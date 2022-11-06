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
	iConsole.log("Letting the background script know that we can sync settings with the server now.");
	authPort.postMessage({ action: "resync" });
});

const extVersionElem = document.getElementById("ext-version");
if (extVersionElem) {
	extVersionElem.innerText = chrome.runtime.getManifest().version;
}

const extVersionInput = document.getElementById("ext_version_input");
if (extVersionInput) {
	extVersionInput.value = chrome.runtime.getManifest().version;
}
