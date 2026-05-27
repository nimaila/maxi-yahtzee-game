import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { Dice3DEnhanced } from "@/components/dice-3d-enhanced";
import { ScoreCelebrationModal } from "@/components/score-celebration-modal";
import { useGame } from "@/lib/game-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function GameplayScreenRedesigned() {
  const router = useRouter();
  const gameContext = useGame();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ score: 0, category: "" });

  if (!gameContext.gameState) {
    return (
      <ScreenContainer>
        <Text>Loading game...</Text>
      </ScreenContainer>
    );
  }

  const gameState = gameContext.gameState;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  // Build current turn data from game state
  const currentTurn = {
    dice: gameState.currentDice,
    heldDice: gameState.heldDice,
    rollsRemaining: gameState.rollsRemaining,
    isRolling: false,
    scores: currentPlayer.scores,
  };

  const handleRollDice = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    gameContext.rollDice();
  };

  const handleDicePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    gameContext.holdDie(index);
  };

  const handleScoreCategory = async (category: string) => {
    const score = currentTurn.scores[category as keyof typeof currentTurn.scores] || 0;
    setCelebrationData({ score, category });
    setCelebrationVisible(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    gameContext.scoreCategory(category);
  };

  const availableCategories = gameContext.availableCategories;

  return (
    <ScreenContainer containerClassName="bg-black" className="p-0">
      <LinearGradient
        colors={["#0F172A", "#1E1B4B", "#2D1B69", "#1E0B4B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >
          {/* Player Info Card */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#00D9FF",
              backgroundColor: "rgba(0, 217, 255, 0.05)",
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginBottom: 20,
              shadowColor: "#00D9FF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#A0AEC0",
                    marginBottom: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  CURRENT PLAYER
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#00D9FF",
                  }}
                >
                  {currentPlayer.name}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#A0AEC0",
                    marginBottom: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  TURN {gameState.currentPlayerIndex + 1}/20
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#FFD700",
                    textShadowColor: "#FFD700",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 2,
                  }}
                >
                  {currentPlayer.totalScore} pts
                </Text>
              </View>
            </View>
          </View>

          {/* Throws Counter */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#FF00FF",
              backgroundColor: "rgba(255, 0, 255, 0.05)",
              paddingVertical: 10,
              paddingHorizontal: 16,
              marginBottom: 24,
              alignItems: "center",
              shadowColor: "#FF00FF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#FF00FF",
                letterSpacing: 1,
              }}
            >
              🎲 Throws: {currentTurn.rollsRemaining}/{gameState.rules.throwsPerTurn}
            </Text>
          </View>

          {/* Dice Grid */}
          <View
            style={{
              backgroundColor: "rgba(147, 51, 234, 0.1)",
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#9333EA",
              padding: 20,
              marginBottom: 24,
              shadowColor: "#9333EA",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 16,
              }}
            >
              {currentTurn.dice.map((value: number, index: number) => (
                <Dice3DEnhanced
                  key={index}
                  value={value}
                  isHeld={currentTurn.heldDice[index]}
                  isRolling={currentTurn.isRolling}
                  onPress={() => handleDicePress(index)}
                  size={70}
                />
              ))}
            </View>
          </View>

          {/* Roll Button */}
          <Pressable
            onPress={handleRollDice}
            disabled={currentTurn.rollsRemaining === 0 || currentTurn.isRolling}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              marginBottom: 24,
            })}
          >
            <LinearGradient
              colors={["rgba(255, 0, 255, 0.15)", "rgba(255, 0, 255, 0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#FF00FF",
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: "center",
                shadowColor: "#FF00FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#FF00FF",
                  letterSpacing: 1,
                }}
              >
                ✨ ROLL DICE
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Scorecard */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#00D9FF",
              backgroundColor: "rgba(0, 217, 255, 0.05)",
              overflow: "hidden",
              shadowColor: "#00D9FF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0, 217, 255, 0.1)",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#00D9FF",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#00D9FF",
                  letterSpacing: 1,
                }}
              >
                SCORECARD
              </Text>
            </View>

            <FlatList
              scrollEnabled={false}
              data={availableCategories}
              keyExtractor={(item: string) => item}
              renderItem={({ item: category }: { item: string }) => {
                const score = currentTurn.scores[category as keyof typeof currentTurn.scores];
                const isScored = score !== undefined;

                return (
                  <Pressable
                    onPress={() => !isScored && handleScoreCategory(category)}
                    disabled={isScored}
                    style={({ pressed }) => ({
                      opacity: isScored ? 0.5 : pressed ? 0.8 : 1,
                    })}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(0, 217, 255, 0.1)",
                        backgroundColor: isScored
                          ? "rgba(0, 217, 255, 0.05)"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: isScored ? "#6B7280" : "#E0E7FF",
                          flex: 1,
                        }}
                      >
                        {category}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: isScored ? "#00D9FF" : "#FFD700",
                        }}
                      >
                        {isScored ? score : "—"}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </ScrollView>

        {/* Score Celebration Modal */}
        <ScoreCelebrationModal
          visible={celebrationVisible}
          score={celebrationData.score}
          category={celebrationData.category}
          onClose={() => setCelebrationVisible(false)}
        />
      </LinearGradient>
    </ScreenContainer>
  );
}
