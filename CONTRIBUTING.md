# Contriuting Guidelines


## Notice
The aim of this extension is to make Intra have a dark theme, **not** to improve general usefulness of the website.
While a file called *improv.js* does exist, its functionality should be kept as simplistic as possible. Please only
contribute to this extension when you're meaning to improve on the theme of Intra itself. And, try to only make
changes to the styling by using the CSS file. Only use Javascript if it is absolutely necessary.


## Modifying a style
When you add a rule to the CSS file, make sure it only applies to the element you wish to stylize. An easy trick to
achieve this, is just to right click the element on the website, and to choose *Inspect Element*. Find the class/id
that currently sets the style you wish to set, and modify only that class/id in the CSS file. If it does not exist
yet, feel free to add it.

An example: if you wanted to modify the background of the boxes in the header of the dashboard page, you would
right click any of them, choose to inspect the element, find out they all have the class `user-header-box`, and
that the background color is set by the rule `.profile-item .user-header-box` in the application's CSS. Thus, you
modify that rule. You check *dark.css* if the rule already exists, ignoring any rules in the `@media` segments
(which are used for stylizing based on certain rules, such as the device's resolution. Generally, they go unused
in this extension, since it only works on desktop PCs anyways). Since the rule does not exist yet, you simply add
it to the CSS file.

```css
.profile-item .user-header-box {
  background-color: red !important;
}
```


## Important
Make sure to add `!important` to any rule you add, so that it gets overwritten by the extension. Otherwise, the
style will end up getting overruled by the application's CSS. Also, please check if the rule is only used on
certain pages. If it is, please add it to the corresponding section of the CSS if possible (sections are defined
by `/* comments */`).
