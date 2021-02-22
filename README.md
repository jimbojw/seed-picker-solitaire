
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

### What are the trade-offs of using the full deck?

Each word of a BIP39 seed phrase encodes 11 bits of data.
In total, a 24-word BIP39 seed phrase encodes 256 bits of entropy plus an 8 bit checksum.
The first 23 words are all entropy.
The 24th word contains 3 bits of entropy followed by the 8 bit checksum value.
(For more detail, see the [seed entropy playground](https://observablehq.com/@jimbojw/grokking-bip39)).

If you use only the first 23 words of a BIP39 seed for data, then the total number of entropy bits is 23 x 11 = 253.
If you shuffle and replace cards between each pick using the SeedPicker Solitaire lookup table, you can preserve all 253 bits.
Without replacing and reshuffling, entropy is lost.
This is because there are fewer orderings of cards that yield words than there are potential word combinations.
There will be no repeat words, or even repeated cards, using a SeedPicker Solitaire ordering.

So how much entropy remains when using the full deck as described in SeedPicker Solitaire?
The current best estimate is slightly more than **205 bits**.

How was this computed?
In three steps:

1. Run a simulation of shuffling and count how many of those shuffled orderings meet the criteria that they begin with at least 23 unsuited tuples.
2. Multiply this rate against the total number of possible orderings that could yield seeds (52!/6!).
3. Take the log base-2 of that estimate.

Code for performing this estimate is in the `src/sim-unsuited-bits.ts` file.
Here were the results from one execution of ten million runs:

```
{
  RUNS: 10000000,
  count: 6584,
  rate: 0.0006584,
  orderings: 1.1202524329297762e+65,
  estimate: 7.375742018409645e+61,
  bits: 205.52040198358318
}
```

Instructions for running this simulation, and other project commands, are in the last section of this document.

Is 205 bits enough?
In practice, yes.
Once a pubkey is revealed—which it must be to spend—the complexity of determining the private key is 2<sup>128</sup>.
(See [Pieter Wuille's explanation](https://bitcoin.stackexchange.com/questions/72612/bip32-recommends-a-256-bit-seed-why-do-most-bitcoin-wallets-only-use-a-128-bit/75588#75588)).
Additional entropy beyond 128 bits does not make a brute-force attacker's job harder.

### How much shuffling is enough?

The SeedPicker Solitaire instructions begin by requiring that the deck of cards is shuffled thoroughly.
But how much shuffling is enough?

To attempt to answer this question, let's quantify it.
A shuffled deck of cards has 52 card slots.
Let's number them from 0 through 51.

Ideally, each card should have an equal chance of showing up in each slot.
So for each slot, there are 52 possibilities, each of which should have a 1/52 chance of occurring.
Using the [Shannon entropy formula](https://en.wikipedia.org/wiki/Entropy_(information_theory)), each card slot represents up to 5.7 bits of entropy.

Now let's model the standard [riffle shuffle](https://en.wikipedia.org/wiki/Shuffling#Riffle).
In a riffle shuffle, the deck is cut in half and then interleaved.
In practice, cards are somewhat sticky, so let's model a stickiness parameter as well.

The code in `src/sim-sticky-shuffle.ts` does this.
The *stickiness* value is varied from 0.1 to 0.99.
A stickiness of 0 would mean that the riffle is carried out perfectly (alternating between left and right hands).
A stickiness of 1 would mean that the cards are perfectly sticky (never alternating, basically a cut).

For each stickiness value, the script models shuffling from 1 to 15 times.
For each stickiness/shuffle-count pair, the script runs 100,000 trials.
Then it computes the minimum entropy among the first 46 card slots.
(Recall that in SeedPicker Solitaire we use the top 46 cards as 23 word-yielding tuples.)

Since the entropy formula is base-agnostic, it's convenient to use base 52.
That way, the range of possible entropy values for any card slot is 0 (for perfectly predictable) to 1 (for maximally random).
Using .99 as the threshold for minimum acceptable entropy, the script produces the following table:

|     Shuffles |          0.1 |          0.5 |          0.8 |          0.9 |         0.95 |         0.99 |
| ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
|            1 |      0.17542 |      0.17542 |      0.17543 |      0.17542 |      0.17542 |      0.17542 |
|            2 |      0.51302 |      0.64649 |      0.72376 |      0.71830 |      0.63120 |      0.35372 |
|            3 |      0.78068 |      0.89638 |      0.90802 |      0.89663 |      0.82353 |      0.47697 |
|            4 |      0.94985 |      0.96936 |      0.97102 |      0.96335 |      0.91358 |      0.57082 |
|            5 |      0.98755 |  **0.99063** |  **0.99155** |      0.98781 |      0.95930 |      0.64507 |
|            6 |  **0.99823** |  **0.99762** |  **0.99767** |  **0.99601** |      0.98201 |      0.70915 |
|            7 |  **0.99953** |  **0.99928** |  **0.99930** |  **0.99877** |  **0.99173** |      0.75960 |
|            8 |  **0.99982** |  **0.99977** |  **0.99975** |  **0.99951** |  **0.99659** |      0.80027 |
|            9 |  **0.99989** |  **0.99989** |  **0.99987** |  **0.99983** |  **0.99845** |      0.83685 |
|           10 |  **0.99991** |  **0.99991** |  **0.99990** |  **0.99991** |  **0.99934** |      0.86174 |
|           11 |  **0.99989** |  **0.99991** |  **0.99991** |  **0.99990** |  **0.99969** |      0.88729 |
|           12 |  **0.99990** |  **0.99991** |  **0.99990** |  **0.99989** |  **0.99986** |      0.90726 |
|           13 |  **0.99992** |  **0.99990** |  **0.99989** |  **0.99990** |  **0.99990** |      0.92438 |
|           14 |  **0.99990** |  **0.99991** |  **0.99991** |  **0.99990** |  **0.99990** |      0.93679 |
|           15 |  **0.99991** |  **0.99990** |  **0.99990** |  **0.99988** |  **0.99991** |      0.94839 |

This result confirms the commonly reported result that **7 shuffles** is sufficient.
Even in a deck where cards have a 95% chance of sticking together when riffled, 7 shuffles produces outcomes that satisfy the .99 minimum entropy threshold for the slot with least entropy.
However, for a deck that is 99% sticky, even 15 shuffles is not sufficient to meet our minimum entropy threshold.

A few parameters that are not varied by the simulation script:

* *Bias in leading card choice* - The model assumes there's a 50/50 chance that the leading card of the riffle comes from either the left- or right-hand half of the cards.
* *Split point* - The model always cuts the deck exactly down the middle (26 cards in each hand).

These parameters could be varied to determine minimum shuffle count thresholds for various cases.

## Running the code

This repo contains several commands you can run which do different things.
To begin, you'll need Node.js.
Once that's installed, open a terminal and install this project's dependencies via npm:

```sh
$ npm install
```

To run a command, use this syntax:

```sh
$ num run <command-name>
```

Where `<command-name>` is one of the following:

* `make-table` - Produces a standalone HTML file called `lookup-table.html` that shows the mappings between card tuples and seed words.
  Also writes out `word-presence.txt`, a text file showing which tuples yield seed words (`#`) and which do not (`.`).
* `make-site` - Produces the PDF to be published to the live site.
  Also creates an `index.html` file which uses a `<meta>` tag to redirect to the PDF file.
* `publish-site` - Uses the `gh-pages` npm module to push the contents of the `dist/` directory up to the live site.
* `sim-sticky-shuffle` - Perform a simulation to compute the minimum entropy for various shuffling conditions.
* `sim-unsuited-bits` - Perform a simulation to compute the number of bits of entropy represented by seeds encoded using SeedPicker Solitaire.

Most commands also include a `-dev` variant which watches the `src/` directory for changes and automatically re-runs the code when files change.
