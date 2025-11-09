const MenuLink = {
	injectObserverNow() {
		const topbar = NavV3.topNavbar || NavV3.findTopNavbar();
		if (!topbar) {
			iConsole.warn("[Improved Intra] topbar still missing, skip for now");
			return;
		}
		console.log("[Improved Intra] Link injected in the menu", topbar);
		const button = topbar.querySelectorAll("button")[1];

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === "attributes"
					&& mutation.attributeName === "aria-expanded"
					&& mutation.target.getAttribute("aria-expanded") === "true") {
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
					iConsole.log("Menu opened, injecting link", Utils.getThemeColor());
				}
			}
		});
		observer.observe(button, { attributes: true, attributeFilter: ["data-state", "aria-expanded"] });
	},

	async injectMenuObserver() {
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
