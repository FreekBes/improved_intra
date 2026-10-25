# Privacy Policy for Improved Intra 42

Version: 1.1.
Last updated: October 25th, 2026.

This is the privacy policy of the browser extension called "Improved Intra 42",
hereafter called "Extension" or "The Extension". Anyone using this extension is
called a user, hereafter called "User", "The User" or "A User".

The Extension is findable, downloadable and/or installable from the following
sources:

- "GitHub"
At https://github.com/FreekBes/improved_intra/.
"GitHub" is owned by GitHub Inc.
Their privacy policy can be found at
https://docs.github.com/en/github/site-policy/github-privacy-statement.

- Google's "Chrome Web Store"
At https://chrome.google.com/webstore/detail/hmflgigeigiejaogcgamkecmlibcpdgo.
The "Chrome Web Store" is owned by Google Inc.
Their privacy policy can be found at https://policies.google.com/privacy.


## Definitions of terms
A web accessible server is a computer, reachable by anyone using a computer
who knows the address of the server. The address is often portrayed in a human-
readable format called a domain.

A Web Browser is a software program that allows a user to locate, access and
display web pages on the Internet. They are delivired to User using HTTP
(Hypertext Transfer Protocol), using HTML (Hypertext Markup Language). A Web
Browser is able to translate the delivered data into human-readable content.
Web pages are stored on web accessible servers and are reachable by combining a
domain and a path to a resource on the server, which is called a URL.

A "browser extension" (also called an "extension" or a "plug-in") is a small
piece of sotware that adds a capacity or functionality to a Web Browser.
They make use of the same programming language "Javascript", the markup language
"HTML", and stylesheets "CSS" as most modern-day websites.
Browser extensions generally perform tasks only for a specific list of websites.

A browser extension often has an internal options page, accessible to User by
going to Web Browser's extensions overview and clicking the options button for
the extension. On this page, User can modify what the extension does. This data
is often stored locally or on a web accessible server.

Example products of Web Browsers are Google's "Chrome", Mozilla's "Firefox" and
Microsoft's Internet Explorer.

Example products of browser extensions are "uBlock Origin" by Raymond Hill
(gorhill), "Tab Manager Plus for Chrome" by stefanxo.com and "Sidebery" by
mbnuwq.


## Access to websites
The Extension is able to access and read any data from the domain "intra.42.fr"
and any of its subdomains, hereafter called "Intranet". It also communicates
with the domain "iintra.freekb.es" (formerly "darkintra.freekb.es"), hereafter
called the "Sync Server", in order to synchronize settings set for The Extension
by User and to provide features that need data from Intranet.


## Storing of user data
User data is stored on the Sync Server only after User connects The Extension
to it. User does this by visiting the URL "https://iintra.freekb.es/v2/connect"
in Web Browser (for example via The Extension's pop-up) and clicking the "Allow"
button on Intranet's website (domain: "api.intra.42.fr"). This grants the Sync
Server read access to User's public Intranet profile (the "public" scope). The
access token Intranet hands out during this step is used once, to retrieve
User's profile, and is never stored on the Sync Server.

After connecting, the Sync Server issues The Extension its own access key, which
identifies User to the Sync Server without further interaction. Only User can
modify their own settings and profile, using either this access key or a
signed-in session on the Sync Server.

The Extension's options page is hosted on the Sync Server, at
"https://iintra.freekb.es/v2/options". Settings changed there are stored on the
Sync Server directly. A copy of these settings is stored locally in Web Browser
using the "Chrome Extension API" (local storage). This copy is not synced using
Chrome's Storage Sync API.

All data transmitted to and from the Sync Server are done in a secure manner
using SSL/HTTPS encryption.

The Extension is usable without connecting to the Sync Server, although then no
customization is possible. The Extension will be loaded in a default, fallback
state instead.


### User data stored on the Sync Server
- Account information, retrieved from Intranet when User connects (and updated
every time User connects again):
	- User's user identification number (ID) and "username" (login) on Intranet
	- User's first name, last name and display name
	- User's student e-mail address
	- User's primary campus (and the campus' name, city and country)
	- Whether User is a staff member on Intranet
	- The date on which Intranet is scheduled to anonymize User's account, if any
	- The date on which User first connected
- Extension settings set by User, including but not limited to:
	- User's preferences regarding themes and color schemes
	- User's choice of features The Extension should enable or disable on
	Intranet
	- The version of The Extension used when the settings were last changed
