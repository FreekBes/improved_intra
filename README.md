# dark_intra
A browser extension which adds a dark theme to 42's Intranet at https://intra.42.fr/.

## Installation
Available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/hmflgigeigiejaogcgamkecmlibcpdgo/). If you are using a Mac at Codam, you'll find that any extensions you install will get removed after logging out. I wrote a small script for this, which fixes this issue by forcefully installing the extension to your macOS profile. You can find this script [here](https://github.com/FreekBes/codam_auto_extension_installer).

For Firefox, please see the [Releases](https://github.com/FreekBes/dark_intra/releases) page. Mozilla has decided to no longer host this extension due to it being for a "limited/non-public audience" (your loss, Mozilla). The extension **should** still automatically update using GitHub.

## Screenshots
<p align="center">
  <img src="https://raw.githubusercontent.com/FreekBes/dark_intra/master/promo/screenshot-1.png">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/FreekBes/dark_intra/master/promo/screenshot-2.png">
</p>

## Contributing
In case you find any white spots on Intra or would like to modify any of the styles, feel free to do so! Use GitHub's built-in editor in dark.css, or for more advanced stuff use the following steps:
1. [Fork](https://github.com/FreekBes/dark_intra/fork) and clone the project
2. Create a new branch: `git checkout -b branch-name` (to switch to this branch later on, remove the `-b` flag)
3. Open [the extensions page](chrome://extensions/) in your web browser
4. Click the *Load unpacked* button
5. Make your changes and verify that they work as intended (also please read the [CONTRIBUTING.md](CONTRIBUTING.md) file)
6. Push to your fork (`git push --set-upstream branch-name`) and [submit a pull request](https://github.com/FreekBes/dark_intra/compare)

After having completed these steps, I will review your modifications to the code and decide on the implementation in the published extension.
