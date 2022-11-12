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

let syncPort = chrome.runtime.connect({ name: portName });
syncPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
syncPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});
setInterval(function() {
	syncPort.disconnect();
	syncPort = chrome.runtime.connect({ name: portName });
}, 250000);

syncPort.postMessage({ action: "intra-logout" });

// const iintraLogoutWindow = window.open("https://iintra.freekb.es/v2/disconnect?continue=/v2/ping", "iintra-logout", "width=10,height=10");
// iintraLogoutWindow.addEventListener("load", function() {
// 	iConsole.log("iintra.freekb.es logout window loaded. Closing it now.");
// 	iintraLogoutWindow.close();
// });
