import { ScrollView, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { GameContext } from "@/lib/game-context";
import * as Haptics from "expo-haptics";

export default function HomeScreenRedesigned() {
  const router = useRouter();
  const gameContext = useContext(GameContext);

  const handleNewGame = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/setup");
  };

  const handleContinueGame = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/gameplay");
  };

  const handleViewStats = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/stats");
  };

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
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          {/* Floating particles background effect */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  borderRadius: 50,
                  backgroundColor: Math.random() > 0.5 ? "#00D9FF" : "#FF00FF",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  shadowColor: Math.random() > 0.5 ? "#00D9FF" : "#FF00FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              />
            ))}
          </View>

          {/* Logo Section */}
          <View style={{ alignItems: "center", marginBottom: 40, zIndex: 1 }}>
            {/* Crown Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: "rgba(147, 51, 234, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                borderWidth: 2,
                borderColor: "#9333EA",
                shadowColor: "#9333EA",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 40 }}>👑</Text>
            </View>

            {/* Title */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "#FFD700",
                  textShadowColor: "#FFD700",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                MAXI
              </Text>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "#FFD700",
                  textShadowColor: "#FFD700",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                  letterSpacing: 2,
                }}
              >
                YAHTZEE
              </Text>
            </View>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 14,
                color: "#00D9FF",
                marginTop: 12,
                fontWeight: "600",
                letterSpacing: 1,
              }}
            >
              ELITE EDITION
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 14,
                color: "#E0E7FF",
                marginTop: 16,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Roll the dice, score big, and become the ultimate Yahtzee champion
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ width: "100%", gap: 12, marginBottom: 40, zIndex: 1 }}>
            {/* New Game Button */}
            <Pressable
              onPress={handleNewGame}
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
                  🎲 NEW GAME
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Continue Game Button */}
            {gameContext?.gameState && (
              <Pressable
                onPress={handleContinueGame}
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
                    ⏸ CONTINUE GAME
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {/* Stats Button */}
            <Pressable
              onPress={handleViewStats}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.15)", "rgba(34, 197, 94, 0.05)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#22C55E",
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  shadowColor: "#22C55E",
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
                    color: "#22C55E",
                    letterSpacing: 1,
                  }}
                >
                  📊 MY STATS
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Feature Cards */}
          <View style={{ width: "100%", gap: 12, zIndex: 1 }}>
            {/* Card 1 */}
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#00D9FF",
                backgroundColor: "rgba(0, 217, 255, 0.05)",
                padding: 16,
                shadowColor: "#00D9FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#00D9FF",
                  marginBottom: 4,
                }}
              >
                1-4 Players
              </Text>
              <Text style={{ fontSize: 12, color: "#A0AEC0" }}>
                Play solo or with friends
              </Text>
            </View>

            {/* Card 2 */}
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#FF00FF",
                backgroundColor: "rgba(255, 0, 255, 0.05)",
                padding: 16,
                shadowColor: "#FF00FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#FF00FF",
                  marginBottom: 4,
                }}
              >
                Custom Rules
              </Text>
              <Text style={{ fontSize: 12, color: "#A0AEC0" }}>
                Adjust bonuses, throws, and dice count
              </Text>
            </View>

            {/* Card 3 */}
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.05)",
                padding: 16,
                shadowColor: "#FFD700",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#FFD700",
                  marginBottom: 4,
                }}
              >
                20 Categories
              </Text>
              <Text style={{ fontSize: 12, color: "#A0AEC0" }}>
                Master all Maxi Yahtzee scoring
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ScreenContainer>
  );
}
