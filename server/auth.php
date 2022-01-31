<?php
	// include non-git variables
	require_once("nogit.php");

	// setup session
	@session_start();
	if (!isset($_SESSION["state"]) || !isset($_GET["state"])) {
		$_SESSION["state"] = hash("sha256", strval(rand(100, 999)));
	}
	else if (isset($_GET["state"]) && $_GET["state"] != $_SESSION["state"]) {
		http_response_code(409);
		exit();
	}

	// below function removes any user info we do not with to store locally in the extension
	function reduce_user_info($userInfo) {
		unset($userInfo["achievements"]);
		unset($userInfo["cursus_users"]);
		unset($userInfo["projects_users"]);
		unset($userInfo["campus_users"]);
		unset($userInfo["cursus_users"]);
		unset($userInfo["expertises_users"]);
		return ($userInfo);
	}

	function get_user_info($accessToken) {
		global $clientID, $clientSecret, $redirectURL;

		if (isset($_SESSION["user"]) && $accessToken == $_SESSION["user_from_access_token"]) {
			return ($_SESSION["user"]);
		}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,"https://api.intra.42.fr/v2/me");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/json" , "Authorization: Bearer ".$accessToken ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($ch);
		if ($response !== false) {
			try {
				$userInfo = json_decode($response, true);
				if (isset($userInfo["error"])) {
					return (null);
				}
				$userInfo = reduce_user_info($userInfo);
				$_SESSION["user"] = $userInfo;
				$_SESSION["user_from_access_token"] = $accessToken;
				return ($userInfo);
			}
			catch (Exception $e) {
				return (null);
			}
		}
		else {
			return (null);
		}
	}

	function access_token_expired($createdAt, $expiresIn) {
		$currentTimestamp = time();
		return ($createdAt + $expiresIn >= $currentTimestamp - 7200);
	}

	// refresh access token if it expires within two hours
	function refresh_access_token_if_needed($refreshToken, $createdAt, $expiresIn) {
		if (access_token_expired($createdAt, $expiresIn)) {
			return (exchange($refreshToken, "refresh_token"));
		}
		else {
			return (false);
		}
	}

	function exchange($code, $codeType = "authorization_code") {
		global $clientID, $clientSecret, $redirectURL;

		$ch = curl_init();
		$postData = array(
			"client_id" => $clientID,
			"client_secret" => $clientSecret,
			"code" => $code,
			"grant_type" => $codeType,
			"redirect_uri" => $redirectURL,
			"state" => $_SESSION["state"]
		);
		curl_setopt($ch, CURLOPT_URL,"https://api.intra.42.fr/oauth/token");
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($ch);
		if ($response !== false) {
			try {
				$ret = array();
				$jsonRes = json_decode($response, true);
				$ret["auth"] = $jsonRes;
				if (!isset($jsonRes["error"])) {
					$ret["user"] = get_user_info($ret["auth"]["access_token"]);
				}
				return ($ret);
			}
			catch (Exception $e) {
				return (null);
			}
		}
		else {
			return (null);
		}
	}

	function get_auth_page_url() {
		global $clientID, $clientSecret, $redirectURL, $scopes;

		return ("https://api.intra.42.fr/oauth/authorize?client_id=".$clientID."&redirect_uri=".urlencode($redirectURL)."&response_type=code&scope=".implode("%20", $scopes)."&state=".$_SESSION["state"]);
	}

	function delete_old_user_banner($username) {
		foreach (glob("banners/".$username."*.*") as $filename) {
			if (exif_imagetype($filename) !== false) {
				unlink($filename);
			}
		}
	}

	function get_image_ext($path, $mime = null) {
		if (!$mime) {
			$mime = exif_imagetype($path);
		}
		switch ($mime) {
			case IMAGETYPE_GIF:
				return ("gif");
			case IMAGETYPE_JPEG:
				return ("jpeg");
			case IMAGETYPE_PNG:
				return ("png");
			case IMAGETYPE_WEBP:
				return ("webp");
			default:
				return (false);
		}
	}
?>
