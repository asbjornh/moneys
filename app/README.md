# moneys

I made this small investment tracking dashboard because I couldn't find one that I liked. Instead of focusing on the total value of a portfolio, this app shows the gain / loss, which to me is more interesting. It supports most stocks and a couple of cryptocurrencies.

_Note: Coinbase is used for currency conversion, which might differ from the rates offered by your bank._

<img src="https://user-images.githubusercontent.com/13281350/33908951-4fb5061a-df8a-11e7-8957-759d2d45821e.png" width="409">

### First:

Before you build, make a copy of `config.example.json` and
rename it to `config.json`. There is an optional proxy API (PHP and MySQL) in this repo, so if you want to use this, put URLs to your server in config.json. If you use the API, you also need to make a config.php and put your info in there (see `config.example.php`)

### Then:

Install deps:

```
yarn
```

Run the thing:

```
yarn run dev
```

Build the thing (if you want to put it on a server):

```
yarn run build
```

### Pro tip:

If you need to know the ticker / symbol of a stock, go to
[https://finance.yahoo.com/](finance.yahoo.com) and search for it there. The
search box will display the ticker / symbol in blue text:

![stock search](https://imgur.com/cULOAT5.png)
