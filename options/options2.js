/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   options2.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/11/06 01:57:35 by fbes          #+#    #+#                 */
/*   Updated: 2022/11/06 01:57:35 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

document.addEventListener("iSettingsChangedPageFormat", function(ev) {
	iConsole.log("iSettingsChangedPageFormat event received in options2.js", ev.detail);
});

document.addEventListener("iSettingsChangedServerFormat", function(ev) {
	iConsole.log("iSettingsChangedServerFormat event received in options2.js", ev.detail);
	if (chrome.extension.inIncognitoContext && navigator.userAgent.indexOf("Firefox") != -1) {
		iConsole.warn("Running Firefox in incognito mode, sync not possible");
		alert("You are running Firefox in incognito mode. Currently, synchronizing settings is not supported in this mode.\nAny modified settings saved will not be applied locally immediately.");
	}
	else {
		iConsole.log("Letting the background script know that we can sync settings with the server now.");
		authPort.postMessage({ action: "resync" });
	}
});

const extVersionElem = document.getElementById("ext-version");
if (extVersionElem) {
	extVersionElem.innerText = chrome.runtime.getManifest().version;
}

const extVersionInput = document.getElementById("ext_version_input");
if (extVersionInput) {
	extVersionInput.value = chrome.runtime.getManifest().version;
}
