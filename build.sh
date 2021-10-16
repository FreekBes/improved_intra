zip -r chromium.zip manifest.json LICENSE dark.css images/logo*.png
mv manifest.json manifest-chromium.json
mv manifest-ff.json manifest.json
zip -r firefox.zip manifest.json LICENSE dark.css images/logo*.png
mv manifest.json manifest-ff.json
mv manifest-chromium.json manifest.json
