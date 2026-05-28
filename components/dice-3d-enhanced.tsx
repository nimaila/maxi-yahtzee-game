import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { C } from "@/constants/game-theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface Dice3DEnhancedProps {
  value: number;
  isHeld: boolean;
  isRolling: boolean;
  onPress?: () => void;
  size?: number;
}

export function Dice3DEnhanced({
  value,
  isHeld,
  isRolling,
  onPress,
  size = 80,
}: Dice3DEnhancedProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Dice pip positions for each face (1-6)
  const pipPositions: Record<number, { x: number; y: number }[]> = {
    1: [{ x: 50, y: 50 }],
    2: [
      { x: 25, y: 25 },
      { x: 75, y: 75 },
    ],
    3: [
      { x: 25, y: 25 },
      { x: 50, y: 50 },
      { x: 75, y: 75 },
    ],
    4: [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 25, y: 75 },
      { x: 75, y: 75 },
    ],
    5: [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 50, y: 50 },
      { x: 25, y: 75 },
      { x: 75, y: 75 },
    ],
    6: [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 25, y: 50 },
      { x: 75, y: 50 },
      { x: 25, y: 75 },
      { x: 75, y: 75 },
    ],
  };

  useEffect(() => {
    if (isRolling) {
      // Rapid rotation animation for rolling effect
      rotateX.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 100, easing: Easing.linear }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );

      rotateY.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 120, easing: Easing.linear }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );

      rotateZ.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 140, easing: Easing.linear }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.3, { duration: 200 })
        ),
        -1
      );
    } else {
      // Stop rolling and settle
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
      rotateZ.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(isHeld ? 0.8 : 0.3, { duration: 300 });
    }
  }, [isRolling, isHeld]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
      { perspective: 1000 },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const pips = pipPositions[value] || pipPositions[1];

  return (
    <Pressable
      onPress={() => {
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
        onPress?.();
      }}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View style={[glowStyle, { position: "absolute" }]}>
        <View
          style={{
            width: size + 20,
            height: size + 20,
            borderRadius: size / 4,
            backgroundColor: isHeld ? C.amber : C.purple,
            opacity: 0.35,
            shadowColor: isHeld ? C.amber : C.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 8,
          }}
        />
      </Animated.View>

      <Animated.View
        style={[
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 6,
            backgroundColor: C.diceBg,
            borderWidth: 2,
            borderColor: isHeld ? C.amber : C.diceBorder,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: isHeld ? C.amber : C.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
      >
        {/* Pips */}
        {pips.map((pip, idx) => (
          <View
            key={idx}
            style={{
              position: "absolute",
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: size * 0.075,
              backgroundColor: isHeld ? C.amber : C.dicePip,
              left: `${pip.x}%`,
              top: `${pip.y}%`,
              transform: [
                { translateX: -(size * 0.075) },
                { translateY: -(size * 0.075) },
              ],
              shadowColor: isHeld ? C.amber : C.purple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        ))}

        {/* Value display (for reference) */}
        <Text
          style={{
            position: "absolute",
            fontSize: size * 0.3,
            fontWeight: "900",
            color: isHeld ? C.amber : C.textSecondary,
            opacity: 0.15,
            textShadowColor: isHeld ? C.amber : C.purple,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 2,
          }}
        >
          {value}
        </Text>
      </Animated.View>

      {/* Status indicator */}
      {isHeld && (
        <View
          style={{
            position: "absolute",
            bottom: -20,
            backgroundColor: C.amber,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: C.bgDeep }}>
            HELD
          </Text>
        </View>
      )}
    </Pressable>
  );
}
