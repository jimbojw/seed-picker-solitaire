
Live Site: [https://jimbojw.github.io/seed-picker-solitaire/](https://jimbojw.github.io/seed-picker-solitaire/)

# SeedPicker Solitaire

SeedPicker Solitaire is a simple game for generating a Bitcoin seed phrase offline using an ordinary deck of playing cards and a printed lookup table.

Go to the live site for usage instructions.
This page describes the project background and technical details.

## Why SeedPicker Solitaire?

In short, because your Bitcoin seed is as secure as the entropy that it encodes, and playing cards are good sources of entropy.
To understand what this means, we should start with a brief explanation of entropy then describe the benefits for producing it.

### Why does entropy matter?

*BECAUSE YOUR SECURITY DEPENDS ON IT!*

The security of your Bitcoin rests on the security of your Bitcoin seeds which generate your keys.
As the saying goes, "Your keys, your coins. Not your keys, not your coins."

In turn, the security of your Bitcoin seeds derive from the *entropy* that those seeds encode.
Entropy is a fancy word from the field of information theory that means "randomness".
You can think of entropy like surprise.
The more surprising (less predictable) the data, the higher its entropy.

Computers have internal mechanisms for generating entropy called random number generators (RNGs).
For many applications, these sources of entropy are good enough.
But for protecting your Bitcoin, you may want more explicit control of the entropy generation process.

There are many ways of producing random data.
Common examples include flipping coins or rolling dice.
SeedPicker Soliataire uses an ordinary deck of playing cards.

### Why use playing cards?

Playing cards are a good choice for generating entropy because:

1. Decks of cards are widely available and relatively cheap.
2. A shuffled deck of cards represents almost as much entropy as a 24-word seed (and significantly more than a 12-word seed).
3. No two decks of cards are perfectly alike in terms of wear.

Importantly, the skill of randomizing cards (shuffling) is widely practiced and learnable.

### How does the lookup table work?

Your Bitcoin seed is basically a big random number.
Worse, it's an important big random number because it protects your Bitcoin.
And while big random numbers are easy for computers to handle, they pose a challenge for humans.
People are generally not good at working with numbers with many significant digits, and in Bitcoin the stakes are high.

The BIP39 standard was developed to help with this.
It uses a list of 2048 words where each word corresponds to 11 bits of data.
For example, the word 'abandon' encodes the binary number `00000000000`.
The word 'clutch' encodes `00101100100`, 'trade' encodes `11100110101`, and so on.
(To explore this relationship, click to flip bits in the [seed entropy playground](https://observablehq.com/@jimbojw/grokking-bip39)).

The goal of the SeedPicker Solitaire lookup table is to map card values to BIP39 seed words.
Since there are 52 ways to pick a card from a deck, and 51 ways to pick a second card, there are 52x51=2652 ways to pick a tuple.
This is more than enough to map tuples to seed words, of which there are only 2048.
But because there are more tuples than seed words, not all tuples will yield a word.
Those tuples are blank in the lookup table.

The lookup table has been designed to make it relatively easy to determine whether a tuple will yield a seed word.
In particular, the algorithm used to assign words to tuples ensures the following properties:

- *Unsuited tuples always yield words*.
  Any tuple of cards of different suits (an unsuited tuple) will yield a seed word.
  All of the blanks in the table are same-suited tuples.
- *Suited tuples that yield words are rare*.
  In all, there are only 20 seed words which are the result of drawing a suited tuple of cards.
  All suited tuples that yield words use only Aces, 2's, Queens and Kings.
  Specifically, they are A-K/K-A, 2-K/K-2 (all four suits), or A-Q/Q-A (diamonds and clubs only).

Due to these properties, one shortcut is to always pick tuples that are unsuited.
This is a quick and easy operation for a person to perform, compared to looking up the tuple in the table.

The downside of this suit-based shortcut is that there are 20 of the 2048 words which would never be picked.
So instead of each word encoding 11 bits of entropy, it encodes roughly 10.98 bits.

## Running the code

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

This code will create a `dist` directory if it doesn't already exist and place a file called `lookup-table.html` there.
