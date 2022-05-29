/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   options.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 02:23:39 by fbes          #+#    #+#                 */
/*   Updated: 2022/05/23 20:13:38 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function showLoading() {
	document.getElementById("loading").className = "";
}

function hideLoading() {
	document.getElementById("loading").className = "hidden";
}

const possibleColorSchemes = {
	"default": "Intra (default)",
	"cetus": "Blue",
	"green": "Green",
	"pyxis": "Purple",
	"vela": "Red",
	"windows": "Windows",
	"yellow": "Yellow"
};

function checkIfKeyStillWorks(access_token) {
	return new Promise(function(it_works, it_does_not_work) {
		const req = new XMLHttpRequest();
		const manifestData = chrome.runtime.getManifest();
		req.open("POST", "https://darkintra.freekb.es/testkey.php?v="+manifestData.version+"&nc="+encodeURIComponent(Math.random()));
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.addEventListener("load", function(event) {
			try {
				const res = JSON.parse(this.responseText);
				if (res["type"] == "error") {
					it_does_not_work(res);
				}
				else {
					it_works();
				}
			}
			catch (err) {
				it_does_not_work(null);
			}
		});
		req.send("access_token="+access_token);
	});
}

let savedNotifHider = null;
function showSettingsSavedNotif() {
	document.getElementById("saved-notif").style.top = "12px";
	if (savedNotifHider) {
		clearTimeout(savedNotifHider);
	}
	savedNotifHider = setTimeout(function() {
		document.getElementById("saved-notif").style.top = "-80px";
		savedNotifHider = null;
	}, 2000);
}

let optionsPort = chrome.runtime.connect({ name: portName });
optionsPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
optionsPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "options-changed":
			loadSettingsIntoForm(msg["settings"]);
			break;
		case "resynced":
			iConsole.log("Options resynced.");
			window.location.reload();
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});
setInterval(function() {
	optionsPort.disconnect();
	optionsPort = chrome.runtime.connect({ name: portName });
}, 250000);

function storeSettingsAndUpdateForm(newSettings) {
	improvedStorage.set(newSettings).then(function() {
		if (optionsPort) {
			optionsPort.postMessage({ action: "options-changed", settings: newSettings });
		}
	});
	document.getElementById("custom-banner-upload").value = "";
	showSettingsSavedNotif();
}

function syncSettings(event) {
	iConsole.log("Syncing settings...");
	if (event) {
		event.preventDefault();
	}

	const syncBtn = document.getElementById("sync-button");
	const form = document.querySelector('form');
	let formData = new FormData(form);

	// add unchecked checkboxes to formdata (not done by default...)
	const uncheckedCheckBoxes = form.querySelectorAll("input[type=checkbox]:not(:checked)");
	for (let i = 0; i < uncheckedCheckBoxes.length; i++) {
		formData.set(uncheckedCheckBoxes[i].getAttribute("name"), "false");
	}
	formData.set("sync", "true");

	// check file size limits
	const bannerUpload = formData.get("custom-banner-upload");
	if (bannerUpload && bannerUpload.size > 10000000) {
		alert("The file you're trying to upload as your custom banner is too big. The file limit is 10MB.");
		document.getElementById("custom-banner-upload").value = "";
		formData.delete("custom-banner-upload");
		return;
	}

	// get js object version for storing in local storage later
	const settingsObj = {};
	formData.forEach(function(value, key) {
		if (typeof(value) == "string") {
			settingsObj[key] = value.trim();
			formData.set(key, value.trim());
		}
	});
	iConsole.log(settingsObj);

	// store on sync server if sync is enabled
	if (settingsObj["sync"] === "true") {
		improvedStorage.get(["user", "auth"]).then(function(data) {
			if (data["user"] && data["auth"]) {
				syncBtn.className = "syncing";
				formData.append("access_token", data["auth"]["access_token"]);
				formData.append("created_at", data["auth"]["created_at"]);
				formData.append("expires_in", data["auth"]["expires_in"]);
				formData.append("refresh_token", data["auth"]["refresh_token"]);
				formData.append("ext_version", chrome.runtime.getManifest().version);
				const req = new XMLHttpRequest();
				req.open("POST", "https://darkintra.freekb.es/update.php?v=1");
				req.addEventListener("load", function(event) {
					syncBtn.className = "";
					try {
						const res = JSON.parse(this.responseText);
						if (res["type"] == "error") {
							iConsole.error("Settings sync result", res);
						}
						else {
							iConsole.log("Settings sync result", res);
						}
						if (res["data"]) {
							storeSettingsAndUpdateForm(res["data"]);
						}
						else {
							storeSettingsAndUpdateForm(settingsObj);
						}
					}
					catch (err) {
						iConsole.error("Could not parse settings sync result!", err);
						storeSettingsAndUpdateForm(settingsObj);
					}
				});
				req.addEventListener("error", function(err) {
					iConsole.error("Could not sync settings", err);
					storeSettingsAndUpdateForm(settingsObj);
				});
				req.send(formData);
			}
		});
	}
	else {
		// check if sync was enabled before, and if so, delete the user's data from the server
		improvedStorage.get(["sync", "auth"]).then(function(data) {
			if ((data["sync"] === true || data["sync"] === "true") && data["auth"]) {
				syncBtn.className = "syncing";
				formData = new FormData(form);
				formData.set("username", document.getElementById("username").value);
				formData.set("access_token", data["auth"]["access_token"]);
				formData.set("created_at", data["auth"]["created_at"]);
				formData.set("expires_in", data["auth"]["expires_in"]);
				formData.set("refresh_token", data["auth"]["refresh_token"]);

				const req = new XMLHttpRequest();
				req.open("POST", "https://darkintra.freekb.es/delete.php");
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				req.addEventListener("load", function(event) {
					syncBtn.className = "";
					try {
						const res = JSON.parse(this.responseText);
						iConsole.log("Settings deletion result", res);
					}
					catch (err) {
						iConsole.error("Could not parse settings deletion result!", err);
					}
				});
				req.send(formData);
			}

			improvedStorage.set(settingsObj).then(function() {
				improvedStorage.set({ "last-sync": new Date().getTime() }, function() {
					iConsole.log("Settings stored locally");
					if (optionsPort) {
						optionsPort.postMessage({ action: "options-changed", settings: settingsObj });
					}
				});
			});
		});
	}
	return (false);
}

function retrieveSettings() {
	return new Promise(function(resolve, reject) {
		try {
			const formElems = document.querySelectorAll("form select, form input");
			const keysToGet = [];
			for (let i = 0; i < formElems.length; i++) {
				keysToGet.push(formElems[i].getAttribute("name"));
			}
			iConsole.log(keysToGet);
			improvedStorage.get(keysToGet).then(function(data) {
				resolve(data);
			});
		}
		catch (err) {
			reject(err);
		}
	});
}

function loadSettingsIntoForm(settings) {
	iConsole.log("Settings fetched somewhere", settings);
	const knownButNotUsed = ["ext_version", "timestamp"];
	for (let key in settings) {
		let settingElem = document.getElementsByName(key);
		if (settingElem.length > 0) {
			settingElem = settingElem[0];
			improvedStorage.set({[key]: settings[key]});
		}
		else if (knownButNotUsed.indexOf(key) == -1) {
			iConsole.warn("Found unknown setting key '" + key + "'");
			continue;
		}
		else {
			continue;
		}
		if (settingElem.nodeName == "SELECT") {
			settingElem.value = settings[key];
		}
		else if (settingElem.nodeName == "INPUT") {
			switch (settingElem.getAttribute("type")) {
				case "text":
				case "number":
				case "url":
					settingElem.value = settings[key];
					break;
				case "checkbox":
					settingElem.checked = (settings[key] === true || settings[key] === "true");
			}
		}
		else {
			iConsole.warn("Unknown nodetype for setting: " + settingElem.nodeName);
			continue;
		}
	}
	improvedStorage.set({ "last-sync": new Date().getTime() });
	document.getElementById("current-custom-banner").setAttribute("src", settings["custom-banner-url"]);
	if (!settings["custom-banner-url"]) {
		document.getElementById("custom-header-preview").style.display = "none";
	}
	else {
		document.getElementById("custom-header-preview").style.display = "block";
	}
	checkThemeSetting();
	hideLoading();
}

window.onload = function() {
	iConsole.log("Initializing options page...");
	const formElems = document.querySelectorAll("form select, form input");
	for (let i = 0; i < formElems.length; i++) {
		formElems[i].addEventListener("change", syncSettings);
	}
	document.getElementById("sync-button").addEventListener("click", syncSettings);
	document.getElementById("back-button").addEventListener("click", function(event) {
		if (window.history.length > 1) {
			window.history.back();
		}
		else {
			window.location.href = "https://intra.42.fr/";
		}
	});
	document.getElementById("rem-custom-banner").addEventListener("click", function(event) {
		const con = confirm("Are you sure you want to remove the custom banner from your profile?");
		if (con) {
			document.getElementById("custom-banner-url").value = "";
			syncSettings(null);
		}
	});
	document.getElementById("bug-report").addEventListener("click", function(event) {
		window.location.href = "https://github.com/FreekBes/improved_intra/issues?q=";
	});
	document.getElementById("link-github").addEventListener("paste", function(event) {
		let paste = (event.clipboardData || window.clipboardData).getData("text");
		if (paste.indexOf("http://") == 0 || paste.indexOf("https://") == 0) {
			if (paste.endsWith("/")) {
				paste = paste.split("/");
				paste = paste[paste.length - 2];
			}
			else {
				paste = paste.split("/").pop();
			}
		}
		event.target.value = paste;
		syncSettings(event);
		event.preventDefault();
	});

	// load possible color schemes
	const colorsDropdown = document.getElementById("colors");
	// clear old ones (left in for versions <3.1.0)
	colorsDropdown.textContent = "";
	const possibleColorSchemesKeys = Object.keys(possibleColorSchemes);
	for (let i = 0; i < possibleColorSchemesKeys.length; i++) {
		const colorOpt = document.createElement("option");
		colorOpt.setAttribute("value", possibleColorSchemesKeys[i]);
		colorOpt.innerText = possibleColorSchemes[possibleColorSchemesKeys[i]];
		if (possibleColorSchemesKeys[i] == "default") {
			colorOpt.setAttribute("selected", "");
		}
		colorsDropdown.appendChild(colorOpt);
	}

	improvedStorage.get(["username", "auth", "user"]).then(function(data) {
		iConsole.log(data);
		if (data["username"] === undefined || data["auth"] === undefined
			|| data["user"] == undefined || data["user"]["login"] != data["username"]) {
			// authorize user on Intra, link below redirects to the correct auth page
			window.location.replace("https://darkintra.freekb.es/connect.php");
		}
		else {
			checkIfKeyStillWorks(data["auth"]["access_token"])
				.then(function() {
					iConsole.log("Access token still works.");
					retrieveSettings()
						.then(loadSettingsIntoForm)
						.catch(function(err) {
							iConsole.error("Could not load settings from local storage.", err);
							alert("Failed to load settings");
						});
				})
				.catch(function(res) {
					iConsole.log("Access token no longer works!", res);
					// authorize user again on Intra, link below redirects to the correct auth page
					window.location.replace("https://darkintra.freekb.es/connect.php");
				});
		}
	});

	// add easter egg to go to the emotes page
	document.getElementsByTagName("h2")[0].addEventListener("click", function(ev) {
		if (ev.detail == 5) {
			// clicked 5 times on the header, open the emotes page
			window.open(chrome.runtime.getURL("promo/emotes.html"));
		}
	});
};
