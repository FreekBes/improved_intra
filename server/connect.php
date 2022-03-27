<?php
	@session_start();

	// set headers
	header('Content-Type: text/html; charset=utf-8');
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");

	// set respond function
	function respond($type, $msg, $data = null) {
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8' />
		<title>Connect Improved Intra 42 with your Intranet account</title>
		<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
		<link rel="icon" type="image/ico" href="favicon.ico" />
	</head>
	<body>
		<code style="display: none;" id="result"><?php echo json_encode($data, JSON_UNESCAPED_UNICODE); ?></code>
<?php
	switch ($type) {
		case "redirect":
?>
		<h1>Redirecting...</h1>
		<p>If you are not redirected automatically, click here: <a href="<?php echo get_auth_page_url(); ?>" target="_self"><?php echo get_auth_page_url(); ?></a></p>
<?php
			break;
		case "success":
?>
		<h1>Authentication succesful</h1>
		<p>Improved Intra 42 is now connected to your Intranet account.<br><span id="action">You can safely close this tab.</span><br><small id="clicker" style="display: none;">Or click <a id="redir_link" href="#" target="_self">here</a> if you are not being redirected...</small></p>
<?php
			break;
		case "error":
?>
		<h1>An error occurred</h1>
		<p>An error occurred while authorizing with your Intranet 42 account.</p>
		<details>
			<summary><?php echo $data["auth"]["error_description"]; ?></summary>
			<code><?php echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT); ?></code>
		</details>
<?php
			break;
	}
?>
	</body>
</html>
<?php
		die();
	}

	// include authorization methods
	require_once("auth.php");

	// check code
	if (isset($_GET["code"]) && !empty($_GET["code"])) {
		$res = exchange($_GET["code"], "authorization_code");
		if (empty($res)) {
			http_response_code(503);
			respond("error", "Could not exchange Intra authorization code for access token: service unavailable");
		}
		else {
			if (isset($res["auth"]["error"])) {
				switch ($res["auth"]["error"]) {
					case "invalid_scope":
						http_response_code(400);
						break;
					case "invalid_grant":
						http_response_code(401);
						break;
					case "unsupported_grant_type":
					case "unauthorized_client":
					case "invalid_request":
					case "invalid_client":
					default:
						http_response_code(500);
						break;
				}
				respond("error", $res["auth"]["error"], $res);
			}
			else {
				http_response_code(200);
				respond("success", "Access code retrieved", $res);
			}
		}
	}
	else {
		http_response_code(302);
		header("Location: ".get_auth_page_url());
		respond("redirect", "Redirecting to authorization page... See Location field in header for URL");
	}
?>
