/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   general.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:52:19 by fbes          #+#    #+#                 */
/*   Updated: 2022/06/23 19:18:13 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function createMenuLink(userMenu, href, text, position) {
	const menuLink = document.createElement("a");
	menuLink.setAttribute("href", href);
	menuLink.setAttribute("target", "_self");
	menuLink.innerText = text;
	const menuItem = document.createElement("li");
	menuItem.appendChild(menuLink);
	if (position && typeof position == "object") {
		userMenu.insertBefore(menuItem, position);
	}
	else if (position == "bottom") {
		userMenu.appendChild(menuItem);
	}
	else {
		userMenu.insertBefore(menuItem, userMenu.children[0]);
	}
}

function setGeneralImprovements() {
	// fix things on profile banners
	if (hasProfileBanner()) {
		fixProfileBanners();
	}

	const userMenu = document.querySelector(".main-navbar-user-nav ul[role='menu']");
	if (userMenu) {
		// add link to extension options in account/user menu
		const intraSettingsOption = userMenu.querySelector("a[href='https://profile.intra.42.fr/languages']");

		// extensionSettingsLink.setAttribute("href", chrome.runtime.getURL('options/options.html'));
		createMenuLink(userMenu, "https://darkintra.freekb.es/options.php", "Improved Intra Settings", intraSettingsOption.parentNode.nextSibling);

		// add view my profile link if it seems to be missing from the menu
		if (!userMenu.querySelector("a[href*='https://profile.intra.42.fr/users/']")) {
			createMenuLink(userMenu, "https://profile.intra.42.fr/users/me", "View my profile");
		}

		// add manage slots link if it seems to be missing from the menu
		if (!userMenu.querySelector("a[href='https://profile.intra.42.fr/slots']")) {
			createMenuLink(userMenu, "https://profile.intra.42.fr/slots", "Manage slots");
		}
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
		dayNameElem.innerText = jsDate.toLocaleString("en", {weekday: 'short'});
		eventLefts[i].insertBefore(dayNameElem, eventLefts[i].firstElementChild);
	}
}

/**
 * Set april fools.
 */
function setAprilFools() {
	iConsole.log("It's april first! Using Comic Sans everywhere");
	const elements = document.querySelectorAll("body, a, .user-primary, text, .name, .login, .modal-header, h4, h3");
	for (let i = 0; i < elements.length; i++) {
		if (elements[i].nodeName === "TEXT") {
			elements[i].setAttribute("font-family", "\"Comic Sans MS\", \"Comic Sans\", fantasy");
		} else {
			elements[i].style.fontFamily = "\"Comic Sans MS\", \"Comic Sans\", fantasy";
		}
	}
}

/**
 * Set an easter egg.
 */
function setEasterEgg() {
	const elements = document.querySelectorAll("*");
	for (let i = 0; i < elements.length; i++) {
		elements[i].className += " funnyhaha";
		elements[i].style.animationDuration = randomIntFromInterval(0.1, 10) + "s";
		elements[i].style.animationDelay = randomIntFromInterval(0, 10) + "s";
	}
}

/**
 * Filter the scale team comments and trim the text to remove leading and trailing newlines
 * https://projects.intra.42.fr/projects/x/projects_users/x
 * @param {RegExpExecArray} match
 */
function setPageProjectsUsersImprovements(match) {
	[...document.querySelectorAll('.correction-comment-item')].forEach(item => {
		item.childNodes.forEach(childNode => {
			if (childNode.nodeType !== 3 || childNode.textContent.trim().length === 0) {
				return;
			}

			const span = document.createElement('span');
			span.innerText = childNode.textContent.trim();
			childNode.parentNode.insertBefore(span, childNode);
			childNode.parentNode.removeChild(childNode);
		});
	});
}

/**
 * Filter the scale team comments and trim the text to remove leading and trailing newlines
 * https://projects.intra.42.fr/users/x/feedbacks
 * @param {RegExpExecArray} match
 */
function setPageUserFeedbacksImprovements(match) {
	[...document.querySelectorAll('li.scaleteam-list-item .comment')].forEach(item => {
		item.innerText = item.textContent.trim();
	});
}

/**
 * @param {RegExpExecArray} match
 */
function setPageUserImprovements(match) {
	const button = document.createElement('a');
	button.textContent = 'Feedbacks logs';
	button.classList.add('simple-link', 'ml-2');
	button.setAttribute('href', `https://projects.intra.42.fr/users/${match.groups.login}/feedbacks`);

	const target = document.querySelector(`[href="/users/${match.groups.login}/correction_point_historics"]`);
	target.parentNode.insertBefore(button, target);
}

/**
 * @param {RegExpExecArray} match
 */
function setPageHolyGraphImprovements(match) {
	const cursuses = [
		{ id: 1, name: "42" },
		{ id: 3, name: "Discovery Piscine" },
		{ id: 4, name: "Piscine C" },
		{ id: 6, name: "Piscine C décloisonnée" },
		{ id: 7, name: "Piscine C à distance" },
		{ id: 9, name: "C Piscine" },
		{ id: 10, name: "Formation Pole Emploi" },
		{ id: 11, name: "Bootcamp" },
		{ id: 12, name: "Créa" },
		{ id: 13, name: "42 Labs" },
		{ id: 21, name: "42cursus" },
		{ id: 53, name: "42.zip" },
	];

	const cursusSwitcher = document.querySelector('#graph_cursus');
	const availableCursuses = [...cursusSwitcher.children].map(opt => parseInt(opt.getAttribute('value')));

	cursuses.forEach(cursus => {
		if (availableCursuses.indexOf(cursus.id) !== -1) {
			return;
		}

		const option = document.createElement('option');
		option.textContent = `${cursus.name} (Improved Intra)`;
		option.setAttribute('value', cursus.id.toString());
		cursusSwitcher.appendChild(option);
	});
}
