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
		const token = await this.improvedStorage.get("token");
		if (!token)
			return (null);
		return ("Bearer " + token);
	};

	this.requestNewExtToken = async () => {
		this.improvedStorage.set("token", null);
		const response = await this.get("https://iintra.freekb.es/v2/ext_token", {});
		if (response.status !== 200)
			return (null);
		const respJson = await response.json();
		if (!respJson || !respJson["type"] != "success" || !respJson["data"])
			return (null);
		this.improvedStorage.set("token", respJson["data"]);
		return (respJson["data"]);
	};

	this.request = async (url, method, data, headers) => {
		const authHeader = await this.getAuthHeader();
		if (authHeader)
			headers['Authorization'] = await this.getAuthHeader();
		const response = await fetch(url, {
			method: method,
			headers: headers,
			body: data,
		});
		return (response);
	};

	this.get = async (url, headers) => {
		return (await networkHandler.request(url, "GET", null, headers));
	};

	this.post = async (url, data, headers) => {
		return (await networkHandler.request(url, "POST", data, headers));
	};

	this.put = async (url, data, headers) => {
		return (await networkHandler.request(url, "PUT", data, headers));
	};

	this.patch = async (url, data, headers) => {
		return (await networkHandler.request(url, "PATCH", data, headers));
	};

	this.delete = async (url, headers) => {
		return (await networkHandler.request(url, "DELETE", null, headers));
	};

	this.head = async (url, headers) => {
		return (await networkHandler.request(url, "HEAD", null, headers));
	};
};
