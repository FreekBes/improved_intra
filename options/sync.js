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

function getLoggedInUserName() {
	try {
		return (document.querySelector(".main-navbar [data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

var syncPort = chrome.runtime.connect({ name: portName });
syncPort.onDisconnect.addListener(function() {
	console.log("%c[Improved Intra]%c Disconnected from service worker", "color: #00babc;", "");
});
syncPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			console.log("pong");
			break;
		case "resynced":
			console.log("%c[Improved Intra]%c Resync done.", "color: #00babc;", "");
			break;
		case "error":
			console.error(msg["message"]);
			break;
	}
});
setInterval(function() {
	syncPort.disconnect();
	syncPort = chrome.runtime.connect({ name: portName });
}, 250000);

improvedStorage.get(["last-sync", "username"]).then(function(data) {
	const curUsername = getLoggedInUserName();
	const curTime = new Date().getTime();
	// if username in storage does not equal the currently logged in user
	// or the last sync was over an hour ago, resynchronize settings with server
	if (!data["username"] || !data["last-sync"] || parseInt(data["last-sync"]) - curTime < -3600000 || (curUsername != data["username"] && curUsername != null)) {
		// a new user logged in!
		improvedStorage.set({"username": curUsername}).then(function() {
			console.log("%c[Improved Intra]%c Intra username stored in local storage, now resyncing settings...", "color: #00babc;", "");
			syncPort.postMessage({ action: "resync" });
		});
	}
	else {
		const lastSync = new Date(parseInt(data["last-sync"]));
		console.log("%c[Improved Intra]%c Hello there, " + curUsername + "! Your settings have last been synced on " + lastSync.toString(), "color: #00babc;", "");
	}
});
