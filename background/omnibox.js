/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   omnibox.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/06/12 22:26:37 by fbes          #+#    #+#                 */
/*   Updated: 2022/06/12 22:26:37 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const omniSuggestions = {
	browser: [],
	urls: [],
	clear: function(text) {
		omniSuggestions.browser.splice(0, omniSuggestions.browser.length);
		omniSuggestions.urls.splice(0, omniSuggestions.urls.length);
		if (text && false) { // never run, chrome.omnibox.setDefaultSuggestion takes care of this for now
			omniSuggestions.browser.push({
				content: text,
				description: "Search Intra for " + text
			});
			omniSuggestions.urls.push("https://profile.intra.42.fr/searches/search?query=" + encodeURIComponent(text));
		}
	},
	add: function(item, url) {
		omniSuggestions.browser.push(item);
		omniSuggestions.urls.push(url);
	}
};

// helper function for xml styling in omnibox suggestions
function addWordIndex(str, wrd, pos) {
	return [str.slice(0, pos), wrd, str.slice(pos)].join("");
}

// used for aborting requests
let controller = null;

// omnibox default search, not on firefox.
// firefox is buggy with this function,
// not supporting %s and when set in the onInputChanged event
// with the "text" parameter from that function,
// it won't include the last letter from the "text" string.
// kinda weird. just don't include it then.
if (navigator.userAgent.indexOf("Firefox") == -1) {
	chrome.omnibox.setDefaultSuggestion({
		description: "Search Intra for %s"
	});
}

// omnibox search suggestions. suggest parameter should be a function.
// first, we abort any currently ongoing request to Intra's API, useful for people who
// type very quickly (the API call takes a while and it would clog up otherwise).
// we store all results from the search predict in the global omniSuggestions object,
// for future use (retrieving the URL from the chosen prediction).
// we add all the suggestions to the object and let the browser know this list is ready.
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	text = text.trim();
	if (typeof suggest == "function") {
		if (controller) {
			controller.abort();
		}
		fetchPredictions(text).then(function(res) {
			omniSuggestions.clear(text);
			if (res.length > 0) {
				const url = "https://profile.intra.42.fr/users/";
				for (let i = 0; i < res.length; i++) {
					omniSuggestions.add({
						content: "u " + res[i]["login"],
						description: "View Intra profile of " + res[i]["login"],
					}, url + res[i]["login"]);
				}
			}
		})
		.catch(function(err) {
			omniSuggestions.clear(text);
			// do nothing else. error happens frequently: i.e. when not signed in to Intra
		})
		.finally(function() {
			suggest(omniSuggestions.browser);
		});
	}
});

// this is the function that's run when the user has chosen one of the extension's
// search suggestions. it first checks if it was any of the suggestions from
// onInputChanged event's function above, if it was we get the url from there.
// in case not, we create a new search on Intra with the query given to us in the address bar.
// based on the disposition, we create a new browser tab for this. if none has
// been given (currentTab), we update the current one.
chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
	text = text.trim();
	let url = "https://profile.intra.42.fr/";
	const sugIndex = omniSuggestions.browser.findIndex(function(obj) {
		console.log(obj);
		return (obj.content == text);
	});
	console.log(sugIndex);
	if (sugIndex > -1) {
		url = omniSuggestions.urls[sugIndex];
	}
	else if ((text != null && text != undefined) && text != "") {
		if (text.indexOf("u ") == 0) { // if query starts with "u ", user probably wanted to quickly open one's profile
			url += "users/" + text.split(" ")[1];
		}
		else { // else, open a search page on Intra
			url += "searches/search?query=" + encodeURIComponent(text);
		}
	}

	if (disposition == "currentTab") {
		chrome.tabs.update(null, {url: url});
	}
	else {
		chrome.tabs.create({
			url: url,
			active: (disposition == "newForegroundTab") // can also be newBackgroundTab, for which active should be false
		});
	}
});

function fetchPredictions(query) {
	return new Promise(function(resolve, reject) {
		controller = new AbortController();
		fetch("https://profile.intra.42.fr/searches/search.json?query=" + encodeURIComponent(query), { signal: controller.signal })
			.then(function(res) {
				res.json().then(resolve).catch(reject);
			})
			.catch(reject);
	});
}
