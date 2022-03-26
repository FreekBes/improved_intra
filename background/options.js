/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   options.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/27 00:13:45 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/27 00:13:45 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const defaults = {
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

const noLongerUsedOptions = [];

function tryFetchIntraUsername(improvedStorage) {
	return new Promise(function (resolve, reject) {
		fetch("https://meta.intra.42.fr/")
			.then(function(response) {
				if (!response.ok) {
					reject("HTTP Response is not OK: " + response.status);
				}
				if (response.url.indexOf("//signin.") > -1) {
					reject("Not signed in on Intra, cannot fetch username");
				}
				return response.text();
			})
			.then(function(metaBody) {
				const _userIndex = metaBody.indexOf("this._user");
				const _consumerAddress = metaBody.indexOf("this._consumer_address");
				console.log("Now trying to parse username from meta.intra.42.fr...");
				if (_userIndex > -1) {
					let toParse = metaBody.substring(_userIndex, _consumerAddress);
					console.log(toParse);
					const startOfObj = toParse.indexOf("{");
					const endOfObj = toParse.indexOf("}");
					if (startOfObj < -1) {
						reject("Could not find start of _user object");
					}
					toParse = toParse.substring(startOfObj, endOfObj + 1);
					console.log(toParse);
					const jsonUser = JSON.parse(toParse);
					if ("login" in jsonUser) {
						console.log("Hooray, found logged in user! Hello, " + jsonUser["login"] + "!");
						improvedStorage.set({username: jsonUser["login"]}).then(function() {
							console.log("Set username in " + improvedStorage.getType() + " storage");
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

function removeUnusedOptions() {
	if (noLongerUsedOptions.length > 0) {
		normalStorage.remove(noLongerUsedOptions).then(function() {
			console.log("Removed no longer used options from normal storage");
		});
		incognitoStorage.remove(noLongerUsedOptions).then(function() {
			console.log("Removed no longer used options from incognito storage");
		});
	}
}

function resetOptions(improvedStorage) {
	return (improvedStorage.set(defaults));
}

function setOptionsIfUnset(improvedStorage) {
	// get set options and only set them if they seem to not be set (equal to undefined)
	improvedStorage.get(Object.keys(defaults), function(data) {
		for (const key in defaults) {
			if (data[key] === undefined) {
				improvedStorage.set({[key]: defaults[key]}, function() {
					console.log("Default setting with key " + key + " created in " + improvedStorage.getType() + " storage (value: " + defaults[key] + ")");
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
					reject("No settings found on the sync server for this username");
					return (null);
				}
				else if (!response.ok) {
					reject("Could not fetch settings from server due to an error");
					return (null);
				}
				return (response.json());
			})
			.then(function(json) {
				if (json != null) {
					storageType.set(json, function() {
						resolve(json);
					});
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}

function fetchUserSettings(improvedStorage) {
	const storageType = improvedStorage.getType();

	tryFetchIntraUsername(improvedStorage)
		.then(function(username) {
			getSettingsFromSyncServer(improvedStorage, username);
		})
		.then(function(settings) {
			messagePortsOfType(storageType, { action: "options-changed", settings: settings });
		})
		.catch(function(err) {
			console.error("Could not parse username and synchronize settings", err);
		});
}
