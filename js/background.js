/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   background.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/27 23:25:07 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/27 23:25:07 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

var sPort = null;

var defaultSettings = {
	"clustermap": "true",
	"codam-monit": "false",
	"hide-broadcasts": "false",
	"show-custom-profiles": "false",
	"sync": "true",
	"theme": "system"
};

function tryFetchIntraUsername() {
	return new Promise(function (resolve, reject) {
		fetch("https://meta.intra.42.fr/")
			.then(function(response) {
				if (!response.ok) {
					throw new Error("HTTP Response is not OK: " + response.status);
				}
				if (response.url.indexOf("//signin.") > -1) {
					throw new Error("Not signed in on Intra, cannot fetch username");
				}
				return response.text();
			})
			.then(function(body) {
				var _userIndex = body.indexOf("this._user");
				var _consumerAddress = body.indexOf("this._consumer_address");
				console.log("Now trying to parse username from meta.intra.42.fr...");
				if (_userIndex > -1) {
					var toParse = body.substr(_userIndex, _consumerAddress - _userIndex);
					var startOfObj = toParse.indexOf("{");
					var endOfObj = toParse.indexOf("}");
					toParse = toParse.substr(startOfObj, endOfObj - startOfObj + 1);
					var jsonUser = JSON.parse(toParse);
					console.log(jsonUser);
					if ("login" in jsonUser) {
						console.log("Hooray, found logged in user! Hello, " + jsonUser["login"] + "!");
						chrome.storage.local.set({username: jsonUser["login"]}, function() {
							console.log("Set username in local storage");
							resolve(jsonUser["login"]);
						});
					}
					else {
						reject("Could not parse username from Intranet website (username not in _user object)");
					}
				}
				else {
					reject("Could not parse username from Intranet website (_user object not found)");
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}

function removeUnusedSettings() {
	var noLongerUsedSettings = [];

	if (noLongerUsedSettings.length > 0) {
		chrome.storage.local.remove(noLongerUsedSettings, function() {
			console.log("Removed no longer used settings");
		});
	}
}

function setSettingsIfUnset() {
	// get set settings
	chrome.storage.local.get(Object.keys(defaultSettings), function(data) {
		for (var key in defaultSettings) {
			if (data[key] === undefined) {
				chrome.storage.local.set({[key]: defaultSettings[key]}, function() {
					console.log("Setting created in local storage");
				});
			}
		}
	});
}

function getSettingsFromSyncServer(username) {
	console.log("Retrieving settings of username " + username);
	fetch("https://darkintra.freekb.es/settings/" + username + ".json?noCache=" + Math.random())
		.then(function(response) {
			if (response.status == 404) {
				console.log("No settings found on the sync server for this username");
				return null;
			}
			else if (!response.ok) {
				throw new Error("Not signed in on Intra, cannot fetch username");
			}
			return response.json();
		})
		.then(function(json) {
			if (json == null) {
				return;
			}
			chrome.storage.local.set(json, function() {
				console.log("Settings successfully retrieved from sync server. Stored a copy locally.", json);
			});
		})
		.catch(function(err) {
			console.error("Could not retrieve settings from sync server", err);
		});
}

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		switch(msg["action"]) {
			case "ping":
				port.postMessage({ action: "pong" });
				break;
			case "resync":
				chrome.storage.local.get("username", function(data) {
					if (data["username"]) {
						getSettingsFromSyncServer(data["username"]);
					}
					else {
						console.warn("Could not resync, as no username was given to sync from");
					}
				});
				break;
			default:
				console.log("Unknown action received over port: ", msg["action"]);
				break;
		}
	});
	sPort = port;
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		console.log("First install.");
		setSettingsIfUnset();
		tryFetchIntraUsername()
			.then(getSettingsFromSyncServer)
			.catch(function(err) {
				console.error("Could not parse username and synchronize settings", err);
			});
	}
	else if (details.reason == "update") {
		console.log("An update has been installed. Run getSettingsFromSyncServer(username) to force synchronization with the sync server.");
		removeUnusedSettings();
		setSettingsIfUnset();
	}
});