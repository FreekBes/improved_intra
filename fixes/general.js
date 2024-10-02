/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   general.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:52:19 by fbes          #+#    #+#                 */
/*   Updated: 2024/01/17 21:00:05 by fbes          ########   odam.nl         */
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
	if (isIntraV3) {
		return;
	}

	// fix things on profile banners
	if (hasProfileBanner()) {
		fixProfileBanners();
	}

	const userMenu = document.querySelector(".main-navbar-user-nav ul[role='menu']");
	if (userMenu) {
		// add link to extension options in account/user menu
		createMenuLink(userMenu, "https://iintra.freekb.es/v2/options", "Improved Intra Settings", userMenu.lastElementChild);

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
		colorizeNewLogTimeDays();
		ltSvg.addEventListener("load", colorizeNewLogTimeDays);
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

	// add class to the agenda overview on dashboard for improved styling
	const eventsList = document.getElementById("events-list");
	if (eventsList) {
		const agendaContainer = eventsList.closest(".container-inner-item.boxed");
		if (agendaContainer) {
			agendaContainer.classList.add("agenda-container");

			// Add button to sync calendar to Google Calendar with Improved Intra
			const syncButton = document.createElement("a");
			syncButton.className = "btn simple-link";
			syncButton.href = "https://iintra.freekb.es/v2/options/calendar";
			syncButton.innerText = "Set up sync";
			const pullRight = agendaContainer.querySelector(".pull-right");
			if (pullRight) {
				// Insert before filters button
				pullRight.insertBefore(syncButton, pullRight.lastElementChild);
			}
		}
	}

	// add hide button to sidebar menu if it exists on the page
	// but not on the holy graph page (it bugs the canvas)
	if (!window.location.pathname.startsWith("/projects/graph")) {
		const sidebarMenu = document.querySelector(".app-sidebar-left");
		const leftSidebarFix = document.querySelector(".left-sidebar-fix");
		const pageContent = document.querySelector(".page-content");
		if (sidebarMenu) {
			const hideButton = document.createElement("button");
			hideButton.className = "sidebar-hide-button emote icon-arrow-37";
			hideButton.setAttribute("title", "Hide sidebar");
			hideButton.addEventListener("click", function(ev) {
				sidebarMenu.classList.toggle("app-sidebar-hidden");
				if (leftSidebarFix) {
					leftSidebarFix.classList.toggle("sidebar-fix-hidden");
				}
				if (pageContent) {
					pageContent.classList.toggle("page-content-fluid");
				}
				ev.currentTarget.classList.toggle("icon-arrow-38");
				ev.currentTarget.classList.toggle("icon-arrow-37");
				ev.currentTarget.blur();
			});
			sidebarMenu.insertBefore(hideButton, sidebarMenu.firstChild);
		}
	}
}

/**
 * Enable April Fools easter egg
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
 * Enable random rotations easter egg
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
	[...document.querySelectorAll('.correction-comment-item, .feedback-item')].forEach(item => {
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
	iConsole.log("Converted all feedback text nodes found in page to span elements and trimmed their contents");
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
	iConsole.log("Trimmed all feedbacks found in page");
}

/**
 * Order administration users select box by login alphabetically
 * @param {RegExpExecArray} match
 */
function setInternshipAdministrationImprovements(match) {
	const administrationSelectBox = document.getElementById("administrations_user_user_id");
	if (administrationSelectBox) {
		const administrationSelectBoxOptions = administrationSelectBox.querySelectorAll("option");
		const administrationSelectBoxOptionsArray = Array.from(administrationSelectBoxOptions);
		administrationSelectBoxOptionsArray.sort((a, b) => {
			return a.text.localeCompare(b.text);
		});
		administrationSelectBoxOptionsArray.forEach(option => {
			administrationSelectBox.appendChild(option);
		});
		iConsole.log("Sorted administration users select box by login alphabetically");
	}
}

/**
 * Improvements for Intra v3 early access page (add note that v3 is not supported by Improved Intra)
 * @param {RegExpExecArray} match
 */
function setEarlyAccessImprovements(match) {
	const earlyAccessContainer = document.getElementById("profile-v3-early-access-container");
	if (earlyAccessContainer) {
		const earlyAccessNote = document.createElement("p");
		earlyAccessNote.className = "alert alert-warning";
		earlyAccessNote.style.marginTop = "6rem";
		earlyAccessNote.style.fontWeight = "bold";
		earlyAccessNote.style.whiteSpace = "pre-wrap"; // make sure the note line breaks on \r\n
		earlyAccessNote.innerText = "Improved Intra is not compatible with Intra v3 and probably never will be.\r\n\r\nThis is because the new Intra is impossible to work with for extensions due to its heavy use of elements without specific ids or classes (blame poorly used frameworks).\r\nIf you want to use Improved Intra without issues, keep using Intra v2. If you want to use v3, it is recommended to disable the Improved Intra extension.";
		earlyAccessContainer.appendChild(earlyAccessNote);

		// replace the container class with container-inner-item class to prevent the container from going out of bounds
		while (wrongContainerUse = earlyAccessContainer.closest(".container")) {
			iConsole.log("Replaced container class with container-inner-item class", wrongContainerUse);
			wrongContainerUse.classList.replace("container", "container-inner-item");
		}
	}
}

