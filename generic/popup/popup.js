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

const buttons = {
	openIntra: document.getElementById("open-intra"),
	viewProfile: document.getElementById("view-profile"),
	extSettings: document.getElementById("ext-settings"),
	buildingHours: document.getElementById("codam-monit"),
	login: document.getElementById("intra-login")
};

buttons.login.addEventListener("click", function(ev) {
	window.open("https://signin.intra.42.fr/");
});

buttons.openIntra.addEventListener("click", function(ev) {
	window.open("https://intra.42.fr/");
});

buttons.viewProfile.addEventListener("click", function(ev) {
	window.open("https://profile.intra.42.fr/users/me");
});

buttons.extSettings.addEventListener("click", function(ev) {
	window.open("https://darkintra.freekb.es/options.php");
});

improvedStorage.get(["username", "codam-monit"]).then(function(data) {
	// if logged in, hide the login button and show menu
	if (data["username"]) {
		document.getElementById("plslogin").style.display = "none";
		document.getElementById("menu").style.display = "block";
	}

	// enable building hours button if Monitoring System progress is enabled
	if (optionIsActive(data, "codam-monit")) {
		buttons.buildingHours.style.display = "block";
	}
});
