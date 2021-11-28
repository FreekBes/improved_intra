/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   sync.js                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/27 20:53:51 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/27 20:53:51 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function getUserName() {
	try {
		return (document.querySelector(".main-navbar [data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

var syncPort = chrome.runtime.connect({ name: "sync_port" });
syncPort.onDisconnect.addListener(function() {
	console.log("%c[Improved Intra]%c Disconnected from service worker", "color: #00babc;", "");
});
syncPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			console.log("pong");
			break;
		case "error":
			console.error(msg["message"]);
			break;
	}
});

chrome.storage.local.get("username", function(data) {
	var curUsername = getUserName();
	if (curUsername != data["username"] && curUsername != null) {
		// a new user logged in!
		chrome.storage.local.set({"username": curUsername}, function() {
			console.log("%c[Improved Intra]%c Intra username stored in local storage", "color: #00babc;", "");
			syncPort.postMessage({ action: "resync" });
		});
	}
	else {
		console.log("%c[Improved Intra]%c Hello there, " + curUsername + "!", "color: #00babc;", "");
	}
});