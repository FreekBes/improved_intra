var didSyncBefore = false;

function showLoading() {
	document.getElementById("loading").className = "";
}

function hideLoading() {
	document.getElementById("loading").className = "hidden";
}

function syncSettings(event) {
	console.log("Syncing settings...");
	event.preventDefault();
	
	var syncBtn = document.getElementById("sync-button");
	var form = document.querySelector('form');
	var formData = new FormData(form);

	// add unchecked checkboxes to formdata (not done by default...)
	var uncheckedCheckBoxes = form.querySelectorAll("input[type=checkbox]:not(:checked)");
	for (var i = 0; i < uncheckedCheckBoxes.length; i++) {
		formData.append(uncheckedCheckBoxes[i].getAttribute("name"), "false");
	}

	// store locally
	var settingsObj = {};
	formData.forEach(function(value, key) {
		settingsObj[key] = value;
	});
	console.log(settingsObj);
	chrome.storage.local.set(settingsObj, function() {
		console.log("Settings stored locally");
	});

	// store on sync server if sync is enabled
	if (settingsObj["sync"] === "true") {
		didSyncBefore = true;
		syncBtn.className = "syncing";
		var req = new XMLHttpRequest();
		req.open("POST", "https://darkintra.freekb.es/update.php?v=1");
		req.addEventListener("load", function(event) {
			syncBtn.className = "";
			try {
				var res = JSON.parse(this.responseText);
				console.log("Settings sync result", res);
			}
			catch (err) {
				console.error("Could not parse settings sync result!", err);
			}
		});
		req.send(formData);
	}
	else if (didSyncBefore === true) {
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
		req.send("username="+document.getElementById("username").value);
		didSyncBefore = false;
	}
	return false;
}

function retrieveSettingsFromSync() {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get("username", function(data) {
			if (data["username"]) {
				console.log("Retrieving settings of username " + data["username"]);
				var req = new XMLHttpRequest();
				req.open("GET", "https://darkintra.freekb.es/settings/" + data["username"] + ".json");
				req.addEventListener("load", function(event) {
					try {
						var res = JSON.parse(this.responseText);
						didSyncBefore = true;
						resolve(res);
					}
					catch (err) {
						reject(err);
					}
				});
				req.addEventListener("error", function(err) {
					reject(err);
				});
				req.send();
			}
			else {
				document.getElementById("sync").checked = false;
				document.getElementById("sync").disabled = true;
				reject("Not retrieving settings from sync server, as no username was set in local storage");
			}
		});	
	});
}

function retrieveSettingsFromLocal() {
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
	console.log("Settings retrieved", settings);
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
	console.log("Setting up events...");
	var i;

	var formElems = document.querySelectorAll("form select, form input");
	for (i = 0; i < formElems.length; i++) {
		formElems[i].addEventListener("change", syncSettings);
	}
	document.getElementById("sync-button").addEventListener("click", syncSettings);

	retrieveSettingsFromSync()
		.then(loadSettingsIntoForm)
		.catch(function(err) {
			console.warn("Could not retrieve settings from sync server, only saving settings locally!", err);
			retrieveSettingsFromLocal()
				.then(loadSettingsIntoForm)
				.catch(function(err) {
					console.error("Could not load settings from local storage.", err);
				})
				.finally(function() {
					hideLoading();
				});
		});
};