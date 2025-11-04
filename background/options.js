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
	"hide-help": "false",
	"hide-goals": "false",
	"holygraph-morecursuses": "false",
	"link-github": "",
	"link-web": "",
	"logsum-month": "true",
	"logsum-week": "true",
	"old-blackhole": "false",
	"outstandings": "true",
	"show-custom-profiles": "true",
	"sort-projects-date": "false",
	"sync": "true",
	"theme": "system"
};

const v1Translations = {
	"clustermap": ["settings", "clustermap"],
	"codam-auto-equip-coa-title": ["settings", "codam_auto_equip_coa_title"],
	"codam-monit": ["settings", "codam_monit"],
	"colors": ["settings", "colors", "internal_name"],
	"custom-banner-url": ["profile", "banner_img", "url"],
	"custom-banner-pos": ["profile", "banner_pos", "internal_name"],
	"hide-broadcasts": ["settings", "hide_broadcasts"],
	"hide-goals": ["settings", "hide_goals"],
	"hide-help": ["settings", "hide_help"],
	"holygraph-morecursuses": ["settings", "holygraph_more_cursuses"],
	"link-github": ["profile", "link_git"],
	"link-web": ["profile", "link_web"],
	"logsum-month": ["settings", "logsum_month"],
	"logsum-week": ["settings", "logsum_week"],
	"old-blackhole": ["settings", "old_blackhole"],
	"outstandings": ["settings", "outstandings"],
	"show-custom-profiles": ["settings", "show_custom_profiles"],
	"sort-projects-date": ["settings", "sort_projects_date"],
	"theme": ["settings", "theme", "internal_name"],
	"username": ["user", "login"]
}

const noLongerUsedOptions = [ "sync", "codam-buildingtimes-chart", "codam-buildingtimes-public" ];

function v1Translate(v2Options) {
	const v1Options = {};

	translateloop:
	for (const v1key in v1Translations) {
		let v2Value = v2Options;
		// dive into the v2Options object for each v1Options key
		diveloop:
		for (const v2subkey of v1Translations[v1key]) {
			if (!v2Value) {
				v1Options[v1key] = '';
				continue translateloop;
			}
			v2Value = v2Value[v2subkey];
		}
		if (v2Value === null) {
			v2Value = '';
		}
		if (v2Value !== undefined) {
			iConsole.log("v1Translate: " + v1key + " -> '" + v2Value + "'");
			v1Options[v1key] = v2Value;
		}
		else {
			iConsole.warn("Could not translate v1Option " + v1key + " from v2Option, using default value");
			v1Options[v1key] = defaults[v1key];
		}
	}
	return (v1Options);
}

async function tryFetchIntraUsername(improvedStorage) {
	const networkHandler = (improvedStorage.getType() == "incognito" ? incognitoNetworkHandler : normalNetworkHandler);
	return new Promise(function (resolve, reject) {
		networkHandler.get("https://intra.42.fr/")
			.then(function(response) {
				if (!response.ok) {
					throw new Error("HTTP Response is not OK: " + response.status);
				}
				if (response.url.indexOf("//signin.") > -1) {
					throw new Error("Not signed in on Intra, cannot fetch username");
				}
				return response.text();
			})
			.then(function(metaSourceCode) {

				const _userIndex = metaSourceCode.indexOf("this._user");
				const _consumerAddress = metaSourceCode.indexOf("this._consumer_address");
				iConsole.log("Now trying to parse username from meta.intra.42.fr...");
				if (_userIndex > -1) {
					let toParse = metaSourceCode.substring(_userIndex, _consumerAddress);
					iConsole.log(toParse);
					const startOfObj = toParse.indexOf("{");
					const endOfObj = toParse.indexOf("}");
					if (startOfObj < -1) {
						throw new Error("Could not find start of _user object");
					}
					toParse = toParse.substring(startOfObj, endOfObj + 1);
					iConsole.log(toParse);
					const jsonUser = JSON.parse(toParse);
					if ("login" in jsonUser) {
						iConsole.log("Hooray, found logged in user! Hello, " + jsonUser["login"] + "!");
						improvedStorage.set({username: jsonUser["login"]}).then(function() {
							iConsole.log("Set username in " + improvedStorage.getType() + " storage");
							resolve(jsonUser["login"]);
						});
					}
					else {
						throw new Error("Could not parse username from Intranet website (username not in _user object)");
					}
				}
				else {
					throw new Error("Could not parse username from Intranet website (_user object not found)");
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
			iConsole.log("Removed no longer used options from normal storage");
		});
		incognitoStorage.remove(noLongerUsedOptions).then(function() {
			iConsole.log("Removed no longer used options from incognito storage");
		});
	}
}

function resetOptions(improvedStorage) {
	return (improvedStorage.set(defaults));
}

function setOptionsIfUnset(improvedStorage) {
	// get set options and only set them if they seem to not be set (equal to undefined)
	improvedStorage.get(Object.keys(defaults)).then(function(data) {
		for (const key in defaults) {
			if (data[key] === undefined) {
				improvedStorage.set({[key]: defaults[key]}, function() {
					iConsole.log("Default setting with key " + key + " created in " + improvedStorage.getType() + " storage (value: " + defaults[key] + ")");
				});
			}
		}
	});
}

function handleSettingsFromSyncServer(json, improvedStorage, username, resolve, reject) {
	if (json['type'] === 'success') {
		if (json['data']['user']['login'] !== username) {
			reject("Username in sync server settings does not match the username of the user who we wanted to fetch data for");
			return (null);
		}
		iConsole.log('v2Settings', json['data']);
		iConsole.log("Translating the settings into v1...");
		const v1Settings = v1Translate(json['data']);
		iConsole.log('v1Settings', v1Settings);
		iConsole.log("Storing settings in " + improvedStorage.getType() + " storage...");
		improvedStorage.set(v1Settings).then(function() {
			improvedStorage.set({ "last-sync": new Date().getTime() }).then(function() {
				resolve(json);
			});
		});
	}
	else {
		reject(json['message']);
	}
}

function getSettingsFromSyncServer(improvedStorage, username) {
	return new Promise(async function(resolve, reject) {
		iConsole.log("Retrieving settings of authenticated user " + username + " for " + improvedStorage.getType());
		const networkHandler = (improvedStorage.getType() == "incognito" ? incognitoNetworkHandler : normalNetworkHandler);
		try {
			const json = await networkHandler.json("https://iintra.freekb.es/v2/options.json?noCache=" + Math.random());
			if (!json) {
				reject("Empty options.json response");
			}
			if (json["type"] == "success") {
				const handledSettings = await handleSettingsFromSyncServer(json, improvedStorage, username, resolve, reject);
				resolve(handledSettings);
			}
			else {
				reject(json["message"]);
			}
		}
		catch (err) {
			reject(err);
		}
	});
}

function resetLastSyncTimestamp(improvedStorage) {
	return new Promise(function(resolve) {
		improvedStorage.remove("last-sync").then(resolve);
	});
}

function fetchUserSettings(improvedStorage) {
	const storageType = improvedStorage.getType();

	tryFetchIntraUsername(improvedStorage)
		.then(function(username) {
			getSettingsFromSyncServer(improvedStorage, username)
				.catch(function(err) {
					iConsole.error("Could not fetch settings from sync server:", err);
					// Check if the extension token was still valid
					checkForExtToken(storageType == "incognito", true);
				});
		})
		.then(function(settings) {
			messagePortsOfType(storageType, { action: "options-changed", settings: settings });
		})
		.catch(function(err) {
			iConsole.error("Could not parse username and synchronize settings:", err);
		});
}
