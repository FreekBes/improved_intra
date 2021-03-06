#!/bin/bash
if [[ $OSTYPE == 'darwin'* ]] || [[ $OSTYPE == 'linux-gnu' ]]; then
	rm -f chromium.zip firefox.zip
	zip -r chromium.zip manifest.json LICENSE PRIVACY-POLICY.md sw.js background/* features/* fixes/* generic/* options/* images/logo*.png _locales/* promo/emotes.css promo/emotes.html promo/logo-wide.png
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	zip -r firefox.zip manifest.json LICENSE PRIVACY-POLICY.md background/* features/* fixes/* generic/* options/* images/logo*.png _locales/* promo/emotes.css promo/emotes.html promo/logo-wide.png
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
else
	rm -f chromium.zip firefox.zip
	7z a chromium.zip manifest.json LICENSE PRIVACY-POLICY.md sw.js background/* features/* fixes/* generic/* options/* images/logo*.png _locales/* promo/emotes.css promo/emotes.html promo/logo-wide.png
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	7z a firefox.zip manifest.json LICENSE PRIVACY-POLICY.md background/* features/* fixes/* generic/* options/* images/logo*.png _locales/* promo/emotes.css promo/emotes.html promo/logo-wide.png
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
fi
