import { ScrollView, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { GameContext } from "@/lib/game-context";
import * as Haptics from "expo-haptics";
import { C, GRADIENTS } from "@/constants/game-theme";

export default function HomeScreen() {
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

  return (
    <ScreenContainer containerClassName="bg-black" className="p-0">
      <LinearGradient colors={GRADIENTS.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28, paddingVertical: 48 }}>

          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 18,
              backgroundColor: C.purpleDim,
              justifyContent: "center", alignItems: "center",
              marginBottom: 20,
              borderWidth: 1.5, borderColor: C.purpleBorder,
              shadowColor: C.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10,
            }}>
              <Text style={{ fontSize: 36 }}>👑</Text>
            </View>
            <Text style={{ fontSize: 52, fontWeight: "900", color: C.gold, letterSpacing: 3,
              textShadowColor: C.gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
              MAXI
            </Text>
            <Text style={{ fontSize: 52, fontWeight: "900", color: C.gold, letterSpacing: 3, marginTop: -8,
              textShadowColor: C.gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
              YAHTZEE
            </Text>
            <Text style={{ fontSize: 12, color: C.purple, marginTop: 10, fontWeight: "700", letterSpacing: 3 }}>
              ELITE EDITION
            </Text>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 14, textAlign: "center", lineHeight: 20 }}>
              The ultimate dice challenge.{"\n"}More dice. More strategy. More glory.
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ width: "100%", gap: 12, marginBottom: 48 }}>
            <Pressable onPress={handleNewGame} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <LinearGradient colors={GRADIENTS.purpleBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 14, borderWidth: 1.5, borderColor: C.purple, paddingVertical: 16, alignItems: "center",
                  shadowColor: C.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: C.textPrimary, letterSpacing: 2 }}>👑  NEW GAME</Text>
              </LinearGradient>
            </Pressable>

            {gameContext?.gameState && (
              <Pressable onPress={handleContinueGame} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                <View style={{ borderRadius: 14, borderWidth: 1.5, borderColor: C.purpleBorder,
                  paddingVertical: 16, alignItems: "center", backgroundColor: C.bgCard }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: C.textSecondary, letterSpacing: 1 }}>CONTINUE GAME</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Feature pills */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { icon: "🎲", label: "Premium\nExperience" },
              { icon: "🧠", label: "Strategic\nDepth" },
              { icon: "🏆", label: "Elite\nCompetition" },
            ].map(function(item) {
              return (
                <View key={item.label} style={{
                  flex: 1, borderRadius: 12, borderWidth: 1, borderColor: C.separator,
                  backgroundColor: C.bgCard, padding: 12, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 10, color: C.textMuted, textAlign: "center", lineHeight: 14 }}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </ScreenContainer>
  );
}
