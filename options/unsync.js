/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   unsync.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 00:06:47 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 00:06:47 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// these functions are run when signing out from Intranet at https://intra.42.fr

improvedStorage.remove("username").then(function() {
	iConsole.log("Signed out from Intra, so removed the username to synchronize with. Settings will be kept locally, until another person signs in.");
});
