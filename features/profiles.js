/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   profiles.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/01/09 01:01:42 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:18:05 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// everything for custom profiles

let gUName = null;
let gProfileBanner = null;
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
		if (gProfileBanner.style.backgroundImage.indexOf(imageUrl) == -1) {
			gProfileBanner.className += " customized";
			gProfileBanner.setAttribute("data-old-bg", gProfileBanner.style.backgroundImage);
			gProfileBanner.style.backgroundImage = newCSSval;
			switch (imagePos) {
				default:
				case "center-center":
					gProfileBanner.style.backgroundPosition = "center center";
					break;
				case "center-top":
					gProfileBanner.style.backgroundPosition = "center top";
					break;
				case "center-bottom":
					gProfileBanner.style.backgroundPosition = "center bottom";
					break;
			}
			iConsole.log("Custom banner set!");
		}
		return (true);
	}
	return (false);
}

function unsetCustomBannerIfRequired() {
	if (gProfileBanner.getAttribute("data-old-bg")) {
		gProfileBanner.style.backgroundImage = gProfileBanner.getAttribute("data-old-bg");
		gProfileBanner.removeAttribute("data-old-bg");
		iConsole.log("Custom banner unset");
	}
}

function setGitHubLink(gitHubName) {
	gitHubName = gitHubName.trim();
	const gitHubLink = document.getElementById("ii-profile-link-github");
	if (gitHubLink) {
		if (gitHubName.indexOf("@") == 0) {
			gitHubName = gitHubName.substring(1);
		}
		else if (gitHubName.indexOf("http://") == 0 || gitHubName.indexOf("https://") == 0) {
			if (gitHubName.endsWith("/")) {
				gitHubName = gitHubName.split("/");
				gitHubName = gitHubName[gitHubName.length - 2];
			}
			else {
				gitHubName = gitHubName.split("/").pop();
			}
		}
		gitHubLink.innerText = gitHubName;
		gitHubLink.parentNode.setAttribute("href", "https://www.github.com/" + gitHubName);
		gitHubLink.parentNode.parentNode.style.display = "block";
	}
}

function setCustomBannerWrapper() {
	if (gExtSettings["show-custom-profiles"] === true || gExtSettings["show-custom-profiles"] === "true") {
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
	if (gExtSettings["show-custom-profiles"] === true || gExtSettings["show-custom-profiles"] === "true") {
		if (gProfileBanner) {
			if (gUName == gExtSettings["username"]) {
				if (gExtSettings["link-github"] && gExtSettings["link-github"].trim() != "") {
					setGitHubLink(gExtSettings["link-github"]);
				}
			}
			else {
				getUserSettings(gUName)
					.then(function(uSettings) {
						if (uSettings["link-github"] && uSettings["link-github"].trim() != "") {
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
	// easter egg for user fbes, even when customized profiles are disabled
	if (gProfileBanner && gUName == "fbes") {
		gProfileBanner.className += " egg";
	}

	if (window.location.pathname.indexOf("/users/") == 0) {
		// improvements to profile boxes
		const locations = document.getElementById("locations");
		if (locations) {
			const logTimesHeader = document.createElement("h4");
			logTimesHeader.className = "profile-title";
			logTimesHeader.innerText = "Logtime";
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

			const evt = new CustomEvent("add-tooltip", { detail: "#ii-profile-link-c-github" });
			document.dispatchEvent(evt);
		}
	}
}

// check if the custom profile is kept in an interval for 5 seconds
// sometimes things get overruled by coalition stuff, such as banners
function confirmProfileUpdatedForFiveSeconds() {
	if (!gInterval) {
		gInterval = setInterval(setCustomBannerWrapper, 150);
		setTimeout(function() {
			clearInterval(gInterval);
			gInterval = null;
		}, 5000);
	}
}

gUName = getProfileUserName();
gProfileBanner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
immediateProfileChanges();
improvedStorage.get(["username", "show-custom-profiles", "custom-banner-url", "custom-banner-pos", "link-github"]).then(function(data) {
	gExtSettings = data;
	setCustomBannerWrapper();
	setCustomProfile();
	confirmProfileUpdatedForFiveSeconds();
});

const cursusSelector = document.querySelector(".cursus-user-select");
if (cursusSelector) {
	cursusSelector.addEventListener("change", function(event) {
		confirmProfileUpdatedForFiveSeconds();
	});
}
