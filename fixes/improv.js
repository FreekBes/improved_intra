/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:04:09 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

// enable general improvements
setGeneralImprovements();

// enable optional improvements
// can be enabled in extension options
setOptionalImprovements();

// communication between background.js and this script
let improvPort = chrome.runtime.connect({ name: portName });
improvPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
improvPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "resynced":
		case "prefers-color-scheme-change":
		case "options-changed":
			iConsole.log("Settings changed. Enabling settings that can be enabled. Settings that must be disabled, will disable after a refresh.");
			checkThemeSetting();
			setOptionalImprovements();
			colorizeLogtimeChart();
			if (typeof setCustomProfile != "undefined") {
				setCustomProfile();
			}
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});

// reconnect every 4-5 minutes to keep service worker running in background
setInterval(function() {
	improvPort.disconnect();
	improvPort = chrome.runtime.connect({ name: portName });
}, 250000);
