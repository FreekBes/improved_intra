/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   unauth2.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/10/09 22:28:22 by fbes          #+#    #+#                 */
/*   Updated: 2022/10/09 22:28:22 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

let authPort = chrome.runtime.connect({ name: portName });
authPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
authPort.onMessage.addListener(function(msg) {
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
	authPort.disconnect();
	authPort = chrome.runtime.connect({ name: portName });
}, 250000);

iConsole.log("Notifying extension that the back-end session ended...");
authPort.postMessage({ action: "server-session-ended" });
