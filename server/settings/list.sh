#!/bin/bash

# Display all settings when no arguments supplied, otherwise display only the filename + that setting
if [[ $# -eq 0 ]]; then
	for f in *.json; do (cat "${f}"; echo); done
else
	for f in *.json; do
		VALUE=$(cat "${f}" | sed -n -e "s/^.*\"${1}\"://p" | cut -f1 -d",")
		echo "${f}: $VALUE"
	done
fi
