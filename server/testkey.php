<?php
	@session_start();

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

	// include authorization methods
	require_once("auth.php");

	if (!isset($_POST["access_token"]) || empty($_POST["access_token"])) {
		http_response_code(400);
		respond("error", "Missing access token");
		die();
	}

	$userInfoFromIntra = get_user_info($_POST["access_token"]);
	if (empty($userInfoFromIntra) || isset($userInfoFromIntra["error"])) {
		http_response_code(410);
		respond("error", "Access token no longer works", $userInfoFromIntra);
		die();
	}
	else {
		http_response_code(200);
		respond("success", "Access token still works", $userInfoFromIntra);
		die();
	}
?>
