import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { Dice3DEnhanced } from "@/components/dice-3d-enhanced";
import { ScoreCelebrationModal } from "@/components/score-celebration-modal";
import { TurnTransition } from "@/components/turn-transition";
import { useGame } from "@/lib/game-context";
import { audioManager } from "@/lib/audio-manager";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { C, GRADIENTS } from "@/constants/game-theme";
import {
  calculateScore,
  calculateBonus,
  getCategoryName,
  getCategoryPoints,
  type ScoringCategory,
} from "@/lib/game-engine";

// ── Scorecard section definitions ────────────────────────────────────────────
type SectionDef = { title: string; categories: ScoringCategory[] };

const SECTIONS: SectionDef[] = [
  {
    title: "UPPER SECTION",
    categories: ["ones", "twos", "threes", "fours", "fives", "sixes"],
  },
  {
    title: "COMBINATION SCORES",
    categories: [
      "pair", "twoPairs", "threePairs",
      "threeOfAKind", "fourOfAKind", "fiveOfAKind",
    ],
  },
  {
    title: "STRAIGHTS",
    categories: ["smallStraight", "bigStraight", "fullStraight"],
  },
  {
    title: "HOUSE & MISC.",
    categories: ["fullHouse", "chance"],
  },
  {
    title: "MAXI SPECIALS",
    categories: ["villa", "tower", "maxiYahtzee"],
  },
];

const ALL_CATEGORIES: ScoringCategory[] = SECTIONS.flatMap((s) => s.categories);

