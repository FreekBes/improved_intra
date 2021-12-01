/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   background.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/27 23:25:07 by fbes          #+#    #+#                 */
/*   Updated: 2021/12/01 16:53:14 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

var defaultSettings = {
	"clustermap": "true",
	"codam-monit": "true",
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
					var toParse = body.substring(_userIndex, _consumerAddress);
					console.log(toParse);
					var startOfObj = toParse.indexOf("{");
					var endOfObj = toParse.indexOf("}");
					if (startOfObj < -1) {
						reject("Could not find start of _user object");
					}
					toParse = toParse.substring(startOfObj, endOfObj + 1);
					console.log(toParse);
					var jsonUser = JSON.parse(toParse);
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

function resetSettings() {
	return (chrome.storage.local.set(defaultSettings));
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
	return new Promise(function(resolve, reject) {
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
					reject();
				}
				else {
					chrome.storage.local.set(json, function() {
						resolve(json);
					});
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}

var ports = [];
function messageAllPorts(msg) {
	for (var i = 0; i < ports.length; i++) {
		ports[i].postMessage(msg);
	}
}
chrome.runtime.onConnect.addListener(function(port) {
	ports.push(port);
	port.onDisconnect.addListener(function(port) {
		ports.splice(ports.indexOf(port), 1);
	});
	port.onMessage.addListener(function(msg) {
		switch(msg["action"]) {
			case "ping":
				port.postMessage({ action: "pong" });
				break;
			case "resync":
				chrome.storage.local.get("username", function(data) {
					if (data["username"]) {
						getSettingsFromSyncServer(data["username"])
							.then(function() {
								console.log("Settings successfully retrieved from server. Stored a copy locally.");
								messageAllPorts({ action: "resynced" });
							})
							.catch(function(err) {
								resetSettings().then(function() {
									messageAllPorts({ action: "resynced" });
								});
							});
					}
					else {
						console.warn("Could not resync, as no username was given to sync from");
					}
				});
				break;
			case "options-changed":
				messageAllPorts({ action: "options-changed", settings: msg["settings"] });
				break;
			default:
				console.log("Unknown action received over port: ", msg["action"]);
				break;
		}
	});
});

function fetchUserSettings() {
	tryFetchIntraUsername()
			.then(getSettingsFromSyncServer)
			.then(function(settings) {
				messageAllPorts({ action: "options-changed", settings: settings });
			})
			.catch(function(err) {
				console.error("Could not parse username and synchronize settings", err);
			});
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		console.log("First install.");
		setSettingsIfUnset();
		fetchUserSettings();
	}
	else if (details.reason == "update") {
		console.log("An update has been installed. Run getSettingsFromSyncServer(username) to force synchronization with the sync server.");
		removeUnusedSettings();
		setSettingsIfUnset();
	}
});
