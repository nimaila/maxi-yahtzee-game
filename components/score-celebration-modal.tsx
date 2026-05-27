import React, { useEffect } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ScoreCelebrationModalProps {
  visible: boolean;
  score: number;
  category: string;
  onClose: () => void;
}

export function ScoreCelebrationModal({
  visible,
  score,
  category,
  onClose,
}: ScoreCelebrationModalProps) {
  const checkmarkScale = useSharedValue(0);
  const checkmarkRotate = useSharedValue(-45);
  const glowOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // Trigger celebration animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      checkmarkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.elastic(1.2)) })
      );

      checkmarkRotate.value = withSequence(
        withTiming(-45, { duration: 0 }),
        withTiming(0, { duration: 400, easing: Easing.out(Easing.elastic(1.2)) })
      );

      glowOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 300 }),
        withTiming(0.6, { duration: 200 })
      );

      cardScale.value = withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.elastic(1)) })
      );

      // Auto-close after 2 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkmarkScale.value },
      { rotate: `${checkmarkRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={[
            cardAnimatedStyle,
            {
              width: "85%",
              maxWidth: 320,
              borderRadius: 20,
              overflow: "hidden",
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(20, 184, 166, 0.2)", "rgba(16, 185, 129, 0.1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderWidth: 2,
              borderColor: "#14B8A6",
              paddingVertical: 40,
              paddingHorizontal: 24,
              alignItems: "center",
              shadowColor: "#14B8A6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Glow background */}
            <Animated.View
              style={[
                glowAnimatedStyle,
                {
                  position: "absolute",
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  backgroundColor: "#14B8A6",
                  opacity: 0.2,
                },
              ]}
            />

            {/* Checkmark */}
            <Animated.View
              style={[
                checkmarkAnimatedStyle,
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: "#FFD700",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  shadowColor: "#FFD700",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                  elevation: 8,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "#FFD700",
                  textShadowColor: "#FFD700",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
                }}
              >
                ✓
              </Text>
            </Animated.View>

            {/* Text */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#14B8A6",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              SCORE LOCKED
            </Text>

            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "#FFD700",
                marginBottom: 12,
                textAlign: "center",
                textShadowColor: "#FFD700",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
            >
              +{score}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#E0E7FF",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              points for
            </Text>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#14B8A6",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              {category.toUpperCase()}
            </Text>

            {/* Decorative elements */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 20 }}>✨</Text>
              <Text style={{ fontSize: 20 }}>🎲</Text>
              <Text style={{ fontSize: 20 }}>✨</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
