/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   inject.js                                          :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/11/28 03:06:01 by fbes          #+#    #+#                 */
/*   Updated: 2023/01/11 15:49:30 by fbes          ########   odam.nl         */
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

document.addEventListener("add-tooltip", function(ev) {
	addToolTip(ev.detail);
});


function applyHardcodedGraphShit(projects, cursus_id) {
	console.log("%c[Improved Intra %cinject.js]%c Fetching hardcoded Holy Graph shit", "color: #00babc;", "color: #02807c;", "");
	const projectsString = JSON.stringify(projects);
	const actualCode = `
		(function() {
			try {
				let projects = ` + projectsString + `;
				const cursus_id = ` + cursus_id + `;
				projects = window.Graph.hack.add_hack_info(projects, cursus_id);
				console.log("%c[Improved Intra %cinject.js]%c Sending hardcoded graph data to Galaxy Graph...", "color: #00babc;", "color: #02807c;", "");
				const evt = new CustomEvent("hardcoded-holy-graph-shit-ret", { detail: { projects, cursus_id }});
				window.dispatchEvent(evt);
			}
			catch (e) {
				console.warn("%c[Improved Intra %cinject.js]%c Failed to load hardcoded Holy Graph shit", "color: #00babc;", "color: #02807c;", "");
				console.error(e);
				const evt = new CustomEvent("hardcoded-holy-graph-shit-err", { detail: { error: e }});
				window.dispatchEvent(evt);
			}
		})();
	`;
	const script = document.createElement('script');
	script.appendChild(document.createTextNode(actualCode));
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

document.addEventListener("apply-holy-graph-hardcoded-shit", function(ev) {
	applyHardcodedGraphShit(ev.detail.projects, ev.detail.cursus_id);
});
