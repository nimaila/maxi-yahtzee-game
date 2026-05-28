import React, { useEffect } from "react";
import { View, Text, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { C, GRADIENTS } from "@/constants/game-theme";

interface TurnTransitionProps {
  visible: boolean;
  playerName: string;
  playerNumber: number;
  onDone: () => void;
  /** Override the auto-dismiss duration (ms). Default 2000. */
  durationMs?: number;
}

/**
 * Brief "Next up: <Player>" overlay shown between turns in a pass-the-phone
 * multiplayer game. Auto-dismisses after `durationMs` (default 2s).
 *
 * Theme: Maxi Elite (deep violet bg, royal purple primary, gold accent).
 */
export function TurnTransition({
  visible,
  playerName,
  playerNumber,
  onDone,
  durationMs = 2000,
}: TurnTransitionProps) {
  const cardOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(20);
  const badgeScale = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
      );
      cardTranslate.value = withSequence(
        withTiming(20, { duration: 0 }),
        withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) }),
      );
      badgeScale.value = withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(1, { duration: 360, easing: Easing.out(Easing.elastic(1.1)) }),
      );

      const timer = setTimeout(onDone, durationMs);
      return () => clearTimeout(timer);
    }
  }, [visible, durationMs]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslate.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(10, 4, 24, 0.82)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <Animated.View style={[cardAnimatedStyle, { width: "100%", maxWidth: 340 }]}>
          <LinearGradient
            colors={GRADIENTS.bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: C.purpleBorder,
              paddingVertical: 36,
              paddingHorizontal: 28,
              alignItems: "center",
              shadowColor: C.purple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 14,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.gold,
                letterSpacing: 3,
                marginBottom: 14,
              }}
            >
              NEXT UP
            </Text>

            <Animated.View
              style={[
                badgeAnimatedStyle,
                {
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: C.purpleDim,
                  borderWidth: 2,
                  borderColor: C.gold,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: C.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.55,
                  shadowRadius: 12,
                  elevation: 8,
                },
              ]}
            >
              <Text style={{ fontSize: 22, fontWeight: "900", color: C.gold }}>
                P{playerNumber}
              </Text>
            </Animated.View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: C.textPrimary,
                textAlign: "center",
                letterSpacing: 0.5,
              }}
              numberOfLines={2}
            >
              {playerName}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: C.textSecondary,
                marginTop: 10,
                letterSpacing: 1.5,
              }}
            >
              YOUR TURN
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
