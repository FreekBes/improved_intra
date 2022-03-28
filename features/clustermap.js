/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   clustermap.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:38:32 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:03:24 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function openClusterMap(event) {
	let url = null;
	switch (getCampus()) {
		case "Amsterdam":
			url = "https://codamhero.dev/v2/clusters.php";
			break;
		case "Paris":
			url = "https://stud42.fr/clusters";
			break;
		default: {
			if (event.target.textContent.indexOf(".codam.nl") > -1) {
				url = "https://codamhero.dev/v2/clusters.php";
			}
			else {
				url = "https://meta.intra.42.fr/clusters";
			}
			break;
		}
	}

	const win = window.open(url, "improved_intra_cluster_map_win");
	// since we can no longer check when a window is loaded with an event
	// for domains that are not of the same origin, we simply try and send
	// the location ID multiple times to the opened cluster map window
	// could also do it with the extension but then we need more permissions...
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
}
