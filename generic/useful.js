/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   useful.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 17:03:38 by fbes          #+#    #+#                 */
/*   Updated: 2022/06/23 19:10:24 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// from https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url (jesus)
function validateUrl(value) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

// get the theme color of the Intranet
function getThemeColor() {
	const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
	return (color ? color : '#00babc'); // fallback
}

// get the coalition color of a user or coalition on a webpage
function getCoalitionColor() {
	let color = getThemeColor(); // fallback
	try {
		color = document.getElementsByClassName("coalition-span")[0].style.color;
	}
	catch (err) {
		iConsole.warn("Could not get coalition color, using theme color instead.");
	}
	return (color);
}

// get the name of the campus a user is part of (only on profile pages)
function getCampus() {
	try {
		const iconLocation = document.getElementsByClassName("icon-location");
		return (iconLocation[0].nextSibling.nextSibling.textContent);
	}
	catch (err) {
		return (null);
	}
}

// get the username from a profile
function getProfileUserName() {
	try {
		return (document.querySelector(".login[data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

// convert hex color to rgb color object
// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	  return (r + r + g + g + b + b);
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

// set the color of an element to the coalition color using an event
function setCoalitionTextColor(event) {
	event.target.style.color = getCoalitionColor();
}

// unset the color of an element using an event
function unsetCoalitionTextColor(event) {
	event.target.style.color = null;
}

// returns true if the current webpage has a profile banner
function hasProfileBanner() {
	return (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/"));
}

// get the URL of the current webpage without the hash and query
function getRawPageURL() {
	return (window.location.hostname + window.location.pathname);
}

// return a random integer between a min and a max, min and max included
function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// apply a CSS style to an element or its parent, if it exists
function setStyleIfExists(query, style, value, parentPlease) {
	let elem = document.querySelector(query);
	if (elem) {
		if (parentPlease) {
			elem = elem.parentNode;
		}
		elem.style[style] = value;
		return (true);
	}
	return (false);
}

// parse logtime from text (HHhMM or HH:MM) into minutes
function parseLogTime(logTimeText) {
	if (!logTimeText) {
		return (0);
	}
	const logTimeSplit = (logTimeText.indexOf("h") > -1 ? logTimeText.split("h") : logTimeText.split(":"));
	if (logTimeSplit.length < 2) {
		return (0);
	}
	return (parseInt(logTimeSplit[0]) * 60 + parseInt(logTimeSplit[1]));
}

// convert an amount of minutes into logtime text (HHhMM)
function logTimeToString(logTime) {
	return (Math.floor(logTime / 60) + "h" + (logTime % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}));
}

// convert a JS date to a string a date input would accept
// from https://stackoverflow.com/questions/14245339/pre-populating-date-input-field-with-javascript
function dateToInputDate(d) {
	// Date string
	let ds = d.getFullYear().toString().padStart(4, '0') + '-' + (d.getMonth()+1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
	// Time string
	let ts = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
	return [ds, ts];
  }

// add bootstrap tooltip to holder (send to inject.js)
function addToolTip(query) {
	const evt = new CustomEvent("add-tooltip", { detail: query });
	document.dispatchEvent(evt);
}

// check if a boolean option is true
function optionIsActive(improvedStorageData, optionKey) {
	// can be string or boolean, depending on where the data was fetched from. So check for both
	return (improvedStorageData[optionKey] === true || improvedStorageData[optionKey] === "true");
}

// check if the current page is a profile of a Codam student
function profileFromCodam() {
	if (window.location.pathname.indexOf("/users/") == 0) {
		// user profile. check if user loaded is from Amsterdam campus
		const iconLocation = document.getElementsByClassName("icon-location");
		if (iconLocation.length == 0) {
			return (false);
		}
		if (iconLocation[0].nextSibling.nextSibling.textContent != "Amsterdam") {
			return (false);
		}
	}
	if (window.location.pathname == "/") {
		// dashboard page. check if user logged in is from Amsterdam campus.
		// check by checking the school record button, should contain Codam
		// if the button is not there (before handing in Libft), check coalition
		const schoolRecordButton = document.querySelector(".school-record-button");
		if (schoolRecordButton) {
			const srFormData = document.getElementsByName("sr_id");
			if (srFormData.length > 0) {
				if (srFormData[0].textContent.indexOf("Codam") == -1) {
					return (false);
				}
			}
			else {
				return (false);
			}
		}
		else {
			const coalitionName = document.querySelector(".coalition-name .coalition-span");
			if (coalitionName) {
				if (["Pyxis", "Vela", "Cetus"].indexOf(coalitionName.textContent) == -1) {
					return (false);
				}
			}
			else {
				return (false);
			}
		}
	}
	return (true);
}
