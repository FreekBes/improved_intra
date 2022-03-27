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

var coaTitleRegex = new RegExp(/ \(([0-9]{1,2}(st|nd|rd|th){1}|[ABCDEF]{1})\)/g);

function autoEquipCoaTitle(loggedInUserName) {
	var headerLoginName = document.querySelector("span.login[data-login]");
	if (!headerLoginName || headerLoginName.textContent !== loggedInUserName) {
		return;
	}

	var titleSelectButton = headerLoginName.parentNode;
	if (!titleSelectButton || titleSelectButton.nodeName != "BUTTON") {
		console.warn("No title select button, but auto-equipping coalition titles is enabled!");
		return;
	}

	var titleSelectDropdown = titleSelectButton.nextElementSibling;
	if (!titleSelectDropdown || titleSelectDropdown.nodeName != "UL") {
		console.warn("No title select dropdown, but auto-equipping coalition titles is enabled!");
		return;
	}

	// if no title equipped, the element's text content will just be the user's username
	// otherwise, the textContent will include the title. if a title is present, we do not override it
	if (headerLoginName.textContent == headerLoginName.getAttribute("data-login")) {
		var userTitles = titleSelectDropdown.querySelectorAll("a[href*=\"/titles_users/\"]");
		for (var i = 0; i < userTitles.length; i++) {
			if (userTitles[i].textContent.match(coaTitleRegex)) {
				console.log("Found coalition title! Equipping by clicking on it...");
				console.log(userTitles[i]);
				userTitles[i].click();
				break;
			}
		}
	}
	else {
		console.log("Coalition title is already equipped, not equipping now.");
	}
}

improvedStorage.get(["username", "codam-auto-equip-coa-title"]).then(function(data) {
	if (data["codam-auto-equip-coa-title"] === true || data["codam-auto-equip-coa-title"] === "true") {
		autoEquipCoaTitle(data["username"]);
	}
});
