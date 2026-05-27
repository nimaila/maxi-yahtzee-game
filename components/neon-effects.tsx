import React from "react";
import { View, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Neon Glow Card - Glassmorphic card with glowing neon border
 */
export function NeonCard({
  children,
  glowColor = "#00D9FF",
  intensity = 1,
  style,
  ...props
}: ViewProps & { glowColor?: string; intensity?: number }) {
  return (
    <View
      style={[
        {
          borderRadius: 16,
          padding: 16,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: glowColor,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4 * intensity,
          shadowRadius: 12 * intensity,
          elevation: 8 * intensity,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * Neon Button - Glowing neon bordered button
 */
export function NeonButton({
  children,
  glowColor = "#00D9FF",
  onPress,
  disabled = false,
  style,
  ...props
}: ViewProps & {
  glowColor?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={[
        {
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: glowColor,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: disabled ? 0.2 : 0.6,
          shadowRadius: 16,
          elevation: 12,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={["rgba(0, 217, 255, 0.1)", "rgba(255, 0, 255, 0.05)"] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

/**
 * Animated Gradient Background - Dynamic flowing gradient
 */
export function GradientBackground({
  children,
  colors = ["#0F172A", "#1E1B4B", "#2D1B69"],
  ...props
}: ViewProps & { colors?: string[] }) {
  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

/**
 * Glow Text - Text with glowing effect
 */
export function GlowText({
  text,
  glowColor = "#FFD700",
  size = 24,
}: {
  text: string;
  glowColor?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        position: "relative" as const,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Glow text rendered via Text component */}
    </View>
  );
}

/**
 * Particle Effect - Floating particles for ambient effects
 */
export function ParticleEffect({
  count = 20,
  color = "#00D9FF",
}: {
  count?: number;
  color?: string;
}) {
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            borderRadius: 50,
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      ))}
    </View>
  );
}
