/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   profiles.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/01/09 01:01:42 by fbes          #+#    #+#                 */
/*   Updated: 2022/04/01 19:49:24 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// everything for custom profiles

let gUName = null;
let gProfileBanner = null;
let gCustomBanner = null;
let gInterval = null;
let gExtSettings = null;
let gUserSettings = null;

function getUserSettings(username) {
	return new Promise(function(resolve, reject) {
		if (gUserSettings && gUserSettings["username"] === username) {
			resolve(gUserSettings);
			return;
		}
		iConsole.log("Retrieving settings of username " + username);
		fetch("https://darkintra.freekb.es/settings/" + username + ".json?noCache=" + Math.random())
			.then(function(response) {
				if (response.status == 404) {
					iConsole.log("No settings found on the sync server for this username");
					return null;
				}
				else if (!response.ok) {
					throw new Error("Could not get settings from server due to an error");
				}
				return response.json();
			})
			.then(function(json) {
				if (json == null) {
					reject();
				}
				else {
					gUserSettings = json;
					resolve(json);
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}


function setCustomBanner(imageUrl, imagePos) {
	if (imageUrl && validateUrl(imageUrl)) {
		const newCSSval = "url(\"" + imageUrl + "\")";
		if (gCustomBanner.style.backgroundImage.indexOf(imageUrl) == -1) {
			gCustomBanner.className += " customized";
			gCustomBanner.setAttribute("data-old-bg", gProfileBanner.style.backgroundImage);
			gCustomBanner.style.backgroundImage = newCSSval;
			switch (imagePos) {
				default:
				case "center-center":
					gCustomBanner.style.backgroundPosition = "center center";
					break;
				case "center-top":
					gCustomBanner.style.backgroundPosition = "center top";
					break;
				case "center-bottom":
					gCustomBanner.style.backgroundPosition = "center bottom";
					break;
			}
			iConsole.log("Custom banner set!");
		}
		return (true);
	}
	return (false);
}

function unsetCustomBannerIfRequired() {
	if (gCustomBanner.style.backgroundImage) {
		gCustomBanner.style.backgroundImage = null;
		iConsole.log("Custom banner unset");
	}
}

function setGitHubLink(gitHubName) {
	gitHubName = gitHubName.trim();
	if (gitHubName == "" || gitHubName == "null" || gitHubName == "undefined") {
		return;
	}
	const gitHubLink = document.getElementById("ii-profile-link-github");
	if (gitHubLink) {
		// gitHubName can actually be gitplatform@username
		// parse gitplatform to see which URL to use
		if (gitHubName.indexOf("@") > -1) {
			gitHubName = gitHubName.split("@");
			if (gitHubName.length == 2) {
				gitHubName[0] = gitHubName[0].toLowerCase();
				gitHubLink.innerText = gitHubName[1];
				switch (gitHubName[0]) {
					case "github":
						gitHubLink.parentNode.setAttribute("href", "https://www.github.com/" + gitHubName[1]);
						gitHubLink.parentNode.parentNode.style.display = "block";
						break;
					case "gitlab":
						gitHubLink.parentNode.setAttribute("href", "https://gitlab.com/" + gitHubName[1]);
						gitHubLink.parentNode.parentNode.style.display = "block";
						gitHubLink.parentNode.parentNode.setAttribute("data-original-title", "GitLab"); // display GitLab in tooltip
						gitHubLink.parentNode.previousElementSibling.className = "fa fa-gitlab"; // change to gitlab icon
						break;
					default:
						iConsole.warn("Unsupported Git platform found in setGitHubLink():", gitHubName[0]);
						break;
				}
			}
			else {
				iConsole.warn("Length of split on '@' variable gitHubName in setGitHubLink() did not equal 2! Not displaying link.");
			}
		}
		else {
			gitHubLink.innerText = gitHubName;
			gitHubLink.parentNode.setAttribute("href", "https://www.github.com/" + gitHubName);
			gitHubLink.parentNode.parentNode.style.display = "block";
		}
	}
}

function setCustomBannerWrapper() {
	if (optionIsActive(gExtSettings, "show-custom-profiles")) {
		if (gProfileBanner) {
			if (gUName == gExtSettings["username"]) {
				if (!setCustomBanner(gExtSettings["custom-banner-url"], gExtSettings["custom-banner-pos"])) {
					unsetCustomBannerIfRequired();
				}
			}
			else {
				getUserSettings(gUName)
					.then(function(uSettings) {
						if (!setCustomBanner(uSettings["custom-banner-url"], uSettings["custom-banner-pos"])) {
							unsetCustomBannerIfRequired();
						}
					})
					.catch(function(err) {
						// no custom profile settings found
					});
			}
		}
	}
}

function setCustomProfile() {
	if (optionIsActive(gExtSettings, "show-custom-profiles")) {
		if (gProfileBanner) {
			if (gUName == gExtSettings["username"]) {
				if (gExtSettings["link-github"]) {
					setGitHubLink(gExtSettings["link-github"]);
				}
			}
			else {
				getUserSettings(gUName)
					.then(function(uSettings) {
						if (uSettings["link-github"]) {
							setGitHubLink(uSettings["link-github"]);
						}
					})
					.catch(function(err) {
						// no custom profile settings found
					});
			}
		}
	}
}

function immediateProfileChanges() {
	// add custom banner image container
	if (gProfileBanner) {
		gCustomBanner = document.createElement("div");
		gCustomBanner.className = "improved-intra-banner";
		gProfileBanner.insertBefore(gCustomBanner, gProfileBanner.children[0]);
	}

	// easter egg for user fbes, even when customized profiles are disabled
	if (gProfileBanner && gUName == "fbes") {
		gProfileBanner.className += " egg";
		gCustomBanner.className += " egg";
	}

	if (window.location.pathname.indexOf("/users/") == 0) {
		// improvements to profile boxes
		const locations = document.getElementById("locations");
		if (locations) {
			const logTimesHeader = document.createElement("h4");
			logTimesHeader.className = "profile-title";
			logTimesHeader.innerText = "Logtime";
			if (profileFromCodam()) {
				improvedStorage.get("codam-buildingtimes-chart").then(function(data) {
					if (optionIsActive(data, "codam-buildingtimes-chart")) {
						logTimesHeader.innerText = "Buildingtime*";
					}
				});
			}
			locations.parentNode.parentNode.prepend(logTimesHeader);
		}

		// add social links to profile
		const userInfos = document.querySelector(".profile-infos-bottom");
		if (userInfos) {
			const gitHubItem = document.createElement("div");
			gitHubItem.className = "profile-infos-item";
			gitHubItem.setAttribute("id", "ii-profile-link-c-github");
			gitHubItem.setAttribute("data-placement", "left");
			gitHubItem.setAttribute("data-toggle", "tooltip");
			gitHubItem.setAttribute("title", "GitHub");
			gitHubItem.setAttribute("data-original-title", "GitHub");
			gitHubItem.style.display = "none";

			const gitHubIcon = document.createElement("span");
			gitHubIcon.className = "fa fa-github";
			gitHubItem.appendChild(gitHubIcon);

			const gitHubLink = document.createElement("a");
			gitHubLink.style.marginLeft = "4px";
			gitHubLink.style.color = getCoalitionColor();
			gitHubLink.setAttribute("target", "_blank");
			gitHubItem.appendChild(gitHubLink);

			const gitHubName = document.createElement("span");
			gitHubName.className = "coalition-span";
			gitHubName.setAttribute("id", "ii-profile-link-github");
			gitHubLink.appendChild(gitHubName);

			let locationItem = userInfos.querySelector(".icon-location");
			if (locationItem) {
				locationItem = locationItem.parentNode;
				userInfos.insertBefore(gitHubItem, locationItem);
			}
			else {
				userInfos.appendChild(gitHubItem);
			}

			addToolTip("#ii-profile-link-c-github");
		}
	}
}

gUName = getProfileUserName();
gProfileBanner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
immediateProfileChanges();
improvedStorage.get(["username", "show-custom-profiles", "custom-banner-url", "custom-banner-pos", "link-github"]).then(function(data) {
	gExtSettings = data;
	setCustomBannerWrapper();
	setCustomProfile();
});

const cursusSelector = document.querySelector(".cursus-user-select");
if (cursusSelector) {
	cursusSelector.addEventListener("change", function(event) {
		// confirmProfileUpdatedForFiveSeconds();
	});
}
