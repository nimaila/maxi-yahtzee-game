import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  wins: number;
  losses: number;
  bestScore: number;
  averageScore: number;
  totalScore: number;
  achievements: Achievement[];
  gameHistory: GameRecord[];
  lastUpdated: string;
}

export interface GameRecord {
  gameId: string;
  date: string;
  score: number;
  placement: number; // 1st, 2nd, 3rd, 4th
  opponents: string[];
  diceCount: number;
  bonusThreshold: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'isUnlocked'>> = {
  PERFECT_GAME: {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Score 500+ points in a single game',
    icon: '🏆',
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Win 5 consecutive games',
    icon: '⚡',
  },
  SCORE_COLLECTOR: {
    id: 'score_collector',
    name: 'Score Collector',
    description: 'Accumulate 10,000 total points',
    icon: '💰',
  },
  MAXI_YAHTZEE: {
    id: 'maxi_yahtzee',
    name: 'Maxi Yahtzee Master',
    description: 'Score a Maxi Yahtzee (6 of a kind)',
    icon: '🎲',
  },
  FIRST_GAME: {
    id: 'first_game',
    name: 'First Roll',
    description: 'Complete your first game',
    icon: '🎮',
  },
  CHAMPION: {
    id: 'champion',
    name: 'Champion',
    description: 'Win 10 games',
    icon: '👑',
  },
  DICE_MASTER: {
    id: 'dice_master',
    name: 'Dice Master',
    description: 'Play 50 games',
    icon: '🎯',
  },
  LUCKY_ROLL: {
    id: 'lucky_roll',
    name: 'Lucky Roll',
    description: 'Roll a Yahtzee on your first roll',
    icon: '✨',
  },
};

const STATS_STORAGE_KEY = 'maxi_yahtzee_player_stats';
const STATS_LIST_KEY = 'maxi_yahtzee_stats_list';

export class StatsManager {
  static async initializePlayerStats(playerId: string, playerName: string): Promise<PlayerStats> {
    const stats: PlayerStats = {
      playerId,
      playerName,
      totalGames: 0,
      wins: 0,
      losses: 0,
      bestScore: 0,
      averageScore: 0,
      totalScore: 0,
      achievements: Object.values(ACHIEVEMENTS).map(ach => ({
        ...ach,
        isUnlocked: false,
      })),
      gameHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    await this.savePlayerStats(playerId, stats);
    return stats;
  }

  static async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    try {
      const data = await AsyncStorage.getItem(`${STATS_STORAGE_KEY}_${playerId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading player stats:', error);
      return null;
    }
  }

  static async savePlayerStats(playerId: string, stats: PlayerStats): Promise<void> {
    try {
      stats.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(`${STATS_STORAGE_KEY}_${playerId}`, JSON.stringify(stats));

      // Update stats list for quick access
      const statsList = await this.getStatsList();
      const index = statsList.findIndex(s => s.playerId === playerId);
      if (index >= 0) {
        statsList[index] = {
          playerId: stats.playerId,
          playerName: stats.playerName,
          totalGames: stats.totalGames,
          wins: stats.wins,
          bestScore: stats.bestScore,
        };
      } else {
        statsList.push({
          playerId: stats.playerId,
          playerName: stats.playerName,
          totalGames: stats.totalGames,
          wins: stats.wins,
          bestScore: stats.bestScore,
        });
      }
      await AsyncStorage.setItem(STATS_LIST_KEY, JSON.stringify(statsList));
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  }

  static async recordGameResult(
    playerId: string,
    score: number,
    placement: number,
    opponents: string[],
    diceCount: number,
    bonusThreshold: number,
  ): Promise<PlayerStats | null> {
    const stats = await this.getPlayerStats(playerId);
    if (!stats) return null;

    const gameRecord: GameRecord = {
      gameId: `game_${Date.now()}`,
      date: new Date().toISOString(),
      score,
      placement,
      opponents,
      diceCount,
      bonusThreshold,
    };

    stats.gameHistory.push(gameRecord);
    stats.totalGames += 1;
    stats.totalScore += score;
    stats.averageScore = Math.round(stats.totalScore / stats.totalGames);

    if (placement === 1) {
      stats.wins += 1;
    } else {
      stats.losses += 1;
    }

    if (score > stats.bestScore) {
      stats.bestScore = score;
    }

    // Check for achievement unlocks
    this.checkAchievements(stats, score, placement);

    await this.savePlayerStats(playerId, stats);
    return stats;
  }

  private static checkAchievements(stats: PlayerStats, score: number, placement: number): void {
    // Perfect Game: 500+ points
    if (score >= 500) {
      this.unlockAchievement(stats, 'PERFECT_GAME');
    }

    // First Game
    if (stats.totalGames === 1) {
      this.unlockAchievement(stats, 'FIRST_GAME');
    }

    // Champion: 10 wins
    if (stats.wins >= 10) {
      this.unlockAchievement(stats, 'CHAMPION');
    }

    // Dice Master: 50 games
    if (stats.totalGames >= 50) {
      this.unlockAchievement(stats, 'DICE_MASTER');
    }

    // Score Collector: 10,000 total points
    if (stats.totalScore >= 10000) {
      this.unlockAchievement(stats, 'SCORE_COLLECTOR');
    }

    // Streak Master: 5 consecutive wins
    const recentWins = stats.gameHistory.slice(-5).filter(g => g.placement === 1).length;
    if (recentWins === 5) {
      this.unlockAchievement(stats, 'STREAK_MASTER');
    }
  }

  private static unlockAchievement(stats: PlayerStats, achievementId: string): void {
    const achievement = stats.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date().toISOString();
    }
  }

  static async getStatsList(): Promise<Array<{ playerId: string; playerName: string; totalGames: number; wins: number; bestScore: number }>> {
    try {
      const data = await AsyncStorage.getItem(STATS_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading stats list:', error);
      return [];
    }
  }

  static async clearAllStats(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const statsKeys = keys.filter(k => k.startsWith(STATS_STORAGE_KEY));
      await AsyncStorage.multiRemove([...statsKeys, STATS_LIST_KEY]);
    } catch (error) {
      console.error('Error clearing stats:', error);
    }
  }
}
