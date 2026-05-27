import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, SafeAreaView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AnimatedDice } from "@/components/animated-dice";
import { useGame } from "@/lib/game-context";
import { getCategoryName, getCategoryPoints } from "@/lib/game-engine";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInDown, ZoomIn } from "react-native-reanimated";

export default function GameplayEnhancedScreen() {
  const router = useRouter();
  const { gameState, rollDice, holdDie, scoreCategory, resetGame, availableCategories } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  if (!gameState) {
    return (
      <ScreenContainer className="bg-black items-center justify-center">
        <Text className="text-white text-lg">Loading game...</Text>
      </ScreenContainer>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleRollDice = () => {
    if (gameState.rollsRemaining <= 0 || isRolling) return;

    setIsRolling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rollDice();

    setTimeout(() => {
      setIsRolling(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 700);
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
      setTimeout(() => {
        router.push("/(tabs)/gameover" as any);
      }, 300);
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
            <Animated.View entering={FadeIn.duration(400)} className="flex-row justify-between items-center">
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
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text className="text-white text-xl">‹</Text>
              </Pressable>

              <Animated.View entering={ZoomIn.duration(400).delay(100)} className="items-center">
                <Text className="text-sm text-gray-400">Turn {gameState.currentTurn}/20</Text>
                <Text className="text-2xl font-bold text-white">{currentPlayer.name}</Text>
              </Animated.View>

              <Animated.View entering={ZoomIn.duration(400).delay(100)} className="w-11 items-center">
                <Text className="text-2xl font-bold text-emerald-400">{currentPlayer.totalScore}</Text>
                <Text className="text-xs text-gray-400">pts</Text>
              </Animated.View>
            </Animated.View>

            {/* Dice Grid with Animations */}
            <Animated.View
              entering={SlideInDown.duration(400).delay(150)}
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
                  <Pressable
                    key={i}
                    onPress={() => handleHoldDie(i)}
                    style={{ flex: 1, aspectRatio: 1 }}
                  >
                    <AnimatedDice
                      value={value}
                      isHeld={gameState.heldDice[i]}
                      isRolling={isRolling}
                      onRollComplete={() => {}}
                    />
                  </Pressable>
                ))}
              </View>

              <View className="flex-row gap-3">
                {gameState.currentDice.slice(3, 6).map((value, i) => (
                  <Pressable
                    key={i + 3}
                    onPress={() => handleHoldDie(i + 3)}
                    style={{ flex: 1, aspectRatio: 1 }}
                  >
                    <AnimatedDice
                      value={value}
                      isHeld={gameState.heldDice[i + 3]}
                      isRolling={isRolling}
                      onRollComplete={() => {}}
                    />
                  </Pressable>
                ))}
              </View>

              <Animated.View entering={FadeIn.duration(300).delay(200)} className="items-center mt-2">
                <Text className="text-sm text-gray-400">
                  Rolls Remaining: <Text className="font-bold text-white">{gameState.rollsRemaining}</Text>
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Roll Dice Button */}
            <Animated.View entering={SlideInDown.duration(400).delay(250)}>
              <Pressable
                onPress={handleRollDice}
                disabled={gameState.rollsRemaining <= 0 || isRolling}
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
                  {isRolling ? "Rolling..." : gameState.rollsRemaining <= 0 ? "Choose Category" : "Roll Dice"}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Scorecard */}
            <Animated.View
              entering={SlideInDown.duration(400).delay(300)}
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
                          transform: [{ scale: pressed ? 0.98 : 1 }],
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
                          score !== undefined
                            ? "text-emerald-400 font-bold"
                            : "text-gray-500 font-bold"
                        }
                      >
                        {score !== undefined ? score : "−"}
                      </Text>
                    </Pressable>
                  );
                }}
                keyExtractor={(item) => item}
              />
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
