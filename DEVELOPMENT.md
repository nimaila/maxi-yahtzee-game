# Maxi Yahtzee Elite — Development Guide

A premium mobile dice game built with React Native and Expo, featuring full Maxi Yahtzee scoring, player statistics, and achievement badges. This guide is designed for developers taking over the project.

## Tech Stack

### Frontend
- **React Native 0.81** — Cross-platform mobile framework
- **Expo SDK 54** — Managed React Native development platform
- **TypeScript 5.9** — Type-safe JavaScript
- **Expo Router 6** — File-based routing (similar to Next.js)
- **NativeWind 4** — Tailwind CSS for React Native
- **React Native Reanimated 4** — 60fps animations and gestures
- **React Query (TanStack)** — Server state management

### Backend (Optional)
- **Node.js + Express** — API server
- **PostgreSQL + Drizzle ORM** — Database
- **tRPC** — End-to-end type-safe API

### Testing & Tooling
- **Vitest** — Unit testing framework
- **ESLint + Prettier** — Code quality and formatting
- **Metro Bundler** — React Native bundler

## Project Structure

```
maxi-yahtzee-game/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation (Home, Stats)
│   │   ├── index.tsx             # Home screen with neon design
│   │   ├── stats.tsx             # Player statistics & leaderboard
│   │   └── _layout.tsx           # Tab bar configuration
│   ├── setup.tsx                 # Game setup screen (modal)
│   ├── gameplay.tsx              # Main gameplay screen (modal)
│   ├── gameover.tsx              # Winner screen (modal)
│   ├── _layout.tsx               # Root layout with providers
│   └── oauth/callback.tsx        # OAuth redirect handler
├── components/                   # Reusable React components
│   ├── animated-dice.tsx         # 3D dice with rotation animations
│   ├── neon-effects.tsx          # Glowing buttons & cards
│   ├── achievement-badge.tsx     # Achievement display component
│   ├── score-celebration-modal.tsx # Score confirmation animation
│   └── screen-container.tsx      # SafeArea wrapper for all screens
├── lib/                          # Core logic & utilities
│   ├── game-engine.ts            # Maxi Yahtzee scoring logic (20 categories)
│   ├── game-context.tsx          # Global game state (React Context)
│   ├── stats-manager.ts          # Player stats & achievements persistence
│   ├── audio-manager.ts          # Sound effects & audio playback
│   ├── theme-provider.tsx        # Dark/light mode context
│   └── trpc.ts                   # tRPC client setup
├── tests/                        # Unit tests
│   ├── game-engine.test.ts       # 40 tests for scoring logic
│   └── stats-manager.test.ts     # 12 tests for statistics system
├── assets/images/                # App icons & splash screens
├── app.config.ts                 # Expo configuration (bundle IDs, plugins)
├── tailwind.config.js            # Tailwind CSS theme configuration
└── package.json                  # Dependencies & scripts
```

## Gameplay Mechanics

### Core Rules
- **Players**: 1-4 players per game
- **Turns**: 20 turns per player (one per scoring category)
- **Dice**: 1-6 configurable dice (default: 6)
- **Rolls**: 3 rolls per turn (configurable)
- **Scoring**: 20 Maxi Yahtzee categories:
  - **Upper section**: Ones, Twos, Threes, Fours, Fives, Sixes
  - **Lower section**: Pair, Two Pairs, Three Pairs, Three of a Kind, Four of a Kind, Five of a Kind, Small Straight (1-5), Big Straight (2-6), Full Straight (1-6), Full House, Villa, Tower, Chance, Maxi-Yahtzee (all same)

### Bonus System
- **Threshold**: Configurable (default: 75 points in upper section)
- **Bonus**: 50 points when threshold is met
- **Calculation**: Automatic after game ends

### Player Statistics
- **Tracked**: Wins, losses, best score, average score, total games
- **Persistence**: AsyncStorage (local device storage)
- **History**: Last 50 games with date, score, placement, opponents

### Achievement Badges
- **First Game** — Play your first game
- **Perfect Game** — Score 500+ points
- **Champion** — Win 10 games
- **Dice Master** — Play 50 games
- **Score Collector** — Accumulate 10,000 total points

## Design Decisions

