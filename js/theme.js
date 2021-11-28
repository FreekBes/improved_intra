/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   theme.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 01:49:05 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 01:49:05 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

var themeLink = null;

function disableTheme() {
	if (themeLink) {
		themeLink.remove();
		themeLink = null;
	}
}

function enableTheme(theme) {
	console.log("Enabling dark mode...");
	if (!themeLink) {
		themeLink = document.createElement("link");
		themeLink.setAttribute("type", "text/css");
		themeLink.setAttribute("rel", "stylesheet");
		document.getElementsByTagName("head")[0].appendChild(themeLink);
	}
	themeLink.setAttribute("href", chrome.runtime.getURL("css/"+theme+".css"));
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
				disableTheme();
			}
		}
		else if (data["theme"] == "dark") {
			enableTheme("dark");
			console.log("%c[Improved Intra]%c Enabled dark mode because of extension settings", "color: #00babc;", "");
		}
		else {
			disableTheme();
			console.log("%c[Improved Intra]%c Disabled theme because of extension settings", "color: #00babc;", "");
		}
	});
}

checkThemeSetting();