// ── Component ────────────────────────────────────────────────────────────────
export default function GameplayScreen() {
  const router = useRouter();
  const gameContext = useGame();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ score: 0, category: "" });

  // P0 fix #2 — drive the dice tumble animation. Without this, the
  // Dice3DEnhanced component receives isRolling={false} permanently.
  const [isRolling, setIsRolling] = useState(false);
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // P1 — Turn transition state. We capture the next player's identity at the
  // moment of scoring so the overlay shows the right name after the
  // celebration modal dismisses.
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<{
    name: string;
    number: number;
  } | null>(null);
  // Tracks whether the next celebration dismiss should hand off to the
  // transition (set true only when scoring actually advances to another player).
  const pendingHandoffRef = useRef(false);

  // P0 fix #1 — Game Over navigation. gameState.gameOver can't be checked
  // synchronously after scoreCategory(); React state updates are async.
  useEffect(() => {
    if (gameContext.gameState?.gameOver) {
      router.push("/gameover");
    }
  }, [gameContext.gameState?.gameOver, router]);

  // Cleanup the roll-animation timer on unmount.
  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  if (!gameContext.gameState) {
    return (
      <ScreenContainer>
        <Text style={{ color: C.textSecondary }}>Loading game...</Text>
      </ScreenContainer>
    );
  }

  const { gameState, isPaused, lastScoredCategory } = gameContext;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const scoredCategories = Object.keys(currentPlayer.scores) as ScoringCategory[];
  const hasRolled = gameState.currentDice.some((d) => d > 0);

  // ── Score preview: top 3 scoring options for the current roll ──────────────
  const scorePreview = hasRolled
    ? ALL_CATEGORIES.filter((cat) => !scoredCategories.includes(cat))
        .map((cat) => ({ cat, score: calculateScore(gameState.currentDice, cat) }))
        .filter((item): item is { cat: ScoringCategory; score: number } =>
          item.score !== null && item.score > 0
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  // ── Upper section bonus progress ──────────────────────────────────────────
  const upperTotal = (["ones", "twos", "threes", "fours", "fives", "sixes"] as ScoringCategory[])
    .reduce((sum, cat) => sum + (currentPlayer.scores[cat] ?? 0), 0);
  const bonusThreshold = gameState.rules.bonusThreshold;
  const bonusEarned = calculateBonus(currentPlayer.scores, bonusThreshold);
  const bonusProgress = Math.min(upperTotal / bonusThreshold, 1);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRollDice = async () => {
    if (gameState.rollsRemaining <= 0 || isPaused || isRolling) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await audioManager.playDiceRoll();
    // Drive the tumble animation for ~500ms (Dice3DEnhanced reads isRolling).
    setIsRolling(true);
    gameContext.rollDice();
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    rollTimeoutRef.current = setTimeout(() => setIsRolling(false), 500);
  };

  const handleDicePress = (index: number) => {
    if (!hasRolled || isPaused) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    gameContext.holdDie(index);
  };

  const handleScoreCategory = async (category: ScoringCategory) => {
    if (!hasRolled || isPaused) return;
    const score = calculateScore(gameState.currentDice, category) ?? 0;
    setCelebrationData({ score, category: getCategoryName(category) });
    setCelebrationVisible(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await audioManager.playScoreConfirmation();

    // Determine the next player BEFORE scoring (so we can preload the
    // transition overlay with the right name). Skip handoff for solo games.
    const isMultiplayer = gameState.players.length > 1;
    if (isMultiplayer) {
      const nextIdx = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      const nextPlayer = gameState.players[nextIdx];
      setTransitionTarget({ name: nextPlayer.name, number: nextIdx + 1 });
      pendingHandoffRef.current = true;
    }

    gameContext.scoreCategory(category);
    // Game Over nav is handled by the useEffect above — gameState.gameOver
    // hasn't updated yet at this point (React state updates are async).
  };

  // Fires when the celebration modal auto-dismisses. If this score advanced
  // to another player (and the game isn't over), show the turn transition.
  const handleCelebrationClose = useCallback(() => {
    setCelebrationVisible(false);
    if (pendingHandoffRef.current && !gameContext.gameState?.gameOver) {
      setTransitionVisible(true);
    }
    pendingHandoffRef.current = false;
  }, [gameContext.gameState?.gameOver]);

  const handleTransitionDone = useCallback(() => {
    setTransitionVisible(false);
  }, []);

  const handleQuit = () => {
    gameContext.quitGame();
    router.push("/");
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const rollsTotal = gameState.rules.throwsPerTurn;
  const rollsUsed = rollsTotal - gameState.rollsRemaining;
  const canRoll =
    gameState.rollsRemaining > 0 && !isPaused && !isRolling && !transitionVisible;

  return (
    <ScreenContainer containerClassName="bg-black" className="p-0">
      <LinearGradient colors={GRADIENTS.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>

        {/* ── Fixed top area: player card + dice + roll ─────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 8 }}>

          {/* Header row: player info + controls */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 2 }}>
                TURN {gameState.currentTurn}/20 · {currentPlayer.name}
              </Text>
              <Text style={{ fontSize: 28, fontWeight: "900", color: C.gold, letterSpacing: 1 }}>
                {currentPlayer.totalScore}
                <Text style={{ fontSize: 14, fontWeight: "400", color: C.textMuted }}> pts</Text>
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {lastScoredCategory && (
                <Pressable onPress={gameContext.undoLastScore}>
                  <View style={{ backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: "600" }}>↶ UNDO</Text>
                  </View>
                </Pressable>
              )}
              <Pressable onPress={gameContext.pauseGame}>
                <View style={{ backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: "600" }}>⏸</Text>
                </View>
              </Pressable>
              <Pressable onPress={handleQuit}>
                <View style={{ backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: C.error, fontSize: 11, fontWeight: "600" }}>✕</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Dice grid */}
          <View style={{
            backgroundColor: C.bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.purpleBorder,
            padding: 16,
            marginBottom: 10,
          }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {gameState.currentDice.map((value, index) => (
                <Dice3DEnhanced
                  key={index}
                  value={value}
                  isHeld={gameState.heldDice[index]}
                  isRolling={isRolling}
                  onPress={() => handleDicePress(index)}
                  size={64}
                />
              ))}
            </View>

            {/* Roll indicators */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 }}>
              {Array.from({ length: rollsTotal }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: i < rollsUsed ? C.purple : C.bgCardStrong,
                    borderWidth: 1,
                    borderColor: i < rollsUsed ? C.purple : C.purpleBorder,
                  }}
                />
              ))}
            </View>
          </View>

          {/* Roll button */}
          <Pressable
            onPress={handleRollDice}
            disabled={!canRoll}
            style={({ pressed }) => ({ opacity: !canRoll ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
          >
            <LinearGradient
              colors={GRADIENTS.purpleBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: C.purple,
                paddingVertical: 14,
                alignItems: "center",
                shadowColor: C.purple,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: C.textPrimary, letterSpacing: 2 }}>
                {hasRolled ? "🎲 RE-ROLL" : "🎲 ROLL DICE"}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Score preview bar */}
          {scorePreview.length > 0 && (
            <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
              {scorePreview.map(({ cat, score }) => (
                <Pressable
                  key={cat}
                  onPress={() => handleScoreCategory(cat)}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={GRADIENTS.goldBtn}
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: C.goldBorder,
                      paddingVertical: 8,
                      paddingHorizontal: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 9, color: C.textMuted, letterSpacing: 0.5, marginBottom: 2 }} numberOfLines={1}>
                      {getCategoryName(cat).toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: C.gold }}>{score}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Scrollable scorecard ──────────────────────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map((section) => (
            <View key={section.title} style={{ marginBottom: 6 }}>
              {/* Section header */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 6,
                paddingHorizontal: 4,
                marginTop: 4,
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: C.textMuted, letterSpacing: 1.5 }}>
                  {section.title}
                </Text>
                {/* Bonus progress for upper section */}
                {section.title === "UPPER SECTION" && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {bonusEarned > 0 ? (
                      <Text style={{ fontSize: 10, fontWeight: "700", color: C.emerald }}>
                        ✓ BONUS +50
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 10, color: C.textMuted }}>
                        {upperTotal}/{bonusThreshold} for +50
                      </Text>
                    )}
                    <View style={{ width: 48, height: 4, backgroundColor: C.bgCardStrong, borderRadius: 2, overflow: "hidden" }}>
                      <View style={{ width: `${bonusProgress * 100}%`, height: "100%", backgroundColor: bonusEarned > 0 ? C.emerald : C.purple, borderRadius: 2 }} />
                    </View>
                  </View>
                )}
              </View>

              {/* Category rows */}
              <View style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.separator,
                overflow: "hidden",
                backgroundColor: C.bgCard,
              }}>
                {section.categories.map((cat, idx) => {
                  const isScored = scoredCategories.includes(cat);
                  const storedScore = currentPlayer.scores[cat];
                  const potentialScore = hasRolled && !isScored
                    ? calculateScore(gameState.currentDice, cat)
                    : null;
                  const fixedPts = getCategoryPoints(cat);
                  const isLast = idx === section.categories.length - 1;

                  return (
                    <Pressable
                      key={cat}
                      onPress={() => !isScored && hasRolled && handleScoreCategory(cat)}
                      disabled={isScored || !hasRolled}
                      style={({ pressed }) => ({
                        opacity: isScored ? 0.55 : pressed ? 0.75 : 1,
                      })}
                    >
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 11,
                        paddingHorizontal: 14,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: C.separator,
                        backgroundColor: isScored ? C.bgScored : "transparent",
                      }}>
                        {/* Category name */}
                        <Text style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: "600",
                          color: isScored ? C.textMuted : C.textPrimary,
                        }}>
                          {getCategoryName(cat)}
                        </Text>

                        {/* Fixed points label */}
                        {fixedPts && !isScored && (
                          <Text style={{ fontSize: 11, color: C.textMuted, marginRight: 8 }}>{fixedPts}</Text>
                        )}

                        {/* Score display */}
                        {isScored ? (
                          <Text style={{ fontSize: 15, fontWeight: "700", color: C.emerald, minWidth: 32, textAlign: "right" }}>
                            {storedScore}
                          </Text>
                        ) : potentialScore !== null ? (
                          <Text style={{ fontSize: 15, fontWeight: "700", color: C.gold, minWidth: 32, textAlign: "right" }}>
                            {potentialScore}
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 13, color: C.textMuted, minWidth: 32, textAlign: "right" }}>—</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Pause overlay ──────────────────────────────────────────────── */}
        {isPaused && (
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(5,5,5,0.88)",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}>
            <Text style={{ fontSize: 36, fontWeight: "900", color: C.textPrimary, letterSpacing: 3 }}>
              PAUSED
            </Text>
            <Text style={{ fontSize: 13, color: C.textSecondary }}>
              {currentPlayer.name} · Turn {gameState.currentTurn}/20
            </Text>

            <Pressable onPress={gameContext.resumeGame} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
              <LinearGradient
                colors={GRADIENTS.purpleBtn}
                style={{
                  borderRadius: 14, borderWidth: 1.5, borderColor: C.purple,
                  paddingVertical: 14, paddingHorizontal: 40,
                  shadowColor: C.purple, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "800", color: C.textPrimary, letterSpacing: 2 }}>
                  ▶ RESUME
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleQuit} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontSize: 13, color: C.error, fontWeight: "600" }}>Quit Game</Text>
            </Pressable>
          </View>
        )}

        <ScoreCelebrationModal
          visible={celebrationVisible}
          score={celebrationData.score}
          category={celebrationData.category}
          onClose={handleCelebrationClose}
        />

        <TurnTransition
          visible={transitionVisible}
          playerName={transitionTarget?.name ?? ""}
          playerNumber={transitionTarget?.number ?? 1}
          onDone={handleTransitionDone}
        />
      </LinearGradient>
    </ScreenContainer>
  );
}
