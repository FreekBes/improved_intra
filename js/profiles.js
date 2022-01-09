/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   profiles.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/01/09 01:01:42 by fbes          #+#    #+#                 */
/*   Updated: 2022/01/09 01:01:42 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// from https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url (jesus)
function validateUrl(value) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function getProfileUserName() {
	try {
		return (document.querySelector(".login[data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

function getUserSettings(username) {
	return new Promise(function(resolve, reject) {
		console.log("Retrieving settings of username " + username);
		fetch("https://darkintra.freekb.es/settings/" + username + ".json?noCache=" + Math.random())
			.then(function(response) {
				if (response.status == 404) {
					console.log("No settings found on the sync server for this username");
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
					resolve(json);
				}
			})
			.catch(function(err) {
				reject(err);
			});
	});
}


function setCustomBanner(profileBanner, imageUrl, imagePos) {
	if (imageUrl && validateUrl(imageUrl)) {
		profileBanner.className += " customized";
		profileBanner.setAttribute("data-old-bg", profileBanner.style.backgroundImage);
		profileBanner.style.backgroundImage = "url(" + imageUrl + ")";
		switch (imagePos) {
			default:
			case "center-center":
				profileBanner.style.backgroundPosition = "center center";
				break;
			case "center-top":
				profileBanner.style.backgroundPosition = "center top";
				break;
			case "center-bottom":
				profileBanner.style.backgroundPosition = "center bottom";
				break;
		}
		console.log("Custom banner set!");
		return (true);
	}
	return (false);
}

function unsetCustomBannerIfRequired(profileBanner) {
	if (profileBanner.getAttribute("data-old-bg")) {
		profileBanner.style.backgroundImage = profileBanner.getAttribute("data-old-bg");
		profileBanner.removeAttribute("data-old-bg");
		console.log("Custom banner unset");
	}
}

function setCustomProfile() {
	var uName = getProfileUserName();
	var profileBanner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
	chrome.storage.local.get(["username", "show-custom-profiles", "custom-banner-url", "custom-banner-pos"], function(data) {
		if (data["show-custom-profiles"] === true || data["show-custom-profiles"] === "true") {
			if (profileBanner) {
				if (uName == data["username"]) {
					if (!setCustomBanner(profileBanner, data["custom-banner-url"], data["custom-banner-pos"])) {
						unsetCustomBannerIfRequired(profileBanner);
					}
				}
				else {
					getUserSettings(uName)
						.then(function(uSettings) {
							if (!setCustomBanner(profileBanner, uSettings["custom-banner-url"], uSettings["custom-banner-pos"])) {
								unsetCustomBannerIfRequired(profileBanner);
							}
						})
						.catch(function(err) {
							console.error("Could not retrieve custom profile settings for user", err);
						});
				}
			}
		}

		// easter egg for user fbes, even when customized profiles are disabled
		if (uName == "fbes") {
			if (profileBanner) {
				profileBanner.className += " egg";
			}
		}
	});
}

// set custom profile with timeout, as sometimes the coalition banner takes a while to load
setTimeout(function() {
	setCustomProfile();
}, 150);
