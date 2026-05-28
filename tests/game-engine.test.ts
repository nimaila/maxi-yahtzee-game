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
      expect(calculateScore([1, 1, 3, 4, 5, 6], "ones")).toBe(2);
    });
    it("should score twos correctly", () => {
      expect(calculateScore([1, 2, 2, 4, 5, 6], "twos")).toBe(4);
    });
    it("should score sixes correctly", () => {
      expect(calculateScore([1, 2, 3, 6, 6, 6], "sixes")).toBe(18);
    });
    it("should return 0 when no matching dice", () => {
      expect(calculateScore([2, 3, 4, 5, 6, 2], "ones")).toBe(0);
    });
  });

  describe("Pair Scoring", () => {
    it("should score the highest pair only (not all dice)", () => {
      // [2,2,3,4,5,6] → pair = 2×2 = 4
      expect(calculateScore([2, 2, 3, 4, 5, 6], "pair")).toBe(4);
    });
    it("should pick the highest pair when multiple pairs exist", () => {
      // [2,2,5,5,3,4] → best pair is 5s = 5×2 = 10
      expect(calculateScore([2, 2, 5, 5, 3, 4], "pair")).toBe(10);
    });
    it("should score two pairs (sum of those four dice only)", () => {
      // [2,2,3,3,5,6] → 2×2 + 3×2 = 10
      expect(calculateScore([2, 2, 3, 3, 5, 6], "twoPairs")).toBe(10);
    });
    it("should score three pairs (sum of all six pair-dice)", () => {
      // [1,1,2,2,3,3] → 1×2 + 2×2 + 3×2 = 12
      expect(calculateScore([1, 1, 2, 2, 3, 3], "threePairs")).toBe(12);
    });
    it("should return null for pair when no pairs", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 6], "pair")).toBeNull();
    });
    it("should return null for two pairs when only one pair", () => {
      expect(calculateScore([1, 1, 2, 3, 4, 5], "twoPairs")).toBeNull();
    });
    it("should return null for three pairs when only two pairs", () => {
      expect(calculateScore([1, 1, 2, 2, 3, 4], "threePairs")).toBeNull();
    });
  });

  describe("Of a Kind Scoring", () => {
    it("should score three of a kind (sum of those three dice only)", () => {
      // [3,3,3,4,5,6] → 3×3 = 9
      expect(calculateScore([3, 3, 3, 4, 5, 6], "threeOfAKind")).toBe(9);
    });
    it("should score four of a kind (sum of those four dice only)", () => {
      // [4,4,4,4,5,6] → 4×4 = 16
      expect(calculateScore([4, 4, 4, 4, 5, 6], "fourOfAKind")).toBe(16);
    });
    it("should score five of a kind (sum of those five dice only)", () => {
      // [5,5,5,5,5,6] → 5×5 = 25
      expect(calculateScore([5, 5, 5, 5, 5, 6], "fiveOfAKind")).toBe(25);
    });
    it("should pick the highest triplet when multiple groups exist", () => {
      // [3,3,3,4,4,4] → best triplet is 4s = 4×3 = 12
      expect(calculateScore([3, 3, 3, 4, 4, 4], "threeOfAKind")).toBe(12);
    });
    it("should return null for three of a kind when only two", () => {
      expect(calculateScore([2, 2, 3, 4, 5, 6], "threeOfAKind")).toBeNull();
    });
  });

  describe("Straight Scoring", () => {
    it("should score small straight (requires 1-2-3-4-5)", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 6], "smallStraight")).toBe(15);
    });
    it("should score small straight with a repeated 6th die", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 5], "smallStraight")).toBe(15);
    });
    it("should return null for small straight without 1-5 (e.g. 2-6)", () => {
      expect(calculateScore([2, 3, 4, 5, 6, 6], "smallStraight")).toBeNull();
    });
    it("should score big straight (requires 2-3-4-5-6)", () => {
      expect(calculateScore([2, 3, 4, 5, 6, 6], "bigStraight")).toBe(20);
    });
    it("should score big straight from a full-straight roll (1-6 contains 2-6)", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 6], "bigStraight")).toBe(20);
    });
    it("should return null for big straight without 2-6", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 5], "bigStraight")).toBeNull();
    });
    it("should score full straight (all six values 1-6)", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 6], "fullStraight")).toBe(21);
    });
    it("should return null for full straight with duplicates", () => {
      expect(calculateScore([1, 2, 3, 4, 6, 6], "fullStraight")).toBeNull();
    });
  });

  describe("Full House and Variants", () => {
    it("should score full house: sum of the 3+2 dice only (kicker excluded)", () => {
      // [3,3,3,2,2,1] → 3×3 + 2×2 = 13 (the 1 is the kicker, not counted)
      expect(calculateScore([3, 3, 3, 2, 2, 1], "fullHouse")).toBe(13);
    });
    it("should score full house with 6-dice exact fill", () => {
      // [4,4,4,2,2,2] → this is a villa, but also a valid full house (picks 4s as three, 2s as pair)
      // Actually [4,4,4,5,5,1] → 4×3 + 5×2 = 22
      expect(calculateScore([4, 4, 4, 5, 5, 1], "fullHouse")).toBe(22);
    });
    it("should score villa (two sets of 3): sum all 6", () => {
      expect(calculateScore([2, 2, 2, 3, 3, 3], "villa")).toBe(15);
    });
    it("should score tower (four of a kind + pair): sum all 6", () => {
      expect(calculateScore([4, 4, 4, 4, 2, 2], "tower")).toBe(20);
    });
    it("should return null for full house without a pair", () => {
      expect(calculateScore([3, 3, 3, 4, 5, 6], "fullHouse")).toBeNull();
    });
    it("should return null for villa with only one triplet", () => {
      expect(calculateScore([3, 3, 3, 4, 4, 5], "villa")).toBeNull();
    });
    it("should return null for tower without a pair", () => {
      expect(calculateScore([4, 4, 4, 4, 5, 6], "tower")).toBeNull();
    });
  });

  describe("Chance and Maxi-Yahtzee", () => {
    it("should score chance (sum of all dice)", () => {
      expect(calculateScore([1, 2, 3, 4, 5, 6], "chance")).toBe(21);
    });
    it("should score maxi-yahtzee (all same) → 100", () => {
      expect(calculateScore([5, 5, 5, 5, 5, 5], "maxiYahtzee")).toBe(100);
    });
    it("should return null for maxi-yahtzee when not all same", () => {
      expect(calculateScore([5, 5, 5, 5, 5, 4], "maxiYahtzee")).toBeNull();
    });
  });

  describe("Bonus Calculation", () => {
    it("should award 50 point bonus when threshold met", () => {
      const scores = { ones: 5, twos: 10, threes: 15, fours: 20, fives: 25, sixes: 0 };
      expect(calculateBonus(scores, 75)).toBe(50);
    });
    it("should not award bonus when threshold not met", () => {
      const scores = { ones: 5, twos: 10, threes: 15, fours: 20, fives: 0, sixes: 0 };
      expect(calculateBonus(scores, 75)).toBe(0);
    });
    it("should award bonus at exact threshold", () => {
      const scores = { ones: 5, twos: 10, threes: 15, fours: 20, fives: 25, sixes: 0 };
      expect(calculateBonus(scores, 75)).toBe(50);
    });
  });

  describe("Total Score Calculation", () => {
    it("should calculate total with bonus", () => {
      const scores = {
        ones: 5, twos: 10, threes: 15, fours: 20, fives: 25, sixes: 0,
        pair: 10,
      };
      // sum = 85, bonus = 50 → 135
      expect(calculateTotalScore(scores, defaultRules)).toBe(135);
    });
    it("should calculate total without bonus", () => {
      const scores = {
        ones: 5, twos: 10, threes: 15, fours: 20, fives: 0, sixes: 0,
        pair: 10,
      };
      // sum = 60, no bonus → 60
      expect(calculateTotalScore(scores, defaultRules)).toBe(60);
    });
  });

  describe("Game State Management", () => {
    it("should initialize game with correct number of players", () => {
      const gameState = initializeGame(["Alice", "Bob"], defaultRules);
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
      expect(turnState.rollsRemaining).toBe(2); // 3 throws − 1 initial roll
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
    it("should preserve held dice on reroll", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      const turnState = startTurn(gameState);
      const heldState = toggleHeldDie(turnState, 0);
      const originalFirstDie = heldState.currentDice[0];
      const rerolledState = rerollDice(heldState);
      expect(rerolledState.currentDice[0]).toBe(originalFirstDie);
      expect(rerolledState.rollsRemaining).toBe(1);
    });
    it("should prevent reroll when no rolls remaining", () => {
      const gameState = initializeGame(["Player 1"], defaultRules);
      let turnState = startTurn(gameState);
      turnState = rerollDice(turnState);
      turnState = rerollDice(turnState);
      expect(turnState.rollsRemaining).toBe(0);
      expect(rerollDice(turnState).rollsRemaining).toBe(0);
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
      expect(getAvailableCategories(turnState)).toHaveLength(20);
      const scoredState = scoreAndAdvance(turnState, "ones");
      expect(getAvailableCategories(scoredState)).toHaveLength(19);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all dice same value", () => {
      const dice = [3, 3, 3, 3, 3, 3];
      expect(calculateScore(dice, "threes")).toBe(18);
      expect(calculateScore(dice, "maxiYahtzee")).toBe(100);
      expect(calculateScore(dice, "chance")).toBe(18);
    });
    it("should score three pairs correctly with non-sequential pairs", () => {
      // [6,6,4,4,1,1] → 6×2 + 4×2 + 1×2 = 22
      expect(calculateScore([6, 6, 4, 4, 1, 1], "threePairs")).toBe(22);
    });
    it("should not score three pairs when one group is 4-of-a-kind", () => {
      // [5,5,5,5,3,3] → only two distinct pairs, not three
      expect(calculateScore([5, 5, 5, 5, 3, 3], "threePairs")).toBeNull();
    });
    it("should calculate correct bonus at different thresholds", () => {
      const scores = { ones: 10, twos: 10, threes: 10, fours: 10, fives: 10, sixes: 10 };
      expect(calculateBonus(scores, 50)).toBe(50);
      expect(calculateBonus(scores, 60)).toBe(50);
      expect(calculateBonus(scores, 61)).toBe(0);
    });
  });
});
