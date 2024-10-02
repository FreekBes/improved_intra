let isIntraV3 = false;

// detect Intra v3
const rootElem = document.getElementById("root");
if (rootElem && rootElem.parentElement.nodeName === "BODY") {
	isIntraV3 = true;
	iConsole.warn("Detected Intra v3, which is not compatible with Improved Intra. Please consider switching back to Intra v2 for the best experience: https://profile.intra.42.fr/v3_early_access");

	const warningElement = document.createElement("div");
	warningElement.id = "improved-intra-v3-incompatibility-warning";

	const warningTextPart1 = document.createElement("span");
	warningTextPart1.innerText = "Improved Intra is not compatible with Intra v3 and probably never will be. We recommend ";
	warningElement.appendChild(warningTextPart1);

	const switchBackLink = document.createElement("a");
	switchBackLink.href = "https://profile.intra.42.fr/v3_early_access";
	switchBackLink.innerText = "switching back to Intra v2";
	warningElement.appendChild(switchBackLink);

	const warningTextPart2 = document.createElement("span");
	warningTextPart2.innerText = " for a better experience.";
	warningElement.appendChild(warningTextPart2);

	const closeButton = document.createElement("button");
	closeButton.id = "improved-intra-v3-incompatibility-warning-close";
	closeButton.innerText = "✕";
	closeButton.style.float = "right";
	closeButton.style.padding = "0px 6px";
	closeButton.onclick = function() {
		warningElement.remove();
	};
	warningElement.appendChild(closeButton);

	document.body.insertBefore(warningElement, rootElem);
}
