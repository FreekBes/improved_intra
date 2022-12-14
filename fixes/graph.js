/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   graph.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/12/14 17:21:33 by fbes          #+#    #+#                 */
/*   Updated: 2022/12/14 17:53:26 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function addMoreCursuses() {
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

function resizeGalaxyGraph(iframe) {
	const headerHeight = document.querySelector(".main-navbar").offsetHeight;
	const pageContentWidth = document.querySelector(".page-content").offsetWidth;
	iframe.setAttribute("width", pageContentWidth + "px");
	iframe.setAttribute("height", (window.innerHeight - headerHeight) + "px");
}

let removalInterval = null;
function removeHolyGraph(holyGraphContainer) {
	for (const child of holyGraphContainer.children) {
		if (child.getAttribute("id") != "galaxy-graph-iframe") {
			child.remove();
		}
	}
}

function replaceHolyGraph() {
	const pageContent = document.querySelector(".page-content");
	if (pageContent) {
		const holyGraphContainer = pageContent.querySelector(".row .row"); // yes, twice...
		if (holyGraphContainer) {
			// Remove all children in the current holy graph
			removeHolyGraph(holyGraphContainer);
			removalInterval = setInterval(() => {
				removeHolyGraph(holyGraphContainer);
			}, 50);
			setTimeout(() => {
				clearInterval(removalInterval);
			}, 2000);

			// Add our own iframe with the Galaxy Graph
			const headerHeight = document.querySelector(".main-navbar").offsetHeight;
			const iframe = document.createElement("iframe");
			iframe.setAttribute("id", "galaxy-graph-iframe");
			iframe.src = chrome.runtime.getURL("fixes/galaxygraph/www/index.html");
			iframe.style.border = "none";
			resizeGalaxyGraph(iframe);
			holyGraphContainer.appendChild(iframe);

			// Resize the iframe on window resize
			window.addEventListener("resize", function() {
				resizeGalaxyGraph(document.getElementById("galaxy-graph-iframe"));
			});
		}
		else {
			iConsole.warn("Could not find the holy graph container to replace the Holy Graph in");
		}
	}
	else {
		iConsole.warn("Could not find the page-content element to replace the Holy Graph in");
	}
}

function setPageHolyGraphImprovements() {
	improvedStorage.get("holygraph-morecursuses").then(function(data) {
		if (optionIsActive(data, "holygraph-morecursuses")) {
			addMoreCursuses();
		}
	});

	// TODO: add option
	replaceHolyGraph();
}
