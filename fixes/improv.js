/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   improv.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mde-maga <mde-maga@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/11/13 00:37:55 by fbes              #+#    #+#             */
/*   Updated: 2026/04/20 10:45:10 by mde-maga         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const pageUrl = getRawPageURL();

/**
 * A list of regexp based improvements. The `guard` results are piped into
 * the improvement handler. These guards, as implied, make sure code is only
 * executed once the `guard` is set and returns a value which evaluates to
 * "true".
 *
 * @type {[{handler(...any), guard?(): any}]}
 */
const improvementsPerUrl = [
	{ handler: setGeneralImprovements },
	{
		guard: () => window.location.hash === '#haha',
		handler: setEasterEgg,
	},
	{
		guard: () => new RegExp(
			"^projects\\.intra\\.42\\.fr\\/("
				+ "projects\\/(?<slug>[a-zA-Z0-9-_]+)\\/projects_users\\/(?<project_id>\\d+)?"
				+ "|[0-9]+\\/(?<login>[a-z0-9-_]+)"
				+ "|(?<slugmine>[a-zA-Z0-9-_]+)/mine"
			+ ")\\/?$").exec(pageUrl),
		handler: setPageProjectsUsersImprovements,
	},
	{
		guard: () => /^projects\.intra\.42\.fr\/users\/(?<login>[a-z0-9-_]+)\/feedbacks\/?$/.exec(pageUrl),
		handler: setPageUserFeedbacksImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/events\/(?<event_id>[0-9]+)\/feedbacks\/?$/.exec(pageUrl),
		handler: setPageProjectsUsersImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/users\/(?<login>[a-z0-9-_]+)\/?$/.exec(pageUrl),
		handler: setPageUserImprovements,
	},
	{
		guard: () => /^projects\.intra\.42\.fr\/projects\/graph\/?$/.exec(pageUrl),
		handler: setPageHolyGraphImprovements,
	},
	{
		guard: () => /^companies\.intra\.42\.fr\/(?<lang>[a-z]+)\/administrations\/(?<administration_id>[0-9]+)\/?$/.exec(pageUrl),
		handler: setInternshipAdministrationImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/slots\/?$/.exec(pageUrl),
		handler: setPageSlotsImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/?(users\/(?<login>[a-z0-9-_]+)|home\/?)?$/.exec(pageUrl),
		handler: setPageEvaluationsImprovements,
	},
	{
		guard: () => /^profile\.intra\.42\.fr\/v3_early_access\/?$/.exec(pageUrl),
		handler: setEarlyAccessImprovements,
	},
	{ handler: setOptionalImprovements },
];

// Execute our improvements per page. If we have a validator, we execute that and pipe the results into our
// improvement handler.
improvementsPerUrl.forEach(improvement => {
	if (improvement.guard) {
		const pipe = improvement.guard();
		if (pipe) improvement.handler(pipe);
	} else {
		improvement.handler();
	}
});

// communication between background.js and this script
let improvPort = chrome.runtime.connect({ name: portName });
improvPort.onDisconnect.addListener(function() {
	iConsole.log("Disconnected from service worker");
});
improvPort.onMessage.addListener(function(msg) {
	switch (msg["action"]) {
		case "pong":
			iConsole.log("pong");
			break;
		case "resynced":
		case "prefers-color-scheme-change":
		case "options-changed":
			iConsole.log("Settings changed. Enabling settings that can be enabled. Settings that must be disabled, will disable after a refresh.");
			checkThemeSetting();
			setOptionalImprovements();
			if (typeof setCustomProfile != "undefined") {
				setCustomProfile();
			}
			break;
		case "error":
			iConsole.error(msg["message"]);
			break;
	}
});

// reconnect every 4-5 minutes to keep service worker running in background
setInterval(function() {
	improvPort.disconnect();
	improvPort = chrome.runtime.connect({ name: portName });
}, 250000);


