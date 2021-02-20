
# SeedPicker Solitaire

VERSION {.version}

SeedPicker Solitaire is a simple game for generating Bitcoin seed phrases offline using an ordinary deck of playing cards and a printed lookup table.

For technical details, see: [](){.project-page}

## Objective & Setup

The object of the game is to produce a random ordering of cards which yields the first 23 words of a Bitcoin seed phrase.
You'll need:

* An ordinary deck of playing cards.
* These instructions and the SeedPicker Solitaire lookup table, printed.

Lastly, find a quiet space without any cameras or listening devices.

## Procedure Part I - Ordering the Cards

Follow this procedure to produce a random ordering of cards.
This ordering will be mapped to seed words in Part II.

1. Shuffle the deck thoroughly.
1. Deal cards one at a time, face up, from the top of the deck in a line.
1. As soon as you have two cards in a row with DIFFERENT suits, this is called an *unsuited tuple*.
   Remove both cards and place them face up on the discard pile.
1. Continue dealing single cards and removing unsuited tuples until no cards remain in the deck.
1. When the deck is empty and all unsuited tuples have been discarded, take any remaining cards and place them face up on the discard pile.
1. Now all cards are in the discard pile.
   Turn the discard pile over, the game is done.

The deck now contains at least 23 consecutive unsuited tuples.
Each tuple maps to one Bitcoin seed word.

## Procedure Part II - Mapping Tuples to Words

Use the following procedure to convert each tuple into a seed word:

1. Deal one card from the deck face up.
1. Turn to the page in lookup table that has that card in the left-most (big) column.
1. Deal a second card from the deck face up.
1. Find the second card in the entries to the right.
1. Record the seed word.

For example, say the first card was the 4 of spades.
You'll find this on the first page of the lookup table.
Now say the second card is the 7 of diamonds.
In the table, you'll find that this yields the word 'bacon'.

Repeat the above steps until you've recorded your 23 seed words.
You're done!

NOTE: Producing the 24th word of a 24-word Bitcoin seed phrase is not doable offline because it contains a checksum.
For that you'll need special software or a Bitcoin wallet.

