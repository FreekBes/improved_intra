/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   storage.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/26 23:55:04 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/26 23:55:04 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/*
WARNING! THIS SCRIPT RUNS BOTH IN THE BACKGROUND AS A SERVICE WORKER AND
IN THE FOREGROUND AS A CONTENT SCRIPT, AS IT IS INTENDED AS A WRAPPER FOR STORAGE FUNCTION UTILITIES.
DO NOT USE ANY FUNCTIONS DEPENDENT ON MODULES OF EXTENSIONS THAT ONLY WORK IN ONE OF THOSE.

To start, there's three storages:
- a shared one, for generic usage
- a normal one, where user session storage can be stored
- an incognito one, where user session storage from the incognito browser can be stored
Each storage is separated by STORAGETYPE_ in front of the key originally used for the storage.
EXAMPLE: if one were to fetch something with the key "test"; use "SHARED_test", "NORMAL_test", "INCOGNITO_test" instead.

The reason behind this is because storage is actually always shared between normal and incognito mode...
Which is not useful in our case, where we often use storage to synchronize settings based on the user who's currently
signed in to intra.42.fr. This can of course differ between normal and incognito mode
as cookies (and thus sessions) are NOT shared between these modes!
*/

// helper function to prepare keys for storage use
function prepareStorageKeys(type, keys) {
	const internalKeys = Array.from(keys);
	for (let i = 0; i < keys.length; i++) {
		internalKeys[i] = type + "-" + keys[i];
	}
	return (internalKeys);
}

// helper function to prepare data for storage saving
function prepareStorageData(type, data) {
	const newData = {};
	const keys = Object.keys(data);
	const internalKeys = prepareStorageKeys(type, keys);

	for (let i = 0; i < keys.length; i++) {
		newData[internalKeys[i]] = data[keys[i]];
	}
	return (newData);
}

// helper function to sanitize storage returned data
function sanitizeStorageData(origKeys, internalKeys, data) {
	const newData = {};

	for (let i = 0; i < internalKeys.length; i++) {
		newData[origKeys[i]] = data[internalKeys[i]];
	}
	return (newData);
}

function ImprovedStorage(type) {
	this.type = type.toUpperCase();

	this.getType = function() {
		return (this.type.toLowerCase());
	};

	this.get = function(keys) {
		if (typeof keys == "string") {
			keys = [keys];
		}
		const internalKeys = prepareStorageKeys(this.type, keys);
		return new Promise(function(resolve) {
			chrome.storage.local.get(internalKeys, function(data) {
				resolve(sanitizeStorageData(keys, internalKeys, data));
			});
		});
	};

	this.getOne = async function(key) {
		const data = await this.get(key);
		return (data[key]);
	};

	this.set = function(data) {
		const internalData = prepareStorageData(this.type, data);
		return new Promise(function(resolve) {
			chrome.storage.local.set(internalData, resolve);
		});
	};

	this.remove = function(keys) {
		if (typeof keys == "string") {
			keys = [keys];
		}
		const internalKeys = prepareStorageKeys(this.type, keys);
		return new Promise(function(resolve) {
			chrome.storage.local.remove(internalKeys, resolve);
		});
	};

	this.getBytesInUse = function(keys) {
		if (typeof keys == "string") {
			keys = [keys];
		}
		const internalKeys = prepareStorageKeys(this.type, keys);
		return new Promise(function(resolve) {
			chrome.storage.local.getBytesInUse(internalKeys, resolve);
		});
	};
}

// do not use this function from any background script:
// chrome.extension.inIncognitoContext will always be false!
// background scripts never run in incognito context.
function getSessionStorage() {
	if (chrome.extension.inIncognitoContext) {
		return (incognitoStorage);
	}
	return (normalStorage);
}

// set up different kinds of storage
const sharedStorage = new ImprovedStorage("shared");
const normalStorage = new ImprovedStorage("normal");
const incognitoStorage = new ImprovedStorage("incognito");