// widgets are draggable and customizable
const WIDGET_STORAGE_KEY = "improved-intra-widget-layout";
const WIDGET_ORDER_KEY = "improved-intra-widget-order";
const EDIT_MODE_KEY = "iil-layout-edit-mode";

const WIDGET_LABELS = ["Agenda", "Evaluations", "Logtime", "Expertises", "Projects", "Skills", "Last achievements"];

const INTRA_WIDGETS = [
    '[data-iil-widget="agenda"]',
    '[data-iil-widget="evaluations"]',
    '[data-iil-widget="logtime"]',
    '[data-iil-widget="expertises"]',
    '[data-iil-widget="projects"]',
    '[data-iil-widget="skills"]',
    '[data-iil-widget="last-achievements"]',
];

let editMode = false;
localStorage.setItem(EDIT_MODE_KEY, "0");
let dragged = null;
let lastSwapTarget = null;

function labelWidgets() {
    document.querySelectorAll('.container-fullsize > .row > .col-lg-4').forEach((col) => {
        const inner = col.firstElementChild;
        if (!inner) return;
        const heading = inner.querySelector('h2, h3, h4, .title')?.textContent?.trim()
            || inner.firstElementChild?.textContent?.trim().split('\n')[0].trim();
        const match = WIDGET_LABELS.find(label => heading?.startsWith(label));
        if (match) {
            col.setAttribute('data-iil-widget', match.toLowerCase().replace(' ', '-'));
        }
    });
}

function updateEvalPoints() {
    const evalTitle = document.querySelector('[data-iil-widget="evaluations"] h4.profile-title');
    if (!evalTitle) return;
    if (evalTitle.querySelector('.iil-eval-points')) return;

    const points = window._iilEvalPoints;
    if (!points) return;

    const badge = document.createElement('span');
    badge.className = 'iil-eval-points';
    badge.textContent = `${points} points`;
    evalTitle.insertBefore(badge, evalTitle.querySelector('.simple-link'));
}
updateEvalPoints();

function getSavedWidgets() {
    try {
        return JSON.parse(localStorage.getItem(WIDGET_STORAGE_KEY) || "[]");
    } catch (e) {
        return [];
    }
}

function saveHiddenWidgets(hiddenWidgets) {
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(hiddenWidgets));
}

function getWidgetOrder() {
    try {
        return JSON.parse(localStorage.getItem(WIDGET_ORDER_KEY) || "[]");
    } catch (e) {
        return [];
    }
}

function saveWidgetOrder(order) {
    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(order));
}

function hideWidget(selector) {
    const hidden = getSavedWidgets();
    if (!hidden.includes(selector)) hidden.push(selector);
    saveHiddenWidgets(hidden);
    const widget = document.querySelector(selector);
    if (widget) widget.classList.add("widget-hidden");
    updateHiddenPills();
}

function showWidget(selector) {
    const hidden = getSavedWidgets().filter(s => s !== selector);
    saveHiddenWidgets(hidden);
    const widget = document.querySelector(selector);
    if (widget) widget.classList.remove("widget-hidden");
    updateHiddenPills();
}

function applyHiddenWidgets() {
    const hiddenWidgets = getSavedWidgets();
    INTRA_WIDGETS.forEach((selector) => {
        const widget = document.querySelector(selector);
        if (!widget) return;
        widget.classList.toggle("widget-hidden", hiddenWidgets.includes(selector));
    });
}

function applySavedWidgetOrder() {
    const container = document.querySelector('.container-fullsize > .row');
    if (!container) return;

    const order = getWidgetOrder();
    if (!order.length) return;

    order.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) container.appendChild(el);
    });
}

function getWidgetLabel(selector) {
    const widget = document.querySelector(selector);
    if (!widget) return selector;
    const heading = widget.querySelector('h2, h3, h4, .title')?.textContent?.trim().split('\n')[0].trim();
    return heading || selector;
}

