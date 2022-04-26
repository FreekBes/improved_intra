/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   projects.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/02/14 10:19:10 by fbes          #+#    #+#                 */
/*   Updated: 2022/04/26 14:57:30 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

const mlxProjects = [
	"/projects/cub3d",
	"/cub3d",
	"/projects/minirt",
	"/minirt",
	"/projects/so_long",
	"/so_long",
	"/projects/42cursus-fdf",
	"/42cursus-fdf",
	"/projects/42cursus-fract-ol",
	"/42cursus-fract-ol"
];

function createExtraItem(icon, href, text, title) {
	const item = document.createElement("div");
	item.className = "project-attachment-item";

	const nameElem = document.createElement("h4");
	nameElem.className = "attachment-name";

	const iconElem = document.createElement("span");
	iconElem.className = (icon ? icon : "icon-file");
	iconElem.style.marginRight = "4px";
	iconElem.style.display = "inline-block";
	iconElem.style.verticalAlign = "top";
	nameElem.appendChild(iconElem);

	const linkElem = document.createElement("a");
	linkElem.setAttribute("href", href);
	linkElem.setAttribute("target", "_blank");
	linkElem.setAttribute("title", title + ". This link was added by the Improved Intra 42 extension.");
	linkElem.innerText = text;
	linkElem.style.whiteSpace = "initial";
	linkElem.style.display = "inline-block";
	linkElem.style.verticalAlign = "top";
	linkElem.style.width = "calc(100% - 18px)";
	nameElem.appendChild(linkElem);

	item.appendChild(nameElem);
	return (item);
}

function addMLX42Link() {
	let projectAttachments = document.querySelector(".project-attachment-item");
	if (!projectAttachments) {
		return;
	}
	projectAttachments = projectAttachments.parentNode;


}

function addProjectExtrasContainer() {
	const projectSummary = document.querySelector(".project-summary");
	if (!projectSummary) {
		return (null);
	}

	const projectExtras = document.createElement("div");
	projectExtras.className = "project-summary-item";

	const extrasList = document.createElement("div");
	extrasList.className = "project-attachments-list";

	projectExtras.appendChild(extrasList);
	projectSummary.insertBefore(projectExtras, projectSummary.lastElementChild);
	return (extrasList);
}

function addProjectExtras() {
	const extrasList = addProjectExtrasContainer();
	if (!extrasList) {
		return;
	}

	// add Find-peers link
	let projectNameIndex = 1;
	if (window.location.pathname.indexOf("/projects/") > -1) {
		projectNameIndex = 2;
	}
	const projectName = window.location.pathname.split("/")[projectNameIndex].replaceAll(' ', '-');
	extrasList.appendChild(createExtraItem("icon-user-search-1", "https://find-peers.joppekoers.nl/#" + projectName, "Find peers", "Find peers that are working on this project at your campus"));

	// add MLX42 link on project pages that use the MiniLibX library
	for (let i = 0; i < mlxProjects.length; i++) {
		if (window.location.pathname.indexOf(mlxProjects[i]) == 0) {
			extrasList.appendChild(createExtraItem("icon-folder-code", "https://github.com/codam-coding-college/MLX42", "MLX42 (2022, ask campus staff before using)", "Open-source OpenGL version of MLX by W2Wizard (lde-la-h)"));
			break;
		}
	}
}

function changeProjectAttachmentIcons() {
	const attachments = document.getElementsByClassName("attachment-name");

	for (let i = 0; i < attachments.length; i++) {
		const link = attachments[i].querySelector("a");
		const icon = attachments[i].querySelector("span[class*='icon']");

		// below code sucks but ¯\_(ツ)_/¯

		// subject (any file that is named subject.pdf)
		if (link.innerText == "subject.pdf") {
			icon.className = "icon-note-paper-2";
		}

		// any .tar.* file
		if (link.innerText.indexOf(".tar.") > -1) {
			icon.className = "icon-folder-zip";
		}

		// any .zip file
		if (link.innerText.indexOf(".zip") > -1) {
			icon.className = "icon-folder-zip";
		}

		// any .tgz file
		if (link.innerText.indexOf(".tgz") > -1) {
			icon.className = "icon-folder-zip";
		}

		// any .cpp file
		if (link.innerText.indexOf(".cpp") > -1) {
			icon.className = "icon-file-code";
		}

		// any .hpp file
		if (link.innerText.indexOf(".hpp") > -1) {
			icon.className = "icon-file-code";
		}

		// testers (any file with tester in name)
		if (link.innerText.indexOf("tester") > -1) {
			icon.className = "icon-shield-3";
		}

		// checker (any file with checker in name)
		if (link.innerText.indexOf("checker") > -1) {
			icon.className = "icon-shield-3";
		}
	}
}

changeProjectAttachmentIcons();
addProjectExtras();