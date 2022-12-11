/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   main.js                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/26 23:54:09 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/26 23:54:09 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/**
 * Display a badge on the extension icon to notify the user that the session is inactive
 */
function notifyUserOfInactiveSession() {
	(chrome.action || chrome.browserAction).setBadgeBackgroundColor({color: '#df9539'});
	(chrome.action || chrome.browserAction).setBadgeText({text: '!'});
}

/**
 * Check if a session is active on the iintra.freekb.es domain
 */
async function checkForExtToken(incognitoSession=false, doResyncOptions=true) {
	const type = (incognitoSession ? "incognito" : "normal");
	const improvedStorage = (incognitoSession ? incognitoStorage : normalStorage);

	improvedStorage.get("token").then(async function(data) {
		if (data["token"]) {
			// verify the token is still valid
			const pong = await NetworkHandler.get("/v2/ping");
			if (pong.status == 200) {
				iConsole.log("Back-end server session is active for the " + type + " session");
				improvedStorage.set({ "iintra-server-session": true });
				(chrome.action || chrome.browserAction).setBadgeText({text: ''});
			}
			else {
				iConsole.log("Extension token has expired for the " + type + " session");
				improvedStorage.set({ "iintra-server-session": false });
				improvedStorage.remove("token");
				notifyUserOfInactiveSession();
			}
		}
		else {
			iConsole.log("No extension token is set in the improvedStorage for the " + type + " session");
			improvedStorage.set({ "iintra-server-session": false });
			notifyUserOfInactiveSession();
		}
	});
}

function resyncOptions() {
	setOptionsIfUnset(normalStorage);
	setOptionsIfUnset(incognitoStorage);
	fetchUserSettings(normalStorage);
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		iConsole.log("First install.");
		resyncOptions();
		checkForExtToken(false, false);
		checkForExtToken(true, false);
	}
	else if (details.reason == "update") {
		iConsole.log("An update has been installed.");
		checkForExtToken(false, false);
		checkForExtToken(true, false);
		resetLastSyncTimestamp(normalStorage);
		resetLastSyncTimestamp(incognitoStorage);
		removeUnusedOptions();
		resyncOptions();
	}
});

setInterval(checkForExtToken, 1800000); // check for back-end session every 30 minutes
