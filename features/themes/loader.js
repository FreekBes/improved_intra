/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   loader.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 01:49:05 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:05:18 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

let themeColorsLink = null;
let themeLink = null;

// Disable a theme, set theme or colors to false to not disable those colors
function disableTheme(theme, colors) {
	if (theme !== false && themeLink) {
		themeLink.remove();
		themeLink = null;
	}
	if (colors !== false && themeColorsLink) {
		themeColorsLink.remove();
		themeColorsLink = null;
	}
}

// Enable a theme, leave colors as null or undefined to use default color scheme
function enableTheme(theme, colors) {
	iConsole.log("Enabling theme '" + theme + "'" + (colors ? " in '" + colors + "' mode..." : ""));
	if (!themeLink) {
		themeLink = document.createElement("link");
		themeLink.setAttribute("type", "text/css");
		themeLink.setAttribute("rel", "stylesheet");
		document.getElementsByTagName("head")[0].appendChild(themeLink);
	}
	themeLink.setAttribute("href", chrome.runtime.getURL("features/themes/"+theme+".css"));

	if (colors && colors !== "default") {
		if (!themeColorsLink) {
			themeColorsLink = document.createElement("link");
			themeColorsLink.setAttribute("type", "text/css");
			themeColorsLink.setAttribute("rel", "stylesheet");
			document.getElementsByTagName("head")[0].appendChild(themeColorsLink);
		}
		themeColorsLink.setAttribute("href", chrome.runtime.getURL("features/themes/colors/"+colors+".css"));
	}
	else {
		disableTheme(false, true);
	}
}

function checkThemeSetting() {
	improvedStorage.get(["theme", "colors"]).then(function(data) {
		if (data["theme"] == "system" || !data["theme"]) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				enableTheme("dark", data["colors"]);
			}
			else {
				enableTheme("light", data["colors"]);
			}
		}
		else if (data["theme"]) {
			enableTheme(data["theme"], data["colors"]);
		}
		else {
			// fallback to default
			enableTheme("light", null);
		}
	});
}

// colorize logtimes chart based on selected color scheme
function colorizeLogtimeChart(event) {
	setTimeout(function() {
		const ltSvg = document.getElementById("user-locations");
		if (!ltSvg) {
			return;
		}
		const ltDays = ltSvg.getElementsByTagName("rect");
		const col24hex = getComputedStyle(document.documentElement).getPropertyValue('--logtime-chart-24h-color');
		if (col24hex !== "") {
			const col24rgb = hexToRgb(col24hex.trim());
			for (let i = 0; i < ltDays.length; i++) {
				const fill = ltDays[i].getAttribute("fill");
				if (fill.indexOf("rgba") > -1) {
					const opacity = fill.replace(/^.*,(.+)\)/, '$1');
					ltDays[i].setAttribute("fill", "rgba("+col24rgb.r+","+col24rgb.g+","+col24rgb.b+","+opacity+")");
				}
			}
		}
	}, 250);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
	iConsole.log("@media rule prefers-color-scheme changed");
	checkThemeSetting();
});

checkThemeSetting();

// fix sign in page issue with background image
window.addEventListener("DOMContentLoaded", function() {
	if (window.location.origin.indexOf("intra.42.fr") > -1 && window.location.pathname == "/users/sign_in") {
		document.getElementsByTagName("html")[0].setAttribute("style", "background-color: unset !important;");
	}
});
