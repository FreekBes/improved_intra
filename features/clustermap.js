/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   clustermap.js                                      :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/09/26 22:25:54 by fbes          #+#    #+#                 */
/*   Updated: 2024/01/17 19:16:24 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

window.addEventListener('load', function() {
	try {
		JSON.parse(document.body.textContent);
		window.location.reload(); // we got here, so the page is a JSON response, reload to show actual clustermap
	}
	catch (err) {
		// all is good, page is not actually a JSON response (which is not intended to happen)
	}
});

let targetHost = window.location.hash.substring(1);

function markTargetHost() {
	const targetLocation = document.querySelector(".target-location");
	if (targetLocation) {
		targetLocation.classList.remove("target-location");
	}

	const clustermap = document.querySelector("#cluster-map");
	if (!clustermap) {
		iConsole.warn("Clustermap not found!");
		return;
	}
	if (targetHost.length == 0) {
		iConsole.log("No target host set, not marking anything");
		return;
	}
	const targetElem = clustermap.querySelector("#"+targetHost);
	if (!targetElem) {
		iConsole.log(`Target element (#${targetHost}) not found (yet?)`);
		return;
	}

	// Now we have the target element, we need to find the tab pane it's in and focus it
	let tabPane = targetElem;
	iConsole.log("Found clustermap host focus target: ", targetElem);
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
	// Click on the correct clustermap's tab, scroll the element into view and mark it
	tab.children[0].click();
	targetElem.scrollIntoView(false);
	targetElem.classList.add("target-location");
}

// mark the target host on hash change (in URL)
window.addEventListener('hashchange', function(ev) {
	targetHost = window.location.hash.substring(1);
	markTargetHost();
});

// observe when a SVG is loaded
function observeMapContainerLoad() {
	const containerLoadObserver = new MutationObserver(function(mutationsList, observer) {
		for (let mutation of mutationsList) {
			if (mutation.type == "childList") {
				const nodes = mutation.addedNodes;
				for (let i = 0; i < nodes.length; i++) {
					if (nodes[i].nodeType !== 1 || nodes[i].nodeName.toLowerCase() != "svg") { // Skip if not an element node and not an SVG
						continue;
					}
					iConsole.log(`Found SVG in clustermap container: `, nodes[i]);
					markTargetHost();

					// Once all containers have been loaded, disconnect the observer
					if (document.querySelectorAll(".map-container").length == document.querySelectorAll(".map-container svg").length) {
						observer.disconnect();
						iConsole.log("Disconnected MutationObserver from clustermap containers");
					}
				}
			}
		}
	});
	const mapContainers = document.querySelectorAll(".map-container");
	iConsole.log("Found "+mapContainers.length+" map containers");
	for (let i = 0; i < mapContainers.length; i++) {
		containerLoadObserver.observe(mapContainers[i], { childList: true });
	}
}
if (window.location.hash.length > 1) {
	observeMapContainerLoad();
}
