<?php
  error_reporting(0);
  include "../vars.php";

  $date = $_REQUEST["date"];
  $appId = $_REQUEST["appId"];

  echo file_get_contents($historicalCurrenciesUrl . $date . ".json?app_id=" . $appId);
?>