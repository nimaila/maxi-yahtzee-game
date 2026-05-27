import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, SafeAreaView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { getCategoryName, getCategoryPoints } from "@/lib/game-engine";
import * as Haptics from "expo-haptics";

const DiceComponent = ({ value, isHeld, onPress }: { value: number; isHeld: boolean; onPress: () => void }) => {
  const dotPositions: Record<number, string[]> = {
    1: ["center"],
    2: ["top-left", "bottom-right"],
    3: ["top-left", "center", "bottom-right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
    5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
    6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          aspectRatio: 1,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isHeld ? "rgba(16, 185, 129, 0.6)" : "rgba(124, 58, 237, 0.2)",
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Text className="text-3xl font-bold text-black">{value}</Text>
    </Pressable>
  );
};

export default function GameplayScreen() {
  const router = useRouter();
  const { gameState, rollDice, holdDie, scoreCategory, resetGame, availableCategories } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!gameState) {
    return (
      <ScreenContainer className="bg-black items-center justify-center">
        <Text className="text-white text-lg">Loading game...</Text>
      </ScreenContainer>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleRollDice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rollDice();
  };

  const handleHoldDie = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdDie(index);
  };

  const handleScoreCategory = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scoreCategory(category);
    setSelectedCategory(null);

    if (gameState.gameOver) {
      router.push("/(tabs)/gameover" as any);
    }
  };

  const handleBackToSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetGame();
    router.push("/(tabs)" as any);
  };

  return (
    <ScreenContainer className="bg-black">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="px-4 py-6 gap-6">
            {/* Header with Back Button */}
            <View className="flex-row justify-between items-center">
              <Pressable
                onPress={handleBackToSetup}
                style={({ pressed }) => [
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text className="text-white text-xl">‹</Text>
              </Pressable>
              <View className="items-center">
                <Text className="text-sm text-gray-400">Turn {gameState.currentTurn}/20</Text>
                <Text className="text-2xl font-bold text-white">{currentPlayer.name}</Text>
              </View>
              <View className="w-11 items-center">
                <Text className="text-2xl font-bold text-emerald-400">{currentPlayer.totalScore}</Text>
                <Text className="text-xs text-gray-400">pts</Text>
              </View>
            </View>

            {/* Dice Grid */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                padding: 16,
                gap: 12,
              }}
            >
              <View className="flex-row gap-3">
                {gameState.currentDice.slice(0, 3).map((value, i) => (
                  <DiceComponent
                    key={i}
                    value={value}
                    isHeld={gameState.heldDice[i]}
                    onPress={() => handleHoldDie(i)}
                  />
                ))}
              </View>
              <View className="flex-row gap-3">
                {gameState.currentDice.slice(3, 6).map((value, i) => (
                  <DiceComponent
                    key={i + 3}
                    value={value}
                    isHeld={gameState.heldDice[i + 3]}
                    onPress={() => handleHoldDie(i + 3)}
                  />
                ))}
              </View>

              <View className="items-center mt-2">
                <Text className="text-sm text-gray-400">
                  Rolls Remaining: <Text className="font-bold text-white">{gameState.rollsRemaining}</Text>
                </Text>
              </View>
            </View>

            {/* Roll Dice Button */}
            <Pressable
              onPress={handleRollDice}
              disabled={gameState.rollsRemaining <= 0}
              style={({ pressed }) => [
                {
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  backgroundColor:
                    gameState.rollsRemaining <= 0
                      ? "rgba(255, 255, 255, 0.1)"
                      : pressed
                        ? "rgba(124, 58, 237, 0.8)"
                        : "rgba(124, 58, 237, 1)",
                  opacity: gameState.rollsRemaining <= 0 ? 0.5 : pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-bold text-center text-base">
                {gameState.rollsRemaining <= 0 ? "Choose Category" : "Roll Dice"}
              </Text>
            </Pressable>

            {/* Scorecard */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                padding: 16,
                gap: 8,
              }}
            >
              <Text className="text-lg font-semibold text-white mb-2">Scoring Categories</Text>
              <FlatList
                scrollEnabled={false}
                data={[
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
                ]}
                renderItem={({ item: category }) => {
                  const score = (currentPlayer.scores as any)[category];
                  const isAvailable = availableCategories.includes(category);
                  const points = getCategoryPoints(category as any);

                  return (
                    <Pressable
                      onPress={() => isAvailable && handleScoreCategory(category)}
                      disabled={!isAvailable}
                      style={({ pressed }) => [
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: isAvailable
                            ? pressed
                              ? "rgba(124, 58, 237, 0.3)"
                              : "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.02)",
                          opacity: isAvailable ? 1 : 0.5,
                        },
                      ]}
                    >
                      <View className="flex-1">
                        <Text className={isAvailable ? "text-white font-medium" : "text-gray-500 font-medium"}>
                          {getCategoryName(category as any)}
                        </Text>
                        {points && <Text className="text-xs text-gray-400">{points}</Text>}
                      </View>
                      <Text
                        className={
                          (currentPlayer.scores as any)[category] !== undefined
                            ? "text-emerald-400 font-bold"
                            : "text-gray-500 font-bold"
                        }
                      >
                        {(currentPlayer.scores as any)[category] !== undefined
                          ? (currentPlayer.scores as any)[category]
                          : "−"}
                      </Text>
                    </Pressable>
                  );
                }}
                keyExtractor={(item) => item}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
