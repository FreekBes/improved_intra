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

var defaultSettings = {
	"clustermap": "true",
	"codam-monit": "false",
	"hide-broadcasts": "true",
	"show-custom-profiles": "false",
	"sync": "true",
	"theme": "system"
};

function tryFetchIntraUsername() {
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
					});
				}
			}
			else {
				console.warn("Could not parse username from meta.intra.42.fr!", "Unknown indexes");
			}
		})
		.catch(function(err) {
			console.error("Could not parse username from meta.intra.42.fr!", err);
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

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		console.log("First install");
		setSettingsIfUnset();
		tryFetchIntraUsername();
	}
	else if (details.reason == "update") {
		console.log("An update has been installed");
		removeUnusedSettings();
		setSettingsIfUnset();
		tryFetchIntraUsername();
	}
});