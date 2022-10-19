/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   coa-titles.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/02/12 16:49:41 by fbes          #+#    #+#                 */
/*   Updated: 2022/02/12 17:32:25 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const coaTitleRegex = new RegExp(/ \(([0-9]{1,2}(st|nd|rd|th){1}|[ABCDEF]{1})\)/g);

function autoEquipCoaTitle(loggedInUserName) {
	const headerLoginName = document.querySelector("span.login[data-login]");
	if (!headerLoginName || headerLoginName.textContent !== loggedInUserName) {
		return;
	}

	const titleSelectButton = headerLoginName.closest(".dropdown-toggle");
	if (!titleSelectButton) {
		iConsole.warn("No title select button, but auto-equipping coalition titles is enabled!");
		return;
	}

	const titleSelectDropdown = titleSelectButton.nextElementSibling;
	if (!titleSelectDropdown || titleSelectDropdown.nodeName != "UL") {
		iConsole.warn("No title select dropdown, but auto-equipping coalition titles is enabled!");
		return;
	}

	// if no title equipped, the element's text content will just be the user's username
	// otherwise, the textContent will include the title. if a title is present, we do not override it
	if (headerLoginName.textContent == headerLoginName.getAttribute("data-login")) {
		const userTitles = titleSelectDropdown.querySelectorAll("a[href*=\"/titles_users/\"]");
		iConsole.log(userTitles);
		for (let i = 0; i < userTitles.length; i++) {
			if (userTitles[i].textContent.match(coaTitleRegex)) {
				iConsole.log("Found coalition title! Equipping by clicking on it...");
				iConsole.log(userTitles[i]);
				userTitles[i].click();
				break;
			}
			else {
				iConsole.log("Not coalition title " + userTitles[i].textContent);
			}
		}
	}
	else {
		iConsole.log("Coalition title is already equipped, not equipping now.");
	}
}

improvedStorage.get(["username", "codam-auto-equip-coa-title"]).then(function(data) {
	if (optionIsActive(data, "codam-auto-equip-coa-title")) {
		autoEquipCoaTitle(data["username"]);
	}
});
