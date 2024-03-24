/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   console.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/27 14:57:20 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/27 14:57:20 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function ImprovedConsole() {
	for (let c in console) {
		if (typeof console[c] == 'function') {
			this[c] = console[c].bind(console, "%c[Improved Intra]%c", "color: #00babc;", "");
		}
	}

	// overwrite time functions, they do not support styling with %c
	this["time"] = console.time.bind(console, "[Improved Intra]");
	this["timeLog"] = console.timeLog.bind(console, "[Improved Intra]");
	this["timeEnd"] = console.timeEnd.bind(console, "[Improved Intra]");
}

const iConsole = new ImprovedConsole();
