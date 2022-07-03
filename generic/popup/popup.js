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
	buildingHours: document.getElementById("codam-monit"),
	login: document.getElementById("intra-login")
};

buttons.login.addEventListener("click", function(ev) {
	window.open("https://signin.intra.42.fr/");
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

buttons.buildingHours.addEventListener("click", function(ev) {
	let yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	document.getElementById("monit-date").value = dateToInputDate(yesterday)[0];
	switchMenus("building-hours-inputter");
	document.getElementById("monit-hours").focus(); // focus on hours after pre filling in date
});

buttons.extSettings.addEventListener("click", function(ev) {
	window.open("https://darkintra.freekb.es/options.php");
	window.close();
});


// get extension settings and show items accordingly
improvedStorage.get(["username", "codam-monit"]).then(function(data) {
	// if logged in, hide the login button and show menu
	if (data["username"]) {
		switchMenus("main-menu");
	}

	// enable building hours button if Monitoring System progress is enabled
	if (false && optionIsActive(data, "codam-monit")) {
		buttons.buildingHours.style.display = "block";
	}
});


// building hours form validation
function validateBuildingHoursForm(form) {
	const dateField = document.getElementById("monit-date");
	const hoursField = document.getElementById("monit-hours");
	const minsField = document.getElementById("monit-minutes");

	const date = new Date(dateField.value);
	if (isNaN(date)) {
		dateField.setCustomValidity("Invalid date");
		dateField.reportValidity();
		return (false); // date is invalid
	}

	dateField.setCustomValidity("");
	dateField.reportValidity();
	hoursField.reportValidity();
	minsField.reportValidity();
	return (true);
}


// building hours form submitter
function submitBuildingHoursForm(form) {
	if (!validateBuildingHoursForm(form)) {
		return (false);
	}
	alert("This feature has not been implemented yet.");
	return (true);
}
document.getElementById("monit-submit").addEventListener("click", function(ev) {
	submitBuildingHoursForm(ev.currentTarget.parentNode);
});
document.getElementById("monit-hours").addEventListener("change", function(ev) {
	const input = parseInt(ev.currentTarget.value);
	if (input >= 24) {
		document.getElementById("monit-minutes").setAttribute("max", "0");
	}
	else {
		document.getElementById("monit-minutes").setAttribute("max", "59");
	}
});
