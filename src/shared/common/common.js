const Common = {

	/**
	 * Enable the Haha Easter Egg (random rotation of elements on the page)
	 * This will apply a random rotation to all elements on the page and any future elements added
	 * @returns {void}
	 */
	enableHahaEasterEgg: () => {
		const applyEasterEggToElement = function(element) {
			element.classList.add("funnyhaha");
			element.style.animationDuration = Utils.randomIntFromInterval(0.1, 10) + "s";
			element.style.animationDelay = Utils.randomIntFromInterval(0, 10) + "s";
		}

		// Apply the easter egg to all elements currently on the page
		const elements = document.querySelectorAll("*");
		for (let i = 0; i < elements.length; i++) {
			applyEasterEggToElement(elements[i]);
		}

		// Apply the easter egg to any future elements added to the page using a MutationObserver
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							applyEasterEggToElement(node);
						}
					});
				}
			});
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}
};
