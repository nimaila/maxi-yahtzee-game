import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Achievement } from '@/lib/stats-manager';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

export function AchievementBadge({ achievement, onPress }: AchievementBadgeProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={
          achievement.isUnlocked
            ? ['rgba(0, 255, 200, 0.2)', 'rgba(0, 200, 150, 0.1)']
            : ['rgba(100, 100, 100, 0.2)', 'rgba(80, 80, 80, 0.1)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 border-2"
        style={{
          borderColor: achievement.isUnlocked ? '#00ffc8' : '#444444',
          shadowColor: achievement.isUnlocked ? '#00ffc8' : '#000000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: achievement.isUnlocked ? 0.5 : 0.2,
          shadowRadius: achievement.isUnlocked ? 12 : 4,
          elevation: achievement.isUnlocked ? 8 : 2,
        }}
      >
        <View className="items-center gap-2">
          <Text className="text-4xl">{achievement.icon}</Text>
          <Text className="text-sm font-semibold text-foreground text-center">
            {achievement.name}
          </Text>
          <Text
            className="text-xs text-muted text-center"
            numberOfLines={2}
          >
            {achievement.description}
          </Text>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text className="text-xs text-cyan-400 mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
          {!achievement.isUnlocked && (
            <Text className="text-xs text-gray-500 mt-1">Locked</Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
