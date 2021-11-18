/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/18 00:33:47 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

function getCoalitionColor() {
	try {
		return (document.getElementsByClassName("coalition-span")[0].style.color);
	}
	catch (err) {
		return ("#FF0000");
	}
}

function getCampus() {
	try {
		var iconLocation = document.getElementsByClassName("icon-location");
		return (iconLocation[0].nextSibling.nextSibling.textContent);
	}
	catch (err) {
		return (null);
	}
}

if (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/")) {
	var userPosteInfos = document.getElementsByClassName("user-poste-infos");

	if (userPosteInfos.length > 0 && userPosteInfos[0].innerText != "-") {
		userPosteInfos[0].style.cursor = "pointer";
		userPosteInfos[0].className += " improved";
		userPosteInfos[0].addEventListener("mouseenter", function(event) {
			event.target.style.color = getCoalitionColor();
		});
		userPosteInfos[0].addEventListener("mouseleave", function(event) {
			event.target.style.color = null;
		});
		userPosteInfos[0].addEventListener("click", function(event) {
			var win = null;
			var url = null;

			switch (getCampus()) {
				case "Amsterdam":
					url = "https://codamhero.dev/v2/clusters.php";
					break;
				case "Paris":
					url = "https://stud42.fr/clusters";
					break;
				default: {
					if (userPosteInfos[0].textContent.indexOf(".codam.nl") > -1) {
						url = "https://codamhero.dev/v2/clusters.php";
					}
					else {
						url = "https://meta.intra.42.fr/clusters";
					}
					break;
				}
			}
			win = window.open(url, "dark_intra_cluster_map_win");
			// since we can no longer check when a window is loaded with an event
			// for domains that are not of the same origin, we simply try and send
			// the location ID multiple times to the opened cluster map window
			setTimeout(function() {
				win.location.href = url + "#" + event.target.textContent.split(".")[0];
			}, 250);
			setTimeout(function() {
				win.location.href = url + "#";
				win.location.href = url + "#" + event.target.textContent.split(".")[0];
			}, 500);
			setTimeout(function() {
				win.location.href = url + "#";
				win.location.href = url + "#" + event.target.textContent.split(".")[0];
			}, 750);
			setTimeout(function() {
				win.location.href = url + "#";
				win.location.href = url + "#" + event.target.textContent.split(".")[0];
			}, 1000);
		});
	}
}

function setStyleIfExists(query, style, value, parentPlease) {
	var elem = document.querySelector(query);
	if (elem) {
		if (parentPlease) {
			elem = elem.parentNode;
		}
		elem.style[style] = value;
	}
}

setStyleIfExists(".button-actions", "color", getCoalitionColor());
setStyleIfExists(".coalition-name", "color", getCoalitionColor());
setStyleIfExists(".correction-point-btn", "color", getCoalitionColor(), true);

// contributor easter eggs
if (window.location.pathname.indexOf("/users/") == 0) {
	var contributors = [ "fbes", "pde-bakk", "lde-la-h", "ieilat" ];
	var userNameElem = document.querySelector(".profile-name span.login");
	if (userNameElem) {
		var userName = userNameElem.getAttribute("data-login");
		if (contributors.indexOf(userName) > -1) {
			userNameElem.className += " egg";
		}
		if (userName == contributors[0]) {
			var banner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
			if (banner) {
				banner.className += " egg";
			}
		}
	}
}
