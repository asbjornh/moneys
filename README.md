# moneys

I made this small investment tracking dashboard because I couldn't find one that I liked. Instead of focusing on the total value of a portfolio, this app shows the gain / loss, which to me is more interesting. It supports most stocks and a couple of cryptocurrencies.

_Note: Coinbase is used for currency conversion, which might differ from the rates offered by your bank._

<img src="https://user-images.githubusercontent.com/13281350/33908951-4fb5061a-df8a-11e7-8957-759d2d45821e.png" width="409">

### First:

This app uses firebase for hosting. Before you build, make a copy of `firebase-init.example.json` and
rename it to `firebase-init.json`. Put [Firebase initialization options](https://firebase.google.com/docs/reference/js/firebase) in there.

### Then:

Install deps:

```
cd app/
yarn
```

Run the thing (in app folder):

```
yarn run dev
```

Build the thing (in app folder):

```
yarn run build
```

Deploy (in root directory):

```
firebase deploy
```

Deploying with firebase will also build the client code.

### Pro tip:

If you need to know the ticker / symbol of a stock, go to
[finance.yahoo.com](https://finance.yahoo.com/) and search for it there. The
search box will display the ticker / symbol in blue text:

![stock search](https://imgur.com/cULOAT5.png)
