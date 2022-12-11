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

function NetworkHandler(improvedStorage) {
	this.improvedStorage = improvedStorage;
	this.type = this.improvedStorage.getType();

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
			iConsole.log("Fetched a new ext token for " + this.type + " session. Response:", response);
		}
		this.improvedStorage.set({ "token": response["data"] });
		return (response["data"]);
	};

	this.request = async (url, method = "GET", data = null, headers = {}) => {
		if (this.type != "INCOGNITO") {
			const authHeader = await this.getAuthHeader();
			if (authHeader)
				headers['Authorization'] = await this.getAuthHeader();
			const fetchOptions = {
				method: method
			};
			iConsole.log("Fetching URL " + url + " with options:", fetchOptions);
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
							return (document.body.textContent);
						}
					});
					chrome.tabs.remove(tab.id);
					if (res.length < 1)	{
						throw new Error("Could not execute script in incognito tab");
					}
					return(res[0].result);
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
			return (null); // not implemented
		return (await this.request(url, "POST", data, headers));
	};

	this.put = async (url, data, headers) => {
		if (this.type == "INCOGNITO")
			return (null); // not implemented
		return (await this.request(url, "PUT", data, headers));
	};

	this.patch = async (url, data, headers) => {
		if (this.type == "INCOGNITO")
			return (null); // not implemented
		return (await this.request(url, "PATCH", data, headers));
	};

	this.delete = async (url, headers) => {
		if (this.type == "INCOGNITO")
			return (null); // not implemented
		return (await this.request(url, "DELETE", null, headers));
	};

	this.head = async (url, headers) => {
		if (this.type == "INCOGNITO")
			return (null); // not implemented
		return (await this.request(url, "HEAD", null, headers));
	};

	this.json = async (url, method = "GET", body = null, headers = {}) => {
		const resp = await this.request(url, method, body, headers);
		if (!resp)
			return (null);
		return (await resp.json());
	};
};

// do not use this function from any background script:
// chrome.extension.inIncognitoContext will always be false!
// background scripts never run in incognito context.
function getNetworkHandler() {
	if (chrome.extension.inIncognitoContext) {
		return (normalNetworkHandler);
	}
	return (incognitoNetworkHandler);
}

// set up network handler for both the normal and incognito context
const normalNetworkHandler = new NetworkHandler(normalStorage);
const incognitoNetworkHandler = new NetworkHandler(incognitoStorage);