- Customizations for User's own profile on Intranet:
	- A banner image, either uploaded by User to the Sync Server or linked from
	elsewhere, and its position, dimensions and file size
	- A link to User's Git profile and a link to User's personal website
- Study-related data, retrieved from Intranet automatically every few hours:
	- User's project teams, including their final marks and which team is the
	current and best one for each project
	- Evaluations of those teams, including the mark, whether the evaluation
	was successful or flagged as outstanding, the date of the evaluation and
	the Intranet ID of the evaluator
	- The events and exams User has registered for on Intranet, including their
	name, description, location, time and number of subscribers
- Technical data:
	- The access key issued to The Extension, when it was created and when it
	was last used
	- When study-related data was last retrieved for User

In addition, the Sync Server keeps log files. These contain error messages,
records of the automatic data retrieval described above (which may include
User's "username" and ID), and a record of every request made to the Sync
Server, which may include the requester's IP address, the requested URL (which
can contain a "username"), the date and time, the browser's user agent and the
referring page. Log files are used for solving errors and keeping the Sync
Server running, are deleted after 30 days, and are only accessible to the
creator of The Extension.

The Sync Server ensures no data unused by user-facing features of The Extension
is stored. All data that comes in is validated, and any fields that are not
recognized are discarded.

Data stored on the Sync Server will never be sold to third parties, nor to
anyone or any entity that has no goal related to the goal The Extension tries to
achieve: to improve Intranet.


### Usage of user data stored on the Sync Server
The user data stored on the Sync Server is used to:
- synchronize User's settings between Web Browsers and devices. This way, User
never has to customize their settings on every new installation of Extension.
A login to Intranet will be enough to retrieve and apply their settings;
- show User's profile customizations to other users of The Extension;
- show the number of outstanding evaluations per project on Intranet profiles;
- provide User with a calendar feed (iCal) of the events and exams User has
registered for;
- allow staff members of Intranet to review uploaded banner images, in order to
moderate them.


### Accessibility of User's data on the Sync Server
The following data is publicly accessible by anyone who knows User's
"username" on Intranet:
- User's profile customizations (banner image and its position, Git link and
website link), at "https://iintra.freekb.es/v2/profile/-username-.json";
- The number of outstanding evaluations of User's project teams, at
"https://iintra.freekb.es/v2/outstandings/-username-";

where "-username-" is replaced with User's "username" on Intranet. Banner
images uploaded by User are publicly accessible at their own URL.

User's calendar feed is accessible to anyone who has its personal link. This
link is only handed to User and stays valid for 3 years.

Staff members of Intranet who are signed in to the Sync Server can view all
uploaded banner images, together with the "username", campus and staff status
of the user who uploaded them.

All other data, such as User's settings, name and e-mail address, is only
accessible to User and to the creator of The Extension.


### Request of a copy of stored user data
User can download a copy of all data stored about them on the Sync Server,
including uploaded banner images, as a ZIP archive from the "Help" page of
The Extension's options page ("https://iintra.freekb.es/v2/options/help").
For security reasons, the value of the access key is left out.


### Deletion of stored user data on the Sync Server
User may delete all their data from the Sync Server using the "Delete all my
data" button on the "Help" page of The Extension's options page. This deletes
User's account information, settings, profile customizations, uploaded banner
images, study-related data and access keys immediately and permanently.
Evaluations of a team are kept if another user of The Extension was part of the
same team, as they are still needed for that user.

User's data is also deleted automatically once the anonymization date of User's
account on Intranet has passed.

Banner images that are no longer used by any profile are deleted after 30 days.

Entries in log files are not removed upon deletion, but are deleted after 30
days as described above.

If User wishes to delete their data without having Extension installed, they
can request so by sending an e-mail to the creator of Extension.
See the paragraph called "Contact & communication" below for contact details.


## Use of cookies
The Extension does not make use of any cookies in any way or form.
The Sync Server does make use of cookies, but not to track User. Use of cookies
created by Sync Server is limited to a session cookie, which identifies User
when accessing pages on Sync Server's domain and protects forms against forgery.
It contains User's "username", ID, campus, staff status and the URL of User's
Intranet profile picture, and is removed when User closes Web Browser or signs
out.


## Contact & communication
The creator of Extension can be reached by sending an e-mail to the e-mail
address fbes@student.codam.nl or freekbladnl@gmail.com. Any major changes to this
Privacy Policy will be announced using pop-up windows on Intranet, added to
Intranet by Extension.
