/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monit.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/11 19:23:05 by fbes          #+#    #+#                 */
/*   Updated: 2022/05/11 14:33:10 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/*
for checking if user has corrected anything
implement in the future
'/users/{user_id}/scale_teams/as_corrected'
https://github.com/troplolBE/bettercorrectors#sample-1
*/

// used in Array.reduce
function sum(prevVal, curVal) {
	return (prevVal + curVal);
}

const monit = {
	httpReq: null,
	bldtReq: null,
	requirements: {
		today: 205,
		min: 1440,
		achievement1: 3000,
		achievement2: 4800
	},
	bhContainer: null,
	logTimes: [],
	logTimesTotal: 0,
	buildingTimes: [],
	buildingTimesTotal: 0,
	times: [],
	timesTotal: 0,
	usingCombined: false,

	/**
	 * Get the dates of this week's days
	 */
	getWeekDates: function() {
		const thisWeek = [];
		for (let i = 0; i <= dayOfWeek; i++) {
			thisWeek.push(new Date(today.getTime() - 86400000 * i).toISOString().split("T")[0]);
		}
		return (thisWeek);
	},

	/**
	 * Get the status of the monitoring system from the server.
	 * Monitoring system could be disabled.
	 * See server/campus_specifics/codam/monit_status.php
	 */
	getStatus: function() {
		return new Promise(function(resolve, reject) {
			if (monit.httpReq != null) {
				monit.httpReq.abort();
			}
			monit.httpReq = new XMLHttpRequest();
			monit.httpReq.addEventListener("load", function() {
				try {
					const status = JSON.parse(this.responseText);
					resolve(status);
				}
				catch (err) {
					reject(err);
				}
			});
			monit.httpReq.addEventListener("error", function(err) {
				reject(err);
			});
			monit.httpReq.open("GET", "https://darkintra.freekb.es/campus_specifics/codam/monit_status.json");
			monit.httpReq.send();
		});
	},

	/**
	 * Get the expectations for this week, based on the minutes the user has currently
	 * and how many days are left. The required minutes left are expected to be spread
	 * out, equally divided over all remaining days.
	 */
	setExpected: function() {
		const timesNoToday = this.times.slice(1);
		let timesTotalNoToday;

		if (timesNoToday && timesNoToday.length > 0) {
			timesTotalNoToday = timesNoToday.reduce(sum);
		}
		else {
			timesTotalNoToday = 0;
		}
		if (dayOfWeek == 7 || this.timesTotal > this.requirements.min) {
			this.requirements.today = this.requirements.min;
		}
		else {
			this.requirements.today = timesTotalNoToday + Math.round((this.requirements.min - timesTotalNoToday) / (7 - dayOfWeek));
		}
		iConsole.log("Buildingtime up until today", timesTotalNoToday);
		iConsole.log("Expected minutes today", this.requirements.today - timesTotalNoToday);
		iConsole.log("Expected minutes after today", this.requirements.today);
	},

	/**
	 * Get a user's logtime from the web and parse it into the logtime array
	 */
	getLogTimes: function(username) {
		return (new Promise(function(resolve, reject) {
			if (monit.httpReq != null) {
				monit.httpReq.abort();
			}
			monit.httpReq = new XMLHttpRequest();
			monit.httpReq.addEventListener("load", function() {
				try {
					monit.logTimes = [];
					monit.logTimesTotal = 0;
					const stats = JSON.parse(this.responseText);
					const weekDates = monit.getWeekDates();
					iConsole.log("This week's dates: ", weekDates);
					for (let i = 0; i < weekDates.length; i++) {
						if (weekDates[i] in stats) {
							monit.logTimes.push(parseLogTime(stats[weekDates[i]]));
						}
						else {
							monit.logTimes.push(0);
						}
					}
					if (monit.logTimes && monit.logTimes.length > 0) {
						monit.logTimesTotal = monit.logTimes.reduce(sum);
					}
					iConsole.log("Logtimes", monit.logTimes);
					iConsole.log("Total minutes of logtime", monit.logTimesTotal);
					resolve(username);
				}
				catch (err) {
					iConsole.warn("Could not fetch logtimes for user " + username);
					reject(err);
				}
			});
			monit.httpReq.addEventListener("error", function(err) {
				reject(err);
			});
			monit.httpReq.open("GET", window.location.origin + "/users/" + username + "/locations_stats.json");
			monit.httpReq.send();
		}));
	},

	/**
	 * Get a user's buildingtimes from the Improved Intra server (given to server by user or by a third-party script)
	 */
	getBuildingTimes: function(username) {
		return (new Promise(function(resolve, reject) {
			if (monit.bldtReq != null) {
				monit.bldtReq.abort();
			}
			monit.bldtReq = new XMLHttpRequest();
			monit.bldtReq.addEventListener("load", function() {
				try {
					monit.buildingTimes = [];
					monit.buildingTimesTotal = 0;
					const res = JSON.parse(this.responseText);
					if (this.status == 200) {
						const weekDates = monit.getWeekDates();
						for (let i = 0; i < weekDates.length; i++) {
							if (weekDates[i] in res["data"]) {
								monit.buildingTimes.push(res["data"][weekDates[i]]);
							}
							else {
								monit.buildingTimes.push(0);
							}
						}
						if (monit.buildingTimes && monit.buildingTimes.length > 0) {
							monit.buildingTimesTotal = monit.buildingTimes.reduce(sum);
						}
						iConsole.log("Buildingtimes", monit.buildingTimes);
						iConsole.log("Total minutes of building time", monit.buildingTimesTotal);
						resolve(username);
					}
					else {
						// don't care about the error here, just make sure the extension's code keeps running
						iConsole.log("No buildingtimes found for " + username);
						resolve(username);
					}
				}
				catch (err) {
					// don't care about the error here, just make sure the extension's code keeps running
					iConsole.log("Unable to retrieve buildingtimes for " + username);
					resolve(username);
				}
			});
			monit.bldtReq.addEventListener("error", function(err) {
				// don't care about the error here, just make sure the extension's code keeps running
				iConsole.log("Unable to retrieve buildingtimes for " + username);
				resolve(username);
			});
			monit.bldtReq.open("GET", "https://darkintra.freekb.es/buildingtimes.php?username=" + username + "&parsed=true");
			monit.bldtReq.send();
		}));
	},

	combineTimes: function(username) {
		return (new Promise(function(resolve, reject) {
			monit.times = new Array(monit.logTimes.length);
			monit.timesTotal = 0;
			if (monit.times.length == 0) {
				reject("Unexpected error: monit.times.length == 0!");
				return;
			}
			monit.times[0] = monit.logTimes[0];
			for (let i = 1; i < monit.times.length; i++) {
				monit.times[i] = ( monit.buildingTimes[i] > monit.logTimes[i] ? monit.buildingTimes[i] : monit.logTimes[i]);
			}
			if (monit.times && monit.times.length > 0) {
				monit.timesTotal = monit.times.reduce(sum);
			}
			if (monit.timesTotal != monit.logTimesTotal) {
				monit.usingCombined = true;
			}
			resolve(username);
		}));
	},

	/**
	 * Get the progress towards the Monitoring System's goals from the current webpage.
	 * The logtime data is read from the SVG logtime chart, but in case that fails there's
	 * a fallback available to read from the web instead.
	 */
	getProgress: function() {
		if (!profileFromCodam()) {
			return;
		}
		this.bhContainer = document.getElementById("goals_container");
		if (!this.bhContainer) {
			return;
		}
		this.getLogTimes(getProfileUserName())
			.then(this.getBuildingTimes)
			.then(this.combineTimes)
			.then(this.writeProgress)
			.catch(function(err) {
				iConsole.error("Could not retrieve logtimes or buildingtimes for Codam Monitoring System progress", err);
			});
	},

	/**
	 * Write the progress data to the Black Hole box
	 */
	writeProgress: function(username) {
		monit.getStatus().then(function(status) {
			monit.setExpected();
			iConsole.log("Combined times", monit.times);
			iConsole.log("Combined total minutes", monit.timesTotal);

			const aguDate = document.getElementById("agu-date");
			if (aguDate && aguDate.className.indexOf("hidden") == -1) {
				return;
			}

			let atLeastRelaxed = false;
			const partTimeCheck = document.querySelectorAll("a.project-item.block-item[href*='part_time'][data-cursus='42cursus']");
			if (partTimeCheck.length > 0 || status["monitoring_system_active"] === false) {
				iConsole.log("User is working on Part-Time project or monitoring system is currently disabled, emote will be at least relaxed");
				atLeastRelaxed = true;
			}

			const availableStatus = document.querySelector(".user-poste-status");
			if (availableStatus && availableStatus.innerText == "Available") {
				iConsole.log("User is currently available, emote will be at least relaxed");
				atLeastRelaxed = true;
			}

			for (let i = 0; i < monit.bhContainer.children.length; i++) {
				monit.bhContainer.children[i].style.display = "none";
			}

			const progressNode = document.createElement("div");
			progressNode.setAttribute("id", "monit-progress");

			const progressTitle = document.createElement("div");
			progressTitle.setAttribute("class", "mb-1");

			const coalitionSpan = document.createElement("span");
			coalitionSpan.setAttribute("class", "coalition-span");
			coalitionSpan.style.color = getCoalitionColor();
			coalitionSpan.innerText = "Monitoring System progress";

			progressTitle.appendChild(coalitionSpan);
			progressNode.appendChild(progressTitle);

			const progressText = document.createElement("div");
			progressText.setAttribute("id", "monit-progress-text");

			const ltHolder = document.createElement("div");
			ltHolder.setAttribute("id", "lt-holder");
			ltHolder.setAttribute("class", "emote-lt");
			ltHolder.setAttribute("data-toggle", "tooltip");
			ltHolder.setAttribute("title", "");

			const smiley = document.createElement("span");
			smiley.setAttribute("id", "lt-emote");

			const progressPerc = document.createElement("span");
			if (status["monitoring_system_active"]) {
				progressPerc.innerText = Math.floor(monit.timesTotal / 1440 * 100) + "% complete";
				ltHolder.setAttribute("data-original-title", (monit.usingCombined ? "Building time*" : "Logtime") + " this week: " + logTimeToString(monit.timesTotal));
			}
			else if (status["work_from_home_required"] && !status["monitoring_system_active"]) {
				// covid-19 message
				progressPerc.innerText = "Don't give up!";
				ltHolder.setAttribute("data-original-title", "You can do this! Codam will at some point reopen again. I'm sure of it! Times will get better.");
			}
			else if (!status["monitoring_system_active"]) {
				progressPerc.innerText = logTimeToString(monit.timesTotal);
				ltHolder.setAttribute("data-original-title", (monit.usingCombined ? "Building time*" : "Logtime") + " this week (Monitoring System is currently disabled)");
			}

			if (monit.timesTotal < monit.requirements.today && !atLeastRelaxed) {
				smiley.setAttribute("class", "icon-smiley-sad-1");
				smiley.setAttribute("style", "color: var(--danger-color);");
				progressPerc.setAttribute("style", "color: var(--danger-color);");
			}
			else if ((atLeastRelaxed && monit.timesTotal < monit.requirements.min) || (!atLeastRelaxed && monit.timesTotal < monit.requirements.min)) {
				smiley.setAttribute("class", "icon-smiley-relax");
				smiley.setAttribute("style", "color: var(--warning-color);");
				progressPerc.setAttribute("style", "color: var(--warning-color);");
			}
			else if (monit.timesTotal < monit.requirements.achievement1) {
				smiley.setAttribute("class", "icon-smiley-happy-3");
				smiley.setAttribute("style", "color: var(--success-color);");
				progressPerc.setAttribute("style", "color: var(--success-color);");
			}
			else if (monit.timesTotal < monit.requirements.achievement2) {
				smiley.setAttribute("class", "icon-smiley-happy-5");
				smiley.setAttribute("style", "color: var(--success-color);");
				progressPerc.setAttribute("style", "color: var(--success-color);");
			}
			else {
				smiley.setAttribute("class", "icon-smiley-surprise");
				smiley.setAttribute("style", "color: var(--success-color);");
				progressPerc.setAttribute("style", "color: var(--success-color);");
			}

			// profile easter egg: use a certain emote on certain user pages
			const customEmotes = {
				"fbes": "icon-light-house",
				"lde-la-h": "iconf-cactus",
				"jgalloni": "iconf-bug-1",
				"ieilat": "iconf-pacman-ghost",
				"pde-bakk": "iconf-crown-1",
				"pvan-dij": "iconf-milk",
				"jkoers": "iconf-cctv-2",
				"hsmits": "iconf-vector",
			};
			if (Object.keys(customEmotes).indexOf(username) > -1) {
				smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
				smiley.setAttribute("class", customEmotes[username]);

				smiley.addEventListener("click", function(ev) {
					if (!this.getAttribute("data-oclass")) {
						return;
					}
					const tempClass = this.getAttribute("class");
					this.setAttribute("class", this.getAttribute("data-oclass"));
					this.setAttribute("data-oclass", tempClass);
				});
			}
			ltHolder.appendChild(smiley);
			ltHolder.appendChild(progressPerc);

			progressText.appendChild(ltHolder);

			progressNode.appendChild(progressText);

			monit.bhContainer.appendChild(progressNode);
			monit.bhContainer.className = monit.bhContainer.className.replace("hidden", "");
			addToolTip("#lt-holder");
		});
	},
};

improvedStorage.get("codam-monit").then(function(data) {
	if (optionIsActive(data, "codam-monit")) {
		monit.getProgress();
	}
});
