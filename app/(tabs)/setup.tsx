import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { GameRules } from "@/lib/game-engine";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function SetupScreen() {
  const router = useRouter();
  const { startNewGame } = useGame();
  const colors = useColors();

  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2", "", ""]);
  const [bonusThreshold, setBonusThreshold] = useState(75);
  const [throwsPerTurn, setThrowsPerTurn] = useState(3);
  const [diceCount, setDiceCount] = useState(6);

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Use entered names or defaults
    const names = playerNames.slice(0, playerCount).map((name, i) => name || `Player ${i + 1}`);

    const rules: GameRules = {
      bonusThreshold,
      throwsPerTurn,
      diceCount,
    };

    startNewGame(names, rules);
    router.push("/(tabs)/gameplay");
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const incrementValue = (value: number, min: number, max: number) => {
    return Math.min(max, value + 1);
  };

  const decrementValue = (value: number, min: number, max: number) => {
    return Math.max(min, value - 1);
  };

  return (
    <ScreenContainer className="bg-black">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8 gap-8">
            {/* Header */}
            <View className="items-center gap-2 mb-4">
              <Text className="text-5xl font-bold text-white" style={{ letterSpacing: 2 }}>
                MAXI
              </Text>
              <Text className="text-5xl font-bold text-white" style={{ letterSpacing: 2 }}>
                YAHTZEE
              </Text>
              <Text className="text-sm text-gray-400 mt-2">Elite Edition</Text>
            </View>

            {/* Player Count Selection */}
            <View className="gap-4">
              <Text className="text-lg font-semibold text-white">Players</Text>
              <View className="flex-row gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <Pressable
                    key={count}
                    onPress={() => {
                      setPlayerCount(count);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 16,
                        borderRadius: 12,
                        backgroundColor:
                          playerCount === count
                            ? "rgba(124, 58, 237, 0.3)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderWidth: 1,
                        borderColor:
                          playerCount === count ? "rgba(124, 58, 237, 0.5)" : "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <Text className="text-white font-semibold text-center">{count}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Player Names */}
            {playerCount > 0 && (
              <View className="gap-3">
                <Text className="text-lg font-semibold text-white">Player Names</Text>
                {Array.from({ length: playerCount }).map((_, i) => (
                  <TextInput
                    key={i}
                    value={playerNames[i]}
                    onChangeText={(text) => updatePlayerName(i, text)}
                    placeholder={`Player ${i + 1}`}
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: "white",
                      fontWeight: "500",
                    }}
                  />
                ))}
              </View>
            )}

            {/* Game Rules */}
            <View className="gap-4">
              <Text className="text-lg font-semibold text-white">Game Rules</Text>

              {/* Bonus Threshold */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-semibold">Bonus Threshold</Text>
                    <Text className="text-sm text-gray-400">Minimum points for bonus</Text>
                  </View>
                  <Text className="text-lg font-bold text-emerald-400">{bonusThreshold} pts</Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      setBonusThreshold(decrementValue(bonusThreshold, 50, 100));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setBonusThreshold(incrementValue(bonusThreshold, 50, 100));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Throws Per Turn */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-semibold">Throws per Turn</Text>
                    <Text className="text-sm text-gray-400">Number of rolls allowed</Text>
                  </View>
                  <Text className="text-lg font-bold text-emerald-400">{throwsPerTurn}</Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      setThrowsPerTurn(decrementValue(throwsPerTurn, 1, 5));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setThrowsPerTurn(incrementValue(throwsPerTurn, 1, 5));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Dice Count */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-semibold">Dice Count</Text>
                    <Text className="text-sm text-gray-400">Number of dice to use</Text>
                  </View>
                  <Text className="text-lg font-bold text-emerald-400">{diceCount}</Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      setDiceCount(decrementValue(diceCount, 1, 6));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setDiceCount(incrementValue(diceCount, 1, 6));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text className="text-white font-bold text-center text-lg">+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Start Game Button */}
            <Pressable
              onPress={handleStartGame}
              style={({ pressed }) => [
                {
                  marginTop: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  backgroundColor: pressed ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 1)",
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text className="text-white font-bold text-center text-lg">Start Game</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