function updateHiddenPills() {
    const pillsContainer = document.getElementById("iil-hidden-pills");
    if (!pillsContainer) return;

    const hidden = getSavedWidgets();
    pillsContainer.innerHTML = "";

    if (hidden.length === 0) {
        pillsContainer.style.display = "none";
        return;
    }

    pillsContainer.style.display = "flex";
    hidden.forEach((selector) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "iil-hidden-pill";
        pill.innerHTML = `<span>+ ${getWidgetLabel(selector)}</span>`;
        pill.title = "Click to restore";
        pill.addEventListener("click", () => showWidget(selector));
        pillsContainer.appendChild(pill);
    });
}

function addHideButtons() {
    INTRA_WIDGETS.forEach((selector) => {
        const widget = document.querySelector(selector);
        if (!widget || widget.querySelector('.iil-hide-btn')) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "iil-hide-btn";
        btn.title = "Hide widget";
        btn.innerHTML = "✕";
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            hideWidget(selector);
        });
        widget.style.position = "relative";
        widget.appendChild(btn);
    });
}

function removeHideButtons() {
    document.querySelectorAll('.iil-hide-btn').forEach(btn => btn.remove());
}

function resetLayout() {
    localStorage.removeItem(WIDGET_STORAGE_KEY);
    localStorage.removeItem(WIDGET_ORDER_KEY);
    localStorage.removeItem(EDIT_MODE_KEY);
    location.reload();
}