### Visual Aesthetic
- **Color Scheme**: Premium neon (cyan #00D9FF, magenta #FF00FF, gold #FFD700) on deep black (#0F172A)
- **Typography**: Bold, high-contrast text with glowing shadows
- **Cards**: Glassmorphic design with semi-transparent borders and glow effects
- **Animations**: Smooth 60fps transitions using Reanimated 4

### Why These Choices?
1. **Neon Aesthetic** — Modern, premium feel that appeals to young adults; stands out in app stores
2. **Glassmorphism** — Trendy design pattern that feels "expensive" without complexity
3. **Reanimated 4** — Ensures smooth 60fps animations on low-end devices (critical for mobile)
4. **Local-First Stats** — AsyncStorage for instant responsiveness; no server latency

### Navigation Structure
- **Tab-based**: Home (game launch) and Stats (leaderboard) as persistent tabs
- **Modal stacks**: Setup, Gameplay, and GameOver as full-screen modals
- **Rationale**: Keeps main navigation clean; modals prevent accidental back navigation during gameplay

### State Management
- **React Context** — Simple, no external dependencies
- **AsyncStorage** — Local persistence for game state and statistics
- **Why not Redux?** — Overkill for this scope; Context + hooks is sufficient

## Known Issues & Limitations

### Audio
- **Web Support**: Uses Web Audio API (sine wave tones); native audio not available in browser
- **Mobile**: Requires `expo-audio` plugin; ensure `playsInSilentModeIOS` is enabled in app.config.ts
- **Limitation**: No background music yet (only dice roll & score sounds)

### Animations
- **Web Performance**: 3D dice rotation uses CSS transforms; may stutter on low-end browsers
- **Mobile**: Reanimated 4 requires native compilation; Expo Go preview may show reduced performance

### Statistics
- **Data Loss**: AsyncStorage has no backup; clearing app data deletes all stats
- **Sync**: No cloud sync; stats are device-local only
- **Leaderboard**: Currently local-only; no multiplayer comparison

### Routing
- **Web Preview**: Expo Router on web is experimental; some edge cases with modal navigation
- **Deep Links**: Not yet implemented; can't share game links

## Things to Consider for Future Development

### High Priority
1. **Cloud Backup** — Integrate Firebase or Supabase for stats backup and cross-device sync
2. **Multiplayer Online** — Real-time multiplayer using WebSocket (Socket.io or similar)
3. **Leaderboard** — Global leaderboard with friend comparison
4. **Push Notifications** — Remind users to play daily challenges

### Medium Priority
5. **Daily Challenges** — Time-limited game modes (e.g., "Score 300+ in 3 rolls")
6. **Streak System** — Consecutive day play tracking with rewards
7. **Themes** — Alternative color schemes (cyberpunk, retro, minimalist)
8. **Settings Screen** — Volume control, animation speed, difficulty levels

### Lower Priority
9. **Offline Mode** — Play without internet (already works, but needs testing)
10. **Accessibility** — Screen reader support, high-contrast mode
11. **Localization** — Multi-language support (currently English-only)
12. **Analytics** — Track user behavior, retention metrics

### Technical Debt
- **Testing**: Add E2E tests with Detox or Maestro
- **Performance**: Profile with React DevTools; optimize re-renders
- **Error Handling**: Add Sentry for crash reporting
- **Documentation**: Add JSDoc comments to all exported functions

## Running the Project

### Development
```bash
pnpm install
pnpm dev          # Start Metro bundler + dev server
# Scan QR code with Expo Go app on mobile
# Or open http://localhost:8081 in browser
```

### Testing
```bash
pnpm test                    # Run all tests
pnpm test game-engine        # Run specific test file
pnpm test --watch           # Watch mode
```

### Building
```bash
# Generate APK (Android)
eas build --platform android --profile preview

# Generate IPA (iOS)
eas build --platform ios --profile preview
```

## Code Style & Conventions

### File Organization
- **Components**: One component per file, named after the component (e.g., `animated-dice.tsx`)
- **Screens**: Named with screen name (e.g., `gameplay.tsx`)
- **Utilities**: Grouped by domain (e.g., `game-engine.ts`, `stats-manager.ts`)

### Naming Conventions
- **Components**: PascalCase (e.g., `AnimatedDice`)
- **Functions**: camelCase (e.g., `calculateScore`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`)
- **Types**: PascalCase with `I` prefix for interfaces (e.g., `IGameState`)

### Component Structure
```tsx
// Imports
import { useState } from 'react';
import { View, Text } from 'react-native';

// Types
interface Props {
  title: string;
  onPress: () => void;
}

// Component
export function MyComponent({ title, onPress }: Props) {
  const [state, setState] = useState(false);
  
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

## Debugging Tips

### Common Issues
1. **"Module not found"** — Run `pnpm install` and restart Metro
2. **Animations stuttering** — Check Reanimated worklet syntax; use `.runOnJS()` for JS callbacks
3. **Stats not persisting** — Check AsyncStorage permissions; verify key names in `stats-manager.ts`
4. **Audio not playing** — Ensure `playsInSilentModeIOS` is set; test on real device (simulator may not support audio)

### Useful Commands
```bash
pnpm lint              # Check code style
pnpm format            # Auto-format code
pnpm check             # TypeScript type check
pnpm test --coverage   # Test coverage report
```

## Handoff Checklist

Before handing off to another developer:
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm check`)
- [ ] Code formatted (`pnpm format`)
- [ ] README updated with any changes
- [ ] Latest checkpoint created in version control
- [ ] Known issues documented in this file
- [ ] Dependencies up-to-date (`pnpm update`)

## Contact & Support

For questions about specific features:
- **Game Engine**: See `lib/game-engine.ts` and `tests/game-engine.test.ts`
- **Stats System**: See `lib/stats-manager.ts` and `tests/stats-manager.test.ts`
- **UI Components**: See `components/` directory
- **Routing**: See `app/_layout.tsx` and `app/(tabs)/_layout.tsx`

Good luck! 🎲
