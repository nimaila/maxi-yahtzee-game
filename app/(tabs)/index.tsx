import { ScrollView, Text, View, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const { gameState } = useGame();

  const handleNewGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/setup");
  };

  const handleContinueGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (gameState?.gameOver) {
      router.push("/(tabs)/gameover");
    } else {
      router.push("/(tabs)/gameplay");
    }
  };

  return (
    <ScreenContainer className="bg-black">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 py-12 gap-12 items-center justify-center">
            {/* Logo and Title */}
            <View className="items-center gap-6 mb-8">
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                  borderWidth: 2,
                  borderColor: "rgba(124, 58, 237, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text className="text-5xl">🎲</Text>
              </View>

              <View className="items-center gap-2">
                <Text className="text-5xl font-bold text-white" style={{ letterSpacing: 3 }}>
                  MAXI
                </Text>
                <Text className="text-5xl font-bold text-white" style={{ letterSpacing: 3 }}>
                  YAHTZEE
                </Text>
                <Text className="text-sm text-emerald-400 font-semibold mt-2">Elite Edition</Text>
              </View>
            </View>

            {/* Subtitle */}
            <Text className="text-center text-gray-300 text-base leading-relaxed max-w-xs">
              Roll the dice, score big, and become the ultimate Yahtzee champion
            </Text>

            {/* New Game Button */}
            <Pressable
              onPress={handleNewGame}
              style={({ pressed }) => [
                {
                  width: "100%",
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  backgroundColor: pressed ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 1)",
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-bold text-center text-lg">New Game</Text>
            </Pressable>

            {/* Continue Game Button (if game in progress) */}
            {gameState && !gameState.gameOver && (
              <Pressable
                onPress={handleContinueGame}
                style={({ pressed }) => [
                  {
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text className="text-white font-semibold text-center text-base">Continue Game</Text>
              </Pressable>
            )}

            {/* Game Over - View Results Button */}
            {gameState?.gameOver && (
              <Pressable
                onPress={handleContinueGame}
                style={({ pressed }) => [
                  {
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text className="text-emerald-400 font-semibold text-center text-base">View Results</Text>
              </Pressable>
            )}

            {/* Features */}
            <View className="w-full gap-4 mt-8">
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 3,
                }}
              >
                <Text className="text-white font-semibold">1-4 Players</Text>
                <Text className="text-sm text-gray-400">Play solo or with friends</Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 3,
                }}
              >
                <Text className="text-white font-semibold">Custom Rules</Text>
                <Text className="text-sm text-gray-400">Adjust bonuses, throws, and dice count</Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 3,
                }}
              >
                <Text className="text-white font-semibold">20 Categories</Text>
                <Text className="text-sm text-gray-400">Master all Maxi Yahtzee scoring</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
