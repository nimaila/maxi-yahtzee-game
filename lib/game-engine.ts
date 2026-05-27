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
 * Get sorted counts in descending order
 */
function getSortedCounts(dice: number[]): number[] {
  const counts = countDice(dice);
  return Object.values(counts).sort((a, b) => b - a);
}

/**
 * Check if dice form a straight
 */
function isStraight(dice: number[], length: number): boolean {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);
  if (sorted.length < length) return false;

  for (let i = 0; i <= sorted.length - length; i++) {
    let isConsecutive = true;
    for (let j = 1; j < length; j++) {
      if (sorted[i + j] !== sorted[i + j - 1] + 1) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return true;
  }
  return false;
}

/**
 * Calculate score for a given category
 * Returns null if the roll doesn't match the category
 */
export function calculateScore(dice: number[], category: ScoringCategory): number | null {
  const sum = dice.reduce((a, b) => a + b, 0);
  const counts = getSortedCounts(dice);

  switch (category) {
    // Upper section: sum of matching values
    case "ones":
      return dice.filter((d) => d === 1).reduce((a, b) => a + b, 0);
    case "twos":
      return dice.filter((d) => d === 2).reduce((a, b) => a + b, 0);
    case "threes":
      return dice.filter((d) => d === 3).reduce((a, b) => a + b, 0);
    case "fours":
      return dice.filter((d) => d === 4).reduce((a, b) => a + b, 0);
    case "fives":
      return dice.filter((d) => d === 5).reduce((a, b) => a + b, 0);
    case "sixes":
      return dice.filter((d) => d === 6).reduce((a, b) => a + b, 0);

    // Pairs and combinations
    case "pair":
      return counts[0] >= 2 ? sum : null;
    case "twoPairs":
      return counts[0] >= 2 && counts[1] >= 2 ? sum : null;
    case "threePairs":
      return counts[0] >= 2 && counts[1] >= 2 && counts[2] >= 2 ? sum : null;

    // Of a kind
    case "threeOfAKind":
      return counts[0] >= 3 ? sum : null;
    case "fourOfAKind":
      return counts[0] >= 4 ? sum : null;
    case "fiveOfAKind":
      return counts[0] >= 5 ? sum : null;

    // Straights
    case "smallStraight":
      return isStraight(dice, 5) ? 15 : null;
    case "bigStraight":
      // Check if we have 2-6 straight (no 1)
      const hasBigStraight = isStraight(dice, 5) && !dice.includes(1);
      return hasBigStraight ? 20 : null;
    case "fullStraight":
      return isStraight(dice, 6) ? 21 : null;

    // Full House and variants
    case "fullHouse":
      return counts[0] >= 3 && counts[1] >= 2 ? sum : null;
    case "villa":
      return counts[0] >= 3 && counts[1] >= 3 ? sum : null;
    case "tower":
      return counts[0] >= 4 && counts[1] >= 2 ? sum : null;

    // Chance and Maxi-Yahtzee
    case "chance":
      return sum;
    case "maxiYahtzee":
      return counts[0] === 6 ? 100 : null;

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
