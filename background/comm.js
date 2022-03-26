/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   comm.js                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/26 23:57:53 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/26 23:57:53 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const incognitoPortName = "incog_comm";
const normalPorts = [];
const incognitoPorts = [];

// message only ports in non-incognito context
function messageNormalPorts(msg) {
	for (let i = 0; i < normalPorts.length; i++) {
		normalPorts[i].postMessage(msg);
	}
}

// message only ports in incognito context
function messageIncognitoPorts(msg) {
	for (let i = 0; i < incognitoPorts.length; i++) {
		incognitoPorts[i].postMessage(msg);
	}
}

// message all ports
function messageAllPorts(msg) {
	messageNormalPorts(msg);
	messageIncognitoPorts(msg);
}

// message ports of specified type
function messagePortsOfType(type, msg) {
	if (type == "incognito") {
		messageIncognitoPorts(msg);
	}
	else {
		messageNormalPorts(msg);
	}
}

// detect if port is incognito or not
function isIncognitoPort(port) {
	return (port.name == incognitoPortName);
}

// resync on port message function
function resyncOnPortMessage(incognitoSession) {
	const type = (incognitoSession ? "incognito" : "normal");

	getStorage(type, "username").then(function(data) {
		if (data["username"]) {
			getSettingsFromSyncServer(type, data["username"])
				.then(function() {
					console.log("Settings successfully retrieved from server. Stored a copy locally.");
					messagePortsOfType(type, { action: "resynced" });
				})
				.catch(function(err) {
					resetSettings().then(function() {
						messagePortsOfType(type, { action: "resynced" });
					});
				});
		}
		else {
			console.warn("Could not resync, as no username was given to sync from");
		}
	});
}

// port message listener
function portMessageListener(msg, port) {
	switch(msg["action"]) {
		case "ping":
			port.postMessage({ action: "pong" });
			break;
		case "resync":
			resyncOnPortMessage(isIncognitoPort(port));
			break;
		case "options-changed":
			if (isIncognitoPort(port)) {
				messageIncognitoPorts({ action: "options-changed", settings: msg["settings"] });
			}
			else {
				messageNormalPorts({ action: "options-changed", settings: msg["settings"] })
			}
			break;
		default:
			console.log("Unknown action received over port: ", msg["action"]);
			break;
	}
}

chrome.runtime.onConnect.addListener(function(port) {
	// add port to array of ports depending on the name
	if (port.name == incognitoPortName) {
		incognitoPorts.push(port);
	}
	else {
		normalPorts.push(port);
	}

	// remove port from array of ports on closure
	port.onDisconnect.addListener(function(port) {
		const normalIndex = normalPorts.indexOf(port);
		const incognitoIndex = incognitoPorts.indexOf(port);

		if (incognitoIndex > -1) {
			incognitoPorts.splice(incognitoIndex, 1);
		}
		else if (normalIndex > -1) {
			normalPorts.splice(normalIndex, 1);
		}
	});

	// run specific functions on specific messages
	// basically treating messages as commands
	port.onMessage.addListener(portMessageListener);
});
