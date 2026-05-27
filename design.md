# Maxi Yahtzee Elite — Mobile App Design

## Overview

A premium, modern Maxi Yahtzee game for 1–4 players on mobile devices. The app features an ethereal glass aesthetic with deep OLED blacks, glowing gradients, and fluid interactions optimized for one-handed portrait play.

---

## Screen List

1. **Home/Splash Screen** — App branding and "New Game" entry point
2. **Setup Screen** — Player configuration (1-4 players) and customizable game rules
3. **Gameplay Screen** — Active game with dice rolling, player turns, and scorecard
4. **Game Over Screen** — Final scores and replay option

---

## Primary Content and Functionality

### Home/Splash Screen
- **Content:** App logo, title "Maxi Yahtzee Elite", tagline
- **Functionality:** "New Game" button to navigate to Setup Screen

### Setup Screen
- **Player Selection:** Toggle buttons for 1, 2, 3, or 4 players
- **Customizable Rules:**
  - **Bonus Threshold:** Minimum points for bonus (default: 75 pts)
  - **Throws per Turn:** Number of dice rolls allowed (default: 3, range: 1–5)
  - **Dice Count:** Number of dice to use (default: 6, range: 1–6)
- **Player Names:** Optional input fields for each player
- **Start Button:** Begins the game

### Gameplay Screen
- **Player Info Card:** Current player, turn number (e.g., "Player 1 — Turn 3/20"), current score
- **Dice Display:** 6 interactive dice in a 3×2 grid (or fewer if dice count < 6)
  - Tappable to hold/reroll
  - 3D rendered with soft shadows and glows
  - Shows current values
- **Rolls Remaining:** Indicator showing how many rolls are left in the turn
- **Scorecard:** Two-column layout of all 20 Maxi Yahtzee categories
  - Upper section: Ones, Twos, Threes, Fours, Fives, Sixes (with bonus indicator)
  - Lower section: Pair, Two Pairs, Three Pairs, Three of a Kind, Four of a Kind, Five of a Kind, Small Straight (15 pts), Big Straight (20 pts), Full Straight (21 pts), Full House, Villa, Tower, Chance, Maxi-Yahtzee (100 pts)
  - Clickable categories to score the current dice roll
  - Grayed-out categories already used
- **Roll Dice Button:** Large, prominent button at bottom

### Game Over Screen
- **Final Scores:** Ranked list of all players with final scores
- **Winner Highlight:** Top player highlighted
- **Replay Button:** Returns to Setup Screen

---

## Key User Flows

### Flow 1: Setup & Start Game
1. User taps "New Game" on Home Screen
2. User selects number of players (1–4)
3. User optionally enters player names
4. User adjusts game rules (bonus, throws, dice count) if desired
5. User taps "Start Game"
6. App navigates to Gameplay Screen with Player 1 active

### Flow 2: Roll & Score
1. User taps "Roll Dice" button
2. Dice animate and settle on random values
3. User can tap individual dice to hold them (visual feedback: highlighted border)
4. User taps "Roll Dice" again to reroll non-held dice
5. After 3 rolls (or fewer if user chooses), user selects a scoring category
6. Dice values are validated against category rules
7. Score is added to player's total
8. Turn passes to next player (or game ends if all turns used)

### Flow 3: Game Completion
1. After all 20 turns per player, Game Over Screen appears
2. Final scores displayed in ranked order
3. User taps "Play Again" to return to Setup Screen

---

## Color Choices

### Ethereal Glass Aesthetic
- **Background:** Deep OLED black (`#050505`)
- **Primary Accent:** Glowing purple (`#7C3AED`) with emerald tint (`#10B981`)
- **Card Shells:** Semi-transparent dark (`rgba(255, 255, 255, 0.05)`) with hairline borders
- **Text (Primary):** Pure white (`#FFFFFF`)
- **Text (Secondary):** Muted light gray (`#A0AEC0`)
- **Dice:** Cream/ivory (`#F5F3FF`) with soft shadows
- **Success/Score:** Emerald green (`#10B981`)
- **Disabled/Used:** Muted gray (`#4B5563`)

### Typography
- **Headings (H1):** Large, bold, premium sans-serif (Geist or similar)
- **Body Text:** Medium weight, readable sans-serif
- **Numbers/Scores:** Monospace or bold for emphasis

### Spacing & Layout
- **Macro Whitespace:** Heavy padding (`py-24` to `py-40` between sections)
- **Card Padding:** Generous internal spacing (`p-6` to `p-8`)
- **Dice Grid:** 3×2 layout with `gap-4` spacing
- **Scorecard:** Two-column grid with `gap-3` spacing

### Shadows & Depth
- **Soft Ambient Shadows:** Diffused, low-opacity shadows on cards
- **Dice Shadows:** 3D depth with subtle drop shadows
- **Glow Effects:** Subtle radial gradients around interactive elements on hover

### Animations
- **Dice Roll:** Smooth spin animation (400–600ms)
- **Button Press:** Scale down to 0.97 with haptic feedback
- **Category Selection:** Fade and slide animation
- **Transitions:** Custom cubic-bezier curves for smooth, premium feel

---

## Responsive Design (Mobile-First)

- **Portrait Orientation Only:** 9:16 aspect ratio (standard phone)
- **One-Handed Usage:** All interactive elements within thumb reach
- **Safe Area Handling:** Content respects notch and home indicator
- **Scroll Behavior:** Scorecard scrolls vertically if needed; dice area always visible

---

## Interaction Patterns

### Dice Interaction
- **Tap to Hold:** Visual feedback (border highlight, slight scale)
- **Tap to Release:** Visual feedback (border fade, scale reset)
- **Held Dice:** Remain in place during reroll

### Category Selection
- **Tap Category:** Validates roll, shows score preview
- **Confirm Score:** Adds to player total, advances turn
- **Used Categories:** Grayed out, non-interactive

### Player Turns
- **Turn Indicator:** Clear display of current player and turn number
- **Auto-Advance:** After scoring, automatically moves to next player
- **Visual Transition:** Smooth fade/slide when switching players

---

## Accessibility

- **High Contrast:** White text on dark backgrounds
- **Large Touch Targets:** Buttons and dice are large enough for easy tapping
- **Clear Feedback:** Visual and haptic feedback for all interactions
- **Readable Fonts:** Sans-serif with good line height for readability
