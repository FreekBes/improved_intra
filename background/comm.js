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
	const improvedStorage = (incognitoSession ? incognitoStorage : normalStorage);

	iConsole.log("Resyncing " + type + " session...");
	improvedStorage.get("username").then(function(data) {
		if (data["username"]) {
			getSettingsFromSyncServer(improvedStorage, data["username"])
				.then(function() {
					iConsole.log("Settings successfully retrieved from server. Stored a copy locally in " + type + " storage.");
					messagePortsOfType(type, { action: "resynced" });
				})
				.catch(function(err) {
					iConsole.error("Could not retrieve settings from server:", err);

					// Check if the extension token was still valid
					checkForExtToken(incognitoSession, true);

					// Reset the options to the default values
					resetOptions(improvedStorage).then(function() {
						messagePortsOfType(type, { action: "resynced" });
					});
				});
		}
		else {
			iConsole.warn("Could not resync, as no username was given to sync from");
		}
	});
}

// port message listener
async function portMessageListener(msg, port) {
	const improvedStorage = (isIncognitoPort(port) ? incognitoStorage : normalStorage);
	const networkHandler = (isIncognitoPort(port) ? incognitoNetworkHandler : normalNetworkHandler);
	switch(msg["action"]) {
		case "ping":
			port.postMessage({ action: "pong" });
			break;
		case "resync":
			resyncOnPortMessage(isIncognitoPort(port));
			break;
		case "server-session-started":
			iConsole.warn("Received server-session-started message from " + (isIncognitoPort(port) ? "incognito" : "normal") + " port");
			await networkHandler.requestNewExtToken();
			checkForExtToken(isIncognitoPort(port), true);
			break;
		case "server-session-ended":
			iConsole.warn("Received server-session-ended message from " + (isIncognitoPort(port) ? "incognito" : "normal") + " port");
			improvedStorage.remove("token");
			improvedStorage.set({ "iintra-server-session": false });
			if (!isIncognitoPort(port)) {
				notifyUserOfInactiveSession();
			}
			break;
		case "options-changed":
			if (isIncognitoPort(port)) {
				messageIncognitoPorts({ action: "options-changed", settings: msg["settings"] });
			}
			else {
				messageNormalPorts({ action: "options-changed", settings: msg["settings"] })
			}
			break;
		case "intra-logout":
			iConsole.warn("Received intra-logout message from " + (isIncognitoPort(port) ? "incognito" : "normal") + " port");
			improvedStorage.remove("token");
			improvedStorage.set({ "iintra-server-session": false });
			break;
		default:
			iConsole.log("Unknown action received over port: ", msg["action"]);
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
