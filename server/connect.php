<?php
	// include non-git variables
	require_once("nogit.php");

	// set headers
	header('Content-Type: application/json; charset=utf-8');
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");

	// set respond function
	function respond($type = "success", $msg, $data = null) {
		$res = array();
		$res["type"] = $type;
		$res["message"] = $msg;
		if (!empty($data)) {
			$res["data"] = $data;
		}
		echo json_encode($res, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
		die();
	}

	// start session
	session_start();
	if (!isset($_SESSION["state"]) || !isset($_GET["state"])) {
		$_SESSION["state"] = hash("sha256", strval(rand(100, 999)));
	}
	else if (isset($_GET["state"]) && intval($_GET["state"]) != $_SESSION["state"]) {
		http_response_code(409);
		respond("error", "Invalid value for GET key 'state'");
		exit();
	}

	// check code
	if (isset($_GET["code"]) && !empty($_GET["code"])) {
		$ch = curl_init();
		$postData = array(
			"client_id" => $clientID,
			"client_secret" => $clientSecret,
			"code" => $_GET["code"],
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
			$jsonResponse = json_decode($response, true);
			if (isset($jsonResponse["error"])) {
				http_response_code(500);
				respond("error", $jsonResponse["error"], $jsonResponse);
			}
			else {
				http_response_code(200);
				respond(null, "Access code retrieved", $jsonResponse);
			}
		}
		else {
			http_response_code(503);
			respond("error", "Could not exchange Intra authorization code for access token: service unavailable");
		}
	}
	else {
		// check action
		if (!isset($_GET["action"]) || empty($_GET["action"])) {
			http_response_code(400);
			respond("error", "GET key 'action' is not set, but is required to continue");
		}
		else {
			switch ($_GET["action"]) {
				case "start":
					http_response_code(302);
					header("Location: https://api.intra.42.fr/oauth/authorize?client_id=".$clientID."&redirect_uri=".urlencode($redirectURL)."&response_type=code&scope=".implode("%20", $scopes)."&state=".$_SESSION["state"]);
					respond(null, "Redirecting to authorization page... See Location field in header for URL");
					break;
				default:
					http_response_code(400);
					respond("error", "Invalid value for GET key 'action'");
					break;
			}
		}
	}
?>