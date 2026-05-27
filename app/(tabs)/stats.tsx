import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { AchievementBadge } from '@/components/achievement-badge';
import { useGame } from '@/lib/game-context';
import { StatsManager, PlayerStats } from '@/lib/stats-manager';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function StatsScreen() {
  const router = useRouter();
  const gameContext = useGame();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  useEffect(() => {
    loadStats();
  }, [gameContext.gameState]);

  const loadStats = async () => {
    if (gameContext.gameState && gameContext.gameState.players.length > 0) {
      const currentPlayer = gameContext.gameState.players[gameContext.gameState.currentPlayerIndex];
      const stats = await StatsManager.getPlayerStats(currentPlayer.id);
      setPlayerStats(stats);
    }
    setLoading(false);
  };

  if (loading || !playerStats) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground text-lg">Loading stats...</Text>
      </ScreenContainer>
    );
  }

  const unlockedAchievements = playerStats.achievements.filter(a => a.isUnlocked).length;
  const winRate = playerStats.totalGames > 0 ? Math.round((playerStats.wins / playerStats.totalGames) * 100) : 0;

  return (
    <ScreenContainer className="flex-1">
      <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View className="gap-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="gap-2">
                <Text className="text-3xl font-bold text-yellow-400">{playerStats.playerName}</Text>
                <Text className="text-sm text-cyan-400">Player Profile</Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="bg-red-500/20 px-4 py-2 rounded-lg border border-red-500"
              >
                <Text className="text-red-400 font-semibold">Back</Text>
              </Pressable>
            </View>

            {/* Stats Overview Cards */}
            <View className="gap-3">
              <LinearGradient
                colors={['rgba(0, 255, 200, 0.1)', 'rgba(0, 200, 150, 0.05)']}
                className="rounded-xl p-4 border border-cyan-500/30"
              >
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-cyan-400 text-xs font-semibold mb-1">GAMES PLAYED</Text>
                    <Text className="text-2xl font-bold text-foreground">{playerStats.totalGames}</Text>
                  </View>
                  <View>
                    <Text className="text-cyan-400 text-xs font-semibold mb-1">WIN RATE</Text>
                    <Text className="text-2xl font-bold text-foreground">{winRate}%</Text>
                  </View>
                  <View>
                    <Text className="text-cyan-400 text-xs font-semibold mb-1">WINS</Text>
                    <Text className="text-2xl font-bold text-green-400">{playerStats.wins}</Text>
                  </View>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(255, 200, 0, 0.1)', 'rgba(255, 150, 0, 0.05)']}
                className="rounded-xl p-4 border border-yellow-500/30"
              >
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-yellow-400 text-xs font-semibold mb-1">BEST SCORE</Text>
                    <Text className="text-2xl font-bold text-foreground">{playerStats.bestScore}</Text>
                  </View>
                  <View>
                    <Text className="text-yellow-400 text-xs font-semibold mb-1">AVG SCORE</Text>
                    <Text className="text-2xl font-bold text-foreground">{playerStats.averageScore}</Text>
                  </View>
                  <View>
                    <Text className="text-yellow-400 text-xs font-semibold mb-1">TOTAL SCORE</Text>
                    <Text className="text-2xl font-bold text-foreground">{playerStats.totalScore}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2 mb-4">
            {(['overview', 'history', 'achievements'] as const).map(tab => (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTab(tab);
                }}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  selectedTab === tab
                    ? 'bg-cyan-500/30 border-cyan-400'
                    : 'bg-slate-800/30 border-slate-600'
                }`}
              >
                <Text
                  className={`text-center font-semibold text-sm ${
                    selectedTab === tab ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground mb-2">Quick Stats</Text>
              <LinearGradient
                colors={['rgba(100, 100, 200, 0.1)', 'rgba(80, 80, 150, 0.05)']}
                className="rounded-xl p-4 border border-blue-500/30"
              >
                <View className="gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Losses</Text>
                    <Text className="text-foreground font-semibold">{playerStats.losses}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Achievements Unlocked</Text>
                    <Text className="text-foreground font-semibold">
                      {unlockedAchievements} / {playerStats.achievements.length}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted">Last Played</Text>
                    <Text className="text-foreground font-semibold">
                      {playerStats.gameHistory.length > 0
                        ? new Date(playerStats.gameHistory[playerStats.gameHistory.length - 1].date).toLocaleDateString()
                        : 'Never'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {selectedTab === 'history' && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground mb-2">Game History</Text>
              {playerStats.gameHistory.length === 0 ? (
                <Text className="text-muted text-center py-8">No games played yet</Text>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={playerStats.gameHistory.slice().reverse()}
                  keyExtractor={item => item.gameId}
                  renderItem={({ item }) => (
                    <LinearGradient
                      colors={['rgba(150, 100, 200, 0.1)', 'rgba(120, 80, 150, 0.05)']}
                      className="rounded-xl p-3 mb-2 border border-purple-500/30"
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-foreground font-semibold">{item.score} pts</Text>
                          <Text className="text-xs text-muted">
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            className={`font-bold ${
                              item.placement === 1 ? 'text-green-400' : 'text-yellow-400'
                            }`}
                          >
                            {item.placement === 1 ? '🥇 1st' : `${item.placement === 2 ? '🥈' : '🥉'} ${item.placement}${['st', 'nd', 'rd', 'th'][Math.min(item.placement - 1, 3)]}`}
                          </Text>
                          <Text className="text-xs text-muted">{item.diceCount} dice</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                />
              )}
            </View>
          )}

          {selectedTab === 'achievements' && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground mb-2">
                Achievements ({unlockedAchievements}/{playerStats.achievements.length})
              </Text>
              <View className="gap-3">
                {playerStats.achievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </ScreenContainer>
  );
}
