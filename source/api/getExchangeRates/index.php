<?php
  error_reporting(0);
  include "../../config.php";
  include "../vars.php";
  include "../functions.php";
  
	function getStoredData($conn, $query) {
		$result = $conn->query($query);

		if ($result->num_rows == 1) {
      // output data of each row
      while($row = mysqli_fetch_array($result)) {
        $age = time() - $row["lastUpdated"];
        $data = $row["exchangeRates"];
        $id = $row["ID"];

        return array(
          "data" => $data,
          "id" => $id,
          "isOutdated" => $age > 3600
        );
      }
		} else {
      return array(
        "data" => FALSE
      );
		}
	}

  // Create DB connection
  $conn = mysqli_connect($servername, $username, $password, $dbName);

  if ($conn) {
		$query = "SELECT * FROM $exchangeRatesTable WHERE 1";
    $storedData = getStoredData($conn, $query);
    $data = $storedData["data"];
    $id = $storedData["id"];
    $isOutdated = $storedData["isOutdated"];

    if ($data && !$isOutdated) {
      // return stored data
      echo $data;

    } else {
      // get new data
      $response = file_get_contents($exchangeRatesUrl);

      if ($response) {
        echo $response;

        if ($data && $id) {
          // update database
          $query = "UPDATE $exchangeRatesTable SET lastUpdated=". time() .", exchangeRates='$response' WHERE ID=$id";
        } else {
          // insert new data into database
          $query = "INSERT INTO $exchangeRatesTable (lastUpdated, exchangeRates) VALUES ('" . time() . "','$response')";
        }
      }
    }

    if ($conn->query($query) != TRUE) {
      echo $conn->error;
    }

    mysqli_close($conn);
  }
?>