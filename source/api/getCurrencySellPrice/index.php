<?php
  error_reporting(0);
  include "../vars.php";

  $currencyPair = $_REQUEST["currencyPair"];

  echo file_get_contents($currencyPriceUrl . $currencyPair . "/sell");
?>