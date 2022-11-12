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
let gExtSettings = null;

function getUserProfile(username) {
	return new Promise(function(resolve, reject) {
		iConsole.log("Retrieving settings of username " + username);
		fetch("https://iintra.freekb.es/v2/profile/" + username + ".json?noCache=" + Math.random())
			.then(function(response) {
				return (response.json());
			})
			.then(function(json) {
				if (json["type"] == "success") {
					resolve(json["data"]);
				}
				else {
					reject(json["message"]);
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}

function setCustomBanner(bannerImg, bannerPos) {
	if (bannerImg && bannerPos) {
		const newCSSval = "url(\"" + bannerImg["url"] + "\")";
		if (gCustomBanner.style.backgroundImage.indexOf(bannerImg["url"]) == -1) {
			gCustomBanner.classList.add("customized");
			gCustomBanner.setAttribute("data-old-bg", gProfileBanner.style.backgroundImage);
			gCustomBanner.style.backgroundImage = newCSSval;
			gCustomBanner.style.backgroundPosition = bannerPos["css_val"];
			iConsole.log("Custom banner set!");
		}
		return (true);
	}
	return (false);
}

function unsetCustomBannerIfRequired() {
	gCustomBanner.classList.remove("customized");
	if (gCustomBanner.style.backgroundImage) {
		gCustomBanner.style.backgroundImage = null;
		iConsole.log("Custom banner unset");
	}
}

function setGitLink(linkGit) {
	try {
		const linkGitElem = document.getElementById("ii-profile-link-git");
		// linkGit is not a direct url, it is actually a combination of a platform and a username
		// e.g. github.com@FreekBes or gitlab.com@FreekBes
		// this is to prevent people from using random websites as their "git profile"
		if (linkGit.indexOf("@") > -1) {
			linkGit = linkGit.split("@");
			if (linkGit.length == 2) {
				linkGit[0] = linkGit[0].toLowerCase();
				const gitPlatforms = {
					"github.com": {
						"name": "GitHub",
						"profile_url": "https://www.github.com/",
						"icon": "fa fa-github"
					},
					"gitlab.com": {
						"name": "GitLab",
						"profile_url": "https://www.gitlab.com/",
						"icon": "fa fa-gitlab"
					},
					"bitbucket.org": {
						"name": "Bitbucket",
						"profile_url": "https://www.bitbucket.org/",
						"icon": "fa fa-bitbucket"
					},
					"codeberg.org": {
						"name": "Codeberg",
						"profile_url": "https://www.codeberg.org/",
						"icon": "fa fa-git"
					}
				};
				if (!(linkGit[0] in gitPlatforms)) {
					throw "Unknown git platform: " + linkGit[0];
				}
				linkGitElem.innerText = linkGit[1];
				linkGitElem.parentNode.setAttribute("href", gitPlatforms[linkGit[0]]["profile_url"] + "/" + linkGit[1]);
				linkGitElem.parentNode.previousElementSibling.className = gitPlatforms[linkGit[0]]["icon"]; // set fontawesome icon
				linkGitElem.parentNode.parentNode.setAttribute("data-original-title", gitPlatforms[linkGit[0]]["name"]);
				linkGitElem.parentNode.parentNode.style.display = "block";
				return true;
			}
			else {
				throw "Length of split on '@' variable linkGit in setGitHubLink() did not equal 2";
			}
		}
		else {
			throw "Unexpected value for link_git: " + linkGit;
		}
	}
	catch (err) {
		iConsole.error("Not displaying git link due to an error: ", err);
	}
	return false;
}

async function setCustomProfile() {
	// check if custom profiles are enabled and a profile banner is found on the page
	if (optionIsActive(gExtSettings, "show-custom-profiles") && gProfileBanner) {
		try {
			userProfile = await getUserProfile(gUName);
			if (!setCustomBanner(userProfile["banner_img"], userProfile["banner_pos"])) {
				unsetCustomBannerIfRequired();
			}
			setGitLink(userProfile['link_git']);
		}
		catch (err) {
			iConsole.error(err);
		}
	}
}

function showOutstandings() {
	if (optionIsActive(gExtSettings, "outstandings")) {
		// add checkmarks and x for collapsed projects
		const collapsedMarks = document.querySelectorAll(".collapsable .project-item .pull-right");
		for (const collapsedMark of collapsedMarks) {
			collapsedMark.classList.add((collapsedMark.classList.contains("text-success") ? "icon-check-1" : "icon-cross-1"));
		}

		iConsole.log("Retrieving outstanding marks for username " + gUName);
		fetch("https://iintra.freekb.es/outstandings.php?username=" + encodeURIComponent(gUName))
			.then(function(response) {
				if (!response.ok) {
					throw new Error("Could not get outstanding marks from server due to an error");
				}
				return (response.json());
			})
			.then(function(json) {
				if (json == null) {
					throw new Error("Could not parse outstanding marks JSON");
				}
				else if (json["type"] == "error") {
					throw new Error(json["message"]);
				}
				else if (json["type"] == "warning") {
					iConsole.warn(json["message"]);
				}
				else for (const projectsUserId in json["data"]) {
					let mainProjItem = document.querySelector(".main-project-item a[href*='/projects_users/"+projectsUserId+"']");
					if (!mainProjItem) {
						iConsole.warn("Element .main-project-item belonging to ProjectsUser " + projectsUserId + " not found");
						continue;
					}

					// go up to main project item
					while (!mainProjItem.classList.contains("main-project-item") && mainProjItem.parentNode) {
						mainProjItem = mainProjItem.parentNode;
					}

					// apply best mark outstandings
					const mainProjMark = mainProjItem.querySelector(".pull-right.text-success"); // only if mark is considered a success
					if (mainProjMark && json["data"][projectsUserId]["best"] > 0) {
						mainProjMark.classList.remove("icon-check-1");
						mainProjMark.classList.add((json["data"][projectsUserId]["best"] >= 3 ? "icon-star-8" : "icon-star-1"));
						mainProjMark.setAttribute("title", "Received " + json["data"][projectsUserId]["best"] + " outstanding" + (json["data"][projectsUserId]["best"] > 1 ? "s" : ""));
					}

					// apply outstandings for other efforts
					const otherProjItems = document.querySelectorAll(".project-item:not(.main-project-item) a[href*='/projects_users/"+projectsUserId+"']");
					for (let i = 0; i < otherProjItems.length && i < json["data"][projectsUserId]["all"].length; i++) {
						const otherProjMark = otherProjItems[i].parentNode.querySelector(".pull-right.text-success"); // only if mark is considered a success
						if (otherProjMark && json["data"][projectsUserId]["all"][i] > 0) {
							otherProjMark.classList.remove("icon-check-1"); // should actually not be here, but for just in case try to remove it anyways
							otherProjMark.classList.add((json["data"][projectsUserId]["all"][i] >= 3 ? "icon-star-8" : "icon-star-1"));
							otherProjMark.setAttribute("title", "Received " + json["data"][projectsUserId]["all"][i] + " outstanding" + (json["data"][projectsUserId]["all"][i] > 1 ? "s" : ""));
						}
					}
				}
			})
			.catch(function(err) {
				iConsole.error(err);
			});
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
			locations.closest(".container-inner-item").prepend(logTimesHeader);
		}

		// add social links to profile
		const userInfos = document.querySelector(".user-header-box.infos .profile-infos-bottom");
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
			gitHubName.setAttribute("id", "ii-profile-link-git");
			gitHubLink.appendChild(gitHubName);

			let locationItem = userInfos.querySelector(".icon-location");
			if (locationItem) {
				locationItem = locationItem.closest(".profile-infos-item");
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
improvedStorage.get(["username", "show-custom-profiles", "custom-banner-url", "custom-banner-pos", "link-github", "outstandings"]).then(function(data) {
	gExtSettings = data;
	setCustomProfile();
	if (window.location.pathname.indexOf("/users/") == 0) {
		showOutstandings();
	}
});
