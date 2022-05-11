<?php
	function parse_custom_banner_url(&$userSettings) {
		if (empty($userSettings["custom-banner-url"])) {
			delete_old_user_banner($userSettings["username"]);
		}
		else if (!filter_var($userSettings["custom-banner-url"], FILTER_VALIDATE_URL)) {
			$userSettings["custom-banner-url"] = "";
		}
		else {
			$hostName = parse_url($userSettings["custom-banner-url"], PHP_URL_HOST);
			if ($hostName != $_SERVER["SERVER_NAME"]) {
				delete_old_user_banner($userSettings["username"]);
			}
		}
	}

	function parse_github_link(&$userSettings) {
		// remove URLs, only keep username
		if (filter_var($userSettings["link-github"], FILTER_VALIDATE_URL)) {
			$path = parse_url($userSettings["link-github"], PHP_URL_PATH);
			$userSettings["link-github"] = basename($path);
		}

		// remove github@ if value starts with that
		if (strpos(strtolower($userSettings["link-github"]), "github@") === 0) {
			$userSettings["link-github"] = substr($userSettings["link-github"], 7);
		}

		// remove @ if it starts with one
		if ($userSettings["link-github"][0] == '@') {
			$userSettings["link-github"] = substr($userSettings["link-github"], 1);
		}

		if (strpos($userSettings["link-github"], "@") !== false) {
			$splitUsername = explode("@", $userSettings["link-github"]);
			if (count($splitUsername) == 2) {
				$splitUsername[0] = strtolower($splitUsername[0]);
				// github@username links are formatted to just username by default (see line 187)
				// so github does not need to be in the array below, but for future use it is anyways.
				$supportedGitPlatforms = ["github", "gitlab"];
				if (!in_array($splitUsername[0], $supportedGitPlatforms)) {
					$userSettings["link-github"] = ""; // git platform before @ in string is not supported right now. Empty link-github.
				}
				else {
					$userSettings["link-github"] = $splitUsername[0].'@'.$splitUsername[1];
				}
			}
			else {
				// there was more than one @ in the string. Empty it, parsing error.
				$userSettings["link-github"] = "";
			}
		}
		else {
			// validate username according to allowed characters in a GitHub username. if it contains not-allowed characters, set it to empty
			// RegEx from https://github.com/shinnn/github-username-regex
			$allowedChars = '/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i';
			if (!preg_match($allowedChars, $userSettings["link-github"])) {
				$userSettings["link-github"] = "";
			}
		}
	}
?>
