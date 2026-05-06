import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CDP_HOST = process.env.CDP_HOST || "http://127.0.0.1:9222";
const OUT_DIR = process.env.OUT_DIR || "temp/intra-v3";
const WAIT_MS = Number(process.env.WAIT_MS || 2500);
const MAX_LANDMARKS = Number(process.env.MAX_LANDMARKS || 800);
const MAX_BODY_TEXT_CHARS = Number(process.env.MAX_BODY_TEXT_CHARS || 20000);
const INCLUDE_FULL_BODY_TEXT = process.env.INCLUDE_FULL_BODY_TEXT === "1";
const WebSocketImpl = globalThis.WebSocket;

if (!WebSocketImpl || !globalThis.fetch) {
	throw new Error("This scraper requires Node.js 22+ with global fetch and WebSocket support.");
}

const routes = (process.argv.slice(2).length
	? process.argv.slice(2)
	: ["current"]);

class CdpClient {
	constructor(webSocketUrl) {
		this.webSocketUrl = webSocketUrl;
		this.nextId = 1;
		this.pending = new Map();
	}

	async connect() {
		this.ws = new WebSocketImpl(this.webSocketUrl);
		this.ws.addEventListener("message", event => {
			const message = JSON.parse(event.data);
			if (!message.id || !this.pending.has(message.id)) {
				return;
			}
			const { resolve, reject } = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) {
				reject(new Error(JSON.stringify(message.error)));
			}
			else {
				resolve(message.result);
			}
		});
		await new Promise((resolve, reject) => {
			this.ws.addEventListener("open", resolve, { once: true });
			this.ws.addEventListener("error", reject, { once: true });
		});
	}

	send(method, params = {}) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.ws.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const result = await this.send("Runtime.evaluate", {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(JSON.stringify(result.exceptionDetails));
		}
		return result.result.value;
	}

	close() {
		this.ws.close();
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function safeName(value) {
	return value
		.replace(/^https?:\/\//, "")
		.replace(/[^a-z0-9]+/gi, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase()
		.slice(0, 100) || "page";
}

async function getTargets() {
	return fetch(`${CDP_HOST}/json/list`).then(response => response.json());
}

async function getProfileV3Target() {
	const targets = await getTargets();
	const target = targets.find(item => item.type === "page" && item.url.includes("profile-v3.intra.42.fr"))
		|| targets.find(item => item.type === "page");
	if (!target) {
		throw new Error(`No Chrome page target found at ${CDP_HOST}`);
	}
	return target;
}

async function enableDomains(cdp) {
	await cdp.send("Runtime.enable");
	await cdp.send("Page.enable");
	await cdp.send("DOM.enable");
	await cdp.send("CSS.enable");
}

async function waitForSettledPage(cdp) {
	await cdp.evaluate(`new Promise(resolve => {
		if (document.readyState === "complete") resolve();
		else window.addEventListener("load", resolve, { once: true });
	})`);
	await sleep(WAIT_MS);
}

async function scrapePage(cdp, label, index) {
	await waitForSettledPage(cdp);

	const snapshot = await cdp.evaluate(`(() => {
			const maxLandmarks = ${JSON.stringify(MAX_LANDMARKS)};
			const maxBodyTextChars = ${JSON.stringify(MAX_BODY_TEXT_CHARS)};
			const includeFullBodyText = ${JSON.stringify(INCLUDE_FULL_BODY_TEXT)};
			const trim = value => (value || "").replace(/\\s+/g, " ").trim();
			const visibleText = element => trim(element.innerText || element.textContent || "").slice(0, 240);
		const rectFor = element => {
			const rect = element.getBoundingClientRect();
			return {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height)
			};
		};
		const selectorFor = element => {
			if (element.id) return "#" + CSS.escape(element.id);
			const classes = [...element.classList].slice(0, 4).map(className => "." + CSS.escape(className)).join("");
			return element.tagName.toLowerCase() + classes;
		};
			const landmarkElements = [...document.querySelectorAll("header, nav, main, aside, footer, section, article, [role], [aria-label], [data-testid], [data-test], [class], [id]")];
			const bodyText = document.body.innerText || "";
		return {
			capturedAt: new Date().toISOString(),
			url: location.href,
			title: document.title,
			viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
			assets: {
				scripts: [...document.scripts].map(script => script.src).filter(Boolean),
				stylesheets: [...document.querySelectorAll("link[rel='stylesheet']")].map(link => link.href).filter(Boolean)
			},
			links: [...document.links].map(anchor => ({
				text: visibleText(anchor),
				href: anchor.href,
				selector: selectorFor(anchor),
				rect: rectFor(anchor)
			})),
			landmarkCount: landmarkElements.length,
			landmarks: landmarkElements.slice(0, maxLandmarks).map(element => ({
				tag: element.tagName.toLowerCase(),
				id: element.id || "",
				className: element.className || "",
				role: element.getAttribute("role") || "",
				ariaLabel: element.getAttribute("aria-label") || "",
				dataTestid: element.getAttribute("data-testid") || "",
				dataTest: element.getAttribute("data-test") || "",
				selector: selectorFor(element),
				text: visibleText(element),
				rect: rectFor(element)
			})).filter(item => item.rect.width || item.rect.height || item.text),
			bodyText: includeFullBodyText ? bodyText : bodyText.slice(0, maxBodyTextChars),
			bodyTextTruncated: !includeFullBodyText && bodyText.length > maxBodyTextChars
		};
	})()`);

	const html = await cdp.evaluate("document.documentElement.outerHTML");
	const screenshot = await cdp.send("Page.captureScreenshot", {
		format: "png",
		captureBeyondViewport: true,
		fromSurface: true
	});

	const name = `${String(index).padStart(2, "0")}-${safeName(label === "current" ? snapshot.url : label)}`;
	await writeFile(join(OUT_DIR, `${name}.html`), html);
	await writeFile(join(OUT_DIR, `${name}.json`), JSON.stringify(snapshot, null, "\t"));
	await writeFile(join(OUT_DIR, `${name}.png`), Buffer.from(screenshot.data, "base64"));
	console.log(`${name}: ${snapshot.title} ${snapshot.url}`);
}

await mkdir(OUT_DIR, { recursive: true });

const target = await getProfileV3Target();
const cdp = new CdpClient(target.webSocketDebuggerUrl);
await cdp.connect();
await enableDomains(cdp);

try {
	const startUrl = await cdp.evaluate("location.href");
	for (const [index, route] of routes.entries()) {
		const label = route.startsWith("label:") ? route.slice("label:".length) : route;
		if (route !== "current" && !route.startsWith("label:")) {
			const nextUrl = route.startsWith("http")
				? route
				: new URL(route, startUrl).toString();
			await cdp.send("Page.navigate", { url: nextUrl });
		}
		await scrapePage(cdp, label, index);
	}
}
finally {
	cdp.close();
}
