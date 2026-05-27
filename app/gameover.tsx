import { ScrollView, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function GameOverScreenRedesigned() {
  const router = useRouter();
  const gameContext = useGame();

  if (!gameContext.gameState) {
    return (
      <ScreenContainer>
        <Text>Loading...</Text>
      </ScreenContainer>
    );
  }

  const gameState = gameContext.gameState;
  
  // Sort players by score (descending)
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  const winner = sortedPlayers[0];
  const medals = ["🥇", "🥈", "🥉"];

  const handlePlayAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    gameContext.resetGame();
    router.push("/setup");
  };

  const handleMainMenu = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    gameContext.resetGame();
    router.push("/");
  };

  return (
    <ScreenContainer containerClassName="bg-black" className="p-0">
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460", "#1a1a2e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 32,
          }}
        >
          {/* Floating particles */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  borderRadius: 50,
                  backgroundColor: Math.random() > 0.5 ? "#FFD700" : "#00D9FF",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  shadowColor: Math.random() > 0.5 ? "#FFD700" : "#00D9FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              />
            ))}
          </View>

          {/* Winner Title */}
          <Text
            style={{
              fontSize: 56,
              fontWeight: "900",
              color: "#FFD700",
              textShadowColor: "#FFD700",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
              marginBottom: 24,
              letterSpacing: 2,
              zIndex: 1,
            }}
          >
            WINNER
          </Text>

          {/* Winner Card */}
          <View
            style={{
              borderRadius: 16,
              borderWidth: 3,
              borderColor: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.05)",
              paddingVertical: 24,
              paddingHorizontal: 20,
              marginBottom: 32,
              alignItems: "center",
              shadowColor: "#FFD700",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 12,
              zIndex: 1,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏆</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#FFD700",
                marginBottom: 8,
                textShadowColor: "#FFD700",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              {winner.name}
            </Text>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "#00D9FF",
                textShadowColor: "#00D9FF",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              {winner.totalScore} pts
            </Text>
          </View>

          {/* Podium */}
          <View
            style={{
              width: "100%",
              marginBottom: 32,
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#00D9FF",
                textAlign: "center",
                marginBottom: 16,
                letterSpacing: 1,
              }}
            >
              FINAL STANDINGS
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                gap: 12,
                height: 200,
              }}
            >
              {sortedPlayers.slice(0, 3).map((player, index) => {
                const heights = [160, 120, 80];
                const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                const glowColors = ["#FFD700", "#A9A9A9", "#B87333"];

                return (
                  <View
                    key={player.id}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Podium */}
                    <View
                      style={{
                        width: "100%",
                        height: heights[index],
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: colors[index],
                        backgroundColor: `rgba(${
                          index === 0 ? "255, 215, 0" : index === 1 ? "192, 192, 192" : "205, 127, 50"
                        }, 0.1)`,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: glowColors[index],
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 12,
                        elevation: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "900",
                          color: colors[index],
                          textShadowColor: colors[index],
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 4,
                          marginBottom: 8,
                        }}
                      >
                        {index + 1}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: colors[index],
                          textAlign: "center",
                          paddingHorizontal: 4,
                        }}
                      >
                        {player.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors[index],
                          marginTop: 4,
                        }}
                      >
                        {player.totalScore}
                      </Text>
                    </View>

                    {/* Medal */}
                    <Text style={{ fontSize: 32, marginTop: 8 }}>
                      {medals[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Leaderboard */}
          <View
            style={{
              width: "100%",
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#00D9FF",
              backgroundColor: "rgba(0, 217, 255, 0.05)",
              overflow: "hidden",
              marginBottom: 24,
              shadowColor: "#00D9FF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              zIndex: 1,
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
                TOP SCORES
              </Text>
            </View>

            {sortedPlayers.map((player, index) => (
              <View
                key={player.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: index < sortedPlayers.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(0, 217, 255, 0.1)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#FFD700",
                      width: 24,
                    }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#E0E7FF",
                      flex: 1,
                    }}
                  >
                    {player.name}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#00D9FF",
                  }}
                >
                  {player.totalScore} pts
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ width: "100%", gap: 12, zIndex: 1 }}>
            {/* Play Again Button */}
            <Pressable
              onPress={handlePlayAgain}
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
                  borderColor: "#00D9FF",
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  shadowColor: "#00D9FF",
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
                    color: "#00D9FF",
                    letterSpacing: 1,
                  }}
                >
                  ▶ PLAY AGAIN
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Main Menu Button */}
            <Pressable
              onPress={handleMainMenu}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LinearGradient
                colors={["rgba(147, 51, 234, 0.15)", "rgba(147, 51, 234, 0.05)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#9333EA",
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  shadowColor: "#9333EA",
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
                    color: "#9333EA",
                    letterSpacing: 1,
                  }}
                >
                  🏠 MAIN MENU
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </ScreenContainer>
  );
}
