# Sound Files

This directory should contain the following sound effect files:

- `card-draw.mp3` - Sound when drawing cards
- `card-select.mp3` - Sound when selecting/deselecting a card
- `card-play.mp3` - Sound when playing a hand
- `card-discard.mp3` - Sound when discarding cards
- `chip-count.mp3` - Sound for chip counting animation
- `score-increase.mp3` - Sound when score increases
- `round-win.mp3` - Sound when winning a round
- `round-lose.mp3` - Sound when losing a round
- `shop-purchase.mp3` - Sound when purchasing from shop
- `button-click.mp3` - Generic button click sound
- `blind-select.mp3` - Sound when selecting a blind
- `joker-activate.mp3` - Sound when a joker effect activates
- `error.mp3` - Error/invalid action sound

All sound files should be in MP3 format for broad browser compatibility.

## Adding Sound Files

1. Place your MP3 files in this directory
2. Name them exactly as listed above
3. Keep file sizes reasonable (under 100KB per sound)
4. Use 44.1kHz sample rate for best compatibility

## License Considerations

Make sure any sound files you add are either:
- Created by you
- Licensed for use in your project
- From royalty-free sound libraries

## Testing

The sound system will gracefully handle missing files by logging warnings to the console but not breaking the game.