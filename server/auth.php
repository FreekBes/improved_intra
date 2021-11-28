<?php
	// include non-git variables
	require_once("nogit.php");

	// setup session
	session_start();
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

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,"https://api.intra.42.fr/v2/me");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/json" , "Authorization: Bearer ".$accessToken ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($ch);
		if ($response !== false ) {
			try {
				return (json_decode($response, true));
			}
			catch (Exception $e) {
				return (null);
			}
		}
		else {
			return (null);
		}
	}

	function exchange($code) {
		global $clientID, $clientSecret, $redirectURL;

		$ch = curl_init();
		$postData = array(
			"client_id" => $clientID,
			"client_secret" => $clientSecret,
			"code" => $code,
			"grant_type" => "authorization_code",
			"redirect_uri" => $redirectURL,
			"state" => $_SESSION["state"]
		);
		curl_setopt($ch, CURLOPT_URL,"https://api.intra.42.fr/oauth/token");
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($ch);
		if ($response !== false ) {
			try {
				$ret = array();
				$jsonRes = json_decode($response, true);
				$ret["auth"] = $jsonRes;
				if (!isset($jsonRes["error"])) {
					$ret["user"] = get_user_info($ret["auth"]["access_token"]);
					$ret["user"] = reduce_user_info($ret["user"]);
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

	function getAuthPageURL() {
		global $clientID, $clientSecret, $redirectURL, $scopes;

		return ("https://api.intra.42.fr/oauth/authorize?client_id=".$clientID."&redirect_uri=".urlencode($redirectURL)."&response_type=code&scope=".implode("%20", $scopes)."&state=".$_SESSION["state"]);
	}
?>