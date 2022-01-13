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

var gUName = null;
var gProfileBanner = null;
var gInterval = null;
var gExtSettings = null;
var gUserSettings = null;

function getUserSettings(username) {
	return new Promise(function(resolve, reject) {
		if (gUserSettings && gUserSettings["username"] === username) {
			resolve(gUserSettings);
			return;
		}
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
		var newCSSval = "url(\"" + imageUrl + "\")";
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
			console.log("Custom banner set!");
		}
		return (true);
	}
	return (false);
}

function unsetCustomBannerIfRequired() {
	if (gProfileBanner.getAttribute("data-old-bg")) {
		gProfileBanner.style.backgroundImage = gProfileBanner.getAttribute("data-old-bg");
		gProfileBanner.removeAttribute("data-old-bg");
		console.log("Custom banner unset");
	}
}

function setCustomProfile() {
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

function immediateProfileChanges() {
	// easter egg for user fbes, even when customized profiles are disabled
	if (gUName == "fbes") {
		if (gProfileBanner) {
			gProfileBanner.className += " egg";
		}
	}
}

gUName = getProfileUserName();
gProfileBanner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
immediateProfileChanges();
chrome.storage.local.get(["username", "show-custom-profiles", "custom-banner-url", "custom-banner-pos"], function(data) {
	gExtSettings = data;
	setCustomProfile();
	// check if the custom profile is kept in an interval for 5 seconds
	// sometimes things get overruled by coalition stuff, such as banners
	gInterval = setInterval(setCustomProfile, 150);
	setTimeout(function() {
		clearInterval(gInterval);
		gInterval = null;
	}, 5000);
});
