/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   externalclustermap.js                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: natamazy <natamazy@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/03/28 18:38:32 by fbes              #+#    #+#             */
/*   Updated: 2024/03/27 11:11:35 by natamazy         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

function openClusterMap(event) {
	const location = event.target.textContent.split(".")[0];
	let url = null;
	let highlightAfter = false;
	switch (getCampus()) {
		case "Amsterdam":
			url = "https://codamhero.dev/v2/clusters.php";
			highlightAfter = true;
			break;
		case "Paris":
			const headerLoginName = getProfileUserName();
			url = "https://stud42.fr/clusters/" + headerLoginName;
			break;
		case "Kuala Lumpur":
			url = "https://locatepeer.vercel.app/"+location;
			break;
		case "\nYerevan\n":
			url = "https://dashboard-42yerevan.onrender.com/";
			break;
		default: {
			url = "https://meta.intra.42.fr/clusters#"+location.replaceAll(".", "");
			break;
		}
	}

	const win = window.open(url, "improved_intra_cluster_map_win");

	if (highlightAfter) {
		// if a cluster map takes a while to load, we can send the location over
		// later by setting highlightAfter to true.
		// since we can no longer check when a window is loaded with an event
		// for domains that are not of the same origin, we simply try and send
		// the location ID multiple times to the opened cluster map window.
		// do this every 250 milliseconds, for up to 5 seconds
		// could also do it with the extension but then we need more permissions...
		const highlightInterval = setInterval(function() {
			win.location.href = url + "#";
			win.location.href = url + "#" + location;
		}, 250);
		setTimeout(function() {
			clearInterval(highlightInterval);
		}, 5000);
	}
}
