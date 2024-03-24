/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   inject.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 03:06:01 by fbes          #+#    #+#                 */
/*   Updated: 2022/02/07 20:47:22 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function addToolTip(query) {
	console.log("%c[Improved Intra %cinject.js]%c Adding tooltip to element " + query, "color: #00babc;", "color: #02807c;", "");
	const actualCode = '$("'+query+'").tooltip();';
	const script = document.createElement('script');
	script.appendChild(document.createTextNode(actualCode));
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

document.addEventListener("add-tooltip", function(event) {
	addToolTip(event.detail);
});
