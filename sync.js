/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   sync.js                                            :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/27 20:53:51 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/27 20:53:51 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function getUserName() {
	try {
		return (document.querySelector(".login[data-login]").getAttribute("data-login"));
	}
	catch (err) {
		return (null);
	}
}

chrome.storage.local.set({"username": getUserName()}, function() {
	console.log("%c[Improved Intra]%c Intra username stored in local storage", "color: #00babc;", "");
});
