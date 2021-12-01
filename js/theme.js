/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   theme.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 01:49:05 by fbes          #+#    #+#                 */
/*   Updated: 2021/12/01 16:36:41 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

var themeColorsLink = null;

function disableTheme() {
	if (themeColorsLink) {
		themeColorsLink.remove();
		themeColorsLink = null;
	}
}

function enableTheme(theme) {
	console.log("Enabling dark mode...");
	if (!themeColorsLink) {
		themeColorsLink = document.createElement("link");
		themeColorsLink.setAttribute("type", "text/css");
		themeColorsLink.setAttribute("rel", "stylesheet");
		document.getElementsByTagName("head")[0].appendChild(themeColorsLink);
	}
	themeColorsLink.setAttribute("href", chrome.runtime.getURL("css/colors-"+theme+".css"));
}

function checkThemeSetting() {
	chrome.storage.local.get("theme", function(data) {
		if (data["theme"] == "system") {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				enableTheme("dark");
				console.log("%c[Improved Intra]%c Enabled dark mode to follow the system setting", "color: #00babc;", "");
			}
			else {
				console.log("%c[Improved Intra]%c Following system settings for dark mode, but system is set to light mode", "color: #00babc;", "");
				enableTheme("light");
			}
		}
		else if (data["theme"] == "dark") {
			enableTheme("dark");
			console.log("%c[Improved Intra]%c Enabled dark mode because of extension settings", "color: #00babc;", "");
		}
		else {
			enableTheme("light");
			console.log("%c[Improved Intra]%c Disabled theme because of extension settings", "color: #00babc;", "");
		}
	});
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
	console.log("%c[Improved Intra]%c @media rule prefers-color-scheme changed", "color: #00babc;", "");
	checkThemeSetting();
});

checkThemeSetting();
