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
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface Dice3DEnhancedProps {
  value: number;
  isHeld: boolean;
  isRolling: boolean;
  onPress?: () => void;
  size?: number;
}

// Pip positions on a 100×100 die face. The center 50,50 is dice-anatomically
// correct for 1, 3, and 5; the rest are placed at canonical .25 / .75 offsets.
const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
};

const PIP_RADIUS = 8;          // inside a 100-unit viewBox
const FACE_GRADIENT_ID = "dieFaceGrad";

/**
 * Dice3DEnhanced — Maxi Yahtzee crystal die.
 *
 * Renders a single die face as a styled View with an SVG overlay for the
 * pips (replaces the prior View-based pip dots and removes the value-number
 * "ghost" behind them). The SVG gives crisper pips at all sizes and supports
 * a subtle radial gradient inside the face for a crystal feel.
 *
 * Animations (rotation, glow, press scale) are unchanged from the prior
 * implementation — the prop signature is also unchanged.
 */
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

  useEffect(() => {
    if (isRolling) {
      rotateX.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 100, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      );
      rotateY.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 120, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      );
      rotateZ.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 140, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.3, { duration: 200 }),
        ),
        -1,
      );
    } else {
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
      rotateZ.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(isHeld ? 0.8 : 0.3, { duration: 300 });
    }
  }, [isRolling, isHeld]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const pips = PIP_POSITIONS[value] ?? PIP_POSITIONS[1];
  const pipColor = isHeld ? C.amber : C.dicePip;
  const borderColor = isHeld ? C.amber : C.diceBorder;
  const glowColor = isHeld ? C.amber : C.purple;

  return (
    <Pressable
      onPress={() => {
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withTiming(1, { duration: 100 }),
        );
        onPress?.();
      }}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      {/* Outer halo */}
      <Animated.View style={[glowStyle, { position: "absolute" }]}>
        <View
          style={{
            width: size + 20,
            height: size + 20,
            borderRadius: size / 4,
            backgroundColor: glowColor,
            opacity: 0.35,
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 8,
          }}
        />
      </Animated.View>

      {/* Die body */}
      <Animated.View
        style={[
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 6,
            backgroundColor: C.diceBg,
            borderWidth: 2,
            borderColor,
            overflow: "hidden",
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            {/* Subtle radial sheen to suggest crystal interior */}
            <RadialGradient id={FACE_GRADIENT_ID} cx="35" cy="30" r="60">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.02" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.20" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill={`url(#${FACE_GRADIENT_ID})`} />
          {pips.map(([cx, cy], idx) => (
            <Circle
              key={idx}
              cx={cx}
              cy={cy}
              r={PIP_RADIUS}
              fill={pipColor}
              opacity={0.95}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Held badge */}
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
