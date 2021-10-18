#!/bin/bash
if ! [ command -v zip &> /dev/null ]; then
	tar.exe -a -c -f chromium.zip manifest.json LICENSE dark.css images/logo*.png _locales/*
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	tar.exe -a -c -f firefox.zip manifest.json LICENSE dark.css images/logo*.png _locales/*
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
else
	zip -r chromium.zip manifest.json LICENSE dark.css images/logo*.png _locales/*
	mv manifest.json manifest-chromium.json
	mv manifest-ff.json manifest.json
	zip -r firefox.zip manifest.json LICENSE dark.css images/logo*.png _locales/*
	mv manifest.json manifest-ff.json
	mv manifest-chromium.json manifest.json
fi