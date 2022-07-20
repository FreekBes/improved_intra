/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   improv.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/13 00:37:55 by fbes          #+#    #+#                 */
/*   Updated: 2022/07/02 15:15:12 by fbes          ########   odam.nl         */
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
		guard: () => today.getMonth() === 3 && today.getDate() === 1,
		handler: setAprilFools,
	},
	{
		guard: () => window.location.hash === '#haha',
		handler: setEasterEgg,
	},
	{
		guard: () => /^projects\.intra\.42\.fr\/(projects\/(?<cursus>[a-zA-Z0-9-_]+)\/projects_users\/(?<project_id>\d+)?|[0-9]+\/(?<login>[a-z0-9-_]+))\/?$/.exec(pageUrl),
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
			colorizeLogtimeChart();
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
