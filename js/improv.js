/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/12/03 19:46:48 by fbes          ########   odam.nl         */
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

// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	  return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function setCoalitionTextColor(event) {
	event.target.style.color = getCoalitionColor();
}

function unsetCoalitionTextColor(event) {
	event.target.style.color = null;
}

function hasProfileBanner() {
	return (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/"));
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
			if (event.target.textContent.indexOf(".codam.nl") > -1) {
				url = "https://codamhero.dev/v2/clusters.php";
			}
			else {
				url = "https://meta.intra.42.fr/clusters";
			}
			break;
		}
	}
	win = window.open(url, "improved_intra_cluster_map_win");
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

function setStyleIfExists(query, style, value, parentPlease) {
	var elem = document.querySelector(query);
	if (elem) {
		if (parentPlease) {
			elem = elem.parentNode;
		}
		elem.style[style] = value;
	}
}

function colorizeLogtimeChart(event) {
	setTimeout(function() {
		var ltSvg = document.getElementById("user-locations");
		if (!ltSvg) {
			return;
		}
		var ltDays = ltSvg.getElementsByTagName("rect");
		var fill = null;
		var opacity = 0;
		var col24 = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
		if (col24 != "") {
			col24 = hexToRgb(col24.trim());
			for (var i = 0; i < ltDays.length; i++) {
				fill = ltDays[i].getAttribute("fill");
				if (fill.indexOf("rgba") > -1) {
					opacity = fill.replace(/^.*,(.+)\)/, '$1');
					ltDays[i].setAttribute("fill", "rgba("+col24.r+","+col24.g+","+col24.b+","+opacity+")");
				}
			}
		}
	}, 100);
}

function setOptionalImprovements() {
	var broadcastNav = document.querySelector(".broadcast-nav");
	if (broadcastNav) {
		chrome.storage.local.get("hide-broadcasts", function(data) {
			if (data["hide-broadcasts"] === true || data["hide-broadcasts"] === "true") {
				broadcastNav.style.display = "none";
			}
		});
	}

	var goalsContainer = document.getElementById("goals_container");
	if (goalsContainer) {
		chrome.storage.local.get("hide-goals", function(data) {
			if (data["hide-goals"] === true || data["hide-goals"] === "true") {
				goalsContainer.style.display = "none";
			}
		});
	}

	if (hasProfileBanner()) {
		var userPosteInfos = document.querySelector(".user-poste-infos");
		if (userPosteInfos) {
			chrome.storage.local.get("clustermap", function(data) {
				if ((data["clustermap"] === true || data["clustermap"] === "true") && userPosteInfos.innerText != "-") {
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
			});
		}
	}
}

function randomIntFromInterval(min, max) { // min and max included
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function setGeneralImprovements() {
	// easter egg
	if (window.location.hash == "#haha") {
		var elements = document.querySelectorAll("*");
		for (var i = 0; i < elements.length; i++) {
			elements[i].className += " funnyhaha";
			elements[i].style.animationDuration = randomIntFromInterval(0.1, 10) + "s";
			elements[i].style.animationDelay = randomIntFromInterval(0, 10) + "s";
		}
	}

	// easter egg for user fbes
	if (getUserName() == "fbes") {
		var banner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
		if (banner) {
			banner.className += " egg";
		}
	}

	// fix coalition colored links
	setStyleIfExists(".coalition-name a", "color", getCoalitionColor());
	setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

	// fix things on profile banners
	if (hasProfileBanner()) {
		var profileActions = document.querySelector(".profile-item .user-primary .user-infos .button-actions");
		var telInfo = document.querySelector(".profile-infos-item a[href*=\"tel:\"]");
		var mailInfo = document.querySelector(".profile-infos-item a[href*=\"mailto:\"]");

		if (profileActions) {
			profileActions.addEventListener("mouseenter", setCoalitionTextColor);
			profileActions.addEventListener("mouseleave", unsetCoalitionTextColor);
		}

		if (telInfo) {
			telInfo.addEventListener("mouseenter", setCoalitionTextColor);
		}
		if (mailInfo) {
			mailInfo.addEventListener("mouseenter", setCoalitionTextColor);
		}
	}

	// add link to options in account/user menu
	var userMenu = document.querySelector(".main-navbar-user-nav ul[role='menu']");
	if (userMenu) {
		var intraSettingsOption = userMenu.querySelector("a[href='https://profile.intra.42.fr/languages']");
		if (intraSettingsOption) {
			intraSettingsOption.innerText = "Intranet Settings";
		}
		var extensionSettings = document.createElement("li");
		var extensionSettingsLink = document.createElement("a");
		extensionSettingsLink.setAttribute("href", chrome.runtime.getURL('options/options.html'));
		extensionSettingsLink.setAttribute("target", "_self");
		extensionSettingsLink.innerText = "Improved Intra Settings";
		extensionSettings.appendChild(extensionSettingsLink);
		userMenu.insertBefore(extensionSettings, userMenu.children[userMenu.children.length - 1]);
	}

	var ltSvg = document.getElementById("user-locations");
	if (ltSvg) {
		ltSvg.addEventListener("load", colorizeLogtimeChart);
	}
}

// enable general improvements
setGeneralImprovements();

// enable optional improvements
// can be enabled in extension options
setOptionalImprovements();

// communication between background.js and this script
var syncPort = chrome.runtime.connect({ name: "sync_port" });
syncPort.onDisconnect.addListener(function() {
	console.log("%c[Improved Intra]%c Disconnected from service worker", "color: #00babc;", "");
});
syncPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			console.log("pong");
			break;
		case "resynced":
		case "prefers-color-scheme-change":
		case "options-changed":
			console.log("%c[Improved Intra]%c Settings changed. Enabling settings that can be enabled. Settings that must be disabled, will disable after a refresh.", "color: #00babc;", "");
			checkThemeSetting();
			setOptionalImprovements();
			colorizeLogtimeChart();
			break;
		case "error":
			console.error(msg["message"]);
			break;
	}
});

// reconnect every 4-5 minutes to keep service worker running in background
setInterval(function() {
	syncPort.disconnect();
	syncPort = chrome.runtime.connect({ name: "sync_port" });
}, 250000);
