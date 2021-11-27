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
	syncBtn.className = "syncing";
	var form = document.querySelector('form');
	var formData = new FormData(form);

	var req = new XMLHttpRequest();
	req.open("POST", form.action);
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
	return false;
}

function getIntraUserName() {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get("intra-username", function(data) {
			resolve(data["intra-username"]);
		});
	});
}

function retrieveSettings() {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get("intra-username", function(data) {
			if (data["intra-username"] != undefined) {
				console.log("Retrieving settings of username " + data["intra-username"]);
				var req = new XMLHttpRequest();
				req.open("GET", "https://darkintra.freekb.es/settings/" + data["intra-username"] + ".json");
				req.addEventListener("load", function(event) {
					try {
						var res = JSON.parse(this.responseText);
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
				reject("Not retrieving settings from sync server, as no username was set in local storage");
			}
		});	
	});
}

window.onload = function() {
	console.log("Setting up events...");
	var i;

	var formElems = document.querySelectorAll("form select, form input");
	for (i = 0; i < formElems.length; i++) {
		formElems[i].addEventListener("change", syncSettings);
	}
	document.getElementById("sync-button").addEventListener("click", syncSettings);

	retrieveSettings()
		.then(function(settings) {
			console.log("Settings retrieved from sync server", settings);
			var key, settingElem;
			for (key in settings) {
				settingElem = document.getElementsByName(key);
				if (settingElem.length > 0) {
					settingElem = settingElem[0];
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
							settingElem.value = settings[key];
							break;
						case "checkbox":
							settingElem.checked = settings[key];
					}
				}
				else {
					console.warn("Unknown nodetype for setting: " + settingElem.nodeName);
					continue;
				}
			}
			hideLoading();
		})
		.catch(function(err) {
			console.warn("Could not retrieve settings from sync server, only saving settings locally!", err);
			hideLoading();
		});
};