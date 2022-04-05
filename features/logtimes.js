/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   logtimes.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/04/05 22:04:27 by fbes          #+#    #+#                 */
/*   Updated: 2022/04/05 22:04:27 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function codamMonitHelper(settings, logTime) {
	if (settings["codam-monit"] === true || settings["codam-monit"] === "true") {
		return (" / " + Math.floor(logTime / monit.requirements.min * 100) + "%");
	}
	return ("");
}

function waitForLogTimesChartToLoad(ltSvg) {
	const ltDays = ltSvg.getElementsByTagName("g");
	if (ltDays.length < 1) {
		// logtimes chart hasn't finished loading yet, try again in 100ms
		setTimeout(function() {
			waitForLogTimesChartToLoad(ltSvg);
		}, 100);
		return false;
	}

	// fix first month sometimes outside container
	let viewBox = ltSvg.getAttribute("viewBox");
	if (viewBox) {
		viewBox = viewBox.split(" ").map(function(item) {
			return parseInt(item);
		});
		console.log(viewBox);
		if (viewBox[0] > 0) {
			viewBox[0] = 0;
			ltSvg.setAttribute("viewBox", viewBox.join(" "));
		}
	}

	improvedStorage.get(["logsum-month", "logsum-week", "codam-monit"]).then(function(settings) {
		let ltDay = ltDays[ltDays.length - 1];
		let daysInWeek = dayOfWeek + 1;
		const remainingWeeks = Math.floor(ltDays.length / 7) + (dayOfWeek != 6 ? 1 : 0);
		let r = 0;
		const logTimes = [];
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
					return true;
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
					return true;
				}
				ltDay.setAttribute("data-original-title", ltDay.getAttribute("data-original-title") + " (week's cumulative: " + logTimeToString(tempLogTimes[daysInWeek - 1 - j]) + codamMonitHelper(settings, tempLogTimes[daysInWeek - 1 - j]) + ")");
			}
		}
	});
}

if (window.location.pathname == "/" || window.location.pathname.indexOf("/users/") == 0) {
	const ltSvg = document.getElementById("user-locations");
	if (ltSvg) { // check if logtimes chart is on page
		improvedStorage.get(["logsum-month", "logsum-week"]).then(function(data) {
			if (data["logsum-month"] === true || data["logsum-month"] === "true" || data["logsum-week"] === true || data["logsum-week"] === "true") {
				waitForLogTimesChartToLoad(ltSvg);
			}
		});
	}
}
