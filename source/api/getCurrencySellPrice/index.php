<?php
  error_reporting(0);
  include "../../config.php";
  include "../vars.php";
  include "../functions.php";

  $ticker = $_REQUEST["ticker"];
  $currency = $_REQUEST["currency"];
  
	function getStoredData($conn, $sql) {
		$result = $conn->query($sql);

		if ($result->num_rows == 1) {
      // output data of each row
      while($row = mysqli_fetch_array($result)) {
        $age = time() - $row["lastUpdated"];
        $currency = $row["currency"];
        $id = $row["ID"];
        $longName = $row["longName"];
        $price = $row["price"];

        return array(
          "data" => array(
            "currency" => $currency,
            "longName" => $longName,
            "price" => $price
          ),
          "id" => $id,
          "isOutdated" => $age > 600
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
    $ticker = mysqli_real_escape_string($conn, $ticker);
    $currency = mysqli_real_escape_string($conn, $currency);
		$sql = "SELECT * FROM $stocksTable WHERE ticker='$ticker' AND currency='$currency'";
    $storedData = getStoredData($conn, $sql);
    $data = $storedData["data"];
    $id = $storedData["id"];
    $isOutdated = $storedData["isOutdated"];

    if ($data && !$isOutdated) {
      // return stored data
      echo json_encode($data);

    } else {
      // get new data
      $longName = file_get_contents($currencyNameUrl . "?currency=$ticker");
      $response = file_get_contents($currencyPriceUrl . $ticker . "-" . $currency . "/sell");

      if ($response) {
	      $json = json_decode($response);
        $stock = get($json, "data");

        if ($stock) {
          $currency = get($stock, "currency");
          $price = get($stock, "amount");
          
          echo json_encode([
            "currency" => $currency,
            "longName" => $longName,
            "price" => $price
          ]);

          if ($data && $id) {
            // update database
            $query = "UPDATE $stocksTable SET lastUpdated=". time() .", currency='$currency', longName='$longName', price='$price' WHERE ID=$id";
          } else {
            // insert new data into database
            $query = "INSERT INTO $stocksTable (currency, longName, lastUpdated, price, ticker) VALUES ('$currency', '$longName', '" . time() . "','$price', '$ticker')";
          }
        }
      }
    }

    if ($conn->query($query) != TRUE) {
      echo $conn->error;
    }

    mysqli_close($conn);
  }
?>