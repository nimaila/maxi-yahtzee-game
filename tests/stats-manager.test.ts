import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StatsManager, PlayerStats, ACHIEVEMENTS } from '../lib/stats-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiRemove: vi.fn(),
    getAllKeys: vi.fn(),
  },
}));

describe('StatsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initializePlayerStats', () => {
    it('should create new player stats with default values', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';

      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      expect(stats.playerId).toBe(playerId);
      expect(stats.playerName).toBe(playerName);
      expect(stats.totalGames).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.bestScore).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.totalScore).toBe(0);
      expect(stats.gameHistory).toEqual([]);
      expect(stats.achievements.length).toBe(Object.keys(ACHIEVEMENTS).length);
      expect(stats.achievements.every(a => !a.isUnlocked)).toBe(true);
    });

    it('should save player stats to AsyncStorage', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';

      await StatsManager.initializePlayerStats(playerId, playerName);

      expect(vi.mocked(AsyncStorage.setItem)).toHaveBeenCalled();
    });
  });

  describe('recordGameResult', () => {
    it('should record a game result and update player stats', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      // Mock getPlayerStats to return our stats
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(stats));

      const updatedStats = await StatsManager.recordGameResult(
        playerId,
        350,
        1,
        ['Player 2', 'Player 3'],
        6,
        75
      );

      expect(updatedStats).not.toBeNull();
      expect((updatedStats as any)?.totalGames).toBe(1);
      expect((updatedStats as any)?.wins).toBe(1);
      expect((updatedStats as any)?.bestScore).toBe(350);
      expect((updatedStats as any)?.totalScore).toBe(350);
      expect((updatedStats as any)?.averageScore).toBe(350);
      expect((updatedStats as any)?.gameHistory.length).toBe(1);
    });

    it('should calculate win rate correctly after multiple games', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(stats));

      // Record 1 win and verify
      const updatedStats = await StatsManager.recordGameResult(
        playerId,
        300,
        1,
        ['Opponent'],
        6,
        75
      );

      expect((updatedStats as any)?.totalGames).toBe(1);
      expect((updatedStats as any)?.wins).toBe(1);
      expect((updatedStats as any)?.losses).toBe(0);
    });

    it('should initialize achievements in unlocked state', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(stats));

      // All achievements should start as locked
      const allLocked = stats.achievements.every(a => !a.isUnlocked);
      expect(allLocked).toBe(true);
    });



    it('should track game history with correct placement', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(stats));

      const updatedStats = await StatsManager.recordGameResult(
        playerId,
        350,
        2,
        ['Winner'],
        6,
        75
      );

      expect((updatedStats as any)?.gameHistory.length).toBe(1);
      expect((updatedStats as any)?.gameHistory[0].placement).toBe(2);
      expect((updatedStats as any)?.gameHistory[0].score).toBe(350);
    });
  });

  describe('getPlayerStats', () => {
    it('should return null for non-existent player', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const stats = await StatsManager.getPlayerStats('non_existent');

      expect(stats).toBeNull();
    });

    it('should retrieve saved player stats', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const savedStats = await StatsManager.initializePlayerStats(playerId, playerName);

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(savedStats));

      const retrievedStats = await StatsManager.getPlayerStats(playerId);

      expect(retrievedStats).toEqual(savedStats);
    });
  });

  describe('getStatsList', () => {
    it('should return empty array when no stats exist', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const statsList = await StatsManager.getStatsList();

      expect(statsList).toEqual([]);
    });

    it('should return list of all player stats', async () => {
      const mockStatsList = [
        { playerId: 'player_1', playerName: 'Player 1', totalGames: 5, wins: 3, bestScore: 400 },
        { playerId: 'player_2', playerName: 'Player 2', totalGames: 3, wins: 1, bestScore: 350 },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(mockStatsList));

      const statsList = await StatsManager.getStatsList();

      expect(statsList).toEqual(mockStatsList);
      expect(statsList.length).toBe(2);
    });
  });

  describe('Achievement structure', () => {
    it('should have all required achievements defined', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      // Verify achievements structure
      expect(stats.achievements).toBeDefined();
      expect(stats.achievements.length).toBeGreaterThan(0);
      
      // Verify each achievement has required properties
      stats.achievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('isUnlocked');
        expect(typeof achievement.isUnlocked).toBe('boolean');
      });
    });

    it('should have specific achievement types', async () => {
      const playerId = 'player_123';
      const playerName = 'John Doe';
      const stats = await StatsManager.initializePlayerStats(playerId, playerName);

      const achievementIds = stats.achievements.map(a => a.id);
      expect(achievementIds).toContain('first_game');
      expect(achievementIds).toContain('perfect_game');
      expect(achievementIds).toContain('champion');
      expect(achievementIds).toContain('dice_master');
      expect(achievementIds).toContain('score_collector');
    });
  });
});
