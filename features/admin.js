/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   admin.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/22 22:12:54 by fbes          #+#    #+#                 */
/*   Updated: 2022/03/22 22:12:54 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/*
This file is added to the admin.intra.42.fr/tags page to add a page for managing
custom user banners from Improved Intra (which can be done on a separate website)
*/

window.addEventListener("load", function(event) {
	const improvedIntraPageLink = document.createElement("a");
	improvedIntraPageLink.setAttribute("href", "https://darkintra.freekb.es/imagery.php");
	improvedIntraPageLink.setAttribute("target", "_self");
	improvedIntraPageLink.setAttribute("class", "sidebar-item-link");

	const icon = document.createElement("span");
	icon.setAttribute("class", "icon-setting-wrenches sidebar-icon");
	improvedIntraPageLink.appendChild(icon);

	const text = document.createTextNode(" Improved Intra banners");
	improvedIntraPageLink.appendChild(text);

	const sidebarMenuList = document.querySelector(".sidebar-menu-list");
	const sidebarItemLinkPatronages = document.querySelector(".sidebar-menu-list .sidebar-item-link[href=\'/patronages\']");
	if (sidebarItemLinkPatronages) {
		sidebarMenuList.insertBefore(improvedIntraPageLink, sidebarItemLinkPatronages);
	}
	else {
		sidebarMenuList.appendChild(improvedIntraPageLink);
	}
});
