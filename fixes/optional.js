/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   optional.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:55:12 by fbes          #+#    #+#                 */
/*   Updated: 2023/05/09 12:26:53 by mvan-wij      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function setOptionalImprovements() {
	// hide broadcasts
	const broadcastNav = document.querySelector(".broadcast-nav");
	if (broadcastNav) {
		improvedStorage.get("hide-broadcasts").then(function(data) {
			if (optionIsActive(data, "hide-broadcasts")) {
				broadcastNav.style.display = "none";
			}
		});
	}

	// hide help button ('Have a problem?' button in header)
	const helpButtonWrapper = document.querySelector(".main-navbar-user-nav .help-btn-wrapper");
	if (helpButtonWrapper) {
		improvedStorage.get("hide-help").then(function(data) {
			if (optionIsActive(data, "hide-help")) {
				helpButtonWrapper.style.display = "none";
				// Hide nav-seperator next to wrapper too
				const navSeparator = helpButtonWrapper.previousElementSibling;
				if (navSeparator && navSeparator.classList.contains("nav-separator")) {
					navSeparator.style.display = "none";
				}
			}
		});
	}

	// hide black hole container
	const goalsContainer = document.getElementById("goals-container");
	if (goalsContainer) {
		improvedStorage.get("hide-goals").then(function(data) {
			if (optionIsActive(data, "hide-goals")) {
				goalsContainer.style.display = "none";
			}
		});
	}

	if (hasProfileBanner()) {
		// open cluster map on location click
		const userPosteInfos = document.querySelector(".user-poste-infos");
		if (userPosteInfos) {
			improvedStorage.get("clustermap").then(function(data) {
				if (optionIsActive(data, "clustermap") && userPosteInfos.innerText != "-") {
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

/**
 * @param {RegExpExecArray} match
 */
function setPageHolyGraphImprovements(match) {
	improvedStorage.get("holygraph-morecursuses").then(function(data) {
		if (optionIsActive(data, "holygraph-morecursuses")) {
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
	});
}
