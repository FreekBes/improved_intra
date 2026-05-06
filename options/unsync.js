/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   unsync.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 00:06:47 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 00:06:47 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// these functions are run when signing out from Intranet at https://intra.42.fr

improvedStorage.remove("username").then(function() {
	iConsole.log("Signed out from Intra, so removed the username to synchronize with. Settings will be kept locally, until another person signs in.");
});

let syncPort = null;
let syncPortInterval = null;
let syncPortClosed = false;

function connectSyncPort() {
	if (syncPortClosed) {
		return false;
	}
	syncPort = chrome.runtime.connect({ name: portName });
	syncPort.onDisconnect.addListener(function() {
		iConsole.log("Disconnected from service worker");
		syncPort = null;
	});
	syncPort.onMessage.addListener(handleSyncPortMessage);
	return true;
}

function disconnectSyncPort() {
	syncPortClosed = true;
	if (syncPortInterval) {
		clearInterval(syncPortInterval);
		syncPortInterval = null;
	}
	if (syncPort) {
		syncPort.disconnect();
		syncPort = null;
	}
}

function postSyncPortMessage(msg) {
	if (syncPortClosed) {
		return;
	}
	if (!syncPort && !connectSyncPort()) {
		return;
	}
	try {
		syncPort.postMessage(msg);
	}
	catch (err) {
		iConsole.warn("Could not message service worker:", err);
	}
}

function handleSyncPortMessage(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
}

connectSyncPort();
syncPortInterval = setInterval(function() {
	if (syncPortClosed) {
		return;
	}
	if (syncPort) {
		syncPort.disconnect();
		syncPort = null;
	}
	connectSyncPort();
}, 250000);
window.addEventListener("pagehide", disconnectSyncPort);

postSyncPortMessage({ action: "intra-logout" });

// const iintraLogoutWindow = window.open("https://iintra.freekb.es/v2/disconnect?continue=/v2/ping", "iintra-logout", "width=10,height=10");
// iintraLogoutWindow.addEventListener("load", function() {
// 	iConsole.log("iintra.freekb.es logout window loaded. Closing it now.");
// 	iintraLogoutWindow.close();
// });
