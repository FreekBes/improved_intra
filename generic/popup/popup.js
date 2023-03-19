/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   popup.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/07/03 12:16:22 by fbes          #+#    #+#                 */
/*   Updated: 2022/07/03 12:16:22 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// menu switcher
let currentMenu = document.getElementById("loading-menu");
function switchMenus(newMenu) {
	if (currentMenu) {
		currentMenu.style.display = "none";
	}
	if (typeof newMenu == "string") {
		newMenu = document.getElementById(newMenu);
	}
	newMenu.style.display = "block";
	currentMenu = newMenu;
}


// communication with background scripts
let popupPort = chrome.runtime.connect({ name: portName });
popupPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
popupPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});
setInterval(function() {
	popupPort.disconnect();
	popupPort = chrome.runtime.connect({ name: portName });
}, 250000);


// buttons setup
const buttons = {
	openIntra: document.getElementById("open-intra"),
	manageSlots: document.getElementById("manage-slots"),
	listProjects: document.getElementById("list-projects"),
	viewProfile: document.getElementById("view-profile"),
	extSettings: document.getElementById("ext-settings"),
	extSync: document.getElementById("ext-sync"),
	auth: document.getElementById("iintra-auth"),
	login: document.getElementById("intra-login")
};

if (buttons.login) {
	buttons.login.addEventListener("click", function(ev) {
		window.open("https://signin.intra.42.fr/");
		window.close();
	});
}

if (buttons.auth) {
	buttons.auth.addEventListener("click", function(ev) {
		window.open("https://iintra.freekb.es/v2/connect?continue=%2Fv2%2Fping", "iintra-auth-win", "width=460,height=600");
		window.close();
	});
}

if (buttons.openIntra) {
	buttons.openIntra.addEventListener("click", function(ev) {
		window.open("https://intra.42.fr/");
		window.close();
	});
}

if (buttons.manageSlots) {
	buttons.manageSlots.addEventListener("click", function(ev) {
		window.open("https://profile.intra.42.fr/slots");
		window.close();
	});
}

if (buttons.listProjects) {
	buttons.listProjects.addEventListener("click", function(ev) {
		window.open("https://projects.intra.42.fr/");
		window.close();
	});
}

if (buttons.viewProfile) {
	buttons.viewProfile.addEventListener("click", function(ev) {
		window.open("https://profile.intra.42.fr/users/me");
		window.close();
	});
}

if (buttons.extSettings) {
	buttons.extSettings.addEventListener("click", function(ev) {
		window.open("https://iintra.freekb.es/v2/options");
		window.close();
	});
}

if (buttons.extSync) {
	buttons.extSync.addEventListener("click", function(ev) {
		popupPort.postMessage({ action: "resync" });
		window.close();
	});
}

// get extension settings and show items accordingly
improvedStorage.get(["username", "iintra-server-session"]).then(function(data) {
	// if logged in at 42, continue
	if (data["username"]) {
		// if authenticated with Improved Intra 42 back-end, show main menu
		if (data["iintra-server-session"]) {
			switchMenus("main-menu");
		}
		else {
			switchMenus("session-menu");
		}
		document.getElementById("intra-logged-in-username").innerText = ", " + data["username"] + "!";
	}
	else {
		switchMenus("login-menu");
	}
});
