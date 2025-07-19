const ProfileV3 = {
	profile_boxes_found: 0,
	profile_boxes: [
		{
			name: "Logtime",
			element: null,
			loadDetector: (node) => {
				return ProfileV3.findBoxWithHeader(node, "logtime");
			},
			improve() {
				iConsole.log("Improving Logtime box");
			},
		},
		{
			name: "Marks", // Shared with Achievements
			element: null,
			loadDetector: (node) => {
				return ProfileV3.findBoxWithHeader(node, "marks");
			},
			improve() {
				iConsole.log("Improving Marks box (shared with Achievements)");
			},
		},
		{
			name: "Projects",
			element: null,
			loadDetector: (node) => {
				return ProfileV3.findBoxWithHeader(node, "projects");
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
		const allElements = node.querySelectorAll(".font-bold.uppercase");
		for (let i = 0; i < allElements.length; i++) {
			if (allElements[i].innerText && allElements[i].innerText.toLowerCase() === headerText) {
				// Find the boxelement by looking for the grid parent
				let boxElement = allElements[i].parentElement;
				while (boxElement.parentElement.classList.contains("grid") === false) {
					boxElement = boxElement.parentElement;
				}
				if (!boxElement) continue; // In case the text appears in a different context
				allElements[i].classList.add("iintra-profile-box-header");
				return boxElement;
			}
		}
		return null;
	},

	/**
	 * Initialize the improvements for the Profile V3.
	 * Registers a MutationObserver to wait for the profile boxes to load.
	 */
	init: () => {
		iConsole.log("Initializing Profile V3 improvements");

		// Check for newly created nodes with a MutationObserver.
		// Compare every node created with the loadDetector of each box.
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach((node) => {
						ProfileV3.profile_boxes.forEach((box) => {
							const boxElement = box.loadDetector(node);
							if (boxElement) {
								// Box found, make the element easily accessible and improve it.
								iConsole.log(`Found Profile V3 box: ${box.name}`);
								box.element = boxElement;
								box.element.classList.add("iintra-profile-box");
								box.element.classList.add("iintra-profile-box-" + box.name.replaceAll(" ", "-").toLowerCase());
								box.improve();

								// If all boxes have been found, disconnect the observer.
								ProfileV3.profile_boxes_found++;
								if (ProfileV3.profile_boxes_found === ProfileV3.profile_boxes.length) {
									iConsole.log("All Profile V3 boxes found, disconnecting observer");
									observer.disconnect();
								}

								// Apply iintra-profile-bg class to the container of the boxes
								let boxContainer = boxElement.parentElement;
								while (!boxContainer.classList.contains("grid") && boxContainer.parentElement) {
									boxContainer = boxContainer.parentElement;
								}
								boxContainer.classList.add("iintra-profile-bg");
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
