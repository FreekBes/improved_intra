/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monit.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/11 19:23:05 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 02:22:54 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function sum(prevVal, curVal) {
	return (prevVal + curVal);
}

var monit = {
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
			return (document.querySelector(".login[data-login]").getAttribute("data-login"));
		}
		catch (err) {
			return (null);
		}
	},

	/**
	 * Get the dates of this week's days
	 */
	getWeekDates: function() {
		var thisWeek = [];
		var timestamp = new Date().getTime();
		for (var i = 0; i <= monit.dayOfWeek; i++) {
			thisWeek.push(new Date(timestamp - 86400000 * i).toISOString().split("T")[0]);
		}
		console.log("This week's dates: ", thisWeek);
		return (thisWeek);
	},

	/**
	 * Get the expectations for this week, based on the minutes the user has currently
	 * and how many days are left. The required minutes left are expected to be spread
	 * out, equally divided over all remaining days.
	 */
	setExpected: function() {
		var logTimesNoToday = this.logTimes.slice(1);
		var logTimesTotalNoToday;

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
		console.log("Logtime up until today", logTimesTotalNoToday);
		console.log("Expected minutes today", this.requirements.today - logTimesTotalNoToday);
		console.log("Expected minutes after today", this.requirements.today);
	},

	/**
	 * Parse a piece of logtime text: in format HHhMM or HH:MM(:SS)
	 */
	parseLogTime: function(logTimeText) {
		var logTime = 0;
		var logTimeSplit;

		if (logTimeText.indexOf("h") > -1) {
			logTimeSplit = logTimeText.split("h");
		}
		else {
			logTimeSplit = logTimeText.split(":");
		}
		if (logTimeSplit.length < 2) {
			return (0);
		}
		logTime += parseInt(logTimeSplit[0]) * 60;
		logTime += parseInt(logTimeSplit[1]);
		return (logTime);
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
					var stats = JSON.parse(this.responseText);
					var weekDates = monit.getWeekDates();
					monit.logTimes = [];
					for (var i = 0; i < weekDates.length; i++) {
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
			var ltSvg = document.getElementById("user-locations");
			if (!ltSvg) {
				reject("Element #user-locations not found");
			}
			var ltDays = ltSvg.getElementsByTagName("g");
			var ltDay = ltDays[ltDays.length - 1];
			var i, j;

			monit.logTimes = [];
			for (i = 0; i <= monit.dayOfWeek; i++) {
				ltDay = ltDays[ltDays.length - i - 1];
				if (!ltDay) {
					reject("Not enough days in logtimes overview SVG");
				}
				monit.logTimes.push(monit.parseLogTime(ltDay.getAttribute("data-original-title")));
			}
			if (monit.logTimes && monit.logTimes.length > 0) {
				monit.logTimesTotal = monit.logTimes.reduce(sum);
			}
			else {
				monit.logTimesTotal = 0;
			}

			var daysInWeek = monit.dayOfWeek + 1;
			var remainingWeeks = Math.floor(ltDays.length / 7) + (monit.dayOfWeek != 6 ? 1 : 0);
			var r = 0;
			var tempLogTimes;
			for (i = 0; i < remainingWeeks; i++) {
				if (i == 1) {
					daysInWeek = 7;
				}
				tempLogTimes = [];

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
			var iconLocation = document.getElementsByClassName("icon-location");
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
		this.username = this.getUserName();
		for (var i = 0; i < this.bhContainer.children.length; i++) {
			this.bhContainer.children[i].style.display = "none";
		}
		this.getLogTimes()
			.then(this.writeProgress)
			.catch(function(err) {
				console.warn("Could not read logtimes chart:", err);
				monit.getLogTimesWeb(monit.username).then(monit.writeProgress)
					.catch(function(err) {
						console.error("Could not retrieve logtimes from the web", err);
					});
			});
	},

	addTooltip: function() {
		// add bootstrap tooltip to holder
		var evt = new CustomEvent("add-tooltip", { detail: "#lt-holder" });
		document.dispatchEvent(evt);
	},

	/**
	 * Write the progress data to the Black Hole box
	 */
	writeProgress: function() {
		monit.setExpected();
		console.log("Logtimes", monit.logTimes);
		console.log("Total minutes", monit.logTimesTotal);

		var progressNode = document.createElement("div");
		progressNode.setAttribute("id", "monit-progress");

		var progressTitle = document.createElement("div");
		progressTitle.setAttribute("class", "mb-1");
		progressTitle.innerHTML = '<span class="coalition-span" style="color: '+monit.getCoalitionColor()+';">Monitoring System progress</span>';
		progressNode.appendChild(progressTitle);

		var progressText = document.createElement("div");
		progressText.setAttribute("id", "monit-progress-text");

		var emoteHolder = document.createElement("div");
		emoteHolder.setAttribute("id", "lt-holder");
		emoteHolder.setAttribute("class", "emote-lt");
		emoteHolder.setAttribute("data-toggle", "tooltip");
		emoteHolder.setAttribute("data-original-title", "Logtime this week: " + monit.logTimeToString(monit.logTimesTotal));
		emoteHolder.setAttribute("title", "");

		var smiley = document.createElement("span");
		smiley.setAttribute("id", "lt-emote");
		var progressPerc = document.createElement("span");
		progressPerc.innerHTML = Math.floor(monit.logTimesTotal / 1440 * 100) + "% complete";
		if (monit.logTimesTotal < monit.requirements.today) {
			smiley.setAttribute("class", "icon-smiley-sad-1");
			smiley.setAttribute("style", "color: rgb(238, 97, 115);");
			progressPerc.setAttribute("style", "color: rgb(238, 97, 115);");
		}
		else if (monit.logTimesTotal < monit.requirements.min) {
			smiley.setAttribute("class", "icon-smiley-relax");
			smiley.setAttribute("style", "color: rgb(223, 149, 57);");
			progressPerc.setAttribute("style", "color: rgb(223, 149, 57);");
		}
		else if (monit.logTimesTotal < monit.requirements.achievement1) {
			smiley.setAttribute("class", "icon-smiley-happy-3");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		else if (monit.logTimesTotal < monit.requirements.achievement2) {
			smiley.setAttribute("class", "icon-smiley-happy-5");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
		}
		else {
			smiley.setAttribute("class", "icon-smiley-surprise");
			smiley.setAttribute("style", "color: rgb(83, 210, 122);");
			progressPerc.setAttribute("style", "color: rgb(83, 210, 122);");
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
		}
		smiley.addEventListener("click", function() {
			if (!smiley.getAttribute("data-oclass")) {
				return;
			}
			var tempClass = smiley.getAttribute("class");
			smiley.setAttribute("class", smiley.getAttribute("data-oclass"));
			smiley.setAttribute("data-oclass", tempClass);
		});
		emoteHolder.appendChild(smiley);
		emoteHolder.appendChild(progressPerc);

		progressText.appendChild(emoteHolder);

		progressNode.appendChild(progressText);

		monit.bhContainer.appendChild(progressNode);
		monit.bhContainer.className = monit.bhContainer.className.replace("hidden", "");
		monit.addTooltip();
	},

	init: function() {
		this.dayOfWeek = new Date().getDay() - 1;
		if (this.dayOfWeek < 0) {
			this.dayOfWeek = 6;
		}
	}
};

chrome.storage.local.get("codam-monit", function(data) {
	if (data["codam-monit"] === true || data["codam-monit"] === "true") {
		monit.init();
		var s = document.createElement('script');
		s.src = chrome.runtime.getURL('campus_specifics/codam/inject.js');
		(document.head || document.documentElement).appendChild(s);
		s.onload = function() {
			setTimeout(function() {
				monit.getProgress();
			}, 250);
		};
	}
});