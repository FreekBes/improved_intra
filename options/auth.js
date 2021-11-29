/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   auth.js                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 20:22:10 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 20:22:10 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

var action = document.getElementById("action");
if (action) {
	action.innerText = "Please wait while we redirect you to the Improved Intra 42 options page...";
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
		case "resynced":
			console.log("Options resynced.");
			window.location.href = chrome.runtime.getURL('options/options.html');
			break;
		case "error":
			console.error(msg["message"]);
			break;
	}
});
setInterval(function() {
	syncPort.disconnect();
	syncPort = chrome.runtime.connect({ name: "sync_port" });
}, 250000);

var authResElem = document.getElementById("result");
if (authResElem) {
	try {
		var authRes = JSON.parse(authResElem.innerText);
		if (!("error" in authRes)) {
			chrome.storage.local.set(authRes, function() {
				chrome.storage.local.set({"username": authRes["user"]["login"]}, function() {
					console.log("%c[Improved Intra]%c Authentication details saved in local storage!", "color: #00babc;", "");
					syncPort.postMessage({ action: "resync" });
				});
			});
		}
		else {
			console.error("Error " + authRes["error"] + ":", authRes["error_description"]);
		}
	}
	catch (err) {
		console.error(err);
		alert("Unable to retrieve authentication details. Could not authorize in extension's scope. See the Javascript console for details.");
	}
}