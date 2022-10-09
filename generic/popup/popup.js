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
let currentMenu = document.getElementById("login-menu");
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


// buttons setup
const buttons = {
	openIntra: document.getElementById("open-intra"),
	manageSlots: document.getElementById("manage-slots"),
	listProjects: document.getElementById("list-projects"),
	viewProfile: document.getElementById("view-profile"),
	extSettings: document.getElementById("ext-settings"),
	auth: document.getElementById("iintra-auth"),
	login: document.getElementById("intra-login")
};

buttons.login.addEventListener("click", function(ev) {
	window.open("https://signin.intra.42.fr/");
	window.close();
});

buttons.auth.addEventListener("click", function(ev) {
	window.open("https://iintra.freekb.es/v2/connect");
	window.close();
});

buttons.openIntra.addEventListener("click", function(ev) {
	window.open("https://intra.42.fr/");
	window.close();
});

buttons.manageSlots.addEventListener("click", function(ev) {
	window.open("https://profile.intra.42.fr/slots");
	window.close();
});

buttons.listProjects.addEventListener("click", function(ev) {
	window.open("https://projects.intra.42.fr/");
	window.close();
});

buttons.viewProfile.addEventListener("click", function(ev) {
	window.open("https://profile.intra.42.fr/users/me");
	window.close();
});

buttons.extSettings.addEventListener("click", function(ev) {
	window.open("https://iintra.freekb.es/options.php");
	window.close();
});


// get extension settings and show items accordingly
improvedStorage.get(["username", "iintra-server-session"]).then(function(data) {
	// if logged in at 42, continue
	if (data["username"]) {
		// if authenticated with Improved Intra 42 back-end, show main menu
		if (data["iintra-server-session"]) {
			switchMenus("main-menu");
		}
		else {
			switchMenus("auth-menu");
		}
	}
});
