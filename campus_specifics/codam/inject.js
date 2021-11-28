/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   inject.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 03:06:01 by fbes          #+#    #+#                 */
/*   Updated: 2021/11/28 03:06:01 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function addToolTip(query) {
	console.log("Adding tooltip to element", document.querySelector(query));
	var actualCode = '$("'+query+'").tooltip();';
	var script = document.createElement('script');
	script.appendChild(document.createTextNode(actualCode));
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

document.addEventListener("add-tooltip", function(event) {
	console.log(event);
	addToolTip(event.detail);
});