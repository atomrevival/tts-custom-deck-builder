# Tabletop Simulator Custom Deck Builder

Use multiple image files and create a grid image that can be used with importing custom deck for TTS.

## Prerequisites

- pnpm

## Install and run

Install all dependencies

```sh
pnpm install
```

Start application

```sh
pnpm start
```

---

## How to use

- Upload multiple image files using the "Upload Images" button
- Images automatically adjust to MTG card proportions (5:7 ratio)
- Adjust grid dimensions (rows/columns) as needed
- Use "Auto Arrange" to automatically position images in order
- Manually adjust image positions using the position input in the image list
- Download the final grid as a high-resolution PNG image

## Limitations

As of writing, TTS only allows up to 69 cards (70th card is the hidden card).

If you're playing Commander, you'll have to make 2 separate grid images and import the two and meld them as one deck.

## Adding custom decks to TTS

Instructions can be found here: https://kb.tabletopsimulator.com/custom-content/custom-deck/

## Contributions

All contributions are welcome. :)