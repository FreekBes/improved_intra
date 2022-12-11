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
 * Check if a session is active on the iintra.freekb.es domain.
 * Using the ext_token stored in the improvedStorage, ping the server to verify the token is still valid.
 * If it is valid, a server session is started automatically by the server.
 */
async function checkForExtToken(incognitoSession=false, doResyncOptions=true) {
	const type = (incognitoSession ? "incognito" : "normal");
	const improvedStorage = (incognitoSession ? incognitoStorage : normalStorage);
	const networkHandler = (incognitoSession ? incognitoNetworkHandler : normalNetworkHandler);

	const token = await improvedStorage.getOne("token");
	if (token) {
		try {
			// verify the token is still valid by pinging the server with it
			const response = await networkHandler.get("https://iintra.freekb.es/v2/ping");
			if (response.status == 200) {
				iConsole.log("Back-end server session is active for the " + type + " session");
				improvedStorage.set({ "iintra-server-session": true });
				if (!incognitoSession) {
					(chrome.action || chrome.browserAction).setBadgeText({text: ''});
				}
				if (doResyncOptions) {
					resyncOptions(improvedStorage);
				}
				return;
			}
			else {
				iConsole.log("Extension token has expired for the " + type + " session. Status: ", response.status.toString() + " " + response.statusText);
			}
		}
		catch (err) {
			iConsole.log("Extension token has expired for the " + type + " session. Error: ", err);
		}
	}
	else {
		iConsole.log("No extension token is set in the improvedStorage for the " + type + " session");
	}
	improvedStorage.set({ "iintra-server-session": false });
	improvedStorage.remove("token");
	if (!incognitoSession) {
		notifyUserOfInactiveSession();
	}
}

function resyncOptions(improvedStorage) {
	setOptionsIfUnset(improvedStorage);
	fetchUserSettings(improvedStorage);
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		iConsole.log("First install.");
		checkForExtToken(false, true);
		checkForExtToken(true, true);
	}
	else if (details.reason == "update") {
		iConsole.log("An update has been installed.");
		resetLastSyncTimestamp(normalStorage);
		resetLastSyncTimestamp(incognitoStorage);
		removeUnusedOptions();
		checkForExtToken(false, true);
		checkForExtToken(true, true);
	}
});

setInterval(checkForExtToken, 1800000); // check for back-end session every 30 minutes
