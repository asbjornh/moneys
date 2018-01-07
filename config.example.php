<?php
	$servername = "url_to_db";
	$username = "username";
	$password = "password";
	$dbName = "dbname";
	$stocksTable = "tablename";
	$currenciesTable = "tablename";
	$exchangeRatesTable = "tablename";
	
	$moneysRoot = "http://your-website.com";

	$openExchangeRatesAppId = "your_app_id";

	/*
		MySQL tables:
			Stocks table:
				ID: int,
				ticker: varchar,
				lastUpdated: double,
				longName: varchar,
				currency: varchar,
				price: float

			Currencies table:
				ID: int,
				ticker: varchar,
				longName: varchar

			Exchange rates table:
				ID: int,
				lastUpdated: double,
				exchangeRates: longtext

	*/
?>