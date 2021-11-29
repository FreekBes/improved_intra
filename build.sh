#!/bin/bash
if [[ $OSTYPE == 'darwin'* ]]; then
	rm -f chromium.zip firefox.zip
	zip -r chromium.zip manifest.json LICENSE PRIVACY-POLICY.md js/* options/* css/* campus_specifics/* images/logo*.png _locales/*
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	zip -r firefox.zip manifest.json LICENSE PRIVACY-POLICY.md js/* options/* css/* campus_specifics/* images/logo*.png _locales/*
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
else
	rm -f chromium.zip firefox.zip
	7z a chromium.zip manifest.json LICENSE PRIVACY-POLICY.md js/* options/* css/* campus_specifics/* images/logo*.png _locales/*
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	7z a firefox.zip manifest.json LICENSE PRIVACY-POLICY.md js/* options/* css/* campus_specifics/* images/logo*.png _locales/*
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
fi
