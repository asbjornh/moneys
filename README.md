# moneys

This simple investment tracking dashboard tries to answer one question: "How
many moneys?". Or, in grown up-talk, what is the current value of your
portfolio? 🎩

Your bank / investment platform can tell you this but then you'd have to log in
all the time... Probably two factor authentication even 😩.

Server optional. Uses local storage. Draws pretty graph. iOS web app capable.

_Note: Open Exchange Rates is used for currency conversion, which might differ
from the rates offered by your bank._

<img src="https://i.imgur.com/RSVlIeO.png" width="400">

### First:

To make it work you need an openexchangerates API key from
[https://openexchangerates.org](here). Make a copy of `config.example.json`,
rename it to `config.json` and paste your API key in there.

### Then:

Install the thing:

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
