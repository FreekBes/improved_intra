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
	 * Get the campus of the profile currently being viewed.
	 * @param {Element | null} header The header of the current profile. Can be null, then it is fetched from the document (however it might not exist yet).
	 * @returns {string} The campus of the profile.
	 */
	getProfileCampus: (header) => {
		header = header || document.querySelector("header");
		if (!header) {
			iConsole.error("No header found in the profile page to get campus from.");
			return "Unknown";
		}
		const userInfosList = ProfileV3.findUserInfosList(header);
		const campusItem = userInfosList.children[1];
		if (!campusItem || !campusItem.innerText) {
			iConsole.error("No campus item found in the profile infos list.");
			return "Unknown";
		}
		const campusText = campusItem.innerText.trim();
		if (!campusText) {
			iConsole.error("Campus item text is empty.");
			return "Unknown";
		}
		return campusText;
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
	 * Find the profile infos list element within the header, containing user information like campus, email, etc.
	 * @param {Element} header The header element to search within.
	 * @returns The profile infos list element or null if not found.
	 */
	findUserInfosList: (header) => {
		let userInfosList = header.querySelector(".iintra-profile-infos-list");
		if (userInfosList) {
			iConsole.log("Found existing profile infos list in the header.");
			return userInfosList;
		}

		// Find the last box in the header
		const userInfosColumn = header.parentElement.querySelector("header > div > div:last-child");
		if (!userInfosColumn) {
			iConsole.error("No user info column found in the profile header to apply links.");
			return;
		}
		if (userInfosColumn.children.length != 2) {
			iConsole.error("Unexpected number of children in the user info column, expected 2 but found " + userInfosColumn.children.length);
			return;
		}
		const userInfosBox = userInfosColumn.children[1];
		if (!userInfosBox || !userInfosBox.firstElementChild) {
			iConsole.error("No user info box found in the profile header to apply links.");
			return;
		}

		// Make sure the links are not too close to the edge
		userInfosBox.style.paddingTop = "24px";
		userInfosBox.style.paddingBottom = "24px";

		userInfosList = userInfosBox.firstElementChild;
		userInfosList.classList.add("iintra-profile-infos-list");
		return userInfosList;
	},

	/**
	 * Add a piece of information to the list of user info in the profile header.
	 * @param {*} userInfosList The element containing the user info list.
	 * @param {*} itemId The ID of the item to add.
	 * @param {*} itemTitle The hover title of the item.
	 * @param {*} itemIcon A URL to an icon to use for the item.
	 * @param {*} itemContent The displayable text content of the item.
	 * @param {*} itemLink If the item should be a link, the URL to link to. If null, the item will not be a link.
	 * @returns A newly created, already added button element.
	 */
	addProfileInfosItem: (userInfosList, itemId, itemTitle, itemIcon, itemContent, itemLink=null) => {
		const button = document.createElement("button");
		button.setAttribute("data-state", "closed");
		button.classList.add("cursor-default", "iintra-profile-infos-item");
		button.setAttribute("data-iintra-profile-info-item-id", itemId);
		button.setAttribute("title", itemTitle); // TODO: use Intra's tooltip system

		const innerButton = document.createElement("div");
		innerButton.classList.add("flex", "flex-row", "items-center", "gap-1");
		button.appendChild(innerButton);

		const icon = document.createElement("img");
		icon.setAttribute("width", "15");
		icon.setAttribute("height", "15");
		icon.classList.add("mr-2");
		icon.setAttribute("src", itemIcon);
		innerButton.appendChild(icon);

		const text = document.createElement("div");
		text.classList.add("text-white");
		if (!itemLink) {
			text.innerText = itemContent;
		}
		else {
			const linkWrapper = document.createElement("div"); // Why, you may ask? Because Intra does this too.
			linkWrapper.classList.add("flex", "flex-row", "items-center", "gap-1");
			text.appendChild(linkWrapper);

			const link = document.createElement("a");
			link.classList.add("hover:underline", "decoration-[hsl(var(--legacy-main)]");
			link.setAttribute("href", itemLink);
			link.setAttribute("target", "_blank");
			// TODO: set color to coalition color
			link.innerText = itemContent;
			linkWrapper.appendChild(link);
		}
		innerButton.appendChild(text);

		userInfosList.appendChild(button);
		return button;
	},

	/**
	 * Set up links to external websites (git profile, personal website) in the profile header.
	 * @param {*} header The header element to apply links to.
	 * @param {*} profileData The profile data containing the links to set up.
	 * @returns {void}
	 */
	setupProfileLinks: (header, profileData) => {
		const userInfosList = ProfileV3.findUserInfosList(header);

		// Create link to user's git profile
		try {
			if (profileData.link_git) {
				// linkGit is not a direct url, it is actually a combination of a platform and a username
				// e.g. github.com@FreekBes or gitlab.com@FreekBes
				// this is to prevent people from using random websites as their "git profile"
				if (profileData.link_git.indexOf("@") > -1) {
					linkGit = profileData.link_git.split("@");
					if (linkGit.length == 2) {
						linkGit[0] = linkGit[0].toLowerCase();
						const gitPlatforms = {
							"github.com": {
								"name": "GitHub",
								"profile_url": "https://www.github.com/",
								"icon": chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "github.svg")
							},
							"gitlab.com": {
								"name": "GitLab",
								"profile_url": "https://www.gitlab.com/",
								"icon": chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "gitlab.svg")
							},
							"bitbucket.org": {
								"name": "Bitbucket",
								"profile_url": "https://www.bitbucket.org/",
								"icon": chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "bitbucket.svg")
							},
							"codeberg.org": {
								"name": "Codeberg",
								"profile_url": "https://www.codeberg.org/",
								"icon": chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "git.svg")
							},
							"sr.ht": {
								"name": "SourceHut",
								"profile_url": "https://www.sr.ht/",
								"icon": chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "git.svg")
							}
						};
						if (!(linkGit[0] in gitPlatforms)) {
							throw "Unknown git platform: " + linkGit[0];
						}
						const link = ProfileV3.addProfileInfosItem(userInfosList, "git", "Git", gitPlatforms[linkGit[0]]["icon"], gitPlatforms[linkGit[0]]["name"], gitPlatforms[linkGit[0]]["profile_url"] + linkGit[1]);
					}
					else {
						throw "Length of split on '@' variable linkGit in setGitHubLink() did not equal 2";
					}
				}
				else {
					throw "Unexpected value for link_git: " + linkGit;
				}
			}
		}
		catch (error) {
			iConsole.error("Failed to set up Git link in profile header: " + error);
		}

		// Create link to user's website
		try {
			if (profileData.link_web) {
				const linkWebItem = ProfileV3.addProfileInfosItem(userInfosList, "web", "Personal website", chrome.runtime.getURL(EXT_ICONS_PATH_PREFIX + "globe.svg"), "Personal website", profileData.link_web);
				linkWebItem.querySelector("a").addEventListener("click", function(ev) {
					ev.preventDefault();
					const doOpen = confirm(gUName + "'s personal website is set to a page hosted on the following domain:\n\n" + ev.currentTarget.hostname + "\n\nAre you sure you want to open it?");
					if (doOpen) {
						window.open(ev.currentTarget.href);
					}
				});
			}
		}
		catch (error) {
			iConsole.error("Failed to set up website link in profile header: " + error);
		}
	},

	makeLocationClickable: (header) => {
		// Find the first column of the header
		const firstColumn = header.querySelector("div > div:first-child");
		if (!firstColumn) {
			iConsole.error("No first column found in the profile header to make location clickable.");
			return;
		}

		// Create a MutationObserver to wait for the location element to be added
		const locationObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach((node) => {
						if (!(node instanceof Element)) return; // Only process Element nodes
						if (node.classList.contains("absolute") && node.classList.contains("top-2") && node.classList.contains("right-4")) {
							// This is the location element we are looking for
							const locationElement = node;
							locationObserver.disconnect(); // Stop observing once the location element is found
							iConsole.log("Location element found in profile header, checking if we can make it clickable.", locationElement);
							locationElement.classList.add("iintra-profile-location");

							// Make the location element clickable if the user is logged in.
							// We can identify this by checking if the text color of the element is white.
							const activeLocation = locationElement.querySelector("div.text-white");
							if (!activeLocation) {
								iConsole.log("Not making, location clickable because the user is not logged in.");
								locationElement.classList.add("iintra-profile-location-unavailable");
								return;
							}

							// TODO: replace with an A element for accessibility?
							locationElement.classList.add("iintra-profile-location-available");
							locationElement.setAttribute("title", "Click to open the Clustermap for this location");
							locationElement.addEventListener("click", async (ev) => {
								const location = ev.currentTarget.innerText;
								const campus = ProfileV3.getProfileCampus(header);
								iConsole.log("Location clicked: " + location + " on campus " + campus);
								Utils.openClustermap(campus, location);
							});
						}
					});
				}
			});
		});

		// Start observing the header for changes
		locationObserver.observe(firstColumn, { childList: true, subtree: true });
	},


	/**
	 * Setup the profile header with the necessary improvements.
	 * @param {Element} header The header element to improve.
	 * @returns {void}
	 */
	setupProfileHeader: async (header) => {
		const login = ProfileV3.getProfileLogin();
		try {
			ProfileV3.findUserInfosList(header);
			ProfileV3.makeLocationClickable(header);
			const profileData = await ProfileV3.getUserProfile(login);
			if (!profileData) {
				iConsole.error("Failed to retrieve profile data for " + login);
				return;
			}
			iConsole.log("Setting up profile header for " + login, profileData);
			ProfileV3.setupProfileBannerImage(header, profileData);
			ProfileV3.setupProfileLinks(header, profileData);

			// Prevent the header from being limited in height
			header.classList.remove("xl:h-72");
		} catch (error) {
			iConsole.error("Error setting up header for " + login, error);
		}
	},
}
