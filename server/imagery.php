<!DOCTYPE html>
<html>
	<head>
		<title>Custom imagery used by Improved Intra Users on Intranet</title>
		<style>
			html, body {
				display: block;
				text-align: center;
				color: #f2f2f2;
				background: #202124;
				font-family: sans-serif;
				margin: 0;
				padding: 0;
				height: 100%;
			}
			h1 {
				display: block;
				font-weight: bold;
				margin: 24px 8px 8px 8px;
				padding: 0px;
			}
			a, a:visited {
				color: inherit;
				text-decoration: none;
				cursor: pointer;
			}
			a:hover, a:focus {
				color: #00babc;
				text-decoration: underline;
			}
			img {
				display: block;
				margin: 8px auto;
				max-height: 70%;
				max-width: 90%;
			}
		</style>
	</head>
	<body>
<?php
	@session_start();

	// set headers
	header('Content-Type: text/html; charset=utf-8');
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");

	function safe_print($str) {
		echo htmlspecialchars_decode($str);
	}

	// get all setting files
	$settingFiles = glob("settings/*.json");

	// go through all user settings
	foreach ($settingFiles as $settingFile) {
		$userSettings = json_decode(file_get_contents($settingFile), true);

		// display custom banner image if set
		if (isset($userSettings["custom-banner-url"]) && !empty($userSettings["custom-banner-url"])) {
			?>
		<h1><a target="imagery-user-win" href="https://profile.intra.42.fr/users/<?php safe_print($userSettings["username"]); ?>"><?php safe_print($userSettings["username"]); ?></a></h1>
		<img src="<?php safe_print($userSettings["custom-banner-url"]); ?>" title="<?php safe_print($userSettings["custom-banner-url"]); ?>" alt="Could not load image. Maybe the URL is invalid?" />
			<?php
		}
	}
?>
	</body>
</html>