function createLayoutButtons() {
    if (document.getElementById("iil-layout-controls")) return;

    const target = document.querySelector(".profile-item .profile-item-top");
    if (!target) return;

    const controls = document.createElement("div");
    controls.id = "iil-layout-controls";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.title = "Edit layout";
    editBtn.className = "iil-layout-btn";
    editBtn.innerHTML = '<span class="iil-layout-btn-icon">✎</span><span>Edit </span>';

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.title = "Reset to default layout";
    resetBtn.className = "iil-layout-btn iil-layout-btn-reset";
    resetBtn.innerHTML = '<span class="iil-layout-btn-icon">↺</span><span>Default</span>';
    resetBtn.addEventListener("click", () => {
        if (confirm("Reset layout to default?")) resetLayout();
    });

    const pillsContainer = document.createElement("div");
    pillsContainer.id = "iil-hidden-pills";
    pillsContainer.style.display = "none";

    controls.appendChild(editBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(pillsContainer);
    target.insertAdjacentElement("afterend", controls);
}

function makeWidgetsDraggable(enabled) {
    INTRA_WIDGETS.forEach((selector) => {
        const widget = document.querySelector(selector);
        if (!widget) return;
        widget.draggable = enabled;
        widget.classList.toggle("widget-draggable", enabled);
    });
}

function setEditMode(enabled) {
    editMode = enabled;

    const controls = document.getElementById("iil-layout-controls");
    if (!controls) return;

    const editBtn = controls.querySelector(".iil-layout-btn:not(.iil-layout-btn-reset)");
    if (!editBtn) return;

    editBtn.innerHTML = enabled
        ? '<span class="iil-layout-btn-icon">✓</span><span>Done</span>'
        : '<span class="iil-layout-btn-icon">✎</span><span>Edit </span>';

    const resetBtn = controls.querySelector(".iil-layout-btn-reset");
    if (resetBtn) resetBtn.style.display = enabled ? "inline-flex" : "none";

    const pillsContainer = document.getElementById("iil-hidden-pills");
    if (pillsContainer) pillsContainer.style.display = enabled && getSavedWidgets().length ? "flex" : "none";

    if (enabled) {
        addHideButtons();
        updateHiddenPills();
    } else {
        removeHideButtons();
        applyHiddenWidgets();
        applySavedWidgetOrder();
    }

    makeWidgetsDraggable(enabled);
    localStorage.setItem(EDIT_MODE_KEY, enabled ? "1" : "0");
}

function initLayoutControls() {
    const controls = document.getElementById("iil-layout-controls");
    if (!controls) return;

    const editBtn = controls.querySelector(".iil-layout-btn:not(.iil-layout-btn-reset)");
    if (!editBtn) return;

    editBtn.addEventListener("click", () => {
        setEditMode(!editMode);
    });
}

function getHoveredWidget(x, y) {
    return INTRA_WIDGETS.map(sel => document.querySelector(sel))
        .filter(el => el && !el.classList.contains("dragging") && !el.classList.contains("widget-hidden"))
        .find(el => {
            const box = el.getBoundingClientRect();
            return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
        }) || null;
}

function swapElements(a, b) {
    const parentA = a.parentNode;
    const siblingA = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    parentA.insertBefore(b, siblingA);
}

function enableWidgetDragging() {
    const container = document.querySelector('.container-fullsize > .row');
    if (!container) return;

    INTRA_WIDGETS.forEach((selector) => {
        const widget = document.querySelector(selector);
        if (!widget) return;

        widget.addEventListener("dragstart", (e) => {
            if (!editMode) {
                e.preventDefault();
                return;
            }
            dragged = widget;
            setTimeout(() => widget.classList.add("dragging"), 0);
        });

        widget.addEventListener("dragend", () => {
            widget.classList.remove("dragging");
            document.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target'));
            dragged = null;
            lastSwapTarget = null;

            const order = [...container.querySelectorAll(INTRA_WIDGETS.join(","))]
                .map((el) => INTRA_WIDGETS.find((sel) => document.querySelector(sel) === el))
                .filter(Boolean);

            saveWidgetOrder(order);
        });
    });

    container.addEventListener("dragover", (e) => {
        if (!editMode || !dragged) return;
        e.preventDefault();

        const hovered = getHoveredWidget(e.clientX, e.clientY);

        document.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target'));
        if (hovered && hovered !== dragged) hovered.classList.add('drag-target');

        if (hovered && hovered !== dragged && hovered !== lastSwapTarget) {
            lastSwapTarget = hovered;
            swapElements(dragged, hovered);
        }
    });

    container.addEventListener("dragleave", (e) => {
        if (!e.relatedTarget || !container.contains(e.relatedTarget)) {
            lastSwapTarget = null;
        }
    });
}

function initWidgetLayout() {
    labelWidgets();
    createLayoutButtons();
    applyHiddenWidgets();
    applySavedWidgetOrder();
    initLayoutControls();
    enableWidgetDragging();
    setEditMode(editMode);
    const profileItem = document.querySelector('.container-item.profile-item.full-width');
    if (profileItem) {
        profileItem.style.setProperty('margin-bottom', '0', 'important');
        profileItem.style.setProperty('padding', '0', 'important');
        profileItem.style.setProperty('min-height', '0', 'important');
    }
    const fullsize = document.querySelector('.container-fullsize.full-width.fixed-height');
    if (fullsize) fullsize.style.setProperty('margin-top', '0', 'important');

    // Force collapse the gap between edit button and widgets
    const controls = document.getElementById('iil-layout-controls');
    if (controls) {
        controls.style.setProperty('margin-bottom', '0', 'important');
        controls.style.setProperty('padding-bottom', '0', 'important');
    }
    const widgetRow = document.querySelector('.container-fullsize > .row');
    if (widgetRow) {
        widgetRow.style.setProperty('margin-top', '0', 'important');
        widgetRow.style.setProperty('padding-top', '0', 'important');
    }
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initWidgetLayout);
} else {
    initWidgetLayout();
}

// ── Social links box ──
const SOCIAL_STORAGE_KEY = "iil-social-links";

