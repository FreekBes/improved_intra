/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   graph.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/12/14 17:21:33 by fbes          #+#    #+#                 */
/*   Updated: 2022/12/14 18:44:00 by fbes          ########   odam.nl         */
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
	const sidebarWidth = document.querySelector(".page-sidebar").offsetWidth;
	iframe.setAttribute("width", (document.body.offsetWidth - sidebarWidth) + "px");
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

			// Remove the negative margin from the row
			holyGraphContainer.style.marginLeft = "0px";
			holyGraphContainer.style.marginRight = "0px";

			// Add our own iframe with the Galaxy Graph
			const iframe = document.createElement("iframe");
			iframe.setAttribute("id", "galaxy-graph-iframe");
			resizeGalaxyGraph(iframe);
			iframe.style.border = "none";

			// Make sure the iframe is resized when it is loaded
			// This is because a scrollbar will get added to the top window
			iframe.addEventListener("load", function() {
				resizeGalaxyGraph(document.getElementById("galaxy-graph-iframe"));
				iframe.contentWindow.postMessage({
					type: "cursus_data",
					cursi: [
						{
							id: 21,
							name: "42cursus"
						},
						{
							id: 9,
							name: "C Piscine"
						}
					]
				}, '*');
			});

			// Set the source to the Galaxy Graph page, hosted in the extension
			iframe.src = chrome.runtime.getURL("fixes/galaxygraph/www/index.html?noCache=" + Date.now());

			// Append the iframe to the holy graph container
			holyGraphContainer.appendChild(iframe);

			// Resize the iframe on window resize
			window.addEventListener("resize", function() {
				resizeGalaxyGraph(document.getElementById("galaxy-graph-iframe"));
			});

			// Add event listener for communication with the iframe
			window.addEventListener("message", function(event) {
				switch (event.data.type) {
					case "graph_data":
						iframe.contentWindow.postMessage({
							type: "graph_data",
							graph: {
								ranks: [ "done", "done", "in_progress", "unavailable" ],
								projects: APIData
							}
						}, '*');
						break;
					case "error":
						iConsole.error(event.data.message);
						break;
					case "warning":
						iConsole.warn(event.data.message);
						break;
					default:
						iConsole.warn("Unknown message type received from Galaxy Graph iframe: " + event.data);
						break;
				}
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
