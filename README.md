
# SeedPicker Solitaire

SeedPicker Solitaire is a simple technique for generating a BIP39 seed phrase offline using an ordinary deck of playing cards and a printed lookup table.

## Why does entropy matter?

*BECAUSE YOUR SECURITY DEPENDS ON IT!*

The security of your Bitcoin rests on the security of your Bitcoin seeds which generate your keys.
As the saying goes, "Your keys, your coins. Not your keys, not your coins."

In turn, the security of your Bitcoin seeds derive from the *entropy* that those seeds encode.
Entropy is a fancy word from the field of information theory that means "randomness".
You can think of entropy like surprise.
The more surprising (less predictable) the data, the higher its entropy.

Computers have internal mechanisms for generating entropy called random number generators (RNGs).
For many applications, these sources of entropy are good enough.
But for storing your Bitcoin, you may want more explicit control of the entropy generation process.

This project helps you generate Bitcoin seed entropy using an ordinary deck of playing cards.

## Why use playing cards?

Playing cards are excellent sources of entropy.
They're widely available and relatively inexpensive.

Playing cards are a good choice for generating entropy because:

1. Decks of cards are widely available and relatively cheap.
2. A shuffled deck of cards represents almost as much entropy as a 24-word seed (and more than a 12-word seed).
3. No two decks of cards are perfectly alike in terms of wear.

Importantly, the skill of randomizing cards (shuffling) is widely practiced and learnable.

## How to generate a single seed word

What you'll need:

* An ordinary deck of playing cards.
* The SeedPicker Solitaire [lookup table](dist/lookup-table.html), printed.

Procedure:

1. Shuffle the deck thoroughly.
2. Deal two cards (a tuple) face up from the top of the deck.
3. Look up the matching seed word from the table for that tuple.
4. If there is no matching word, repeat.

Because there are more possible tuples (2652) than there are seed words (2048), it's possible that the top two cards of the deck will not yield a seed word.
This occurs roughly a quarter of the time.

To simplify the procedure, in the case of a miss, you can simply deal another card from the top until you hit two in a row that yield a seed word.

Note that the lookup table has been designed to make it relatively easy to determine whether a tuple will yield a seed word.
In particular, the algorithm used to assign word indexes to tuples ensures the following properties:

- *Unsuited tuples always yield words*.
  Any tuple of cards of different suits (an unsuited tuple) will yield a seed word.
  All of the blanks in the table are same-suited tuples.
- *Suited tuples that yield words are rare*.
  In all, there are only 20 seed words which are the result of drawing a suited tuple of cards.
  All suited tuples that yield words use only Aces, 2's, Queens and Kings.
  Specifically, they are A-K/K-A, 2-K/K-2, or A-Q/Q-A.

Due to these properties, one shortcut is to always pick tuples that are unsuited.
This is a quick and easy operation to perform, compared to looking up the tuple in the table.

The downside of this suit-based shortcut is that there are 20 of the 2048 words which would never be picked.
So instead of each word encoding 11 bits of entropy, it encodes roughly 10.98 bits.

## How to generate the first 23-words of a seed

The BIP39 standard allows for Bitcoin seed phrases consisting of between 12 and 24 words.
SeedPicker Solitaire is designed for the full 24 word variant.

One method of generating 23 seed words is to repeat the single word procedure 23 times.
This has the advantage of preserving all 253 bits of entropy encoded in the 23 words (or 252.67 bits using the always-unsuited variant).

Another method is to generate a random ordering of the full deck such that each successive tuple yields a seed word.
The first 46 cards in such an ordering collectively yield 23 words.
Creating such an ordering is the objective of SeedPicker Solitaire.

Playing SeedPicker Solitaire:

1. Shuffle the deck thoroughly.
2. Deal cards from the top of the deck face up in a line until the last two cards are unsuited.
3. Remove the two unsuited cards and place them face up in the discard pile.
4. Continue dealing cards and removing unsuited tuples until all cards have been dealt.
5. Place any remaining cards in the discard pile.

Flip the discard pile over, face down.
Starting from the top, your deck now has a random ordering of at least 23 unsuited tuples.
(There's less that a 1 in 100,000 chance that the ordering will end with 8 or more suited cards, yielding less than 23 tuples).




## How to compute the 24th word of a seed

While the first 23 words can be chosen entirely at random, the 24th word encodes not only entropy, but also a *checksum*.
A checksum is a number which has particular properties and is used to ensure the correctness of the data.
In a BIP39 seed phrase, each word encodes 11 bits.
In the 24-word variant, the 24th word encodes 3 bits of entropy, and an 8-bit checksum.

The checksum is not practically computable by hand offline.
So instead, SeedPicker Solitaire leaves the computation of the final word to the wallet software that eventually receives the seed.


## How does SeedPicker Solitaire work?

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
