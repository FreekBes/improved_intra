/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   menu-link.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ando-sou <ando-sou@student.42porto.com>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/08 02:46:54 by ando-sou          #+#    #+#             */
/*   Updated: 2025/11/09 22:00:46 by ando-sou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @module MenuLink
 * @description
 * This module handles injecting a custom "Improved Intra Settings" link
 * into the v3 intranet's user profile dropdown menu.
 *
 * It works in two steps:
 * 1. `injectMenuObserver`: Waits for the navigation to be ready.
 * 2. `injectObserverNow`: Attaches a `MutationObserver` to the menu button
 * to inject the link only when the user opens the menu.
 */
const MenuLink = {
	/**
	 * @method createLink
	 * @description
	 * Creates and inserts a new menu item linking to the
	 * “Improved Intra Settings” page. The item is cloned
	 * from an existing element to preserve visual consistency.
	 *
	 * Adds hover/focus simulation to match Radix UI behavior.
	 * The new item is inserted before the 4th menu entry.
	 *
	 * @returns {void}
	 */
	createLink() {
		const popup = document.querySelectorAll("div[data-radix-popper-content-wrapper]")[0].children[0];
		const htmlLi = popup.children[2].cloneNode(true);

		htmlLi.querySelector("a").href = "https://iintra.freekb.es/v2/options";
		htmlLi.querySelector("a").textContent = "Improved Intra Settings";

		htmlLi.addEventListener("mouseenter", () => {
			htmlLi.setAttribute("tabindex", "0");
			htmlLi.setAttribute("data-highlighted", "");
		});
		htmlLi.addEventListener("mouseleave", () => {
			htmlLi.setAttribute("tabindex", "-1");
			htmlLi.removeAttribute("data-highlighted");
		});

		popup.insertBefore(htmlLi, popup.children[3]);
	},
	/**
	 * @method injectObserverNow
	 * @description
	 * Initializes a MutationObserver on the user profile button.
	 * When the menu expands (aria-expanded=true), triggers the
	 * injection of the custom “Improved Intra Settings” item.
	 *
	 * @returns {void}
	 */
	injectObserverNow() {
		const topbar = NavV3.topNavbar || NavV3.findTopNavbar();
		if (!topbar) {
			iConsole.warn("Topbar still missing, skipping Improved Intra settings link injection for now");
			return;
		}

		iConsole.log("Improved Intra settings link injected in the user menu", topbar);
		const button = topbar.querySelectorAll("button")[1];

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded"
					&& mutation.target.getAttribute("aria-expanded") === "true") {
					this.createLink();
				}
			}
		});

		observer.observe(button, { attributes: true, attributeFilter: ["data-state", "aria-expanded"] });
	},

	/**
	 * @method injectMenuObserver
	 * @description
	 * Entry point of the module. Ensures that the navigation
	 * elements (NavV3) are ready before starting the injection logic.
	 *
	 * If the navigation is already available, triggers
	 * {@link MenuLink.injectObserverNow} immediately.
	 *
	 * @returns {void}
	 */
	injectMenuObserver() {
		if (NavV3.topNavbar && NavV3.leftNavbar) {
			return MenuLink.injectObserverNow();
		}

		const once = () => {
			document.removeEventListener("iintra:nav-ready", once);
			MenuLink.injectObserverNow();
		};

		document.addEventListener("iintra:nav-ready", once);
	}
}
