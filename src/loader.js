iConsole.log("Loading Improved Intra...");

const INTRA_VERSION = Utils.detectIntraVersion();
const RAW_PAGE_URL = Utils.getRawPageUrl();
const EXT_ICONS_PATH_PREFIX = "images/icons/";

/**
 * Definition of the improvements that can be loaded on a specific URL
 * @type {Array} improvementsPerUrl An array of objects containing the name of the improvement, the versions of Intra it can be loaded on, a guard function and a handler function
 * @property {string} name The name of the improvement
 * @property {Array} intraVersions The versions of Intra the improvement can be loaded on
 * @property {function|null} guard A guard function that returns true if the improvement can be loaded, or false otherwise
 * @property {function} handler The function that will handle the improvement
 */
const IMPROVEMENTS = [
	{
		name: "Theme Applier V2",
		intraVersions: ["v2"],
		guard: null, // Always load the theme applier
		handler: ThemeApplyV2.apply
	},
	{
		name: "Theme Applier V3",
		intraVersions: ["v3"],
		guard: null, // Always load the theme applier
		handler: ThemeApplyV3.apply
	},
	{
		name: "Navigation Bars V3",
		intraVersions: ["v3"],
		guard: null, // Always handle the navigation bars, they're always present
		handler: NavV3.init
	},
	{
		name: "Menu Link v3",
		intraVersions: ["v3"],
		guard: null, // Always handle the Menu link, it needs to be injected on nav load
		handler: MenuLink.injectMenuObserver
	},
	{
		name: "Haha Easter Egg",
		intraVersions: ["v2", "v3"],
		guard: () => window.location.hash === "#haha",
		handler: Common.enableHahaEasterEgg
	},
	{
		name: "Dashboard V3",
		intraVersions: ["v3"],
		guard: () => /^profile-v3\.intra\.42\.fr\/?$/.exec(RAW_PAGE_URL),
		handler: DashboardV3.init
	},
	{
		name: "Profile V3",
		intraVersions: ["v3"],
		guard: () => /^profile-v3\.intra\.42\.fr\/users\/(.+)\/?$/.exec(RAW_PAGE_URL),
		handler: ProfileV3.init
	}
];

const Loader = {
	/**
	 * Load an improvement
	 * @param {Object} improvement The improvement to load
	 * @param {any} pipe The output of the guard function, if any
	 * @returns {void}
	 */
	loadImprovement: (improvement, pipe) => {
		iConsole.log(`Loading improvement: ${improvement.name}`);
		improvement.handler(pipe);
	},

	/**
	 * Detect which page is currently being viewed and load the improvements that are available for that page
	 * @returns {void}
	 */
	detectImprovementsToLoad: () => {
		IMPROVEMENTS.forEach((improvement) => {
			if (!improvement.intraVersions.includes(INTRA_VERSION)) {
				iConsole.log(`Skipping improvement '${improvement.name}' for Intra version '${INTRA_VERSION}'`);
				return;
			}
			try {
				if (improvement.guard) {
					// Guard present, only load the improvement if the guard returns anything that ==true in Javascript.
					const pipe = improvement.guard();
					if (pipe) {
						Loader.loadImprovement(improvement, pipe);
					}
				}
				else {
					// No guard, always load the improvement
					Loader.loadImprovement(improvement, null);
				}
			}
			catch (err) {
				iConsole.error(`Error loading improvement '${improvement.name}':`, err);
			}
		});
	}
}

Loader.detectImprovementsToLoad();
