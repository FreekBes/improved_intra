<?PHP
	// set headers
	header('Content-Type: application/json; charset=utf-8');
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");

	// set respond function
	function respond($type = "success", $msg) {
		$data = array();
		$data["type"] = $type;
		$data["message"] = $msg;
		echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
		die();
	}

	// trim entire post array
	$_POST = array_map("trim", $_POST);

	if (!isset($_POST["username"]) || empty($_POST["username"])) {
		http_response_code(400);
		respond("error", "POST key 'username' is not set, but is required to delete the settings of a user");
	}
	else {
		// do some security checks before modifiying files...
		if ($_POST["username"] == "null" || $_POST["username"] == "undefined") {
			http_response_code(403);
			respond("warning", "Invalid username");
			die();
		}
		if (preg_match('/[^a-z\-]/', $_POST["username"])) {
			http_response_code(406);
			respond("warning", "Are you proud of yourself?");
			die();
		}

		// delete settings of user
		if (unlink("settings/".strval($_POST["username"]).".json") === true) {
			http_response_code(200);
			respond(null, "User settings have been deleted");
		}
		else {
			http_response_code(500);
			respond("error", "Could not delete user settings");
		}
	}
?>