/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   options.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 02:23:39 by fbes          #+#    #+#                 */
/*   Updated: 2021/12/03 21:11:22 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function showLoading() {
	document.getElementById("loading").className = "";
}

function hideLoading() {
	document.getElementById("loading").className = "hidden";
}

function checkIfKeyStillWorks(access_token) {
	return new Promise(function(it_works, it_does_not_work) {
		var req = new XMLHttpRequest();
		req.open("POST", "https://darkintra.freekb.es/testkey.php?nc="+encodeURIComponent(Math.random()));
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.addEventListener("load", function(event) {
			try {
				var res = JSON.parse(this.responseText);
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

var syncPort = chrome.runtime.connect({ name: "sync_port" });
syncPort.onDisconnect.addListener(function() {
	console.log("%c[Improved Intra]%c Disconnected from service worker", "color: #00babc;", "");
});
syncPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			console.log("pong");
			break;
		case "options-changed":
			loadSettingsIntoForm(msg["settings"]);
			break;
		case "resynced":
			console.log("Options resynced.");
			window.location.reload();
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

function syncSettings(event) {
	console.log("Syncing settings...");
	event.preventDefault();

	var syncBtn = document.getElementById("sync-button");
	var form = document.querySelector('form');
	var formData = new FormData(form);

	// add unchecked checkboxes to formdata (not done by default...)
	var uncheckedCheckBoxes = form.querySelectorAll("input[type=checkbox]:not(:checked)");
	for (var i = 0; i < uncheckedCheckBoxes.length; i++) {
		formData.set(uncheckedCheckBoxes[i].getAttribute("name"), "false");
	}
	formData.set("sync", "true");

	// get js object version for storing in local storage later
	var settingsObj = {};
	formData.forEach(function(value, key) {
		settingsObj[key] = value;
	});
	console.log(settingsObj);

	// store on sync server if sync is enabled
	if (settingsObj["sync"] === "true") {
		chrome.storage.local.get(["user", "auth"], function(data) {
			if (data["user"] && data["auth"]) {
				syncBtn.className = "syncing";
				formData.append("access_token", data["auth"]["access_token"]);
				formData.append("created_at", data["auth"]["created_at"]);
				formData.append("expires_in", data["auth"]["expires_in"]);
				formData.append("refresh_token", data["auth"]["refresh_token"]);
				var req = new XMLHttpRequest();
				req.open("POST", "https://darkintra.freekb.es/update.php?v=1");
				req.addEventListener("load", function(event) {
					syncBtn.className = "";
					try {
						var res = JSON.parse(this.responseText);
						if (res["type"] == "error") {
							console.error("Settings sync result", res);
						}
						else {
							console.log("Settings sync result", res);
						}
					}
					catch (err) {
						console.error("Could not parse settings sync result!", err);
					}
				});
				req.send(formData);
			}

			chrome.storage.local.set(settingsObj, function() {
				console.log("Settings stored locally");
				if (syncPort) {
					syncPort.postMessage({ action: "options-changed", settings: settingsObj });
				}
			});
		});
	}
	else {
		chrome.storage.local.get(["sync", "auth"], function(data) {
			if ((data["sync"] === true || data["sync"] === "true") && data["auth"]) {
				syncBtn.className = "syncing";
				formData = new FormData(form);
				formData.set("username", document.getElementById("username").value);
				formData.set("access_token", data["auth"]["access_token"]);
				formData.set("created_at", data["auth"]["created_at"]);
				formData.set("expires_in", data["auth"]["expires_in"]);
				formData.set("refresh_token", data["auth"]["refresh_token"]);

				var req = new XMLHttpRequest();
				req.open("POST", "https://darkintra.freekb.es/delete.php");
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
				req.addEventListener("load", function(event) {
					syncBtn.className = "";
					try {
						var res = JSON.parse(this.responseText);
						console.log("Settings deletion result", res);
					}
					catch (err) {
						console.error("Could not parse settings deletion result!", err);
					}
				});
				req.send(formData);
			}

			chrome.storage.local.set(settingsObj, function() {
				console.log("Settings stored locally");
				if (syncPort) {
					syncPort.postMessage({ action: "options-changed", settings: settingsObj });
				}
			});
		});
	}
	return false;
}

function retrieveSettings() {
	return new Promise(function(resolve, reject) {
		try {
			var formElems = document.querySelectorAll("form select, form input");
			var keysToGet = [];
			for (var i = 0; i < formElems.length; i++) {
				keysToGet.push(formElems[i].getAttribute("name"));
			}
			console.log(keysToGet);
			chrome.storage.local.get(keysToGet, function(data) {
				resolve(data);
			});
		}
		catch (err) {
			reject(err);
		}
	});
}

function loadSettingsIntoForm(settings) {
	console.log("Settings fetched somewhere", settings);
	var key, settingElem;
	for (key in settings) {
		settingElem = document.getElementsByName(key);
		if (settingElem.length > 0) {
			settingElem = settingElem[0];
			chrome.storage.local.set({[key]: settings[key]});
		}
		else {
			console.warn("Found unknown setting key '" + key + "'");
			continue;
		}
		if (settingElem.nodeName == "SELECT") {
			settingElem.value = settings[key];
		}
		else if (settingElem.nodeName == "INPUT") {
			switch (settingElem.getAttribute("type")) {
				case "text":
				case "number":
					settingElem.setAttribute("value", settings[key]);
					break;
				case "checkbox":
					settingElem.checked = (settings[key] === true || settings[key] === "true");
			}
		}
		else {
			console.warn("Unknown nodetype for setting: " + settingElem.nodeName);
			continue;
		}
	}
	hideLoading();
}

window.onload = function() {
	console.log("Initializing options page...");
	var i;

	var formElems = document.querySelectorAll("form select, form input");
	for (i = 0; i < formElems.length; i++) {
		formElems[i].addEventListener("change", syncSettings);
	}
	document.getElementById("sync-button").addEventListener("click", syncSettings);
	document.getElementById("bug-report").addEventListener("click", function(event) {
		window.location.href = "https://github.com/FreekBes/improved_intra/issues?q=";
	});

	chrome.storage.local.get(["username", "auth", "user"], function(data) {
		console.log(data);
		if (data["username"] === undefined || data["auth"] === undefined
			|| data["user"] == undefined || data["user"]["login"] != data["username"]) {
			// authorize user on Intra, link below redirects to the correct auth page
			window.location.href = "https://darkintra.freekb.es/connect.php";
		}
		else {
			checkIfKeyStillWorks(data["auth"]["access_token"])
				.then(function() {
					console.log("Access token still works.");
					retrieveSettings()
						.then(loadSettingsIntoForm)
						.catch(function(err) {
							console.error("Could not load settings from local storage.", err);
							alert("Failed to load settings");
						});
				})
				.catch(function(res) {
					console.log("Access token no longer works!", res);
					// authorize user again on Intra, link below redirects to the correct auth page
					window.location.href = "https://darkintra.freekb.es/connect.php";
				});
		}
	});
};
