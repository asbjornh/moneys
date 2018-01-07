<?php
  error_reporting(0);
  include "../../config.php";
  include "../vars.php";

  $currency = $_REQUEST["currency"];
  
	function getStoredData($conn, $table, $currency) {
		$sql = "SELECT * FROM $table WHERE currency='$currency'";
		$result = $conn->query($sql);

		if ($result->num_rows == 1) {
      // output data of each row
      while($row = mysqli_fetch_array($result)) {
        $age = time() - $row["lastUpdated"];

        return array(
          "cryptos" => $row["cryptos"],
          "id" => $row["ID"],
          "isOutdated" => $age > 300
        );
      }
		} else {
      return array(
        "cryptos" => FALSE
      );
		}
	}

  // Create DB connection
  $conn = mysqli_connect($servername, $username, $password, $dbName);

  if ($conn) {
    $currency = mysqli_real_escape_string($conn, $currency);
    $storedData = getStoredData($conn, $cryptosTable, $currency);
    $cryptos = $storedData["cryptos"];
    $id = $storedData["id"];
    $isOutdated = $storedData["isOutdated"];

    if ($cryptos && !$isOutdated) {
      // return stored data
      echo $cryptos;

    } else {
      // get new data
      $queryString = $currency != "USD" ? "?convert=" . $currency : "";
      
      $response = file_get_contents($cryptoCurrenciesUrl . $queryString);

      if ($response) {
        echo $response;

        if ($cryptos && $id) {
          // update database
          $query = "UPDATE $cryptosTable SET lastUpdated=". time() .", cryptos='$response' WHERE ID=$id";
        } else {
          // insert new data into database
          $query = "INSERT INTO $cryptosTable (currency, lastUpdated, cryptos) VALUES ('$currency', '" . time() . "','$response')";
        }
      }
    }

    if ($conn->query($query) != TRUE) {
      echo $conn->error;
    }

    mysqli_close($conn);
  }
?>