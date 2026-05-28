import React, { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { C } from "@/constants/game-theme";

interface ConfettiProps {
  /** How many particles to emit. Default 60. */
  count?: number;
  /** Total animation duration (ms). Default 2500. */
  durationMs?: number;
}

interface ParticleSpec {
  id: number;
  startX: number;       // 0..screenW px
  endX: number;
  rotateDeg: number;    // total rotation over the fall
  delay: number;        // ms
  size: number;         // px
  color: string;
  shape: "square" | "circle";
}

const COLORS = [C.gold, C.purple, "#C4A0FF", "#E8C66B", "#FFFFFF"];

function randomParticle(id: number, screenW: number, totalDuration: number): ParticleSpec {
  const startX = Math.random() * screenW;
  // Drift sideways slightly during the fall
  const drift = (Math.random() - 0.5) * 140;
  return {
    id,
    startX,
    endX: startX + drift,
    rotateDeg: (Math.random() - 0.5) * 720, // ±360deg total spin
    delay: Math.random() * (totalDuration * 0.25), // stagger across first quarter
    size: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.random() > 0.5 ? "square" : "circle",
  };
}

/**
 * Game-Over confetti burst — falls from the top of the screen with gravity-like
 * easing, mild horizontal drift, and end-state rotation. Uses Reanimated only
 * (no external confetti library — every dep is already in the project).
 *
 * Mounts the particles once and animates them; the View has pointerEvents
 * disabled so it never blocks UI interaction underneath.
 */
export function Confetti({ count = 60, durationMs = 2500 }: ConfettiProps) {
  const { width: screenW, height: screenH } = Dimensions.get("window");

  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => randomParticle(i, screenW, durationMs)),
    [count, screenW, durationMs],
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <Particle key={p.id} spec={p} fallHeight={screenH + 100} totalDuration={durationMs} />
      ))}
    </View>
  );
}

interface ParticleProps {
  spec: ParticleSpec;
  fallHeight: number;
  totalDuration: number;
}

function Particle({ spec, fallHeight, totalDuration }: ParticleProps) {
  const ty = useSharedValue(-40);
  const tx = useSharedValue(spec.startX);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Fall — slight ease-in for "gravity" feel
    ty.value = withDelay(
      spec.delay,
      withTiming(fallHeight, {
        duration: totalDuration,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
    );
    // Horizontal drift — linear is fine
    tx.value = withDelay(
      spec.delay,
      withTiming(spec.endX, { duration: totalDuration, easing: Easing.linear }),
    );
    rot.value = withDelay(
      spec.delay,
      withTiming(spec.rotateDeg, { duration: totalDuration, easing: Easing.linear }),
    );
    // Fade out in the last 20% of the fall
    opacity.value = withDelay(
      spec.delay + totalDuration * 0.8,
      withTiming(0, { duration: totalDuration * 0.2 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          width: spec.size,
          height: spec.size,
          backgroundColor: spec.color,
          borderRadius: spec.shape === "circle" ? spec.size / 2 : 1,
        },
      ]}
    />
  );
}
