import React from "react";
import { ScrollView, Text, View, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInDown, ZoomIn } from "react-native-reanimated";

export default function GameOverScreen() {
  const router = useRouter();
  const { gameState, resetGame } = useGame();

  if (!gameState || !gameState.gameOver) {
    return (
      <ScreenContainer className="bg-black items-center justify-center">
        <Text className="text-white text-lg">Game not finished</Text>
      </ScreenContainer>
    );
  }

  // Sort players by score (descending)
  const sortedPlayers = [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetGame();
    router.push("/(tabs)" as any);
  };

  return (
    <ScreenContainer className="bg-black">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8 gap-8 items-center justify-center">
            {/* Game Over Title */}
            <Animated.View entering={FadeIn.duration(400)} className="items-center gap-4 mb-4">
              <Text className="text-5xl font-bold text-white" style={{ letterSpacing: 2 }}>
                GAME OVER
              </Text>
              <View className="h-1 w-16 bg-emerald-400 rounded-full" />
            </Animated.View>

            {/* Winner Section */}
            <Animated.View
              entering={ZoomIn.duration(400).delay(150)}
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderWidth: 2,
                borderColor: "rgba(16, 185, 129, 0.5)",
                borderRadius: 16,
                padding: 24,
                width: "100%",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text className="text-sm text-emerald-400 font-semibold">WINNER</Text>
              <Text className="text-4xl font-bold text-white">{winner.name}</Text>
              <Text className="text-3xl font-bold text-emerald-400">{winner.totalScore} pts</Text>
            </Animated.View>

            {/* Final Scores */}
            <Animated.View entering={SlideInDown.duration(400).delay(200)} className="w-full gap-3">
              <Text className="text-lg font-semibold text-white mb-2">Final Scores</Text>
              {sortedPlayers.map((player, index) => (
                <View
                  key={player.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg font-bold text-gray-400 w-8 text-center">#{index + 1}</Text>
                    <Text className="text-white font-semibold">{player.name}</Text>
                  </View>
                  <Text className="text-lg font-bold text-emerald-400">{player.totalScore}</Text>
                </View>
                ))}
            </Animated.View>

            {/* Play Again Button */}
            <Animated.View entering={SlideInDown.duration(400).delay(250)}>
              <Pressable
                onPress={handlePlayAgain}
                style={({ pressed }) => [
                  {
                    marginTop: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: pressed ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 1)",
                    width: "100%",
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text className="text-white font-bold text-center text-lg">Play Again</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
