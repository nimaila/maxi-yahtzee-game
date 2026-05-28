/**
 * Maxi Yahtzee Game Engine
 * Core logic for dice rolling, scoring, and game state management
 */

export type ScoringCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "pair"
  | "twoPairs"
  | "threePairs"
  | "threeOfAKind"
  | "fourOfAKind"
  | "fiveOfAKind"
  | "smallStraight"
  | "bigStraight"
  | "fullStraight"
  | "fullHouse"
  | "villa"
  | "tower"
  | "chance"
  | "maxiYahtzee";

export interface GameRules {
  bonusThreshold: number; // Default: 75
  throwsPerTurn: number; // Default: 3, range: 1-5
  diceCount: number; // Default: 6, range: 1-6
}

export interface Player {
  id: string;
  name: string;
  scores: Partial<Record<ScoringCategory, number>>;
  totalScore: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: number; // 1-20
  currentDice: number[];
  heldDice: boolean[]; // Which dice are held
  rollsRemaining: number;
  rules: GameRules;
  gameOver: boolean;
  winner?: string; // Player ID
}

/**
 * Roll dice and return random values
 */
export function rollDice(count: number, heldIndices: boolean[] = []): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    if (heldIndices[i]) {
      // Keep held dice value (will be replaced with current value)
      result.push(-1); // Placeholder
    } else {
      result.push(Math.floor(Math.random() * 6) + 1);
    }
  }
  return result;
}

/**
 * Update dice values, preserving held dice
 */
export function updateDiceWithHeld(
  currentDice: number[],
  newRoll: number[],
  heldIndices: boolean[]
): number[] {
  return currentDice.map((die, i) => (heldIndices[i] ? die : newRoll[i]));
}

/**
 * Count occurrences of each die value
 */
function countDice(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 6; i++) {
    counts[i] = dice.filter((d) => d === i).length;
  }
  return counts;
}


/**
 * Calculate score for a given category.
 *
 * Scoring follows standard Maxi Yahtzee (Norwegian) rules:
 *  - Pair/Two Pairs/Three Pairs: sum of MATCHING dice only
 *  - Three/Four/Five of a Kind: sum of the matching dice only
 *  - Small Straight: exactly 1-2-3-4-5 present → 15 pts
 *  - Big Straight: exactly 2-3-4-5-6 present → 20 pts
 *  - Full Straight: all six values 1-6 → 21 pts
 *  - Full House: 3 of a kind + pair (different values), sum those 5 dice
 *  - Villa: two sets of 3, sum all 6 dice
 *  - Tower: four of a kind + pair, sum all 6 dice
 *  - Chance: sum of all dice
 *  - Maxi-Yahtzee: all dice same → 100 pts
 *
 * Returns null when the roll does not satisfy the category.
 */
