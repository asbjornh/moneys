<?php
	error_reporting(0);
	include "../vars.php";

	$symbol = $_REQUEST["symbol"];

  echo file_get_contents($stockUrl . $symbol . "?formatted=false&modules=price");
?>