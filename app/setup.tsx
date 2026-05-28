import { C, GRADIENTS } from "@/constants/game-theme";
import { ScrollView, Text, View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function SetupScreenRedesigned() {
  const router = useRouter();
  const gameContext = useGame();
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [bonusThreshold, setBonusThreshold] = useState(75);
  const [throwsPerTurn, setThrowsPerTurn] = useState(3);
  const [diceCount, setDiceCount] = useState(6);

  const handleStartGame = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const names = playerNames.slice(0, playerCount);
    gameContext.startNewGame(names, {
      bonusThreshold,
      throwsPerTurn,
      diceCount,
    });
    router.push("/gameplay");
  };

  return (
    <ScreenContainer containerClassName="bg-black" className="p-0">
      <LinearGradient
        colors={GRADIENTS.bg}
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
          {/* Title */}
          <View style={{ marginBottom: 24, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: C.purple,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              GAME SETUP
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: C.textSecondary,
                textAlign: "center",
              }}
            >
              Configure your game and add players
            </Text>
          </View>

          {/* Player Count Section */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: C.purple,
              backgroundColor: "rgba(0, 217, 255, 0.05)",
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 20,
              shadowColor: C.purple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.purple,
                marginBottom: 12,
                letterSpacing: 1,
              }}
            >
              NUMBER OF PLAYERS
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              {[1, 2, 3, 4].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => {
                    setPlayerCount(num);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <LinearGradient
                    colors={
                      playerCount === num
                        ? ["rgba(0, 217, 255, 0.3)", "rgba(0, 217, 255, 0.1)"]
                        : ["rgba(0, 217, 255, 0.1)", "rgba(0, 217, 255, 0.05)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: playerCount === num ? C.purple : C.textMuted,
                      paddingVertical: 12,
                      alignItems: "center",
                      shadowColor: playerCount === num ? C.purple : "transparent",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: playerCount === num ? 4 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: playerCount === num ? C.purple : C.textSecondary,
                      }}
                    >
                      {num}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Player Names Section */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: C.purple,
              backgroundColor: "rgba(255, 0, 255, 0.05)",
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 20,
              shadowColor: C.purple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.purple,
                marginBottom: 12,
                letterSpacing: 1,
              }}
            >
              PLAYER NAMES
            </Text>
            {Array.from({ length: playerCount }).map((_, i) => (
              <TextInput
                key={i}
                value={playerNames[i]}
                onChangeText={(text) => {
                  const newNames = [...playerNames];
                  newNames[i] = text;
                  setPlayerNames(newNames);
                }}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={C.textMuted}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: C.purple,
                  backgroundColor: C.bgCard,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: C.textPrimary,
                  fontWeight: "600",
                  marginBottom: i < playerCount - 1 ? 8 : 0,
                }}
              />
            ))}
          </View>

          {/* Rules Section */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: C.gold,
              backgroundColor: "rgba(255, 215, 0, 0.05)",
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 20,
              shadowColor: C.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.gold,
                marginBottom: 12,
                letterSpacing: 1,
              }}
            >
              CUSTOM RULES
            </Text>

            {/* Bonus Threshold */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  Bonus Threshold
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: C.gold,
                  }}
                >
                  {bonusThreshold} pts
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {[50, 75, 100].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => {
                      setBonusThreshold(val);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={
                        bonusThreshold === val
                          ? ["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.1)"]
                          : ["rgba(255, 215, 0, 0.1)", "rgba(255, 215, 0, 0.05)"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: bonusThreshold === val ? C.gold : C.bgCardStrong,
                        paddingVertical: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: bonusThreshold === val ? C.gold : C.textSecondary,
                        }}
                      >
                        {val}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Throws Per Turn */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  Throws Per Turn
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: C.gold,
                  }}
                >
                  {throwsPerTurn}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => {
                      setThrowsPerTurn(val);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={
                        throwsPerTurn === val
                          ? ["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.1)"]
                          : ["rgba(255, 215, 0, 0.1)", "rgba(255, 215, 0, 0.05)"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: throwsPerTurn === val ? C.gold : C.bgCardStrong,
                        paddingVertical: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: throwsPerTurn === val ? C.gold : C.textSecondary,
                        }}
                      >
                        {val}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Dice Count */}
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  Number of Dice
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: C.gold,
                  }}
                >
                  {diceCount}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => {
                      setDiceCount(val);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={
                        diceCount === val
                          ? ["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.1)"]
                          : ["rgba(255, 215, 0, 0.1)", "rgba(255, 215, 0, 0.05)"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: diceCount === val ? C.gold : C.bgCardStrong,
                        paddingVertical: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: diceCount === val ? C.gold : C.textSecondary,
                        }}
                      >
                        {val}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Start Game Button */}
          <Pressable
            onPress={handleStartGame}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <LinearGradient
              colors={["rgba(0, 217, 255, 0.15)", "rgba(0, 217, 255, 0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 12,
                borderWidth: 2,
                borderColor: C.purple,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: "center",
                shadowColor: C.purple,
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
                  color: C.purple,
                  letterSpacing: 1,
                }}
              >
                ▶ START GAME
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </ScreenContainer>
  );
}
