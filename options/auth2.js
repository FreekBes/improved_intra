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

async function checkSendSessionStatus(closeAfter = false) {
	iConsole.log("Checking if the user is authenticated...");
	const serverSession = await improvedStorage.getOne("iintra-server-session");
	iConsole.log("iintra-server-session:", serverSession);
	if (!serverSession) {
		iConsole.log("(New) authenticated session detected, notifying extension...");
		authPort.postMessage({ action: "server-session-started" });
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
	authPort.postMessage({ action: "server-session-ended" });
}
