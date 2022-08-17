/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   admin.js                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/22 22:12:54 by fbes          #+#    #+#                 */
/*   Updated: 2022/08/17 15:42:52 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

/*
This file is added to the admin.intra.42.fr/tags page to add a page for managing
custom user banners from Improved Intra (which can be done on a separate website)

Also for some additional features and fixes on admin pages
*/

window.addEventListener("load", function(event) {
	const improvedIntraPageLink = document.createElement("a");
	improvedIntraPageLink.setAttribute("href", "https://iintra.freekb.es/imagery.php");
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

	const examIPRangeField = document.getElementById("exam_ip_range");
	if (examIPRangeField) {
		examIPRangeField.setAttribute("placeholder", "0.0.0.0/16,0.0.0.0/24,0.0.0.0/32,...");
	}
});
