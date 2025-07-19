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
		// Compare every node created with the loadDetector of each Profile box.
		const boxesObserver = new MutationObserver((mutations) => {
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
									boxesObserver.disconnect();
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

		// Check for newly created header nodes with a MutationObserver.
		const headerObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach((node) => {
						const header = node.querySelector("header");
						if (header) {
							iConsole.log("Profile header has been added to the page!");
							// Header has been added, disconnect the MutationObserver.
							headerObserver.disconnect();
							ProfileV3.setupProfileHeader(header);
						}
					});
				}
			});
		});

		// Start observing the body for changes.
		boxesObserver.observe(document.body, { childList: true, subtree: true });
		headerObserver.observe(document.body, { childList: true, subtree: true });
	},

	/**
	 * Get the login of the profile currently being viewed.
	 * @returns {string} The login of the profile.
	 */
	getProfileLogin: () => {
		// Login is in the URL, as the last part of the path
		const parts = window.location.pathname.split("/");
		return parts[parts.length - 1];
	},

	/**
	 * Get a user's profile settings from the Improved Intra server.
	 * @param {string} login The username of the user to retrieve the profile of.
	 * @returns {Promise<Object>} A promise that resolves with the user's profile data or rejects with an error message.
	 */
	getUserProfile: (login) => {
		return new Promise(async function(resolve, reject) {
			iConsole.log("Retrieving profile of login " + login);
			try {
				const res = await fetch("https://iintra.freekb.es/v2/profile/" + login + ".json", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
					},
				});
				if (!res.ok) {
					if (res.status === 404) {
						reject(`No profile found for login ${login}, user is likely not an Improved Intra user.`);
						return;
					}

					reject("Failed to fetch profile data: " + res.status + " " + res.statusText);
					return;
				}
				const json = await res.json();
				if (json["type"] == "success") {
					resolve(json["data"]);
				}
				else {
					reject(json["message"]);
				}
			}
			catch (err) {
				reject(err);
			}
		});
	},

	setupProfileBannerImage: (header, profileData) => {
		// Apply background image to the first child of the header.
		// The original header will have the original background image as set by Intra.
		// The child will then overlay our header. In case our header fails to load, the original header will still be visible.
		const customBannerElement = header.firstElementChild;
		if (!customBannerElement) {
			iConsole.error("No child element found in the profile header to apply the banner image.");
			return;
		}

		customBannerElement.classList.add("iintra-profile-banner");
		if (!profileData.banner_img || !profileData.banner_img.url) {
			iConsole.log("No banner image found in the profile data.");
			customBannerElement.style.backgroundImage = null; // Clear the background image if no banner is set
			return;
		}
		customBannerElement.style.backgroundImage = `url(${profileData.banner_img.url})`;
		customBannerElement.style.backgroundPosition = profileData.banner_pos.css_val;
	},

	/**
	 * Setup the profile header with the necessary improvements.
	 * @param {Element} header The header element to improve.
	 * @returns {void}
	 */
	setupProfileHeader: async (header) => {
		const login = ProfileV3.getProfileLogin();
		try {
			const profileData = await ProfileV3.getUserProfile(login);
			if (!profileData) {
				iConsole.error("Failed to retrieve profile data for " + login);
				return;
			}
			iConsole.log("Setting up profile header for " + login, profileData);
			ProfileV3.setupProfileBannerImage(header, profileData);
		} catch (error) {
			iConsole.error("Error setting up profile for " + login, error);
		}
	},
}
