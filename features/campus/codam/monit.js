/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monit.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/11 19:23:05 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 19:22:39 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// for checking if user has corrected anything
// implement in the future
// '/users/{user_id}/scale_teams/as_corrected'
// https://github.com/troplolBE/bettercorrectors#sample-1

function sum(prevVal, curVal) {
	return (prevVal + curVal);
}

const monit = {
	httpReq: null,
	requirements: {
		today: 205,
		min: 1440,
		achievement1: 3000,
		achievement2: 4800
	},
	dayOfWeek: -1,
	bhContainer: null,
	logTimes: [],
	logTimesTotal: 0,
	username: "me",

	/**
	 * Get the color of the user's coalition
	 */
	getCoalitionColor: function() {
		try {
			return (document.getElementsByClassName("coalition-span")[0].style.color);
		}
		catch (err) {
			return ("#FF0000");
		}
	},

	/**
	 * Get username of profile
	 */
	getUserName: function() {
		try {
			return (document.querySelector(".profile-item .profile-name .login[data-login]").getAttribute("data-login"));
		}
		catch (err) {
			return (null);
		}
	},

	/**
	 * Get the dates of this week's days
	 */
	getWeekDates: function() {
		const thisWeek = [];
		for (let i = 0; i <= monit.dayOfWeek; i++) {
			thisWeek.push(new Date(today.getTime() - 86400000 * i).toISOString().split("T")[0]);
		}
		iConsole.log("This week's dates: ", thisWeek);
		return (thisWeek);
	},

	/**
	 * Get the expectations for this week, based on the minutes the user has currently
	 * and how many days are left. The required minutes left are expected to be spread
	 * out, equally divided over all remaining days.
	 */
	setExpected: function() {
		const logTimesNoToday = this.logTimes.slice(1);
		let logTimesTotalNoToday;

		if (logTimesNoToday && logTimesNoToday.length > 0) {
			logTimesTotalNoToday = logTimesNoToday.reduce(sum);
		}
		else {
			logTimesTotalNoToday = 0;
		}
		if (this.dayOfWeek == 7 || this.logTimesTotal > this.requirements.min) {
			this.requirements.today = this.requirements.min;
		}
		else {
			this.requirements.today = logTimesTotalNoToday + Math.round((this.requirements.min - logTimesTotalNoToday) / (7 - this.dayOfWeek));
		}
		iConsole.log("Logtime up until today", logTimesTotalNoToday);
		iConsole.log("Expected minutes today", this.requirements.today - logTimesTotalNoToday);
		iConsole.log("Expected minutes after today", this.requirements.today);
	},

	/**
	 * Parse a piece of logtime text: in format HHhMM or HH:MM(:SS)
	 */
	parseLogTime: function(logTimeText) {
		const logTimeSplit = (logTimeText.indexOf("h") > -1 ? logTimeText.split("h") : logTimeText.split(":"));
		if (logTimeSplit.length < 2) {
			return (0);
		}
		return (parseInt(logTimeSplit[0]) * 60 + parseInt(logTimeSplit[1]));
	},

	/**
	 * Convert a logTime into a string with format HHhMM
	 */
	logTimeToString: function(logTime) {
		return (Math.floor(logTime / 60) + "h" + (logTime % 60).toLocaleString(undefined, {minimumIntegerDigits: 2}));
	},

	/**
	 * Get a user's logtime from the web and parse it into the logtime array
	 */
	getLogTimesWeb: function(username) {
		return (new Promise(function(resolve, reject) {
			if (monit.httpReq != null) {
				monit.httpReq.abort();
			}
			monit.httpReq = new XMLHttpRequest();
			monit.httpReq.addEventListener("load", function() {
				try {
					const stats = JSON.parse(this.responseText);
					const weekDates = monit.getWeekDates();
					monit.logTimes = [];
					for (let i = 0; i < weekDates.length; i++) {
						if (weekDates[i] in stats) {
							monit.logTimes.push(monit.parseLogTime(stats[weekDates[i]]));
						}
						else {
							monit.logTimes.push(0);
						}
					}
					if (monit.logTimes && monit.logTimes.length > 0) {
						monit.logTimesTotal = monit.logTimes.reduce(sum);
					}
					else {
						monit.logTimesTotal = 0;
					}
					resolve();
				}
				catch (err) {
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
	 * Get the logtime from the logtime chart, modify the chart to include
	 * progress for previous weeks, and parse this week's logtime into the logtime array
	 */
	getLogTimes: function() {
		return (new Promise(function (resolve, reject) {
			const ltSvg = document.getElementById("user-locations");
			if (!ltSvg) {
				reject("Element #user-locations not found");
			}
			const ltDays = ltSvg.getElementsByTagName("g");
			let ltDay = ltDays[ltDays.length - 1];
			let i;

			monit.logTimes = [];
			for (i = 0; i <= monit.dayOfWeek; i++) {
				ltDay = ltDays[ltDays.length - i - 1];
				if (!ltDay) {
					reject("Failed to read data from SVG logtime chart");
				}
				monit.logTimes.push(monit.parseLogTime(ltDay.getAttribute("data-original-title")));
			}
			if (monit.logTimes && monit.logTimes.length > 0) {
				monit.logTimesTotal = monit.logTimes.reduce(sum);
			}
			else {
				monit.logTimesTotal = 0;
			}

			let daysInWeek = monit.dayOfWeek + 1;
			const remainingWeeks = Math.floor(ltDays.length / 7) + (monit.dayOfWeek != 6 ? 1 : 0);
			let r = 0;
			for (i = 0; i < remainingWeeks; i++) {
				let j;

				if (i == 1) {
					daysInWeek = 7;
				}
				const tempLogTimes = [];

				// parse individual logtimes
				for (j = 0; j < daysInWeek; j++) {
					ltDay = ltDays[ltDays.length - r - 1];
					if (!ltDay) {
						resolve();
						return;
					}
					tempLogTimes.push(monit.parseLogTime(ltDay.getAttribute("data-original-title")));
					if (tempLogTimes[j] == 0) {
						ltDay.setAttribute("data-nolog", "");
					}
					r++;
				}

				// calculate cumulative logtime
				for (j = daysInWeek - 2; j > -1; j--) {
					tempLogTimes[j] = tempLogTimes[j] + tempLogTimes[j + 1];
				}

				// add cumulative logtime and percentage to tooltips
				for (j = daysInWeek - 1; j > -1; j--) {
					ltDay = ltDays[ltDays.length - r + j];
					if (!ltDay) {
						resolve();
						return;
					}
					ltDay.setAttribute("data-original-title", ltDay.getAttribute("data-original-title") + " (" + monit.logTimeToString(tempLogTimes[daysInWeek - 1 - j]) + " / " + Math.floor(tempLogTimes[daysInWeek - 1 - j] / monit.requirements.min * 100) + "%)");
				}
			}
			resolve();
		}));
	},

	/**
	 * Get the progress towards the Monitoring System's goals from the current webpage.
	 * The logtime data is read from the SVG logtime chart, but in case that fails there's
	 * a fallback available to read from the web instead.
	 */
	getProgress: function() {
		if (window.location.pathname.indexOf("/users/") == 0) {
			// user profile. check if user loaded is from Amsterdam campus
			// if not, do not display monitoring system progress (return)
			const iconLocation = document.getElementsByClassName("icon-location");
			if (iconLocation.length == 0) {
				return;
			}
			if (iconLocation[0].nextSibling.nextSibling.textContent != "Amsterdam") {
				return;
			}
		}
		this.bhContainer = document.getElementById("goals_container");
		if (!this.bhContainer) {
			return;
		}
		if (window.location.pathname == "/") {
			// dashboard page. check if user logged in is from Amsterdam campus
			// if not, do not display monitoring system progress (return)
			// check by checking the school record button, should contain Codam
			// if the button is not there (before handing in Libft), check coalition
			const schoolRecordButton = document.querySelector(".school-record-button");
			if (schoolRecordButton) {
				const srFormData = document.getElementsByName("sr_id");
				if (srFormData.length > 0) {
					if (srFormData[0].textContent.indexOf("Codam") == -1) {
						return;
					}
				}
				else {
					return;
				}
			}
			else {
				const coalitionName = document.querySelector(".coalition-name .coalition-span");
				if (coalitionName) {
					if (["Pyxis", "Vela", "Cetus"].indexOf(coalitionName.textContent) == -1) {
						return;
					}
				}
				else {
					return;
				}
			}
		}
		this.username = this.getUserName();
		this.getLogTimes()
			.then(this.writeProgress)
			.catch(function(err) {
				iConsole.warn("Could not read logtimes chart:", err);
				monit.getLogTimesWeb(monit.username).then(monit.writeProgress)
					.catch(function(err) {
						iConsole.error("Could not retrieve logtimes from the web", err);
					});
			});
	},

	addTooltip: function() {
		// add bootstrap tooltip to holder
		const evt = new CustomEvent("add-tooltip", { detail: "#lt-holder" });
		document.dispatchEvent(evt);
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
	 * Write the progress data to the Black Hole box
	 */
	writeProgress: function() {
		monit.getStatus().then(function(status) {
			monit.setExpected();
			iConsole.log("Logtimes", monit.logTimes);
			iConsole.log("Total minutes", monit.logTimesTotal);

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
			coalitionSpan.style.color = monit.getCoalitionColor();
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
				progressPerc.innerText = Math.floor(monit.logTimesTotal / 1440 * 100) + "% complete";
				ltHolder.setAttribute("data-original-title", "Logtime this week: " + monit.logTimeToString(monit.logTimesTotal));
			}
			else if (status["work_from_home_required"] && !status["monitoring_system_active"]) {
				// covid-19 message
				progressPerc.innerText = "Don't give up!";
				ltHolder.setAttribute("data-original-title", "You can do this! Codam will at some point reopen again. I'm sure of it! Times will get better.");
			}
			else if (!status["monitoring_system_active"]) {
				progressPerc.innerText = monit.logTimeToString(monit.logTimesTotal);
				ltHolder.setAttribute("data-original-title", "Logtime this week (Monitoring System is currently disabled)");
			}

			if (monit.logTimesTotal < monit.requirements.today && !atLeastRelaxed) {
				smiley.setAttribute("class", "icon-smiley-sad-1");
				smiley.setAttribute("style", "color: var(--danger-color);");
				progressPerc.setAttribute("style", "color: var(--danger-color);");
			}
			else if ((atLeastRelaxed && monit.logTimesTotal < monit.requirements.min) || (!atLeastRelaxed && monit.logTimesTotal < monit.requirements.min)) {
				smiley.setAttribute("class", "icon-smiley-relax");
				smiley.setAttribute("style", "color: var(--warning-color);");
				progressPerc.setAttribute("style", "color: var(--warning-color);");
			}
			else if (monit.logTimesTotal < monit.requirements.achievement1) {
				smiley.setAttribute("class", "icon-smiley-happy-3");
				smiley.setAttribute("style", "color: var(--success-color);");
				progressPerc.setAttribute("style", "color: var(--success-color);");
			}
			else if (monit.logTimesTotal < monit.requirements.achievement2) {
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
			switch (monit.username) {
				case "fbes":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-canon");
					break;
				case "lde-la-h":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-cactus");
					break;
				case "jgalloni":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-bug-1");
					break;
				case "ieilat":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-pacman-ghost");
					break;
				case "pde-bakk":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-crown-1");
					break;
				case "pvan-dij":
					smiley.setAttribute("data-oclass", smiley.getAttribute("class"));
					smiley.setAttribute("class", "iconf-milk");
					break;
			}
			smiley.addEventListener("click", function() {
				if (!smiley.getAttribute("data-oclass")) {
					return;
				}
				const tempClass = smiley.getAttribute("class");
				smiley.setAttribute("class", smiley.getAttribute("data-oclass"));
				smiley.setAttribute("data-oclass", tempClass);
			});
			ltHolder.appendChild(smiley);
			ltHolder.appendChild(progressPerc);

			progressText.appendChild(ltHolder);

			progressNode.appendChild(progressText);

			monit.bhContainer.appendChild(progressNode);
			monit.bhContainer.className = monit.bhContainer.className.replace("hidden", "");
			monit.addTooltip();
		});
	},

	init: function() {
		this.dayOfWeek = new Date().getDay() - 1;
		if (this.dayOfWeek < 0) {
			this.dayOfWeek = 6;
		}
	}
};

improvedStorage.get("codam-monit").then(function(data) {
	if (data["codam-monit"] === true || data["codam-monit"] === "true") {
		if (!document.getElementById("monit-progress-old")) {
			monit.init();
			monit.getProgress();
		}
		else {
			document.getElementById("codam_intra_monit_system_display_deprecation_notice").className = "upgraded";
		}
	}
});
