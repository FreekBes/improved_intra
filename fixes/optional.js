/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   optional.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:55:12 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:22:28 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function setOptionalImprovements() {
	// hide broadcasts
	const broadcastNav = document.querySelector(".broadcast-nav");
	if (broadcastNav) {
		improvedStorage.get("hide-broadcasts").then(function(data) {
			if (data["hide-broadcasts"] === true || data["hide-broadcasts"] === "true") {
				broadcastNav.style.display = "none";
			}
		});
	}

	// hide black hole container
	const goalsContainer = document.getElementById("goals_container");
	if (goalsContainer) {
		improvedStorage.get("hide-goals").then(function(data) {
			if (data["hide-goals"] === true || data["hide-goals"] === "true") {
				goalsContainer.style.display = "none";
			}
		});
	}

	if (hasProfileBanner()) {
		// open cluster map on location click
		const userPosteInfos = document.querySelector(".user-poste-infos");
		if (userPosteInfos) {
			improvedStorage.get("clustermap").then(function(data) {
				if ((data["clustermap"] === true || data["clustermap"] === "true") && userPosteInfos.innerText != "-") {
					userPosteInfos.className += " improved";
					userPosteInfos.setAttribute("tabindex", "0");
					userPosteInfos.addEventListener("mouseenter", setCoalitionTextColor);
					userPosteInfos.addEventListener("mouseleave", unsetCoalitionTextColor);
					userPosteInfos.addEventListener("click", openClusterMap);
					userPosteInfos.addEventListener("auxclick", openClusterMap);
					userPosteInfos.addEventListener("keyup", function(event) {
						if (event.keyCode == 13) {
							openClusterMap(event);
						}
					});
				}
			});
		}
	}
}
