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

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  startNewGame: (playerNames: string[], rules: GameRules) => void;
  rollDice: () => void;
  holdDie: (index: number) => void;
  scoreCategory: (category: string) => void;
  resetGame: () => void;
  availableCategories: string[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GAME_STATE_KEY = "maxi-yahtzee-game-state";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    (playerNames: string[], rules: GameRules) => {
      const newState = initializeGame(playerNames, rules);
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
      const newState = scoreAndAdvance(gameState, category as any);
      if (newState.gameOver) {
        // Game over, don't start new turn
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

  const resetGame = useCallback(() => {
    setGameState(null);
    AsyncStorage.removeItem(GAME_STATE_KEY);
  }, []);

  const availableCategories = gameState ? getAvailableCategories(gameState) : [];

  const value: GameContextType = {
    gameState,
    isLoading,
    startNewGame,
    rollDice,
    holdDie,
    scoreCategory,
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
