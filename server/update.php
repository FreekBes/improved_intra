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

	// set expected values per settings version (starts at version 1)
	// values start with an identifier: S for string, B for boolean, N for number (integer)
	// values with a * are required
	$client_version = 0;
	$latest_version = 1;
	$version_specifics = array(null);
	$version_defaults = array(null);
	array_push($version_specifics, array("S*username", "B*sync", "Stheme", "Bshow-custom-profiles", "Bclustermap", "Bcodam-monit"));
	array_push($version_defaults, array(null, true, "system", false, true, false));

	// check client settings version
	if (!isset($_GET["v"]) || empty($_GET["v"])) {
		respond("error", "GET key 'v' (version) is not set, but is required to continue");
	}
	else {
		$client_version = intval($_GET["v"]);
	}
	if (!isset($version_specifics[$client_version])) {
		respond("error", "Invalid settings version");
	}

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
			if (!isset($_POST[$key])) {
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

	// save settings for user
	if (file_put_contents("settings/".strval($userSettings["username"]).".json", json_encode($userSettings, JSON_UNESCAPED_UNICODE)) === false) {
		respond("error", "Could not save settings");
	}
	else {
		respond(null, "Settings saved");
	}
?>