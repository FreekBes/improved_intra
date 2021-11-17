/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/17 21:18:42 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

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
