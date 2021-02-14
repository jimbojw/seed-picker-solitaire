
# SeedPicker Solitaire

SeedPicker Solitaire is a simple technique for generating a BIP39 seed phrase offline using an ordinary deck of playing cards and a printed lookup table.

## Why playing cards?

The security of your Bitcoin rests on the security of your Bitcoin seeds.
As the saying goes, "Your keys, your coins. Not your keys, not your coins."

In turn, the security of your Bitcoin seeds derive from the entropy that those seeds encode.
Entropy is a fancy word from the field of information theory for randomness.
You can think of entropy like surprise.
The more surprising (less predictable) the data, the higher its entropy.

Computers have internal mechanisms for generating entropy called random number generators (RNGs).
For many applications, these sources of entropy are good enough.
But for storing your money, you may want more explicit control of the entropy generation process.

There are many ways to produce entropy for Bitcoin seeds in real life.
Examples include flipping coins, rolling dice, and picking words out of a hat.
SeedPicker Solitaire uses an ordinary deck of playing cards and a printed lookup table.

Playing cards are a good choice for many because:

1. Decks of cards are widely available and relatively cheap.
2. A shuffled deck of cards represents almost as much entropy as a 24-word seed (and way more than a 12-word seed).
3. No two decks of cards are perfectly alike in terms of wear.

TODO: Transition sentence.

## How does it work?

A standard deck of playing cards contains 52 cards: 13 ranks (A,2,3,4,5,6,7,8,9,10,J,Q,K) in each of 4 suits (spades, hearts, diamonds, clubs).
If you pick one card at random, there are 52 possibilities.
If you then pick a second card at random (without replacing the first card), there are 51 possibilities.
(Call these two randomly picked cards a "tuple").

Since there are 52 ways to pick the first card, and 51 ways to pick the second card, there are 52 x 51 = 2652 total ways to pick a tuple.
Compare this to the BIP39 seed word list, which contains 2048 words.
Because there are more possible tuples (2652) than there are seed word options (2048),
all we need is a lookup table that maps tuples to words in order to generate a seed phrase.

## Playing SeedPicker Solitaire

To play SeedPicker Solitaire, you'll need:

1. An ordinary deck of playing cards.
2. The SeedPicker Solitaire lookup table.

If you deck is missing cards, you can still use it, but the amount of entropy that it produces will be slightly less than would be produced by a full deck.
How much less is a function of how many cards are missing.

## Producing the Lookup Table

To run the code in this repo to produce the lookup table, you'll need Node.js.
Install Node.js, then install the prerequisites using the following command:

```sh
$ npm install
```

To make the table just once, run this command:

```sh
$ npm run make-table
```

To keep the table making code running continuously, run this command:

```sh
$ npm run make-table-dev
```

This code will create a `dist` directory if it doesn't already exist and place a file called `table.html` there.
