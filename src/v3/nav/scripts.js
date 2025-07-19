const NavV3 = {
	topNavbar: null,
	leftNavbar: null,

	findTopNavbar: () => {
		const root = document.querySelector("#root");
		if (!root) {
			return null;
		}

		const topNavbar = root.querySelector(".App > .fixed.top-0.w-full");
		if (!topNavbar) {
			return null;
		}

		iConsole.log("Found the top navigation bar");
		topNavbar.classList.add("iintra-top-navbar");
		NavV3.topNavbar = topNavbar;
		return topNavbar;
	},

	findLeftNavbar: () => {
		const root = document.querySelector("#root");
		if (!root) {
			return null;
		}

		const leftNavbar = root.querySelector(".App > .fixed.top-0:not(.content)");
		if (!leftNavbar) {
			return null;
		}

		iConsole.log("Found the left navigation bar");
		leftNavbar.classList.add("iintra-left-navbar");
		NavV3.leftNavbar = leftNavbar;
		return leftNavbar;
	},

	init: () => {

		// Check for newly created nodes with a MutationObserver.
		// Compare every node created with the loadDetector of each box.
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.addedNodes && mutation.addedNodes.length > 0) {
					if (!NavV3.topNavbar) {
						NavV3.findTopNavbar();
					}
					if (!NavV3.leftNavbar) {
						NavV3.findLeftNavbar();
					}
					if (NavV3.topNavbar && NavV3.leftNavbar) {
						iConsole.log("Both navigation bars found, disconnecting observer");
						observer.disconnect();
						break; // Exit the loop as we found both navigation bars
					}
				}
			}
		});

		// Start observing the body for changes.
		observer.observe(document.body, { childList: true, subtree: true });
	}
}
