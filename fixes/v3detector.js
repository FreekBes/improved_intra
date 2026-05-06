let isIntraV3 = false;

// detect Intra v3
const rootElem = document.getElementById("root");
if (rootElem && rootElem.parentElement.nodeName === "BODY") {
	isIntraV3 = true;
	iConsole.log("Detected Intra v3");
}