const PLATFORMS = {
    discord: {
        label: "Discord",
        modes: ["username", "server"],
        modeLabels: ["Username", "Server invite"],
        placeholder: { username: "e.g. coldone42", server: "https://discord.gg/..." },
        validate: (val, mode) => mode === "username" ? true : val.startsWith("https://discord.gg/"),
        toHref: (val, mode) => mode === "username" ? null : val,
        display: (val, mode) => mode === "username" ? val : "Discord Server",
    },
    github: {
        label: "GitHub",
        modes: null,
        placeholder: { default: "https://github.com/username" },
        validate: (val) => val.startsWith("https://github.com/"),
        toHref: (val) => val,
        display: (val) => val.replace("https://github.com/", ""),
    },
    linkedin: {
        label: "LinkedIn",
        modes: null,
        placeholder: { default: "https://linkedin.com/in/username" },
        validate: (val) => val.startsWith("https://www.linkedin.com/in/") || val.startsWith("https://www.linkedin.com/in/"),
        toHref: (val) => val,
        display: (val) => {
            const slug = val.replace("https://www.linkedin.com/in/", "").replace("https://linkedin.com/in/", "").replace(/\/$/, "");
            return slug.replace(/-[a-z0-9]{8,}$/i, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        }   ,
    },
};

function getSocialLinks() {
    try { return JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || "{}"); }
    catch { return {}; }
}

function saveSocialLinks(links) {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(links));
}

const PLATFORM_ICONS = {
    discord: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.082.116 18.105.136 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
};

function createSocialBox() {
    const target = document.querySelector(".profile-item .user-header-box.infos");
    if (!target) return;
    if (document.getElementById("iil-social-box")) return;

    const evalPointsEl = document.querySelector('.user-correction-point-value');
    const evalPoints = evalPointsEl?.firstElementChild?.textContent.trim()
        || evalPointsEl?.textContent.trim().split('\n')[0].trim()
        || null;
    if (evalPoints) window._iilEvalPoints = evalPoints;

    const links = getSocialLinks();

    const box = document.createElement("div");
    box.id = "iil-social-box";
    box.className = "user-header-box infos";
    box.style.width = "100%";
    box.style.minHeight = "180px";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.justifyContent = "center";

    function render(editing) {
        if (editing) {
            box.innerHTML = `
                <div id="iil-social-header">
                    <span id="iil-social-title">Links</span>
                    <div style="position:absolute;right:0;display:flex;gap:12px;align-items:center">
                        <button class="iil-social-hbtn" id="iil-social-confirm" title="Save">✓</button>
                        <button class="iil-social-hbtn" id="iil-social-cancel" title="Cancel">✕</button>
                    </div>
                </div>
                <div id="iil-social-links">
                    ${Object.entries(PLATFORMS).map(([key, p]) => {
                        const saved = links[key] || {};
                        const mode = saved.mode || (p.modes ? p.modes[0] : "default");
                        const val = saved.val || "";
                        return `
                        <div class="iil-social-row iil-social-edit-row" data-key="${key}">
                            <span class="iil-social-icon-sym">${PLATFORM_ICONS[key]}</span>
                            <span class="iil-social-platform-label">${p.label}</span>
                            ${p.modes ? `
                                <select class="iil-social-mode-select" data-key="${key}">
                                    ${p.modes.map(m => `<option value="${m}" ${mode === m ? "selected" : ""}>${p.modeLabels[p.modes.indexOf(m)]}</option>`).join("")}
                                </select>
                            ` : ""}
                            <input class="iil-social-input-val" data-key="${key}" placeholder="${p.placeholder[mode] || p.placeholder.default}" value="${val}"/>
                        </div>`;
                    }).join("")}
                </div>
            `;

            box.querySelectorAll(".iil-social-mode-select").forEach(sel => {
                sel.addEventListener("change", () => {
                    const key = sel.dataset.key;
                    const input = box.querySelector(`.iil-social-input-val[data-key="${key}"]`);
                    input.placeholder = PLATFORMS[key].placeholder[sel.value] || "";
                    input.value = "";
                });
            });

            box.querySelector("#iil-social-confirm").addEventListener("click", () => {
                const updated = {};
                let error = null;
                Object.keys(PLATFORMS).forEach(key => {
                    const p = PLATFORMS[key];
                    const val = box.querySelector(`.iil-social-input-val[data-key="${key}"]`).value.trim();
                    const modeSel = box.querySelector(`.iil-social-mode-select[data-key="${key}"]`);
                    const mode = modeSel ? modeSel.value : "default";
                    if (val && !p.validate(val, mode)) {
                        error = `Invalid ${p.label} link.`;
                    }
                    updated[key] = { val, mode };
                });
                if (error) { alert(error); return; }
                saveSocialLinks(updated);
                Object.assign(links, updated);
                render(false);
            });

            box.querySelector("#iil-social-cancel").addEventListener("click", () => render(false));

        } else {
            box.innerHTML = `
                <div id="iil-social-header">
                    <span id="iil-social-title">Links</span>
                    <button class="iil-social-hbtn" id="iil-social-edit-btn" title="Edit">✎</button>
                </div>
                <div id="iil-social-links">
                    ${Object.entries(PLATFORMS).map(([key, p]) => {
                        const saved = links[key] || {};
                        const val = saved.val || "";
                        const mode = saved.mode || (p.modes ? p.modes[0] : "default");
                        const href = val ? p.toHref(val, mode) : null;
                        const display = val ? p.display(val, mode) : null;
                        const icon = PLATFORM_ICONS[key];
                        return val ? `
                            ${href
                                ? `<a class="iil-social-row iil-social-link" href="${href}" target="_blank" rel="noopener">
                                        <span class="iil-social-icon-sym">${icon}</span>
                                        <span class="iil-social-link-label">${display}</span>
                                        <span class="iil-social-link-arrow">↗</span>
                                   </a>`
                                : `<div class="iil-social-row iil-social-nolink">
                                        <span class="iil-social-icon-sym">${icon}</span>
                                        <span class="iil-social-link-label">${display}</span>
                                   </div>`
                            }
                        ` : `
                            <div class="iil-social-row iil-social-empty">
                                <span class="iil-social-icon-sym">${icon}</span>
                                <span>—</span>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;
            box.querySelector("#iil-social-edit-btn").addEventListener("click", () => render(true));
        }
    }

    render(false);
    target.replaceWith(box);
    setTimeout(updateEvalPoints, 100);
}


