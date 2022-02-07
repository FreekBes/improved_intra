/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   options.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 02:23:39 by fbes          #+#    #+#                 */
/*   Updated: 2022/02/07 21:01:53 by fbes          ########   odam.nl         */
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

var savedNotifHider = null;
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

function storeSettingsAndUpdateForm(newSettings) {
	chrome.storage.local.set(newSettings, function() {
		if (syncPort) {
			syncPort.postMessage({ action: "options-changed", settings: newSettings });
		}
	});
	document.getElementById("custom-banner-upload").value = "";
	showSettingsSavedNotif();
}

function syncSettings(event) {
	console.log("Syncing settings...");
	if (event) {
		event.preventDefault();
	}

	var syncBtn = document.getElementById("sync-button");
	var form = document.querySelector('form');
	var formData = new FormData(form);

	// add unchecked checkboxes to formdata (not done by default...)
	var uncheckedCheckBoxes = form.querySelectorAll("input[type=checkbox]:not(:checked)");
	for (var i = 0; i < uncheckedCheckBoxes.length; i++) {
		formData.set(uncheckedCheckBoxes[i].getAttribute("name"), "false");
	}
	formData.set("sync", "true");

	// check file size limits
	var bannerUpload = formData.get("custom-banner-upload");
	if (bannerUpload && bannerUpload.size > 10000000) {
		alert("The file you're trying to upload as your custom banner is too big. The file limit is 10MB.");
		document.getElementById("custom-banner-upload").value = "";
		formData.delete("custom-banner-upload");
		return;
	}

	// get js object version for storing in local storage later
	var settingsObj = {};
	formData.forEach(function(value, key) {
		if (typeof(value) == "string") {
			settingsObj[key] = value.trim();
			formData.set(key, value.trim());
		}
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
						if (res["data"]) {
							storeSettingsAndUpdateForm(res["data"]);
						}
						else {
							storeSettingsAndUpdateForm(settingsObj);
						}
					}
					catch (err) {
						console.error("Could not parse settings sync result!", err);
						storeSettingsAndUpdateForm(settingsObj);
					}
				});
				req.addEventListener("error", function(err) {
					console.error("Could not sync settings", err);
					storeSettingsAndUpdateForm(settingsObj);
				});
				req.send(formData);
			}
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
				case "url":
					settingElem.value = settings[key];
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
	document.getElementById("current-custom-banner").setAttribute("src", settings["custom-banner-url"]);
	if (!settings["custom-banner-url"]) {
		document.getElementById("custom-header-preview").style.display = "none";
	}
	else {
		document.getElementById("custom-header-preview").style.display = "block";
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
	document.getElementById("back-button").addEventListener("click", function(event) {
		window.location.href = "https://intra.42.fr/";
	});
	document.getElementById("rem-custom-banner").addEventListener("click", function(event) {
		var con = confirm("Are you sure you want to remove the custom banner from your profile?");
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
