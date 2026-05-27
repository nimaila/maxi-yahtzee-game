# Maxi Yahtzee Elite — Project TODO

## Core Game Engine
- [x] Dice rolling logic (1-6 dice, random values 1-6)
- [x] Dice hold/reroll state management
- [x] Maxi Yahtzee scoring rules (all 20 categories)
- [x] Bonus calculation (75 pts threshold, 50 pts bonus)
- [x] Player turn management (1-4 players, 20 turns each)
- [x] Game state persistence (AsyncStorage)

## Setup Screen
- [x] Player count selector (1-4 buttons)
- [x] Player name input fields
- [x] Bonus threshold customization (default 75)
- [x] Throws per turn customization (default 3)
- [x] Dice count customization (default 6, range 1-6)
- [x] Start Game button with validation

## Gameplay Screen
- [x] Player info card (current player, turn, score)
- [x] Dice display grid (3×2 layout, interactive)
- [x] Dice hold/reroll interaction
- [x] Rolls remaining indicator
- [x] Scorecard with all 20 categories
- [x] Category selection and scoring
- [x] Prevent duplicate category scoring
- [x] Auto-advance to next player after scoring
- [x] Roll Dice button with haptic feedback

## Game Over Screen
- [x] Final scores display (ranked)
- [x] Winner highlight
- [x] Play Again button

## UI/UX & Design
- [ ] Premium glassmorphism aesthetic (deep black, glowing gradients)
- [ ] Double-bezel card architecture (nested borders)
- [ ] Smooth animations (dice roll, button press, transitions)
- [ ] Haptic feedback on interactions
- [ ] Mobile-responsive layout (portrait 9:16)
- [ ] Safe area handling (notch, home indicator)
- [ ] Dark mode support

## Visual Assets
- [x] Custom app logo/icon (square, 1024×1024)
- [x] Splash screen icon
- [x] Android adaptive icon (foreground, background, monochrome)
- [x] Favicon for web preview

## Testing & Polish
- [x] Test all 20 scoring categories with various dice combinations (40 unit tests passing)
- [x] Test player flow (1-4 players)
- [x] Test customizable rules (bonus, throws, dice count)
- [x] Test edge cases (invalid scores, all categories used)
- [ ] Performance optimization (smooth animations, no lag)
- [ ] Cross-platform testing (iOS, Android, Web)

## Deployment
- [ ] Create checkpoint
- [ ] Generate APK/IPA via Publish button
