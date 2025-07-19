const THEME_PATH_PREFIX = "src/shared/styling/themes/";

const ThemeLoader = {
	mainThemeLink: null, // Link to the CSS file containing all base colors for the theme
	themeColorsLink: null, // Link to the CSS file containing the colors for the theme, overrides the main theme
	applyLink: null, // Link to the CSS file that applies the theme to the page

	/**
	 * Get the head element of the document, creating it if it doesn't exist
	 * @returns {HTMLHeadElement} The head element of the document
	 */
	getHead: () => {
		const head = document.head || document.getElementsByTagName('head')[0];
		if (!head) {
			// Create the head if it doesn't exist
			const newHead = document.createElement('head');
			document.documentElement.appendChild(newHead);
			return newHead;
		}
		return head;
	},

	/**
	 * Create the theme link elements in the head of the document
	 * This will create two links: one for the main theme and one for the color scheme
	 * @returns {void}
	 */
	createThemeLinks: () => {
		const head = ThemeLoader.getHead();

		// Main theme link: contains all the base colors
		if (!ThemeLoader.mainThemeLink) {
			ThemeLoader.mainThemeLink = document.createElement('link');
			ThemeLoader.mainThemeLink.setAttribute("rel", "stylesheet");
			ThemeLoader.mainThemeLink.setAttribute("type", "text/css");
			ThemeLoader.mainThemeLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + "placeholder.css"));
			head.appendChild(ThemeLoader.mainThemeLink);
		}

		// Color scheme link: contains the colors for the theme, overrides the main theme
		if (!ThemeLoader.themeColorsLink) {
			ThemeLoader.themeColorsLink = document.createElement('link');
			ThemeLoader.themeColorsLink.setAttribute("rel", "stylesheet");
			ThemeLoader.themeColorsLink.setAttribute("type", "text/css");
			ThemeLoader.themeColorsLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + "placeholder.css"));
			head.appendChild(ThemeLoader.themeColorsLink);
		}

		// Apply link: this is used to apply the theme to the page
		if (!ThemeLoader.applyLink) {
			ThemeLoader.applyLink = document.createElement('link');
			ThemeLoader.applyLink.setAttribute("rel", "stylesheet");
			ThemeLoader.applyLink.setAttribute("type", "text/css");
			ThemeLoader.applyLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + "placeholder.css"));
			head.appendChild(ThemeLoader.applyLink);
		}
	},

	/**
	 * Load a theme
	 * @param {*} themeName The name of the theme to load
	 * @param {*} colors The color scheme to use, or null/undefined to use the default color scheme
	 * @returns {void}
	 */
	loadTheme: (themeName, colors) => {
		iConsole.log("Enabling theme '" + themeName + "'" + (colors ? " in '" + colors + "' mode..." : ""));
		ThemeLoader.mainThemeLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + themeName + ".css"));
		if (colors && colors !== "default") {
			ThemeLoader.themeColorsLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + "colors/" + colors + ".css"));
		} else {
			ThemeLoader.themeColorsLink.setAttribute("href", chrome.runtime.getURL(THEME_PATH_PREFIX + "placeholder.css"));
		}
	},

	/**
	 * Apply the theme to the page based on the Intra version
	 * This will set the href attribute of the apply link to the correct CSS file based on the Intra version
	 * @param {string} intraVersion The version of Intra being used (e.g. "v2", "v3")
	 * @returns {void}
	 */
	applyTheme: (intraVersion) => {
		switch (intraVersion) {
			case "v3":
				iConsole.log("Applying theme for Intra v3");
				ThemeLoader.applyLink.setAttribute("href", chrome.runtime.getURL("src/v3/themes/apply.css"));
				break;
			case "v2":
				iConsole.log("Applying theme for Intra v2");
				ThemeLoader.applyLink.setAttribute("href", chrome.runtime.getURL("src/v2/themes/apply.css"));
				break;
			default:
				iConsole.warn(`Unknown version '${INTRA_VERSION}' for theme application, defaulting to v2.`);
				ThemeLoader.applyLink.setAttribute("href", chrome.runtime.getURL("src/v2/themes/apply.css"));
				break;
		}
	},

	/**
	 * Check if a theme and color scheme should be loaded based on the user's settings
	 * @returns {Promise<{theme: string, colors: string}>} The theme and color scheme that were loaded
	 */
	checkLoadThemeSetting: async () => {
		const { theme, colors } = await ImprovedStorage.get(["theme", "colors"]);
		if (theme === "system" || !theme) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				ThemeLoader.loadTheme("dark", colors);
			} else {
				ThemeLoader.loadTheme("light", colors);
			}
		}
		else if (theme) {
			ThemeLoader.loadTheme(theme, colors);
		}
		else {
			// Fallback to default
			ThemeLoader.loadTheme("light", null);
		}
		return { theme, colors };
	},

	/**
	 * Initialize the theme loader
	 * This will create the theme links and load the theme based on the user's settings
	 * It will also listen for changes to the prefers-color-scheme media query and reload the theme if it changes
	 * @returns {void}
	 */
	init: () => {
		ThemeLoader.createThemeLinks();
		ThemeLoader.checkLoadThemeSetting();
		// ThemeLoader.applyTheme(); // Can only be called after the page has loaded and the Improved Intra Loader has initialized

		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
			iConsole.log("@media rule prefers-color-scheme changed");
			ThemeLoader.checkLoadThemeSetting();
		});
	}
}

ThemeLoader.init();
