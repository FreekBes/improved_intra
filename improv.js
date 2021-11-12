/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/13 00:58:12 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// this file is used for general improvements on the website

if (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/")) {
	var userPosteInfos = document.getElementsByClassName("user-poste-infos");
	if (userPosteInfos.length > 0 && userPosteInfos[0].textContent.indexOf(".codam.nl") > -1) {
		userPosteInfos[0].style.cursor = "pointer";
		userPosteInfos[0].addEventListener("click", function(event) {
			window.open("https://codamhero.dev/v2/clusters.php#"+event.target.textContent.split(".")[0]);
		});
	}
}
