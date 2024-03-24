/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   sw.js                                              :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/26 23:58:26 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/26 23:58:26 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// This is a wrapper for the lack of multiple background scripts in Google's
// extension manifest V3. Just use a "service worker" and import all the
// neccessary background scripts here.
// Sadly it does need to be in the root folder of the extension.

try {
	importScripts(
		"src/utils/console.js",
		"src/background/omnibox.js"
	);
	iConsole.log("Improved Intra background scripts loaded.");
}
catch (err) {
	iConsole.error(err);
}
