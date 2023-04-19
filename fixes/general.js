/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   general.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:52:19 by fbes          #+#    #+#                 */
/*   Updated: 2023/03/08 17:58:31 by fbes          ########   odam.nl         */
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
		createMenuLink(userMenu, "https://iintra.freekb.es/v2/options", "Improved Intra Settings", intraSettingsOption.closest("li").nextSibling);

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

	// add class to the agenda overview on dashboard for improved styling
	const eventsList = document.getElementById("events-list");
	if (eventsList) {
		const agendaContainer = eventsList.closest(".container-inner-item.boxed");
		if (agendaContainer) {
			agendaContainer.classList.add("agenda-container");
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
 * Improvements for user profile pages
 * @param {RegExpExecArray} match
 */
function setPageUserImprovements(match) {
	// Sort marks listed by project name or by completion date
	const projectItemsContainer = document.querySelector("#marks .overflowable-item");
	if (projectItemsContainer) {
		const projectItems = projectItemsContainer.querySelectorAll(".main-project-item, .collapsable");
		const projectItemsArray = Array.from(projectItems);
		improvedStorage.get("sort-projects-date").then(function(data) {
			// Sort by completion date if the option is set
			if (optionIsActive(data, "sort-projects-date")) {
				projectItemsArray.sort((a, b) => {
					return (Date.parse(b.querySelector(".project-item-lighteable").dataset.longDate) - Date.parse(a.querySelector(".project-item-lighteable").dataset.longDate));
				});
			}
			// Default to alphabetic sorting otherwise
			else {
				projectItemsArray.sort((a, b) => {
					return a.querySelector(".marked-title > a").textContent.localeCompare(b.querySelector(".marked-title > a").textContent);
				});
			}
			projectItemsArray.forEach(item => {
				projectItemsContainer.appendChild(item);
			});
	
			// Place any ongoing project at the top (e.g. Internships)
			// Ongoing projects are marked by an icon with the class "icon-clock"
			const ongoingProjects = projectItemsContainer.querySelectorAll(".main-project-item .icon-clock");
			if (ongoingProjects.length > 0) {
				const ongoingProject = ongoingProjects[0].closest(".main-project-item");
				projectItemsContainer.insertBefore(ongoingProject, projectItemsContainer.firstChild);
	
				// Add any collapsables for this ongoing project to the top as well
				// otherwise they will be placed at the previous location of the ongoing project (when it was sorted alphabetically)
				const ongoingProjectCollapsables = projectItemsContainer.querySelectorAll(ongoingProject.getAttribute("data-target"));
				if (ongoingProjectCollapsables.length > 0) {
					ongoingProjectCollapsables.forEach(collapsable => {
						projectItemsContainer.insertBefore(collapsable, ongoingProject.nextElementSibling);
					});
				}
			}
	
			iConsole.log("Sorted marks listed by project name");
		});
	}
	else {
		iConsole.warn("Could not find project items container (where marks are located). Unable to sort it.");
	}
}
