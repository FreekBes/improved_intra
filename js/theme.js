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

function enableDarkMode() {
	console.log("Enabling dark mode...");
	var link = document.createElement("link");
	link.setAttribute("href", chrome.runtime.getURL("css/dark.css"));
	link.setAttribute("type", "text/css");
	link.setAttribute("rel", "stylesheet");
	document.getElementsByTagName("head")[0].appendChild(link);
}

chrome.storage.local.get("theme", function(data) {
	if (data["theme"] == "system") {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			enableDarkMode();
			console.log("%c[Improved Intra]%c Enabled dark mode to follow the system setting", "color: #00babc;", "");
		}
		else {
			console.log("%c[Improved Intra]%c Following system settings for dark mode, but system is set to light mode", "color: #00babc;", "");
		}
	}
	else if (data["theme"] == "dark") {
		enableDarkMode();
		console.log("%c[Improved Intra]%c Enabled dark mode because of extension settings", "color: #00babc;", "");
	}
});