/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   useful.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 17:03:38 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/28 17:55:38 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// get the coalition color of a user or coalition on a webpage
function getCoalitionColor() {
	try {
		return (document.getElementsByClassName("coalition-span")[0].style.color);
	}
	catch (err) {
		return ("#FF0000");
	}
}

// get the name of the campus a user is part of (only on profile pages)
function getCampus() {
	try {
		const iconLocation = document.getElementsByClassName("icon-location");
		return (iconLocation[0].nextSibling.nextSibling.textContent);
	}
	catch (err) {
		return (null);
	}
}

// convert hex color to rgb color object
// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
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
}

// set the color of an element to the coalition color using an event
function setCoalitionTextColor(event) {
	event.target.style.color = getCoalitionColor();
}

// unset the color of an element using an event
function unsetCoalitionTextColor(event) {
	event.target.style.color = null;
}

// returns true if the current webpage has a profile banner
function hasProfileBanner() {
	return (window.location.pathname.indexOf("/users/") == 0 || (window.location.hostname == "profile.intra.42.fr" && window.location.pathname == "/"));
}

// return a random integer between a min and a max, min and max included
function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// apply a CSS style to an element or its parent, if it exists
function setStyleIfExists(query, style, value, parentPlease) {
	let elem = document.querySelector(query);
	if (elem) {
		if (parentPlease) {
			elem = elem.parentNode;
		}
		elem.style[style] = value;
		return (true);
	}
	return (false);
}
