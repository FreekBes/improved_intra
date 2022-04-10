/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   general.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:52:19 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:17:30 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function setGeneralImprovements() {
	// fix things on profile banners
	if (hasProfileBanner()) {
		fixProfileBanners();
	}

	// add link to options in account/user menu
	const userMenu = document.querySelector(".main-navbar-user-nav ul[role='menu']");
	if (userMenu) {
		const intraSettingsOption = userMenu.querySelector("a[href='https://profile.intra.42.fr/languages']");
		if (intraSettingsOption) {
			intraSettingsOption.innerText = "Intranet Settings";
		}

		const extensionSettingsLink = document.createElement("a");
		// extensionSettingsLink.setAttribute("href", chrome.runtime.getURL('options/options.html'));
		extensionSettingsLink.setAttribute("href", "https://darkintra.freekb.es/options.php");
		extensionSettingsLink.setAttribute("target", "_self");
		extensionSettingsLink.innerText = "Improved Intra Settings";

		const extensionSettings = document.createElement("li");
		extensionSettings.appendChild(extensionSettingsLink);

		userMenu.insertBefore(extensionSettings, userMenu.children[userMenu.children.length - 1]);
	}

	// colorize logtime chart based on color scheme
	const ltSvg = document.getElementById("user-locations");
	if (ltSvg) {
		colorizeLogtimeChart();
		ltSvg.addEventListener("load", colorizeLogtimeChart);
	}

	// add titles to achievement names and descriptions for better readability
	const achievementItemContents = document.getElementsByClassName("achievement-item--content");
	for (let i = 0; i < achievementItemContents.length; i++) {
		const achName = achievementItemContents[i].querySelector("h1");
		if (achName) {
			achName.setAttribute("title", achName.textContent.replaceAll("\n", ""));
		}

		const achDesc = achievementItemContents[i].querySelector("p");
		if (achDesc) {
			achDesc.setAttribute("title", achDesc.textContent);
		}
	}

	// add day names to agenda overview on dashboard
	const eventLefts = document.getElementsByClassName("event-left");
	for (let i = 0; i < eventLefts.length; i++) {
		const date = eventLefts[i].querySelector(".date-day").textContent;
		const month = eventLefts[i].querySelector(".date-month").textContent;
		let jsDate = new Date(date + " " + month + " " + today.getFullYear());
		if (jsDate.getMonth() < today.getMonth()) {
			jsDate = new Date(date + " " + month + " " + (today.getFullYear() + 1));
		}

		const dayNameElem = document.createElement("div");
		dayNameElem.className = "date-day-name";
		dayNameElem.innerText = jsDate.toLocaleString("en", { weekday: 'short' });
		eventLefts[i].insertBefore(dayNameElem, eventLefts[i].firstElementChild);
	}

	// april 1st easter egg
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

	// haha easter egg
	if (window.location.hash == "#haha") {
		const elements = document.querySelectorAll("*");
		for (let i = 0; i < elements.length; i++) {
			elements[i].className += " funnyhaha";
			elements[i].style.animationDuration = randomIntFromInterval(0.1, 10) + "s";
			elements[i].style.animationDelay = randomIntFromInterval(0, 10) + "s";
		}
	}
}
