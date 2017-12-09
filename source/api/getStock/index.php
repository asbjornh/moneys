<?php
  error_reporting(0);
  include "../../config.php";
  include "../vars.php";
  include "../functions.php";

  $ticker = $_REQUEST["ticker"];
  
	function getStoredData($conn, $table, $ticker) {
		$sql = "SELECT * FROM $table WHERE ticker='$ticker'";
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
    $storedData = getStoredData($conn, $stocksTable, $ticker);
    $data = $storedData["data"];
    $id = $storedData["id"];
    $isOutdated = $storedData["isOutdated"];

    if ($data && !$isOutdated) {
      // return stored data
      echo json_encode($data);

    } else {
      // get new data
      $response = json_decode(
        file_get_contents($stockUrl . $ticker . "?formatted=false&modules=price")
      );
      $resultArray = get($response, "quoteSummary.result", []);
      $stock = get($resultArray[0], "price");

      if ($stock) {
        $shortName = get($stock, "shortName");
        $currency = get($stock, "currency");
        $longName = get($stock, "longName", $shortName);
        $price = get($stock, "regularMarketPrice");
        
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

    if ($conn->query($query) != TRUE) {
      echo $conn->error;
    }

    mysqli_close($conn);
  }
?>