export function calculateScore(dice: number[], category: ScoringCategory): number | null {
  const sum = dice.reduce((a, b) => a + b, 0);
  const fc = countDice(dice); // fc[v] = count of face value v

  switch (category) {
    // ── Upper section ──────────────────────────────────────────────────────────
    case "ones":   return dice.filter((d) => d === 1).reduce((a, b) => a + b, 0);
    case "twos":   return dice.filter((d) => d === 2).reduce((a, b) => a + b, 0);
    case "threes": return dice.filter((d) => d === 3).reduce((a, b) => a + b, 0);
    case "fours":  return dice.filter((d) => d === 4).reduce((a, b) => a + b, 0);
    case "fives":  return dice.filter((d) => d === 5).reduce((a, b) => a + b, 0);
    case "sixes":  return dice.filter((d) => d === 6).reduce((a, b) => a + b, 0);

    // ── Pairs ──────────────────────────────────────────────────────────────────
    case "pair": {
      // Highest pair: v × 2
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 2) return v * 2;
      }
      return null;
    }
    case "twoPairs": {
      // Two highest distinct pairs: sum of those four dice
      const pairs: number[] = [];
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 2) pairs.push(v);
        if (pairs.length === 2) break;
      }
      if (pairs.length < 2) return null;
      return pairs[0] * 2 + pairs[1] * 2;
    }
    case "threePairs": {
      // Three distinct pairs: sum of all six pair-dice
      const pairs: number[] = [];
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 2) pairs.push(v);
        if (pairs.length === 3) break;
      }
      if (pairs.length < 3) return null;
      return pairs[0] * 2 + pairs[1] * 2 + pairs[2] * 2;
    }

    // ── Of a kind ──────────────────────────────────────────────────────────────
    case "threeOfAKind": {
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 3) return v * 3;
      }
      return null;
    }
    case "fourOfAKind": {
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 4) return v * 4;
      }
      return null;
    }
    case "fiveOfAKind": {
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 5) return v * 5;
      }
      return null;
    }

    // ── Straights ──────────────────────────────────────────────────────────────
    case "smallStraight": {
      // Must contain 1-2-3-4-5 (the 6th die is irrelevant)
      const u = new Set(dice);
      return [1, 2, 3, 4, 5].every((v) => u.has(v)) ? 15 : null;
    }
    case "bigStraight": {
      // Must contain 2-3-4-5-6 (the 6th die is irrelevant)
      const u = new Set(dice);
      return [2, 3, 4, 5, 6].every((v) => u.has(v)) ? 20 : null;
    }
    case "fullStraight": {
      // All six distinct values 1-6
      return new Set(dice).size === 6 ? 21 : null;
    }

    // ── House variants ─────────────────────────────────────────────────────────
    case "fullHouse": {
      // 3 of a kind + pair (different values); score = 3×threeVal + 2×pairVal
      let threeVal: number | null = null;
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 3 && threeVal === null) { threeVal = v; }
      }
      if (threeVal === null) return null;
      for (let v = 6; v >= 1; v--) {
        if (v !== threeVal && fc[v] >= 2) return threeVal * 3 + v * 2;
      }
      return null;
    }
    case "villa": {
      // Two sets of three; score = sum of all 6 dice
      const threes: number[] = [];
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 3) threes.push(v);
        if (threes.length === 2) break;
      }
      if (threes.length < 2) return null;
      return threes[0] * 3 + threes[1] * 3;
    }
    case "tower": {
      // Four of a kind + pair (different values); score = sum of all 6 dice
      let fourVal: number | null = null;
      for (let v = 6; v >= 1; v--) {
        if (fc[v] >= 4 && fourVal === null) { fourVal = v; }
      }
      if (fourVal === null) return null;
      for (let v = 6; v >= 1; v--) {
        if (v !== fourVal && fc[v] >= 2) return fourVal * 4 + v * 2;
      }
      return null;
    }

    // ── Specials ───────────────────────────────────────────────────────────────
    case "chance":
      return sum;
    case "maxiYahtzee":
      // All dice show the same face
      return new Set(dice).size === 1 ? 100 : null;

    default:
      return null;
  }
}

/**
 * Calculate upper section bonus
 */
export function calculateBonus(
  scores: Partial<Record<ScoringCategory, number>>,
  threshold: number
): number {
  const upperScores = [
    scores.ones ?? 0,
    scores.twos ?? 0,
    scores.threes ?? 0,
    scores.fours ?? 0,
    scores.fives ?? 0,
    scores.sixes ?? 0,
  ];
  const upperTotal = upperScores.reduce((a, b) => a + b, 0);
  return upperTotal >= threshold ? 50 : 0;
}

/**
 * Calculate total score for a player
 */
export function calculateTotalScore(
  scores: Partial<Record<ScoringCategory, number>>,
  rules: GameRules
): number {
  const allScores = Object.values(scores).reduce((a, b) => a + (b ?? 0), 0);
  const bonus = calculateBonus(scores, rules.bonusThreshold);
  return allScores + bonus;
}

/**
 * Initialize a new game
 */
export function initializeGame(
  playerNames: string[],
  rules: GameRules
): GameState {
  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    scores: {},
    totalScore: 0,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    currentTurn: 1,
    currentDice: Array(rules.diceCount).fill(0),
    heldDice: Array(rules.diceCount).fill(false),
    rollsRemaining: rules.throwsPerTurn,
    rules,
    gameOver: false,
  };
}

/**
 * Start a new turn (roll initial dice)
 */
export function startTurn(state: GameState): GameState {
  const newDice = rollDice(state.rules.diceCount);
  return {
    ...state,
    currentDice: newDice,
    heldDice: Array(state.rules.diceCount).fill(false),
    rollsRemaining: state.rules.throwsPerTurn - 1, // First roll counts as 1
  };
}

/**
 * Reroll non-held dice
 */