/**
 * Improvements for user profile pages
 * @param {RegExpExecArray} match
 */
function setPageUserImprovements(match) {
	if (isIntraV3) {
		return;
	}

	// Sort marks listed by project name or by completion date
	const projectItemsContainer = document.querySelector("#marks .overflowable-item");
	if (projectItemsContainer) {
		const mainProjectItems = Array.from(projectItemsContainer.querySelectorAll(".main-project-item:not(.parent-item)"));
		const mainProjectItemCollapsables = Array.from(projectItemsContainer.querySelectorAll(".collapsable"));
		improvedStorage.get("sort-projects-date").then(function(data) {
			// Completion date sorter function (descending)
			const completionDateSorterDesc = (a, b) => {
				return (Date.parse(b.querySelector(".project-item-lighteable").dataset.longDate) - Date.parse(a.querySelector(".project-item-lighteable").dataset.longDate));
			};

			// Completion date sorter function (ascending)
			const completionDateSorterAsc = (a, b) => {
				return (Date.parse(a.querySelector(".project-item-lighteable").dataset.longDate) - Date.parse(b.querySelector(".project-item-lighteable").dataset.longDate));
			};

			// Alphabetical sorter function (ascending)
			const alphabeticalSorterAsc = (a, b) => {
				return a.querySelector(".marked-title").textContent.localeCompare(b.querySelector(".marked-title").textContent);
			};

			// Alphabetical sorter function (descending)
			const alphabeticalSorterDesc = (a, b) => {
				return b.querySelector(".marked-title").textContent.localeCompare(a.querySelector(".marked-title").textContent);
			};

			// Sort by completion date if the option sort-projects-date is active
			if (optionIsActive(data, "sort-projects-date")) {
				mainProjectItems.sort(completionDateSorterDesc);
			}
			// Default to alphabetic sorting otherwise
			else {
				mainProjectItems.sort(alphabeticalSorterAsc);
			}

			// Place main project items in the correct order
			mainProjectItems.forEach(item => {
				projectItemsContainer.appendChild(item);
			});

			// Sort collapsable project items by completion date (ascending, so that later on they will get appended to their corresponding main project item in the correct order)
			mainProjectItemCollapsables.sort(completionDateSorterAsc);

			// Place any collapsable project items under their corresponding main project item
			mainProjectItemCollapsables.forEach(collapsable => {
				// Find the main project item for this collapsable project item
				// (where data-project equals the id attribute of the collapsable and data-cursus equals the data-cursus attribute of the collapsable's project-item element)
				const collapsableProjectItem = collapsable.querySelector(".project-item");
				const mainProjectItem = projectItemsContainer.querySelector(`.project-item[data-project="${collapsableProjectItem.id}"][data-cursus="${collapsableProjectItem.dataset.cursus}"]`);
				if (mainProjectItem) {
					mainProjectItem.parentNode.insertBefore(collapsable, mainProjectItem.nextElementSibling);
				}
			});

			// Place any "parent-item" project items at the top, like on regular Intra
			const parentProjectItems = Array.from(projectItemsContainer.querySelectorAll(".main-project-item.parent-item"));

			// Reverse the order of the parent project items because the first one will be placed at the top, while in fact the last one found should be placed at the top
			parentProjectItems.reverse();

			// Place parent project items in the correct spot in the project items container
			parentProjectItems.forEach(parentProjectItem => {
				projectItemsContainer.insertBefore(parentProjectItem, projectItemsContainer.firstChild);

				// Add any collapsables for this ongoing project to the top as well
				// otherwise they will be placed at the previous location of the ongoing project (when it was sorted alphabetically)
				const parentProjectItemCollapsables = Array.from(projectItemsContainer.querySelectorAll(parentProjectItem.dataset.target));

				// Sort collapsables by alphabetical order (descending, so that they will get appended to their corresponding main project item in the correct order)
				parentProjectItemCollapsables.sort(alphabeticalSorterDesc);

				// Place collapsables in the correct spot in the project items container
				parentProjectItemCollapsables.forEach(collapsable => {
					projectItemsContainer.insertBefore(collapsable, projectItemsContainer.firstChild.nextSibling);
				});
			});

			iConsole.log("Sorted marks listed by project name");
		});
	}
	else {
		iConsole.warn("Could not find project items container (where marks are located). Unable to sort it.");
	}
}
