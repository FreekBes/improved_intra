/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   blackhole.js                                       :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:28:18 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 18:35:32 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// fix black hole text color
// and if old-blackhole setting is enabled, replace text with old countdown style
function fixBlackHoleContainer() {
	const bhColorTimer = setInterval(function() {
		const bhDate = document.querySelector("#modern-bh-date");
		if (bhDate) {
			const bhDateTitleElem = bhDate.closest("[data-original-title]");
			const bhDateTitle = bhDateTitleElem.getAttribute("data-original-title");
			if (bhDate.innerText.indexOf("absorbed") > -1) {
				clearInterval(bhColorTimer);
				bhDate.style.color = "var(--fail-color)";
				improvedStorage.get("username").then(function(data) {
					if (data["username"] && data["username"] != getProfileUserName()) {
						bhDate.innerText = "User has been absorbed by the Black Hole.";
					}
				});
			}
			else if (bhDateTitle.indexOf("days left") > -1) {
				const daysRemaining = parseInt(bhDateTitle);
				if (isNaN(daysRemaining)) {
					return;
				}
				clearInterval(bhColorTimer);
				iConsole.log("Black Hole days remaining: ", daysRemaining);
				improvedStorage.get("old-blackhole").then(function(data) {
					if (optionIsActive(data, "old-blackhole")) {
						bhDateTitleElem.setAttribute("data-original-title", bhDate.innerText);
						bhDate.innerText = daysRemaining.toString() + " days left";

						// add bootstrap tooltip to holder
						addToolTip("#bh > .emote-bh");

						const smiley = document.createElement("span");
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
}
