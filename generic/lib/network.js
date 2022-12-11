/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   network.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/12/11 12:34:53 by fbes          #+#    #+#                 */
/*   Updated: 2022/12/11 12:34:53 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/*
WARNING! THIS SCRIPT RUNS BOTH IN THE BACKGROUND AS A SERVICE WORKER AND
IN THE FOREGROUND AS A CONTENT SCRIPT, AS IT IS INTENDED AS A WRAPPER FOR
NETWORK COMMUNICATION WITH THE IMPROVED INTRA BACK-END SERVER.
DO NOT USE ANY FUNCTIONS DEPENDENT ON MODULES OF EXTENSIONS THAT ONLY WORK IN
EITHER FOREGROUND OR BACKGROUND.
*/

// helper function to create a custom response object that imitates the response object of fetch
// this is needed because fetch is not available in incognito context, but we do want to act as if it is
// (so that no custom handling for incognito responses is needed everywhere)
function CustomResponse(head, body, bodyTextContent, url) {
	this.head = head;
	this.body = body;
	this.bodyTextContent = bodyTextContent; // for JSON parsing
	this.url = url;
	this.status = 200; // hardcoded!
	this.statusText = "OK";
	this.ok = true;

	this.text = () => {
		return (new Promise((resolve, reject) => {
			resolve(this.head + this.body);
		}));
	};

	this.json = () => {
		return (new Promise((resolve, reject) => {
			try {
				resolve(JSON.parse(this.bodyTextContent));
			}
			catch (err) {
				reject(err);
			}
		}));
	};
}

function NetworkHandler(improvedStorage) {
	this.improvedStorage = improvedStorage;
	this.type = this.improvedStorage.getType().toUpperCase(); // yes, uppercase, like to storage lib

	this.getType = () => {
		return (this.type.toLowerCase());
	};

	this.getAuthHeader = async () => {
		const token = await this.improvedStorage.getOne("token");
		if (!token)
			return (null);
		return ("Bearer " + token);
	};

	this.requestNewExtToken = async () => {
		this.improvedStorage.set("token", null);
		const response = await this.json("https://iintra.freekb.es/v2/ext_token");
		if (!response || response["type"] != "success" || !response["data"]) {
			iConsole.log("Failed to get new ext token for " + this.type + " session. Response:", response);
			return (null);
		}
		else {
			iConsole.log("Fetched a new ext token for " + this.type + " session");
		}
		this.improvedStorage.set({
			"token": response["data"],
			"iintra-server-session": true
		});
		return (response["data"]);
	};

	this.request = async (url, method = "GET", data = null, headers = {}) => {
		iConsole.log("Fetching URL " + url + " in " + this.type + " context");
		if (this.type != "INCOGNITO") {
			const authHeader = await this.getAuthHeader();
			if (authHeader)
				headers['Authorization'] = await this.getAuthHeader();
			const fetchOptions = {
				method: method
			};
			if (Object.keys(headers).length > 0) {
				fetchOptions.headers = headers;
			}
			if (data) {
				fetchOptions.body = data;
			}
			const response = await fetch(url, fetchOptions);
			return (response);
		}
		else {
			// fetch can only fetch using the normal context, not incognito context
			// so instead we open a tab with the URL we want to fetch from in an incognito window
			// and retrieve the contents from there, then close the tab again
			// very hacky, but it works (on Chrome at least)
			// on Firefox it could work using browser.windows.getAll(), but then the script execution fails
			const windows = await chrome.windows.getAll();
			for (const win of windows) {
				if (win.incognito) {
					const tab = await chrome.tabs.create({
						windowId: win.id,
						url: url,
						active: false
					});
					const res = await chrome.scripting.executeScript({
						target: { tabId: tab.id },
						func: function() {
							return ({ head: document.head.innerHTML, body: document.body.innerHTML, bodyText: document.body.textContent, url: document.URL });
						}
					});
					chrome.tabs.remove(tab.id);
					if (res.length < 1)	{
						throw new Error("Could not execute script in incognito tab");
					}
					return (new CustomResponse(res[0].result['head'], res[0].result['body'], res[0].result['bodyText'], res[0].result['url']));
				}
			}
			throw new Error("Could not find incognito window");
		}
	};

	this.get = async (url, headers) => {
		return (await this.request(url, "GET", null, headers));
	};

	this.post = async (url, data, headers) => {
		if (this.type == "INCOGNITO")
			throw new Error("POST not implemented in incognito context");
		return (await this.request(url, "POST", data, headers));
	};

	this.put = async (url, data, headers) => {
		if (this.type == "INCOGNITO")
			throw new Error("PUT not implemented in incognito context");
		return (await this.request(url, "PUT", data, headers));
	};

	this.patch = async (url, data, headers) => {
		if (this.type == "INCOGNITO")
			throw new Error("PATCH not implemented in incognito context");
		return (await this.request(url, "PATCH", data, headers));
	};

	this.delete = async (url, headers) => {
		if (this.type == "INCOGNITO")
			throw new Error("DELETE not implemented in incognito context");
		return (await this.request(url, "DELETE", null, headers));
	};

	this.head = async (url, headers) => {
		if (this.type == "INCOGNITO")
			throw new Error("HEAD not implemented in incognito context");
		return (await this.request(url, "HEAD", null, headers));
	};

	this.json = async (url) => {
		const resp = await this.request(url, "GET");
		if (!resp)
			throw new Error("No response from server");
		return (await resp.json());
	};
};

// do not use this function from any background script:
// chrome.extension.inIncognitoContext will always be false!
// background scripts never run in incognito context.
function getNetworkHandler() {
	if (chrome.extension.inIncognitoContext) {
		return (incognitoNetworkHandler);
	}
	return (normalNetworkHandler);
}

// set up network handler for both the normal and incognito context
const normalNetworkHandler = new NetworkHandler(normalStorage);
const incognitoNetworkHandler = new NetworkHandler(incognitoStorage);
