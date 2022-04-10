/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   banners.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:53:49 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:17:23 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function fixProfileBanners() {
	// fix coalition colored links
	setStyleIfExists(".coalition-name a", "color", getCoalitionColor());
	setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

	// fix black hole container issues, such as text color
	if (document.getElementById("goals_container")) {
		fixBlackHoleContainer();
	}

	const profileActions = document.querySelector(".profile-item .user-primary .user-infos .button-actions");
	if (profileActions) {
		profileActions.addEventListener("mouseenter", setCoalitionTextColor);
		profileActions.addEventListener("mouseleave", unsetCoalitionTextColor);
	}

	const telInfo = document.querySelector(".profile-infos-item a[href*=\"tel:\"]");
	if (telInfo) {
		telInfo.addEventListener("mouseenter", setCoalitionTextColor);
	}

	const mailInfo = document.querySelector(".profile-infos-item a[href*=\"mailto:\"]");
	if (mailInfo) {
		mailInfo.addEventListener("mouseenter", setCoalitionTextColor);
	}

	const gitHubInfo = document.querySelector("#ii-profile-link-github");
	if (gitHubInfo) {
		gitHubInfo.addEventListener("mouseenter", setCoalitionTextColor);
	}

	const cursusSelector = document.querySelector(".cursus-user-select");
	if (cursusSelector) {
		// fix coalition colored elements on cursus selector change
		cursusSelector.addEventListener("change", function(event) {
			setTimeout(function() {
				const titleSelectorCaret = document.querySelector(".caret[style*='color:']");
				if (titleSelectorCaret) {
					titleSelectorCaret.style.color = getCoalitionColor();
				}

				const gitHubInfo = document.querySelector("#ii-profile-link-github");
				if (gitHubInfo) {
					gitHubInfo.parentNode.style.color = getCoalitionColor();
				}
			}, 250);
		});
	}
}
