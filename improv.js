/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/25 15:49:15 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

function getCoalitionColor() {
	try {
		return (document.getElementsByClassName("coalition-span")[0].style.color);
	}
	catch (err) {
		return ("#FF0000");
	}
}

function getUserName() {
	try {
		return (document.querySelector(".login[data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

function getCampus() {
	try {
		var iconLocation = document.getElementsByClassName("icon-location");
		return (iconLocation[0].nextSibling.nextSibling.textContent);
	}
	catch (err) {
		return (null);
	}
}

function setCoalitionTextColor(event) {
	event.target.style.color = getCoalitionColor();
}

function unsetCoalitionTextColor(event) {
	event.target.style.color = null;
}

function openLocationMap(event) {
	var win = null;
	var url = null;

	switch (getCampus()) {
		case "Amsterdam":
			url = "https://codamhero.dev/v2/clusters.php";
			break;
		case "Paris":
			url = "https://stud42.fr/clusters";
			break;
		default: {
			if (userPosteInfos.textContent.indexOf(".codam.nl") > -1) {
				url = "https://codamhero.dev/v2/clusters.php";
			}
			else {
				url = "https://meta.intra.42.fr/clusters";
			}
			break;
		}
	}
	win = window.open(url, "dark_intra_cluster_map_win");
	// since we can no longer check when a window is loaded with an event
	// for domains that are not of the same origin, we simply try and send
	// the location ID multiple times to the opened cluster map window
	setTimeout(function() {
		win.location.href = url + "#" + event.target.textContent.split(".")[0];
	}, 250);
	setTimeout(function() {
		win.location.href = url + "#";
		win.location.href = url + "#" + event.target.textContent.split(".")[0];
	}, 500);
	setTimeout(function() {
		win.location.href = url + "#";
		win.location.href = url + "#" + event.target.textContent.split(".")[0];
	}, 750);
	setTimeout(function() {
		win.location.href = url + "#";
		win.location.href = url + "#" + event.target.textContent.split(".")[0];
	}, 1000);
}

if (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/")) {
	var userPosteInfos = document.querySelector(".user-poste-infos");
	var profileActions = document.querySelector(".profile-item .user-primary .user-infos .button-actions");
	var telInfo = document.querySelector(".profile-infos-item a[href*=\"tel:\"]");
	var mailInfo = document.querySelector(".profile-infos-item a[href*=\"mailto:\"]");

	if (profileActions) {
		profileActions.addEventListener("mouseenter", setCoalitionTextColor);
		profileActions.addEventListener("mouseleave", unsetCoalitionTextColor);
	}

	if (userPosteInfos && userPosteInfos.innerText != "-") {
		userPosteInfos.className += " improved";
		userPosteInfos.setAttribute("tabindex", "0");
		userPosteInfos.addEventListener("mouseenter", setCoalitionTextColor);
		userPosteInfos.addEventListener("mouseleave", unsetCoalitionTextColor);
		userPosteInfos.addEventListener("click", openLocationMap);
		userPosteInfos.addEventListener("keyup", function(event) {
			if (event.keyCode == 13) {
				openLocationMap(event);
			}
		});
	}

	if (telInfo) {
		telInfo.addEventListener("mouseenter", setCoalitionTextColor);
	}
	if (mailInfo) {
		mailInfo.addEventListener("mouseenter", setCoalitionTextColor);
	}
}

function setStyleIfExists(query, style, value, parentPlease) {
	var elem = document.querySelector(query);
	if (elem) {
		if (parentPlease) {
			elem = elem.parentNode;
		}
		elem.style[style] = value;
	}
}

setStyleIfExists(".coalition-name", "color", getCoalitionColor());
setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

// easter egg for user fbes
if (getUserName() == "fbes") {
	var banner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
	if (banner) {
		banner.className += " egg";
	}
}

// remove broadcasts button for codam
// if you see this, I'm wondering if any campuses actually use this ugly looking
// broadcasts feature. if not, I'll disable it for everyone. let me know!
var schoolRecordButton = document.querySelector(".school-record-button");
if (schoolRecordButton) {
	var srFormData = document.getElementsByName("sr_id");
	if (srFormData.length > 0) {
		var formData = srFormData[0].lastChild;
		if (formData && formData.textContent.indexOf("Codam") > -1) {
			var broadcastNav = document.querySelector(".broadcast-nav");
			if (broadcastNav) {
				broadcastNav.style.display = "none";
			}
		}
	}
}
