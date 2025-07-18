/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2025/07/18 22:37:13 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const pageUrl = getRawPageURL();

/**
 * A list of regexp based improvements. The `guard` results are piped into
 * the improvement handler. These guards, as implied, make sure code is only
 * executed once the `guard` is set and returns a value which evaluates to
 * "true".
 *
 * @type {[{handler(...any), guard?(): any}]}
 */
const improvementsPerUrl = [
	{ handler: setGeneralImprovements },
	{
		guard: () => window.location.hash === '#haha',
		handler: setEasterEgg,
	},
	{
		guard: () => new RegExp(
			"^projects\\.intra\\.42\\.fr\\/("
				+ "projects\\/(?<slug>[a-zA-Z0-9-_]+)\\/projects_users\\/(?<project_id>\\d+)?"
				+ "|[0-9]+\\/(?<login>[a-z0-9-_]+)"
				+ "|(?<slugmine>[a-zA-Z0-9-_]+)/mine"
			+ ")\\/?$").exec(pageUrl),
		handler: setPageProjectsUsersImprovements,
	},
	{
		guard: () => /^projects\.intra\.42\.fr\/users\/(?<login>[a-z0-9-_]+)\/feedbacks\/?$/.exec(pageUrl),
		handler: setPageUserFeedbacksImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/events\/(?<event_id>[0-9]+)\/feedbacks\/?$/.exec(pageUrl),
		handler: setPageProjectsUsersImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/users\/(?<login>[a-z0-9-_]+)\/?$/.exec(pageUrl),
		handler: setPageUserImprovements,
	},
	{
		guard: () => /^projects\.intra\.42\.fr\/projects\/graph\/?$/.exec(pageUrl),
		handler: setPageHolyGraphImprovements,
	},
	{
		guard: () => /^companies\.intra\.42\.fr\/(?<lang>[a-z]+)\/administrations\/(?<administration_id>[0-9]+)\/?$/.exec(pageUrl),
		handler: setInternshipAdministrationImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/slots\/?$/.exec(pageUrl),
		handler: setPageSlotsImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/?(users\/(?<login>[a-z0-9-_]+)|home\/?)?$/.exec(pageUrl),
		handler: setPageEvaluationsImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/v3_early_access\/?$/.exec(pageUrl),
		handler: setEarlyAccessImprovements,
	},
	{ handler: setOptionalImprovements },
];

// Execute our improvements per page. If we have a validator, we execute that and pipe the results into our
// improvement handler.
improvementsPerUrl.forEach(improvement => {
	if (improvement.guard) {
		const pipe = improvement.guard();
		if (pipe) improvement.handler(pipe);
	} else {
		improvement.handler();
	}
});

// communication between background.js and this script
let improvPort = chrome.runtime.connect({ name: portName });
improvPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
improvPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "resynced":
		case "prefers-color-scheme-change":
		case "options-changed":
			iConsole.log("Settings changed. Enabling settings that can be enabled. Settings that must be disabled, will disable after a refresh.");
			checkThemeSetting();
			setOptionalImprovements();
			if (typeof setCustomProfile != "undefined") {
				setCustomProfile();
			}
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});

// reconnect every 4-5 minutes to keep service worker running in background
setInterval(function() {
	improvPort.disconnect();
	improvPort = chrome.runtime.connect({ name: portName });
}, 250000);
