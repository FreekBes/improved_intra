<?PHP
	session_start();

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

	// redirect to delete.php if sync == false, this request is probably a misdirected one then
	if (isset($_POST["sync"]) && $_POST["sync"] === "false" || $_POST["sync"] === 0) {
		http_response_code(307);
		header("Location: delete.php");
		die();
	}

	// include authorization methods
	require_once("auth.php");

	// set expected values per settings version (starts at version 1)
	// values start with an identifier: S for string, B for boolean, N for number (integer)
	// values with a * are required
	$client_version = 0;
	$latest_version = 1;
	$version_specifics = array(null);
	$version_defaults = array(null);
	array_push($version_specifics, array("S*access_token", "S*username", "B*sync", "S*expires_in", "S*created_at", "S*refresh_token", "Stheme", "Scolors", "Bshow-custom-profiles", "Bhide-broadcasts", "Bclustermap", "Bcodam-monit"));
	array_push($version_defaults, array(null, null, true, null, null, null, "system", "default", false, false, true, true));
	$neverSave = array("access_token", "expires_in", "created_at", "refresh_token");

	// check client settings version
	if (!isset($_GET["v"]) || empty($_GET["v"])) {
		http_response_code(400);
		respond("error", "GET key 'v' (version) is not set, but is required to continue");
	}
	else {
		$client_version = intval($_GET["v"]);
	}
	if (!isset($version_specifics[$client_version])) {
		http_response_code(400);
		respond("error", "Invalid value for GET key 'settings'");
	}

	// trim entire post array
	$_POST = array_map("trim", $_POST);

	// check if expected and required post fields are set
	// save setting to variable if they exist, else get the default configuration
	$userSettings = array();
	$key = null;
	$keyReq = false;
	$keyType = null;
	for ($i = 0; $i < count($version_specifics[$client_version]); $i++) {
		$key = $version_specifics[$client_version][$i];
		$keyType = $key[0];
		$keyReq = $key[1] == '*';
		if ($keyReq) {
			$key = substr($key, 2);
			if (!isset($_POST[$key]) || empty($_POST[$key])) {
				http_response_code(400);
				respond("error", "POST key '".$key."' is not set, but is required to continue");
			}
		}
		else {
			$key = substr($key, 1);
		}
		if (isset($_POST[$key]) && !empty($_POST[$key])) {
			switch ($keyType) {
				case "S":
					$userSettings[$key] = $_POST[$key];
					break;
				case "B":
					$userSettings[$key] = ($_POST[$key] == "true" || intval($_POST[$key]) > 0);
					break;
				case "N":
					$userSettings[$key] = intval($_POST[$key]);
					break;
			}
		}
		else {
			$userSettings[$key] = $version_defaults[$client_version][$i];
		}
	}

	// do some security checks before modifiying files...
	if ($userSettings["username"] == "null" || $userSettings["username"] == "undefined") {
		http_response_code(403);
		respond("warning", "Invalid username");
		die();
	}
	if (preg_match('/[^a-z\-]/', $userSettings["username"])) {
		http_response_code(406);
		respond("warning", "Are you proud of yourself?");
		die();
	}

	// check if username matches the one found using the access token provided...
	// refresh_access_token_if_needed($userSettings["refresh_token"], intval($userSettings["created_at"]), intval($userSettings["expires_in"]));
	$userInfoFromIntra = get_user_info($userSettings["access_token"]);
	if ($userSettings["username"] != $userInfoFromIntra["login"]) {
		http_response_code(403);
		respond("error", "Username does not match the one found using the access token provided", $userInfoFromIntra);
		die();
	}

	// remove keys that we do not want to save
	for ($i = 0; $i < count($neverSave); $i++) {
		if (isset($userSettings[$neverSave[$i]])) {
			unset($userSettings[$neverSave[$i]]);
		}
	}

	// save settings for user
	if (file_put_contents("settings/".strval($userSettings["username"]).".json", json_encode($userSettings, JSON_UNESCAPED_UNICODE)) === false) {
		http_response_code(500);
		respond("error", "Could not save settings", $userSettings);
	}
	else {
		http_response_code(201);
		respond("success", "Settings saved", $userSettings);
	}
?>
