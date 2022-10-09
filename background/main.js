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
 * Check if a session is active on the iintra.freekb.es domain
 */
function checkForIIServerSession() {
	iConsole.log("Checking for back-end server session...");
	fetch("https://iintra.freekb.es/v2/ping")
		.then(function(res) {
			if (res.status < 200 || res.status > 299) {
				iConsole.log("Back-end server session is inactive");
				normalStorage.set({ "iintra-server-session": false });
				chrome.action.setBadgeBackgroundColor({color: '#df9539'});
				chrome.action.setBadgeText({text: '!'});
			}
			else {
				iConsole.log("Back-end server session is active");
				normalStorage.set({ "iintra-server-session": true });
				chrome.action.setBadgeText({text: ''});
			}
		})
		.catch(function(err) {
			iConsole.log("A fetch error occurred: " + err);
			normalStorage.set({ "iintra-server-session": false });
			chrome.action.setBadgeBackgroundColor({color: '#df9539'});
			chrome.action.setBadgeText({text: '!'});
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
		checkForIIServerSession();
	}
	else if (details.reason == "update") {
		iConsole.log("An update has been installed.");
		checkForIIServerSession();
		resetLastSyncTimestamp(normalStorage);
		resetLastSyncTimestamp(incognitoStorage);
		removeUnusedOptions();
		resyncOptions();
	}
});

setInterval(checkForIIServerSession, 1800000); // check for back-end session every 30 minutes
