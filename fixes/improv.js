/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 17:56:20 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

function openLocationMap(event) {
	const win = null;
	let url = null;

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
	// could also do it with the extension but then we need more permissions...
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

function colorizeLogtimeChart(event) {
	setTimeout(function() {
		const ltSvg = document.getElementById("user-locations");
		if (!ltSvg) {
			return;
		}
		const ltDays = ltSvg.getElementsByTagName("rect");
		const col24hex = getComputedStyle(document.documentElement).getPropertyValue('--logtime-chart-24h-color');
		if (col24hex !== "") {
			const col24rgb = hexToRgb(col24hex.trim());
			for (let i = 0; i < ltDays.length; i++) {
				const fill = ltDays[i].getAttribute("fill");
				if (fill.indexOf("rgba") > -1) {
					const opacity = fill.replace(/^.*,(.+)\)/, '$1');
					ltDays[i].setAttribute("fill", "rgba("+col24rgb.r+","+col24rgb.g+","+col24rgb.b+","+opacity+")");
				}
			}
		}
	}, 250);
}

function setOptionalImprovements() {
	var broadcastNav = document.querySelector(".broadcast-nav");
	if (broadcastNav) {
		improvedStorage.get("hide-broadcasts").then(function(data) {
			if (data["hide-broadcasts"] === true || data["hide-broadcasts"] === "true") {
				broadcastNav.style.display = "none";
			}
		});
	}

	var goalsContainer = document.getElementById("goals_container");
	if (goalsContainer) {
		improvedStorage.get("hide-goals").then(function(data) {
			if (data["hide-goals"] === true || data["hide-goals"] === "true") {
				goalsContainer.style.display = "none";
			}
		});
	}

	if (hasProfileBanner()) {
		var userPosteInfos = document.querySelector(".user-poste-infos");
		if (userPosteInfos) {
			improvedStorage.get("clustermap").then(function(data) {
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

	// fix things on profile banners
	if (hasProfileBanner()) {
		var profileActions = document.querySelector(".profile-item .user-primary .user-infos .button-actions");
		var telInfo = document.querySelector(".profile-infos-item a[href*=\"tel:\"]");
		var mailInfo = document.querySelector(".profile-infos-item a[href*=\"mailto:\"]");
		var gitHubInfo = document.querySelector("#ii-profile-link-github");
		var cursusSelector = document.querySelector(".cursus-user-select");

		// fix coalition colored links
		setStyleIfExists(".coalition-name a", "color", getCoalitionColor());
		setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

		// fix black hole text color
		// and if old-blackhole setting is enabled, replace text with old countdown style
		var bhColorTimer = setInterval(function() {
			var bhDate = document.querySelector("#bh-date");
			if (bhDate) {
				var bhDateTitle = bhDate.parentNode.getAttribute("data-original-title");
				if (bhDate.innerText.indexOf("absorbed") > -1) {
					clearInterval(bhColorTimer);
					bhDate.style.color = "var(--fail-color)";
					if (getProfileUserName) {
						improvedStorage.get("username").then(function(data) {
							if (data["username"] && data["username"] != getProfileUserName()) {
								bhDate.innerText = "User has been absorbed by the Black Hole.";
							}
						});
					}
				}
				else if (bhDateTitle.indexOf("days left") > -1) {
					var daysRemaining = parseInt(bhDateTitle);
					if (isNaN(daysRemaining)) {
						return;
					}
					clearInterval(bhColorTimer);
					iConsole.log("Black Hole days remaining: ", daysRemaining);
					improvedStorage.get("old-blackhole").then(function(data) {
						if (data["old-blackhole"] === true || data["old-blackhole"] === "true") {
							bhDate.parentNode.setAttribute("data-original-title", bhDate.innerText);
							bhDate.innerText = daysRemaining.toString() + " days left";

							// add bootstrap tooltip to holder
							var evt = new CustomEvent("add-tooltip", { detail: "#bh > .emote-bh" });
							document.dispatchEvent(evt);

							var smiley = document.createElement("span");
							smiley.setAttribute("id", "lt-emote");
							if (daysRemaining > 30) {
								smiley.setAttribute("class", "icon-smiley-relax");
								bhDate.style.color = "var(--success-color)";
								smiley.style.color = "var(--success-color)";
							}
							else {
								smiley.setAttribute("class", "icon-smiley-surprise");
								bhDate.style.color = "var(--warning-color)";
								smiley.style.color = "var(--warning-color)";
							}
							bhDate.parentNode.insertBefore(smiley, bhDate);
						}
						else {
							if (daysRemaining > 30) {
								bhDate.style.color = "var(--text-color)";
							}
							else {
								// stylize in warning color if less than 30 colors remaining, just to point it out to user
								bhDate.style.color = "var(--warning-color)";
							}
						}
					});
				}
				else {
					// fallback styling
					bhDate.style.color = "var(--text-color)";
				}
			}
		}, 100);

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
		if (gitHubInfo) {
			gitHubInfo.addEventListener("mouseenter", setCoalitionTextColor);
		}
		if (cursusSelector) {
			cursusSelector.addEventListener("change", function(event) {
				setTimeout(function() {
					var titleSelectorCaret = document.querySelector(".caret[style*='color:']");
					if (titleSelectorCaret) {
						titleSelectorCaret.style.color = getCoalitionColor();
					}
					var gitHubInfo = document.querySelector("#ii-profile-link-github");
					if (gitHubInfo) {
						gitHubInfo.parentNode.style.color = getCoalitionColor();
					}
				}, 250);
			});
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
		// extensionSettingsLink.setAttribute("href", chrome.runtime.getURL('options/options.html'));
		extensionSettingsLink.setAttribute("href", "https://darkintra.freekb.es/options.php");
		extensionSettingsLink.setAttribute("target", "_self");
		extensionSettingsLink.innerText = "Improved Intra Settings";
		extensionSettings.appendChild(extensionSettingsLink);
		userMenu.insertBefore(extensionSettings, userMenu.children[userMenu.children.length - 1]);
	}

	var ltSvg = document.getElementById("user-locations");
	if (ltSvg) {
		colorizeLogtimeChart();
		ltSvg.addEventListener("load", colorizeLogtimeChart);
	}

	// add titles to achievement names and descriptions for better readability
	var achievementItemContents = document.getElementsByClassName("achievement-item--content");
	for (var i = 0; i < achievementItemContents.length; i++) {
		var achName = achievementItemContents[i].querySelector("h1");
		var achDesc = achievementItemContents[i].querySelector("p");

		if (achName) {
			achName.setAttribute("title", achName.textContent.replaceAll("\n", ""));
		}
		if (achDesc) {
			achDesc.setAttribute("title", achDesc.textContent);
		}
	}

	// add day names to agenda overview on dashboard
	var currentDate = new Date();
	var eventLefts = document.getElementsByClassName("event-left");
	var jsDate, date, month;
	for (var i = 0; i < eventLefts.length; i++) {
		date = eventLefts[i].querySelector(".date-day").textContent;
		month = eventLefts[i].querySelector(".date-month").textContent;
		jsDate = new Date(date + " " + month + " " + currentDate.getFullYear());
		if (jsDate.getMonth() < currentDate.getMonth()) {
			jsDate = new Date(date + " " + month + " " + (currentDate.getFullYear() + 1));
		}
		var dayNameElem = document.createElement("div");
		dayNameElem.className = "date-day-name";
		dayNameElem.innerText = jsDate.toLocaleString("en", { weekday: 'short' });
		eventLefts[i].insertBefore(dayNameElem, eventLefts[i].firstElementChild);
	}

	// april 1st easter egg
	const today = new Date();
	if (today.getMonth() == 3 && today.getDate() == 1) {
		iConsole.log("It's april first! Using Comic Sans everywhere");
		const elements = document.querySelectorAll("body, a, .user-primary, text, .name, .login, .modal-header, h4, h3");
		for (let i = 0; i < elements.length; i++) {
			if (elements[i].nodeName == "TEXT") {
				elements[i].setAttribute("font-family", "\"Comic Sans MS\", \"Comic Sans\", fantasy");
			}
			else {
				elements[i].style.fontFamily = "\"Comic Sans MS\", \"Comic Sans\", fantasy";
			}
		}
	}
}

// enable general improvements
setGeneralImprovements();

// enable optional improvements
// can be enabled in extension options
setOptionalImprovements();

// communication between background.js and this script
let improvPort = chrome.runtime.connect({ name: portName });
improvPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
improvPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "resynced":
		case "prefers-color-scheme-change":
		case "options-changed":
			iConsole.log("Settings changed. Enabling settings that can be enabled. Settings that must be disabled, will disable after a refresh.");
			checkThemeSetting();
			setOptionalImprovements();
			colorizeLogtimeChart();
			if (typeof setCustomProfile != "undefined") {
				setCustomProfile();
			}
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});

// reconnect every 4-5 minutes to keep service worker running in background
setInterval(function() {
	improvPort.disconnect();
	improvPort = chrome.runtime.connect({ name: portName });
}, 250000);
