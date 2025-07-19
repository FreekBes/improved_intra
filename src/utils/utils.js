const Utils = {
	/**
	 * Validate a URL
	 *
	 * Source: https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
	 * @param {string} url The URL to validate
	 * @returns {boolean} True if the URL is valid, false otherwise
	 */
	validateUrl: (url) => {
		return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
	},

	/**
	 * Get the theme color currently in use by the CSS variables
	 * @returns {string} The theme color as used by the CSS variables
	 */
	getThemeColor: () => {
		const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
		return (color ? color : '#00babc'); // fallback
	},

	/**
	 * Convert HEX color to RGB color object
	 *
	 * Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @param {string} hex
	 * @returns {object} The color, split in RGB values
	 */
	hexToRgb: (hex) => {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return (r + r + g + g + b + b);
		});

		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},

	/**
	 * Convert a JS Date to a string a date input can understand
	 * @param {Date} date The date to convert
	 * @returns {Array} An array with the date string and the time string
	 */
	dateToInputDate(date) {
		// Date string
		let ds = d.getFullYear().toString().padStart(4, '0') + '-' + (d.getMonth()+1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
		// Time string
		let ts = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
		return [ds, ts];
	},

	/**
	 * Convert a logtime string to the number of minutes
	 * @param {string} logTimeText The logtime string to convert (e.g. 1h30m)
	 * @returns {int} The logtime in minutes (e.g. 90)
	 */
	parseLogTime(logTimeText) {
		if (!logTimeText) {
			return (0);
		}
		const logTimeSplit = (logTimeText.indexOf("h") > -1 ? logTimeText.split("h") : logTimeText.split(":"));
		if (logTimeSplit.length < 2) {
			return (0);
		}
		return (parseInt(logTimeSplit[0]) * 60 + parseInt(logTimeSplit[1]));
	},

	/**
	 * Convert logtime to a string
	 * @param {int} logTime The logtime to convert (in minutes, e.g. 90)
	 * @returns {string} The logtime as a string (e.g. 1h30m)
	 */
	logTimeToString(logTime) {
		return (Math.floor(logTime / 60) + "h" + (logTime % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}));
	},

	/**
	 * Generate a random integer between two bounds
	 * @param {int} min The lower bound of the random number to generate
	 * @param {int} max The upper bound of the random number to generate
	 * @returns {int} The random number generated
	 */
	randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	/**
	 * Detect the version of Intra being used
	 * @returns {string} The version of Intra being used (.e.g. v2, v3)
	 */
	detectIntraVersion() {
		if (!document.body) {
			iConsole.warn("Could not detect Intra version, document body not available");
			return "v2"; // Fallback to v2
		}
		document.body.classList.remove("iintra-v2", "iintra-v3", "iintra-vunknown");

		// Check if an element with the class "page" exists in the root of the body.
		// This element is only present in Intra v2.
		if (document.querySelector("body > .page")) {
			iConsole.log("Detected Intra v2");
			document.body.classList.add("iintra-v2");
			return "v2";
		}

		// Check if an element with the id "root" exists in the root of the body.
		// This element is only present in Intra v3.
		if (document.querySelector("body > #root")) {
			iConsole.log("Detected Intra v3");
			document.body.classList.add("iintra-v3");
			return "v3";
		}

		iConsole.warn("Could not detect Intra version, fallback to v2");
		document.body.classList.add("iintra-v2");
		document.body.classList.add("iintra-vunknown");
		return "v2";
	},

	/**
	 * Get the URL of the current page without the hash and query
	 * @returns {string} The raw URL of the current page
	 */
	getRawPageUrl: () => {
		return (window.location.hostname + window.location.pathname);
	},
}
