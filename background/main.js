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

function resyncOptions() {
	setOptionsIfUnset(normalStorage);
	setOptionsIfUnset(incognitoStorage);
	fetchUserSettings(normalStorage);
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		console.log("First install.");
		resyncOptions();
	}
	else if (details.reason == "update") {
		console.log("An update has been installed.");
		resetLastSyncTimestamp(normalStorage);
		resetLastSyncTimestamp(incognitoStorage);
		removeUnusedOptions();
		resyncOptions();
	}
});
