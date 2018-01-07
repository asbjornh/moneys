<?php
  error_reporting(0);
  include "../../config.php";
  include "../vars.php";
  include "../functions.php";

  $reqCurrency = $_REQUEST["currency"];

  $conn = mysqli_connect($servername, $username, $password, $dbName);

  if ($conn) {
		$reqCurrency = mysqli_real_escape_string($conn, $reqCurrency);
		$query = "SELECT longName FROM $currenciesTable WHERE ticker='$reqCurrency'";
    $result = $conn->query($query);

		if ($result->num_rows == 1) {
			while ($row = mysqli_fetch_array($result)) {
				echo $row["longName"];	
			}
		}
  }

  function getCurrencyNames($conn, $table, $currencyListUrl) {
		if ($conn) {
			$query = "SELECT * FROM $table";
			$result = $conn->query($query);
			$hasStoredCurrencies = $result->num_rows > 0;
			
			$response = file_get_contents($currencyListUrl);
	
	    if ($response) {
	      $data = json_decode($response);
	      $currencies = get($data, "data");
	
	      foreach ($currencies as $currency) {
	        $ticker = $currency->id;
	        $longName = $currency->name;
	        $query = $hasStoredCurrencies
	        	? "UPDATE $table SET longName='$longName' WHERE ticker='$ticker'"
	        	: "INSERT INTO $table (ticker, longName) VALUES ('$ticker', '$longName')";
	        
	        if ($conn->query($query) != TRUE) {
	          echo $conn->error;
	        }
	      }
      }
    }
  }
?>