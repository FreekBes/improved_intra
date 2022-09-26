/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   clustermap.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/09/26 22:25:54 by fbes          #+#    #+#                 */
/*   Updated: 2022/09/26 22:58:42 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

let targetHost = window.location.hash.substring(1);

function markTargetHost() {
	const clustermap = document.querySelector("#cluster-map");
	if (clustermap) {
		const targetElem = clustermap.querySelector("#"+targetHost);
		if (targetElem) {
			if (highlightInterval) {
				clearInterval(highlightInterval);
			}
			let tabPane = targetElem;
			while (!tabPane.classList.contains("tab-pane")) {
				tabPane = tabPane.parentElement;
			}
			if (tabPane.nodeName != "DIV") {
				iConsole.warn("Could not find the tab pane for clustermap host focus");
				return;
			}
			const childIndex = Array.from(tabPane.parentNode.children).indexOf(tabPane);
			const tab = clustermap.querySelectorAll(".nav.nav-pills li[role='presentation']")[childIndex];
			if (!tab) {
				iConsole.warn("Could not find the tab from the pane for clustermap host focus");
				return;
			}
			tab.children[0].click();
			targetElem.scrollIntoView(false);
			iConsole.log("Found clustermap host focus target");
		}
	}
}

// mark the target host now
markTargetHost();

// mark the target host on hash change (in URL)
window.addEventListener('hashchange', function(ev) {
	targetHost = window.location.hash.substring(1);
	markTargetHost();
});

// mark the target host multiple times to make sure it is marked if the SVG takes a while to load
// we have to do it like this in order for the CSS; otherwise the :target selector won't work
const highlightInterval = setInterval(function() {
	window.location.href = window.location.origin + window.location.pathname + "#";
	window.location.href = window.location.origin + window.location.pathname + "#" + targetHost;
}, 250);
