import { describe, it, expect } from "vitest";
import {
  calculateScore,
  calculateBonus,
  calculateTotalScore,
  initializeGame,
  startTurn,
  rerollDice,
  toggleHeldDie,
  scoreAndAdvance,
  getAvailableCategories,
} from "../lib/game-engine";
import { GameRules } from "../lib/game-engine";

describe("Game Engine - Scoring Logic", () => {
  const defaultRules: GameRules = {
    bonusThreshold: 75,
    throwsPerTurn: 3,
    diceCount: 6,
  };

  describe("Upper Section Scoring", () => {
    it("should score ones correctly", () => {
      const dice = [1, 1, 3, 4, 5, 6];
      expect(calculateScore(dice, "ones")).toBe(2);
    });

    it("should score twos correctly", () => {
      const dice = [1, 2, 2, 4, 5, 6];
      expect(calculateScore(dice, "twos")).toBe(4);
    });

    it("should score sixes correctly", () => {
      const dice = [1, 2, 3, 6, 6, 6];
      expect(calculateScore(dice, "sixes")).toBe(18);
    });

    it("should return 0 when no matching dice", () => {
      const dice = [2, 3, 4, 5, 6, 2];
      expect(calculateScore(dice, "ones")).toBe(0);
    });
  });

  describe("Pair Scoring", () => {
    it("should score a pair", () => {
      const dice = [2, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "pair")).toBe(22);
    });

    it("should score two pairs", () => {
      const dice = [2, 2, 3, 3, 5, 6];
      expect(calculateScore(dice, "twoPairs")).toBe(21);
    });

    it("should score three pairs", () => {
      const dice = [1, 1, 2, 2, 3, 3];
      expect(calculateScore(dice, "threePairs")).toBe(12);
    });

    it("should return null for pair when no pairs", () => {
      const dice = [1, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "pair")).toBeNull();
    });

    it("should return null for two pairs when only one pair", () => {
      const dice = [1, 1, 2, 3, 4, 5];
      expect(calculateScore(dice, "twoPairs")).toBeNull();
    });
  });

  describe("Of a Kind Scoring", () => {
    it("should score three of a kind", () => {
      const dice = [3, 3, 3, 4, 5, 6];
      expect(calculateScore(dice, "threeOfAKind")).toBe(24);
    });

    it("should score four of a kind", () => {
      const dice = [4, 4, 4, 4, 5, 6];
      expect(calculateScore(dice, "fourOfAKind")).toBe(27);
    });

    it("should score five of a kind", () => {
      const dice = [5, 5, 5, 5, 5, 6];
      expect(calculateScore(dice, "fiveOfAKind")).toBe(31);
    });

    it("should return null for three of a kind when only two", () => {
      const dice = [2, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "threeOfAKind")).toBeNull();
    });
  });

  describe("Straight Scoring", () => {
    it("should score small straight (1-5)", () => {
      const dice = [1, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "smallStraight")).toBe(15);
    });

    it("should score big straight (2-6)", () => {
      const dice = [2, 3, 4, 5, 6, 6];
      expect(calculateScore(dice, "bigStraight")).toBe(20);
    });

    it("should score full straight (1-6)", () => {
      const dice = [1, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "fullStraight")).toBe(21);
    });

    it("should return null for small straight when not consecutive", () => {
      const dice = [1, 2, 3, 4, 6, 6];
      expect(calculateScore(dice, "smallStraight")).toBeNull();
    });

    it("should return null for big straight when includes 1", () => {
      const dice = [1, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "bigStraight")).toBeNull();
    });
  });

  describe("Full House and Variants", () => {
    it("should score full house (3 of a kind + pair)", () => {
      const dice = [3, 3, 3, 2, 2, 1];
      expect(calculateScore(dice, "fullHouse")).toBe(14);
    });

    it("should score villa (two three of a kinds)", () => {
      const dice = [2, 2, 2, 3, 3, 3];
      expect(calculateScore(dice, "villa")).toBe(15);
    });

    it("should score tower (four of a kind + pair)", () => {
      const dice = [4, 4, 4, 4, 2, 2];
      expect(calculateScore(dice, "tower")).toBe(20);
    });

    it("should return null for full house without pair", () => {
      const dice = [3, 3, 3, 4, 5, 6];
      expect(calculateScore(dice, "fullHouse")).toBeNull();
    });
  });

  describe("Chance and Maxi-Yahtzee", () => {
    it("should score chance (sum of all dice)", () => {
      const dice = [1, 2, 3, 4, 5, 6];
      expect(calculateScore(dice, "chance")).toBe(21);
    });

    it("should score maxi-yahtzee (all same)", () => {
      const dice = [5, 5, 5, 5, 5, 5];
      expect(calculateScore(dice, "maxiYahtzee")).toBe(100);
    });

    it("should return null for maxi-yahtzee when not all same", () => {
      const dice = [5, 5, 5, 5, 5, 4];
      expect(calculateScore(dice, "maxiYahtzee")).toBeNull();
    });
  });

  describe("Bonus Calculation", () => {
    it("should award 50 point bonus when threshold met", () => {
      const scores = {
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 25,
        sixes: 0,
      };
      const bonus = calculateBonus(scores, 75);
      expect(bonus).toBe(50);
    });

    it("should not award bonus when threshold not met", () => {
      const scores = {
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 0,
        sixes: 0,
      };
      const bonus = calculateBonus(scores, 75);
      expect(bonus).toBe(0);
    });

    it("should award bonus at exact threshold", () => {
      const scores = {
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 25,
        sixes: 0,
      };
      const bonus = calculateBonus(scores, 75);
      expect(bonus).toBe(50);
    });
  });

  describe("Total Score Calculation", () => {
    it("should calculate total with bonus", () => {
      const scores = {
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 25,
        sixes: 0,
        pair: 10,
      };
      const total = calculateTotalScore(scores, defaultRules);
      expect(total).toBe(135); // 85 + 50 bonus
    });

    it("should calculate total without bonus", () => {
      const scores = {
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 0,
        sixes: 0,
        pair: 10,
      };
      const total = calculateTotalScore(scores, defaultRules);
      expect(total).toBe(60); // 60, no bonus
    });
  });

  describe("Game State Management", () => {
    it("should initialize game with correct number of players", () => {
      const playerNames = ["Alice", "Bob"];
      const gameState = initializeGame(playerNames, defaultRules);

      expect(gameState.players).toHaveLength(2);
      expect(gameState.players[0].name).toBe("Alice");
      expect(gameState.players[1].name).toBe("Bob");
      expect(gameState.currentPlayerIndex).toBe(0);
      expect(gameState.currentTurn).toBe(1);
    });

    it("should start turn with rolled dice", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      const turnState = startTurn(gameState);

      expect(turnState.currentDice).toHaveLength(6);
      expect(turnState.rollsRemaining).toBe(2); // 3 throws - 1 initial roll
      expect(turnState.currentDice.every((d) => d >= 1 && d <= 6)).toBe(true);
    });

    it("should toggle held dice", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      const turnState = startTurn(gameState);

      const heldState = toggleHeldDie(turnState, 0);
      expect(heldState.heldDice[0]).toBe(true);

      const unHeldState = toggleHeldDie(heldState, 0);
      expect(unHeldState.heldDice[0]).toBe(false);
    });

    it("should reroll non-held dice", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      const turnState = startTurn(gameState);

      // Hold first die
      const heldState = toggleHeldDie(turnState, 0);
      const originalFirstDie = heldState.currentDice[0];

      // Reroll
      const rerolledState = rerollDice(heldState);
      expect(rerolledState.currentDice[0]).toBe(originalFirstDie);
      expect(rerolledState.rollsRemaining).toBe(1);
    });

    it("should prevent reroll when no rolls remaining", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      let turnState = startTurn(gameState);

      // Use all rolls
      turnState = rerollDice(turnState);
      turnState = rerollDice(turnState);

      expect(turnState.rollsRemaining).toBe(0);

      const noRerollState = rerollDice(turnState);
      expect(noRerollState.rollsRemaining).toBe(0);
    });

    it("should score and advance to next player", () => {
      const gameState = initializeGame(["Player 1", "Player 2"], defaultRules);
      const turnState = startTurn(gameState);

      const scoredState = scoreAndAdvance(turnState, "ones");

      expect(scoredState.currentPlayerIndex).toBe(1);
      expect(scoredState.players[0].scores.ones).toBeDefined();
    });

    it("should get available categories", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      const turnState = startTurn(gameState);

      const available = getAvailableCategories(turnState);
      expect(available).toHaveLength(20);

      const scoredState = scoreAndAdvance(turnState, "ones");
      const availableAfter = getAvailableCategories(scoredState);
      expect(availableAfter).toHaveLength(19);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all dice with same value", () => {
      const dice = [3, 3, 3, 3, 3, 3];
      expect(calculateScore(dice, "threes")).toBe(18);
      expect(calculateScore(dice, "maxiYahtzee")).toBe(100);
      expect(calculateScore(dice, "chance")).toBe(18);
    });

    it("should handle dice with value 1", () => {
      const dice = [1, 1, 1, 1, 1, 1];
      expect(calculateScore(dice, "ones")).toBe(6);
      expect(calculateScore(dice, "maxiYahtzee")).toBe(100);
    });

    it("should calculate correct bonus at different thresholds", () => {
      const scores = {
        ones: 10,
        twos: 10,
        threes: 10,
        fours: 10,
        fives: 10,
        sixes: 10,
      };

      expect(calculateBonus(scores, 50)).toBe(50);
      expect(calculateBonus(scores, 60)).toBe(50);
      expect(calculateBonus(scores, 61)).toBe(0);
    });
  });
});
