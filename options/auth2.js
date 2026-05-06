/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   auth-v2.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/10/09 22:14:37 by fbes          #+#    #+#                 */
/*   Updated: 2022/10/09 22:14:37 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

iConsole.log("auth2.js script running now...");

let authPort = null;
let authPortInterval = null;
let authPortClosed = false;

function connectAuthPort() {
	if (authPortClosed) {
		return false;
	}
	authPort = chrome.runtime.connect({ name: portName });
	authPort.onDisconnect.addListener(function() {
		iConsole.log("Disconnected from service worker");
		authPort = null;
	});
	authPort.onMessage.addListener(handleAuthPortMessage);
	return true;
}

function disconnectAuthPort() {
	authPortClosed = true;
	if (authPortInterval) {
		clearInterval(authPortInterval);
		authPortInterval = null;
	}
	if (authPort) {
		authPort.disconnect();
		authPort = null;
	}
}

function postAuthPortMessage(msg) {
	if (authPortClosed) {
		return;
	}
	if (!authPort && !connectAuthPort()) {
		return;
	}
	try {
		authPort.postMessage(msg);
	}
	catch (err) {
		iConsole.warn("Could not message service worker:", err);
	}
}

function handleAuthPortMessage(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
}

connectAuthPort();
authPortInterval = setInterval(function() {
	if (authPortClosed) {
		return;
	}
	if (authPort) {
		authPort.disconnect();
		authPort = null;
	}
	connectAuthPort();
}, 250000);
window.addEventListener("pagehide", disconnectAuthPort);

async function checkSendSessionStatus(closeAfter = false) {
	iConsole.log("Checking if the user is authenticated...");
	const serverSession = await improvedStorage.getOne("iintra-server-session");
	iConsole.log("iintra-server-session:", serverSession);
	if (!serverSession) {
		iConsole.log("(New) authenticated session detected, notifying extension...");
		postAuthPortMessage({ action: "server-session-started" });
	}
	if (closeAfter) {
		iConsole.log("Closing the tab...");
		window.close();
	}
}

if (window.location.pathname == '/auth') {
	checkSendSessionStatus();
}
else if (window.location.pathname.startsWith('/v2/options/')) {
	// only check this on options pages
	if (document.querySelector("#user-login")) {
		checkSendSessionStatus();
	}
}
else if (window.location.pathname == '/') {
	// only check this on landing page
	if (document.querySelector("#account #login")) {
		checkSendSessionStatus();
	}
}
else if (window.location.pathname == '/v2/ping' && document.body.textContent.toLowerCase() == 'pong') {
	// for renewal of the session using the extension popup
	checkSendSessionStatus(true);
}
else if (window.location.pathname.startsWith('/v2/disconnect')) {
	// session actually ended
	iConsole.log("Notifying extension that the back-end session ended...");
	postAuthPortMessage({ action: "server-session-ended" });
}
