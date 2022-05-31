/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   logtimes.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/04/05 22:04:27 by fbes          #+#    #+#                 */
/*   Updated: 2022/05/31 16:57:49 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function codamMonitHelper(settings, logTime) {
	if (profileFromCodam() && (settings["codam-monit"] === true || settings["codam-monit"] === "true")) {
		return (" / " + Math.floor(logTime / monit.requirements.min * 100) + "%");
	}
	return ("");
}

function mergeTimes(logtimes, buildingtimes) {
	const newtimes = new Array();
	for (const date in logtimes) {
		newtimes[date] = logtimes[date];
	}
	for (const date in buildingtimes) {
		if (newtimes[date] == undefined || parseLogTime(buildingtimes[date]) > parseLogTime(newtimes[date])) {
			newtimes[date] = buildingtimes[date];
		}
	}
	return (newtimes);
}

let cachedTimes = null;		// cache
function getBuildingTimes() {
	return new Promise(function(resolve, reject) {
		if (cachedTimes != null) {
			resolve(cachedTimes);
			return;
		}
		const httpReq = new XMLHttpRequest();
		httpReq.addEventListener("load", function() {
			try {
				const res = JSON.parse(this.responseText);
				if (res["data"]) {
					cachedTimes = res["data"];
					resolve(res["data"]);
				}
				else {
					reject("No data");
				}
			}
			catch (err) {
				reject(err);
			}
		});
		httpReq.addEventListener("error", function(err) {
			reject(err);
		});
		httpReq.open("GET","https://darkintra.freekb.es/buildingtimes.php?username=" + getProfileUserName());
		httpReq.send();
	});
}

function getLogTimes(settings) {
	return new Promise(function(resolve, reject) {
		const httpReq = new XMLHttpRequest();
		httpReq.addEventListener("load", function() {
			try {
				const stats = JSON.parse(this.responseText);
				if (settings["codam-monit"] === true || settings["codam-monit"] === "true") {
					getBuildingTimes()
						.then(function(bStats) {
							resolve(mergeTimes(stats, bStats));
						}).catch(function(err) {
							resolve(stats);
						});
				}
				else {
					resolve(stats);
				}
			}
			catch (err) {
				reject(err);
			}
		});
		httpReq.addEventListener("error", function(err) {
			reject(err);
		});
		httpReq.open("GET", window.location.origin + "/users/" + getProfileUserName() + "/locations_stats.json");
		httpReq.send();
	});
}

// month logtime has to be calculated from the web since some days may be missing from the logtimes chart
function sumMonthLogTime(ltMonths, settings) {
	ltMonths = Array.from(ltMonths).reverse();
	getLogTimes(settings)
		.then(function(stats) {
			const dates = Object.keys(stats);
			const monthNames = [];
			const monthSums = [];
			for (let i = 0; i < ltMonths.length; i++) {
				monthNames.push(ltMonths[i].textContent);
				monthSums.push(0);
			}
			for (const date of dates) {
				const jsDate = new Date(date);
				const mIndex = monthNames.indexOf(jsDate.toDateString().split(" ")[1]);
				if (mIndex > -1) {
					monthSums[mIndex] += parseLogTime(stats[date]);
				}
			}
			for (let i = 0; i < ltMonths.length; i++) {
				const oldX = parseInt(ltMonths[i].getAttribute("x"));
				ltMonths[i].textContent = ltMonths[i].textContent + " (" + logTimeToString(monthSums[i]) + ")";
				const newBbox = ltMonths[i].getBBox();
				// move element's x coordinate to the left to account for the width of the text added
				ltMonths[i].setAttribute("x", Math.round(oldX - newBbox.width * 0.5));
			}
		})
		.catch(function(err) {
			iConsole.error(err);
		});
}

function cumWeekLogTime(ltDays, settings) {
	let ltDay = ltDays[ltDays.length - 1];
	let daysInWeek = dayOfWeek + 1;
	const remainingWeeks = Math.floor(ltDays.length / 7) + (dayOfWeek != 6 ? 1 : 0);
	let r = 0;
	for (let i = 0; i < remainingWeeks; i++) {
		let j;

		if (i == 1) {
			daysInWeek = 7;
		}
		const tempLogTimes = [];

		// parse individual logtimes
		for (j = 0; j < daysInWeek; j++) {
			ltDay = ltDays[ltDays.length - r - 1];
			if (!ltDay) {
				return;
			}
			tempLogTimes.push(parseLogTime(ltDay.getAttribute("data-original-title")));
			if (tempLogTimes[j] == 0) {
				ltDay.setAttribute("data-nolog", "");
			}
			r++;
		}

		// calculate cumulative logtime
		for (j = daysInWeek - 2; j > -1; j--) {
			tempLogTimes[j] = tempLogTimes[j] + tempLogTimes[j + 1];
		}

		// add cumulative logtime to tooltips (and percentage if Codam Monit System enabled)
		for (j = daysInWeek - 1; j > -1; j--) {
			ltDay = ltDays[ltDays.length - r + j];
			if (!ltDay) {
				return;
			}
			ltDay.setAttribute("data-original-title", ltDay.getAttribute("data-original-title") + " (" + logTimeToString(tempLogTimes[daysInWeek - 1 - j]) + codamMonitHelper(settings, tempLogTimes[daysInWeek - 1 - j]) + ")");
		}
	}
}

function waitForLogTimesChartToLoad(ltSvg, settings) {
	const ltDays = ltSvg.getElementsByTagName("g");
	const ltMonths = ltSvg.querySelectorAll("svg > text");
	if (ltDays.length == 0 || ltMonths.length == 0) {
		// logtimes chart hasn't finished loading yet, try again in 100ms
		setTimeout(function() {
			waitForLogTimesChartToLoad(ltSvg, settings);
		}, 100);
		return false;
	}

	// fix first month sometimes outside container
	let viewBox = ltSvg.getAttribute("viewBox");
	if (viewBox) {
		const firstText = ltSvg.querySelector("text");
		viewBox = viewBox.split(" ").map(function(item) {
			return parseInt(item);
		});
		const monthsAmount = ltSvg.querySelectorAll("svg > text").length;
		const firstX = (firstText ? parseInt(firstText.getAttribute("x")) : 0);
		if (viewBox[0] > 0 && firstX < 150 && monthsAmount <= 4) {
			// Intra intents to shift months to the left when there's 5 months being displayed
			// however, the code that does that seems to contain some bugs, as sometimes it's also done when there's still only 4.
			// shift them back here, but only if the first month is displayed correctly (less than 150 pixels from the left side of the SVG)
			// and if there's 4 months being displayed instead of 5.
			iConsole.log("Logtimes chart viewBox seems off, first month might be hidden. Unhiding it by setting the first value to 0 (was "+viewBox[0]+", x="+firstX+").");
			viewBox[0] = 0;
			ltSvg.setAttribute("viewBox", viewBox.join(" "));
		}
	}

	// add date attribute to all days in svg
	// useful for Improved Intra but also other extensions!
	const days = ltSvg.getElementsByTagName("g");
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let month = 0;
	let date = 0;
	let year = 0;
	for (const day of days) {
		if (day.previousElementSibling.nodeName.toUpperCase() == "TEXT") {
			month = months.indexOf(day.previousElementSibling.textContent.substring(0, 3)) + 1;
			if (today.getMonth() == 0 && (month == 10 || month == 11 || month == 12)) {
				year = today.getFullYear() - 1;
			}
			else {
				year = today.getFullYear();
			}
			date = 1;
		}
		day.setAttribute("data-iidate", year.toString()+'-'+month.toString().padStart(2, '0')+'-'+date.toString().padStart(2, '0'));
		date++;
	}

	if (profileFromCodam() && settings["codam-buildingtimes-chart"]) {
		// Replace logtime chart data with buildingtime data
		getBuildingTimes()
			.then(function(stats) {
				for (const date in stats) {
					const day = ltSvg.querySelector("g[data-iidate=\""+date+"\"]");
					if (day) {
						const oldMinutes = parseLogTime(day.getAttribute("data-original-title"));
						const minutes = parseLogTime(stats[date]);
						if (minutes > oldMinutes) {
							day.setAttribute("data-original-title", logTimeToString(minutes)+'*');
							const filler = day.querySelector("rect");
							if (filler) {
								const newPerc = (minutes / 1440).toFixed(2);
								let sourceColor = "rgba(0,186,188,0)";
								const col24hex = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
								if (col24hex !== "") {
									let rgb = hexToRgb(col24hex.trim());
									sourceColor = "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0)";
								}
								filler.setAttribute("fill", sourceColor.replace(/[0-9](\.[0-9]*|)(\s|)\)/, newPerc.toString()+')'));
							}
						}
					}
				}
				if (ltSvg.previousElementSibling) {
					ltSvg.previousElementSibling.textContent = " Buildingtime* ";
				}
			})
			.catch(function(err) {
				iConsole.error(err);
			})
			.finally(function() {
				if (settings["logsum-month"]) {
					sumMonthLogTime(ltMonths, settings);
				}
				if (settings["logsum-week"]) {
					cumWeekLogTime(ltDays, settings);
				}
			});
	}
	else {
		// Codam Monitoring System progress not enabled, do not replace logtimes with building times
		if (settings["logsum-month"]) {
			sumMonthLogTime(ltMonths, settings);
		}
		if (settings["logsum-week"]) {
			cumWeekLogTime(ltDays, settings);
		}
	}
}

if (window.location.pathname == "/" || window.location.pathname.indexOf("/users/") == 0) {
	const ltSvg = document.getElementById("user-locations");
	if (ltSvg) { // check if logtimes chart is on page
		improvedStorage.get(["logsum-month", "logsum-week", "codam-monit", "codam-buildingtimes-chart"]).then(function(settings) {
			waitForLogTimesChartToLoad(ltSvg, settings);
		});
	}
}