function initSocialBox() {
    if (/^profile\.intra\.42\.fr\/?($|home)/.test(pageUrl)) {
        if (document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", createSocialBox);
        } else {
            createSocialBox();
        }
    }
}

initSocialBox();

function fixLogtimeSVG() {
    const svg = document.querySelector('[data-iil-widget="logtime"] #user-locations');
    if (!svg) return;

    // find the actual bounds of the content
    const rects = [...svg.querySelectorAll('rect')];
    if (!rects.length) return;

    const xs = rects.map(r => parseFloat(r.getAttribute('x'))).filter(n => !isNaN(n));
    const minX = Math.min(...xs) - 10;
    const maxX = Math.max(...xs) + 30;

    svg.setAttribute('viewBox', `${minX} 0 ${maxX - minX} 210`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '210');
    svg.removeAttribute('preserveAspectRatio');
    svg.style.display = 'block';
}

setTimeout(fixLogtimeSVG, 500);

function fixAchievementLines() {
    const widget = document.querySelector('[data-iil-widget="last-achievements"]');
    if (!widget) return;
    const container = widget.querySelector('.container-inner-item.boxed');
    if (container) {
        container.style.background = 'transparent';
        container.style.paddingBottom = '0';
        container.style.paddingTop = '0';
    }
    const items = [...widget.querySelectorAll('.achievement-item')];
    items.forEach((item, i) => {
        item.style.marginBottom = '0';
        item.style.borderRadius = '0';
        if (i === 0) item.style.borderRadius = '8px 8px 0 0';
        if (i === items.length - 1) item.style.borderRadius = '0 0 8px 8px';
        if (items.length === 1) item.style.borderRadius = '8px';
    });
}

setTimeout(fixAchievementLines, 300);