/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/13 01:18:41 by fbes          ########   odam.nl         */
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
		userPosteInfos[0].addEventListener("click", function(event) {
			switch (getCampus()) {
				case "Amsterdam":
					window.open("https://codamhero.dev/v2/clusters.php#"+event.target.textContent.split(".")[0]);
					break;
				case "Paris":
					window.open("https://stud42.fr/clusters#"+event.target.textContent);
					break;
				default: {
					if (userPosteInfos[0].textContent.indexOf(".codam.nl") > -1) {
						window.open("https://codamhero.dev/v2/clusters.php#"+event.target.textContent.split(".")[0]);
					}
					else {
						window.open("https://meta.intra.42.fr/clusters#"+event.target.textContent);
					}
					break;
				}
			}
		});
	}
}
