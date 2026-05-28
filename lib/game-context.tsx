import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GameState,
  GameRules,
  initializeGame,
  startTurn,
  rerollDice,
  toggleHeldDie,
  scoreAndAdvance,
  getAvailableCategories,
} from "./game-engine";
import { StatsManager } from "./stats-manager";

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  isPaused: boolean;
  lastScoredCategory: string | null;
  startNewGame: (playerNames: string[], rules: GameRules) => void;
  rollDice: () => void;
  holdDie: (index: number) => void;
  scoreCategory: (category: string) => void;
  undoLastScore: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGame: () => void;
  resetGame: () => void;
  availableCategories: string[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GAME_STATE_KEY = "maxi-yahtzee-game-state";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [lastScoredCategory, setLastScoredCategory] = useState<string | null>(null);
  const [previousGameState, setPreviousGameState] = useState<GameState | null>(null);

  // Load saved game state on mount
  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const saved = await AsyncStorage.getItem(GAME_STATE_KEY);
      if (saved) {
        setGameState(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameState = async (state: GameState) => {
    try {
      await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  };

  const startNewGame = useCallback(
    async (playerNames: string[], rules: GameRules) => {
      const newState = initializeGame(playerNames, rules);

      // P1 fix — initialize player-stats records using the SAME canonical IDs
      // (`player-0`, `player-1`, ...) that initializeGame assigns. The old
      // initializePlayerStats() generated random IDs that never matched, so
      // StatsManager.recordGameResult() at game-end found no record and
      // bailed out (returning null) — stats appeared "wired" but recorded
      // nothing. recordGameResult does NOT auto-create, so init is required.
      for (const player of newState.players) {
        const existing = await StatsManager.getPlayerStats(player.id);
        if (!existing) {
          await StatsManager.initializePlayerStats(player.id, player.name);
        }
      }

      const stateWithDice = startTurn(newState);
      setGameState(stateWithDice);
      saveGameState(stateWithDice);
    },
    []
  );

  const rollDice = useCallback(() => {
    if (!gameState) return;
    const newState = rerollDice(gameState);
    setGameState(newState);
    saveGameState(newState);
  }, [gameState]);

  const holdDie = useCallback(
    (index: number) => {
      if (!gameState) return;
      const newState = toggleHeldDie(gameState, index);
      setGameState(newState);
      saveGameState(newState);
    },
    [gameState]
  );

  const scoreCategory = useCallback(
    (category: string) => {
      if (!gameState) return;
      setPreviousGameState(gameState);
      setLastScoredCategory(category);
      const newState = scoreAndAdvance(gameState, category as any);
      if (newState.gameOver) {
        // Game over - record stats for all players
        recordGameStats(newState);
        setGameState(newState);
        saveGameState(newState);
      } else {
        // Start new turn for next player
        const stateWithDice = startTurn(newState);
        setGameState(stateWithDice);
        saveGameState(stateWithDice);
      }
    },
    [gameState]
  );

  const recordGameStats = async (finalState: GameState) => {
    // Sort players by final score to determine placement
    const sortedPlayers = [...finalState.players].sort((a, b) => b.totalScore - a.totalScore);
    
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      const placement = i + 1;
      const opponents = sortedPlayers
        .filter((_, idx) => idx !== i)
        .map(p => p.name);
      
      await StatsManager.recordGameResult(
        player.id,
        player.totalScore,
        placement,
        opponents,
        finalState.rules.diceCount,
        finalState.rules.bonusThreshold
      );
    }
  };

  const undoLastScore = useCallback(() => {
    if (previousGameState) {
      setGameState(previousGameState);
      saveGameState(previousGameState);
      setPreviousGameState(null);
      setLastScoredCategory(null);
    }
  }, [previousGameState]);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
  }, []);

  const quitGame = useCallback(() => {
    setGameState(null);
    setIsPaused(false);
    setLastScoredCategory(null);
    setPreviousGameState(null);
    AsyncStorage.removeItem(GAME_STATE_KEY);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setIsPaused(false);
    setLastScoredCategory(null);
    setPreviousGameState(null);
    AsyncStorage.removeItem(GAME_STATE_KEY);
  }, []);

  const initializePlayerStats = useCallback(async (playerNames: string[]) => {
    // P1 fix — DEPRECATED. Previously generated random IDs that never
    // matched the canonical `player-N` IDs used by initializeGame(), causing
    // StatsManager.recordGameResult() at game-end to silently fail. The init
    // logic has been moved inline into startNewGame above, where the
    // canonical IDs are available.
    return;
  }, []);

  const availableCategories = gameState ? getAvailableCategories(gameState) : [];

  const value: GameContextType = {
    gameState,
    isLoading,
    isPaused,
    lastScoredCategory,
    startNewGame: (playerNames, rules) => {
      // initializePlayerStats is now handled inside startNewGame using
      // canonical player IDs. The legacy callback above is a no-op.
      startNewGame(playerNames, rules);
    },
    rollDice,
    holdDie,
    scoreCategory,
    undoLastScore,
    pauseGame,
    resumeGame,
    quitGame,
    resetGame,
    availableCategories,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameContext };

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
