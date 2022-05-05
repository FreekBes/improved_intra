<?PHP // php block to make GitHub know this is a php page, not "hack" or whatever ?>
<!DOCTYPE html>
<html>
<head>
	<meta charset='utf-8' />
	<title>Improved Intra 42 Settings</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
	<style>
		#improved-intra-no-extension-block {
			position: fixed;
			z-index: 999999;
			background: #12141a;
			color: #f2f2f2;
			padding: 48px 32px;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			font-family: sans-serif;
			text-align: center;
		}
		#improved-intra-no-extension-block a {
			color: #00babc !important;
			cursor: pointer;
			text-decoration: underline;
		}
	</style>
</head>
<body class="limitwidth">
	<div id="improved-intra-no-extension-block">
		<h1>You need to install the Improved Intra 42 extension in order to modify its settings.</h1>
		<p>You can install it from the <a href="https://chrome.google.com/webstore/detail/hmflgigeigiejaogcgamkecmlibcpdgo/">Chrome Web Store</a> or, if you are using Mozilla Firefox, directly by clicking <a href="https://github.com/FreekBes/improved_intra/releases/latest/download/firefox.xpi">here</a>.</p>
		<p style="margin-top: 48px;"><small>If you do have it installed, then something went horribly wrong. Please message me on Slack @fbes or <a href="https://github.com/FreekBes/improved_intra/issues">create a GitHub issue</a>.</small></p>
	</div>
	<div id="loading">
		<div class="spinner"></div>
	</div>
	<div id="saved-notif">Settings saved!</div>
	<div id="contents">
		<header>
			<button id="back-button"></button>
			<h2>Improved Intra 42 Settings</h2>
			<button id="sync-button" class="sync-complete"></button>
		</header>
		<main>
			<form enctype="multipart/form-data" accept-charset="utf-8" autocomplete="off" name="settings-form">
				<section>
					<h3>Synchronization</h3>
					<fieldset>
						<label for="username"><span>Currently logged in user</span><span>Automatically fetched from Intra</span></label>
						<input type="text" id="username" name="username" value="" readonly />
					</fieldset>
					<fieldset style="display: none;">
						<label for="sync"><span>Synchronize my settings</span><span>Synchronize your settings using your Intra's username</span></label>
						<input type="checkbox" value="true" id="sync" name="sync" checked disabled />
					</fieldset>
				</section>
				<section>
					<h3>Appearance</h3>
					<fieldset>
						<label for="theme"><span>Theme</span></label>
						<select id="theme" name="theme">
							<option value="system" selected>Follow system</option>
							<option value="dark">Dark Mode</option>
							<option value="light">Light Mode</option>
						</select>
					</fieldset>
					<fieldset>
						<label for="colors"><span>Color scheme</span></label>
						<select id="colors" name="colors">
							<option value="default" selected>Intra (default)</option>
							<option value="cetus">Cetus</option>
							<option value="pyxis">Pyxis</option>
							<option value="vela">Vela</option>
							<option disabled value="null">More coming eventually</option>
						</select>
					</fieldset>
					<fieldset>
						<label for="show-custom-profiles"><span>Allow customized profiles</span><span>Show customized profiles, such as custom banner imagery</span></label>
						<input type="checkbox" value="true" id="show-custom-profiles" name="show-custom-profiles" checked />
					</fieldset>
				</section>
				<section>
					<h3>General improvements</h3>
					<fieldset>
						<label for="clustermap"><span>Make logged in location clickable</span><span>When a user is available, clicking on their location will open the cluster map</span></label>
						<input type="checkbox" value="true" id="clustermap" name="clustermap" checked />
					</fieldset>
					<fieldset>
						<label for="hide-broadcasts"><span>Hide broadcasts button</span><span>Hide the blue megaphone floating button on the dashboard</span></label>
						<input type="checkbox" value="true" id="hide-broadcasts" name="hide-broadcasts" checked />
					</fieldset>
					<fieldset>
						<label for="logsum-month"><span>Show monthly logtimes</span><span>Show every month's total logtime in the logtime chart</span></label>
						<input type="checkbox" value="true" id="logsum-month" name="logsum-month" checked />
					</fieldset>
					<fieldset>
						<label for="logsum-week"><span>Show cumulative logtimes per week</span><span>When hovering over the logtimes chart, show user's cumulative hours per week</span></label>
						<input type="checkbox" value="true" id="logsum-week" name="logsum-week" checked />
					</fieldset>
				</section>
				<section>
					<h3>Black Hole</h3>
					<fieldset>
						<label for="old-blackhole"><span>Old Black Hole countdown</span><span>Use the old Black Hole countdown in profile banners</span></label>
						<input type="checkbox" value="true" id="old-blackhole" name="old-blackhole" />
					</fieldset>
					<fieldset>
						<label for="hide-goals"><span>Hide Black Hole absorption</span><span>Hide the entire Black Hole container on all profile banners</span></label>
						<input type="checkbox" value="true" id="hide-goals" name="hide-goals" />
					</fieldset>
				</section>
				<section>
					<h3>Customize your profile</h3>
					<fieldset style="display: none;">
						<label for="custom-banner-url"><span>Custom profile banner background</span><span>Override banner image with a custom one</span></label>
						<input type="url" value="" id="custom-banner-url" name="custom-banner-url" placeholder="Leave empty to use default header" title="Leave empty to use default header" />
					</fieldset>
					<div id="custom-header-preview" style="display: none;">
						<figure>
							<img id="current-custom-banner" src="https://i.imgur.com/2dxaFs9.jpeg" />
							<figcaption>Current custom header image</figcaption>
						</figure>
						<div class="options-buttons">
							<button type="button" id="rem-custom-banner" class="danger-btn">Remove custom banner</button>
						</div>
					</div>
					<fieldset>
						<label for="custom-banner-upload"><span>Upload a new custom banner</span><span>Upload an image to use as a custom banner</span></label>
						<input type="file" id="custom-banner-upload" name="custom-banner-upload" accept="image/*" />
					</fieldset>
					<fieldset>
						<label for="custom-banner-pos"><span>Custom banner image position</span><span>The main focus of your custom banner image</span></label>
						<select id="custom-banner-pos" name="custom-banner-pos">
							<option value="center-top">Top</option>
							<option value="center-center" selected>Centered (default)</option>
							<option value="center-bottom">Bottom</option>
						</select>
					</fieldset>
					<fieldset>
						<label for="link-github"><span>Your GitHub username</span><span>Enter a GitHub username to display on your profile</span></label>
						<input type="text" id="link-github" name="link-github" placeholder="GitHub" />
					</fieldset>
				</section>
				<section>
					<h3>Campus specific</h3>
					<fieldset>
						<label for="codam-monit"><span>Replace Black Hole with Codam's Monitoring Progress</span><span>Show a user's progress towards Codam's Monitoring System in profile banners</span></label>
						<input type="checkbox" value="true" id="codam-monit" name="codam-monit" checked />
					</fieldset>
					<fieldset>
						<label for="codam-auto-equip-coa-title"><span>Auto-equip coalition titles</span><span>Automatically equip your rank's Intra title when one is available</span></label>
						<input type="checkbox" value="true" id="codam-auto-equip-coa-title" name="codam-auto-equip-coa-title" />
					</fieldset>
				</section>
				<section>
					<h3>Help</h3>
					<fieldset>
						<label for="bug-report"><span>Report a bug or give feedback</span><span>Bugs and feedbacks are reported using GitHub Issues</span></label>
						<button type="button" id="bug-report" class="non-important-btn">Open GitHub Issues</button>
					</fieldset>
				</section>
			</form>
		</main>
	</div>
</body>
</html>