export function rerollDice(state: GameState): GameState {
  if (state.rollsRemaining <= 0) return state;

  const newRoll = rollDice(state.rules.diceCount);
  const updatedDice = updateDiceWithHeld(state.currentDice, newRoll, state.heldDice);

  return {
    ...state,
    currentDice: updatedDice,
    rollsRemaining: state.rollsRemaining - 1,
  };
}

/**
 * Toggle held status of a die
 */
export function toggleHeldDie(state: GameState, index: number): GameState {
  const newHeld = [...state.heldDice];
  newHeld[index] = !newHeld[index];
  return {
    ...state,
    heldDice: newHeld,
  };
}

/**
 * Score the current dice and advance turn
 */
export function scoreAndAdvance(
  state: GameState,
  category: ScoringCategory
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  // Check if category already scored
  if (currentPlayer.scores[category] !== undefined) {
    return state; // Invalid move
  }

  // Calculate score
  const score = calculateScore(state.currentDice, category);
  if (score === null) {
    // Invalid score for this category, but allow it as per Yahtzee rules
    // (player can score 0 in any category)
  }

  // Update player scores
  const updatedPlayers = state.players.map((p, i) => {
    if (i === state.currentPlayerIndex) {
      const newScores = { ...p.scores, [category]: score ?? 0 };
      return {
        ...p,
        scores: newScores,
        totalScore: calculateTotalScore(newScores, state.rules),
      };
    }
    return p;
  });

  // Check if game is over (all 20 categories scored)
  const allCategoriesScored = Object.keys(updatedPlayers[state.currentPlayerIndex].scores).length === 20;
  const allPlayersFinished = updatedPlayers.every((p) => Object.keys(p.scores).length === 20);

  // Advance to next player or end game
  let nextPlayerIndex = state.currentPlayerIndex + 1;
  let nextTurn = state.currentTurn;

  if (nextPlayerIndex >= updatedPlayers.length) {
    nextPlayerIndex = 0;
    nextTurn += 1;
  }

  // Find winner (highest total score)
  let winner: string | undefined;
  if (allPlayersFinished) {
    const maxScore = Math.max(...updatedPlayers.map((p) => p.totalScore));
    winner = updatedPlayers.find((p) => p.totalScore === maxScore)?.id;
  }

  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    currentTurn: nextTurn,
    currentDice: Array(state.rules.diceCount).fill(0),
    heldDice: Array(state.rules.diceCount).fill(false),
    rollsRemaining: state.rules.throwsPerTurn,
    gameOver: allPlayersFinished,
    winner,
  };
}

/**
 * Get available scoring categories for current player
 */
export function getAvailableCategories(state: GameState): ScoringCategory[] {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const allCategories: ScoringCategory[] = [
    "ones",
    "twos",
    "threes",
    "fours",
    "fives",
    "sixes",
    "pair",
    "twoPairs",
    "threePairs",
    "threeOfAKind",
    "fourOfAKind",
    "fiveOfAKind",
    "smallStraight",
    "bigStraight",
    "fullStraight",
    "fullHouse",
    "villa",
    "tower",
    "chance",
    "maxiYahtzee",
  ];

  return allCategories.filter((cat) => currentPlayer.scores[cat] === undefined);
}

/**
 * Get category display name
 */
export function getCategoryName(category: ScoringCategory): string {
  const names: Record<ScoringCategory, string> = {
    ones: "Ones",
    twos: "Twos",
    threes: "Threes",
    fours: "Fours",
    fives: "Fives",
    sixes: "Sixes",
    pair: "Pair",
    twoPairs: "Two Pairs",
    threePairs: "Three Pairs",
    threeOfAKind: "Three of a Kind",
    fourOfAKind: "Four of a Kind",
    fiveOfAKind: "Five of a Kind",
    smallStraight: "Small Straight",
    bigStraight: "Big Straight",
    fullStraight: "Full Straight",
    fullHouse: "Full House",
    villa: "Villa",
    tower: "Tower",
    chance: "Chance",
    maxiYahtzee: "Maxi-Yahtzee",
  };
  return names[category];
}

/**
 * Get category points (if fixed)
 */
export function getCategoryPoints(category: ScoringCategory): string | null {
  const points: Partial<Record<ScoringCategory, string>> = {
    smallStraight: "15 pts",
    bigStraight: "20 pts",
    fullStraight: "21 pts",
    maxiYahtzee: "100 pts",
  };
  return points[category] ?? null;
}
