const DashboardV3 = {
	dashboard_boxes_found: 0,
	dashboard_boxes: [
		{
			name: "Announcements",
			element: null,
			loadDetector: (node) => {
				// Check if any element in this node has the class "slider-container"
				if (node.nodeType !== Node.ELEMENT_NODE) return false;
				const sliderContainer = node.querySelector(".slider-container");
				return sliderContainer;
			},
			improve() {
				iConsole.log("Improving Announcements box");
			},
		},
		{
			name: "Agenda",
			element: null,
			loadDetector: (node) => {
				return DashboardV3.findBoxWithHeader(node, "agenda");
			},
			improve() {
				iConsole.log("Improving Agenda box");
			},
		},
		{
			name: "Pending Evaluations",
			element: null,
			loadDetector: (node) => {
				return DashboardV3.findBoxWithHeader(node, "pending evaluations");
			},
			improve() {
				iConsole.log("Improving Pending Evaluations box");
			},
		},
		{
			name: "Logtime",
			element: null,
			loadDetector: (node) => {
				return DashboardV3.findBoxWithHeader(node, "logtime");
			},
			improve() {
				iConsole.log("Improving Logtime box");
			},
		},
		{
			name: "Last Achievements",
			element: null,
			loadDetector: (node) => {
				return DashboardV3.findBoxWithHeader(node, "last achievements");
			},
			improve() {
				iConsole.log("Improving Achievements box");

				// Wait for the achievements to load with a MutationObserver
				const observer = new MutationObserver((mutations) => {
					mutations.forEach((mutation) => {
						if (mutation.addedNodes) {
							mutation.addedNodes.forEach((node) => {
								if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "DIV") {
									iConsole.debug("Found achievement", node);

									// Remove the overflow-scroll class from the achievement descriptions
									const achievementDescriptions = node.querySelectorAll("p.overflow-scroll");
									achievementDescriptions.forEach((description) => {
										description.classList.remove("overflow-scroll");
									});
								}
							});
						}
					});
				});
				observer.observe(this.element, { childList: true, subtree: true });
			},
		},
		{
			name: "Projects",
			element: null,
			loadDetector: (node) => {
				return DashboardV3.findBoxWithHeader(node, "projects");
			},
			improve() {
				iConsole.log("Improving Projects box");
			},
		},
	],

	/**
	 * Check if a node contains a box with a specific header text
	 * @param {Node} node The node to check all children of
	 * @param {string} headerText The header text to find
	 * @returns {Element} The box element if found, null otherwise
	 */
	findBoxWithHeader: (node, headerText) => {
		if (node.nodeType !== Node.ELEMENT_NODE) return false;
		const allElements = node.querySelectorAll("*");
		for (let i = 0; i < allElements.length; i++) {
			if (allElements[i].innerText && allElements[i].innerText.toLowerCase() === headerText) {
				// Find the boxelement by looking for the grid parent
				let boxElement = allElements[i].parentElement;
				while (boxElement.parentElement.classList.contains("grid") === false) {
					boxElement = boxElement.parentElement;
				}
				if (!boxElement) continue; // In case the text appears in a different context
				return boxElement;
			}
		}
		return null;
	},

	/**
	 * Initialize the improvements for the Dashboard V3.
	 * Registers a MutationObserver to wait for the dashboard boxes to load.
	 */
	init: () => {
		iConsole.log("Initializing Dashboard V3 improvements");

		// Check for newly created nodes with a MutationObserver.
		// Compare every node created with the loadDetector of each box.
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach((node) => {
						DashboardV3.dashboard_boxes.forEach((box) => {
							const boxElement = box.loadDetector(node);
							if (boxElement) {
								// Box found, make the element easily accessible and improve it.
								iConsole.log(`Found Dashboard V3 box: ${box.name}`);
								box.element = boxElement;
								box.element.classList.add("iintra-dashboard-box");
								box.element.classList.add("iintra-dashboard-box-" + box.name.replaceAll(" ", "-").toLowerCase());
								box.improve();

								// If all boxes have been found, disconnect the observer.
								DashboardV3.dashboard_boxes_found++;
								if (DashboardV3.dashboard_boxes_found === DashboardV3.dashboard_boxes.length) {
									iConsole.log("All Dashboard V3 boxes found, disconnecting observer");
									observer.disconnect();
								}
							}
						});
					});
				}
			});
		});

		// Start observing the body for changes.
		observer.observe(document.body, { childList: true, subtree: true });
	},
}
