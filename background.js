/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   background.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/27 23:25:07 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/24 21:19:37 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// sadly this file cannot be split up right now, because Firefox doesn't currently
// support service workers as background scripts yet, so we cannot use the importScripts
// functionality. Everything in this file is split up by comments instead.
// Once Firefox implements service workers, everything should be easily split-uppable.


// GENERAL_BACKGROUND_JS ///////////////////////////////////////////////////////

// (keep everything in this section on split-up)
chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		console.log("First install.");
		// setSettingsIfUnset();
		// fetchUserSettings();
	}
	else if (details.reason == "update") {
		console.log("An update has been installed. Run getSettingsFromSyncServer(username) to force synchronization with the sync server.");
		// removeUnusedSettings();
		// setSettingsIfUnset();
	}
});

// END GENERAL_BACKGROUND_JS ///////////////////////////////////////////////////





// START STORAGE ///////////////////////////////////////////////////////////////

/*
To start, there's three storages:
- a shared one, for generic usage
- a normal one, where user session storage can be stored
- an incognito one, where user session storage from the incognito browser can be stored
Each storage is separated by STORAGETYPE_ in front of the key originally used for the storage.
EXAMPLE: if one were to fetch something with the key "test"; use "SHARED_test", "NORMAL_test", "INCOGNITO_test" instead.

The reason behind this is because storage is actually always shared between normal and incognito mode...
Which is not useful in our case, where we often use storage to synchronize settings based on the user who's currently
signed in to intra.42.fr. This can of course differ between normal and incognito mode
as cookies (and thus sessions) are NOT shared between these modes!
*/

// helper function to prepare keys for storage use
function prepareStorageKeys(type, keys) {
	if (typeof keys == "string") {
		keys = [keys];
	}
	for (let i = 0; i < keys.length; i++) {
		keys[i] = type.toUpperCase() + "-" + keys[i];
	}
	return (keys);
}

// helper function to sanitize storage returned data
function sanitizeStorageData(orig_keys, internal_keys, data) {
	const newData = {};

	for (let i = 0; i < internal_keys.length; i++) {
		newData[orig_keys[i]] = data[internal_keys[i]];
	}
	return (newData);
}

// get something from storage by type
function getStorage(type, keys) {
	return new Promise(function (resolve) {
		const internal_keys = prepareStorageKeys(type, keys);
		chrome.storage.local.get(keys, function(data) {
			resolve(sanitizeStorageData(keys, internal_keys, data));
		});
	});
}

// wrapper for getStorage("shared", keys);
function getSharedStorage(keys) {
	return (getStorage("shared", keys));
}

// wrapper for getStorage("incognito", keys);
function getIncognitoStorage(keys) {
	return (getStorage("incognito", keys));
}

// wrapper for getStorage("normal", keys);
function getNormalStorage(keys) {
	return (getStorage("normal", keys));
}

// END STORAGE /////////////////////////////////////////////////////////////////






// START COMMUNICATION_SERVICE /////////////////////////////////////////////////

const incognitoPortName = "incog_comm";
const normalPorts = [];
const incognitoPorts = [];

// message only ports in non-incognito context
function messageNormalPorts(msg) {
	for (let i = 0; i < ports.length; i++) {
		normalPorts[i].postMessage(msg);
	}
}

// message only ports in incognito context
function messageIncognitoPorts(msg) {
	for (let i = 0; i < ports.length; i++) {
		incognitoPorts[i].postMessage(msg);
	}
}

// message all ports
function messageAllPorts(msg) {
	messageNormalPorts(msg);
	messageIncognitoPorts(msg);
}

// detect if port is incognito or not
function isIncognitoPort(port) {
	return (port.name == incognitoPortName);
}

// resync function
function resync(port, incognitoSession) {
	const storageType = (incognitoSession ? "incognito" : "normal");

	getStorage(storageType, "username").then(function(data) {
		if (data["username"]) {
			getSettingsFromSyncServer(storageType, data["username"])
				.then(function() {
					console.log("Settings successfully retrieved from server. Stored a copy locally.");
					if (incognitoSession) {
						messageIncognitoPorts({ action: "resynced" });
					}
					else {
						messageNormalPorts({ action: "resynced" });
					}
				})
				.catch(function(err) {
					resetSettings().then(function() {
						if (incognitoSession) {
							messageIncognitoPorts({ action: "resynced" });
						}
						else {
							messageNormalPorts({ action: "resynced" });
						}
					});
				});
		}
		else {
			console.warn("Could not resync, as no username was given to sync from");
		}
	});
}

// port message listener
function portMessageListener(msg, port) {
	switch(msg["action"]) {
		case "ping":
			port.postMessage({ action: "pong" });
			break;
		case "resync":
			resync(port, isIncognitoPort(port));
			break;
		case "options-changed":
			messageAllPorts({ action: "options-changed", settings: msg["settings"] });
			break;
		default:
			console.log("Unknown action received over port: ", msg["action"]);
			break;
	}
}

chrome.runtime.onConnect.addListener(function(port) {
	// add port to array of ports depending on the name
	if (port.name == incognitoPortName) {
		incognitoPorts.push(port);
	}
	else {
		normalPorts.push(port);
	}

	// remove port from array of ports on closure
	port.onDisconnect.addListener(function(port) {
		const normalIndex = normalPorts.indexOf(port);
		const incognitoIndex = incognitoPorts.indexOf(port);

		if (incognitoIndex > -1) {
			incognitoPorts.splice(incognitoIndex, 1);
		}
		else if (normalIndex > -1) {
			normalPorts.splice(normalIndex, 1);
		}
	});

	// run specific functions on specific messages
	// basically treating messages as commands
	port.onMessage.addListener(portMessageListener);
});

// END COMMUNICATION_SERVICE ///////////////////////////////////////////////////





// START OLD_BACKGROUND_JS /////////////////////////////////////////////////////

var defaultSettings = {
	"clustermap": "true",
	"codam-auto-equip-coa-title": "false",
	"codam-monit": "true",
	"colors": "default",
	"custom-banner-url": "",
	"custom-banner-pos": "center-center",
	"hide-broadcasts": "false",
	"hide-goals": "false",
	"link-github": "",
	"old-blackhole": "false",
	"show-custom-profiles": "true",
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

function getSettingsFromSyncServer(storageType, username) {
	return new Promise(function(resolve, reject) {
		console.log("Retrieving settings of username " + username);
		fetch("https://darkintra.freekb.es/settings/" + username + ".json?noCache=" + Math.random())
			.then(function(response) {
				if (response.status == 404) {
					console.log("No settings found on the sync server for this username");
					return null;
				}
				else if (!response.ok) {
					throw new Error("Could not fetch settings from server due to an error");
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

// END OLD_BACKGROUND_JS ///////////////////////////////////////////////////////
