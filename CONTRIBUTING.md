# Contributing Guidelines


## Notice
The aim of this extension is to improve general usefulness of 42's Intranet website.
Try to only make changes to the styling by using the CSS file. Only use Javascript if it is absolutely necessary.


## Steps to contribute
1. Read the contributing guidelines in this file (thank you!)
2. [Fork](https://github.com/FreekBes/dark_intra/fork) and clone this repository
3. Create a new branch: `git checkout -b branch-name` (to switch to this branch later on, remove the `-b` flag)
4. Open [the extensions page](chrome://extensions/) in your web browser
5. Click the *Load unpacked* button
6. Make your changes and verify that they work as intended
7. Push to your fork (`git push --set-upstream branch-name`) and [submit a pull request](https://github.com/FreekBes/dark_intra/compare)
8. Wait for the pull request to be merged, and make changes if necessary or asked by the community.


## Adding campus specific improvements
If an improvement you write only applies to certain campuses, please only write to files in a subfolder of your
campus in the *campus_specific* folder. This keeps things a bit more tidy and clear.


## Modifying a CSS style
When you add a rule to a CSS file, make sure it only applies to the element you wish to stylize. An easy trick to
achieve this, is just to right click the element on the website, and to choose *Inspect Element*. Find the class/id
that currently sets the style you wish to set, and modify only that class/id in the CSS file. If it does not exist
yet, feel free to add it.

An example: if you wanted to modify the background of the boxes in the header of the dashboard page, you would
right click any of them, choose to inspect the element, find out they all have the class `user-header-box`, and
that the background color is set by the rule `.profile-item .user-header-box` in the application's CSS. Thus, you
modify that rule. You check *improv.css* (or the CSS you need to edit) if the rule already exists, ignoring any
rules in the `@media` segments (which are used for stylizing based on certain rules, such as the device's
resolution. Generally, they go unused in this extension, since it only works on desktop PCs anyways). Since the
rule does not exist yet, you simply add it to the CSS file.

```css
/* change background colors of profile banner containers to red */
.profile-item .user-header-box {
  background-color: red !important;
}
```

Please add a comment describing the rule above the rule's targets, like in the example above.
This is not necessary in theme files, such as *dark.css*.


### Important
Make sure to add `!important` to any CSS rule you add, so that it gets overwritten by the extension. Otherwise, the
style will end up getting overruled by Intranet's CSS.
