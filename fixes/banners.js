/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   banners.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:53:49 by fbes          #+#    #+#                 */
/*   Updated: 2023/05/09 12:26:38 by mvan-wij      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function fixProfileBanners() {
	// fix coalition colored links
	setStyleIfExists(".coalition-name a", "color", getCoalitionColor());
	setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

	// fix black hole container issues, such as text color
	if (document.getElementById("goals-container")) {
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

	const linkGit = document.querySelector("#ii-profile-link-git");
	if (linkGit) {
		linkGit.addEventListener("mouseenter", setCoalitionTextColor);
	}

	const linkWeb = document.querySelector("#ii-profile-link-web");
	if (linkWeb) {
		linkWeb.addEventListener("mouseenter", setCoalitionTextColor);
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

				const linkGit = document.querySelector("#ii-profile-link-git");
				if (linkGit) {
					linkGit.parentNode.style.color = getCoalitionColor();
				}

				const linkWeb = document.querySelector("#ii-profile-link-web");
				if (linkWeb) {
					linkWeb.parentNode.style.color = getCoalitionColor();
				}
			}, 250);
		});
	}
}
