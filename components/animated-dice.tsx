import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface AnimatedDiceProps {
  value: number;
  isHeld: boolean;
  isRolling: boolean;
  onRollComplete?: () => void;
}

export function AnimatedDice({ value, isHeld, isRolling, onRollComplete }: AnimatedDiceProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isRolling) {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Rapid spinning animation
      rotateX.value = withTiming(Math.random() * 720 + 360, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      rotateY.value = withTiming(Math.random() * 720 + 360, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      rotateZ.value = withTiming(Math.random() * 360, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      // Scale animation: grow then shrink back
      scale.value = withTiming(1.15, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      // Call completion callback after animation
      setTimeout(() => {
        if (onRollComplete) {
          runOnJS(onRollComplete)();
        }
      }, 600);
    } else if (isHeld) {
      // Held state: subtle glow
      scale.value = withSpring(1.05, {
        damping: 8,
        mass: 1,
        overshootClamping: false,
      });
      opacity.value = withTiming(0.95, { duration: 200 });
    } else {
      // Normal state
      scale.value = withSpring(1, {
        damping: 8,
        mass: 1,
        overshootClamping: false,
      });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isRolling, isHeld]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          aspectRatio: 1,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderWidth: 2,
          borderColor: isHeld ? "rgba(16, 185, 129, 0.6)" : "rgba(124, 58, 237, 0.2)",
          shadowColor: isHeld ? "rgba(16, 185, 129, 0.5)" : "rgba(124, 58, 237, 0.3)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isHeld ? 0.8 : 0.4,
          shadowRadius: isHeld ? 8 : 4,
          elevation: isHeld ? 12 : 6,
        },
        animatedStyle,
      ]}
    >
      <Text className="text-3xl font-bold text-black">{value}</Text>
    </Animated.View>
  );
}
