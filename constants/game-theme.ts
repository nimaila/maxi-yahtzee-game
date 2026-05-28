/**
 * Maxi Yahtzee Elite — Game Color Palette
 * Single source of truth. Import this everywhere instead of hardcoding hex strings.
 */

export const C = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bgDeep: '#0F172A',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardStrong: 'rgba(255,255,255,0.08)',
  bgScored: 'rgba(16,185,129,0.08)',
  bgHeld: 'rgba(245,158,11,0.12)',

  // ── Primary: electric purple ─────────────────────────────────────────────────
  purple: '#7C3AED',
  purpleDim: 'rgba(124,58,237,0.18)',
  purpleBorder: 'rgba(124,58,237,0.55)',
  purpleGlow: 'rgba(124,58,237,0.45)',

  // ── Gold: titles & big scores ────────────────────────────────────────────────
  gold: '#FFD700',
  goldDim: 'rgba(255,215,0,0.12)',
  goldBorder: 'rgba(255,215,0,0.4)',

  // ── Emerald: scored categories, bonuses, success ─────────────────────────────
  emerald: '#10B981',
  emeraldDim: 'rgba(16,185,129,0.15)',
  emeraldBorder: 'rgba(16,185,129,0.45)',

  // ── Amber: held dice, warnings ──────────────────────────────────────────────
  amber: '#F59E0B',
  amberDim: 'rgba(245,158,11,0.15)',
  amberBorder: 'rgba(245,158,11,0.45)',

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#4B5563',

  // ── Dice ────────────────────────────────────────────────────────────────────
  diceBg: '#1A1040',
  dicePip: '#F5F3FF',   // cream/ivory pips (matches crystal dice in design)
  diceBorder: '#7C3AED',
  diceHeldBorder: '#F59E0B',

  // ── Misc ────────────────────────────────────────────────────────────────────
  separator: 'rgba(255,255,255,0.07)',
  error: '#EF4444',
} as const;

export const GRADIENTS = {
  bg:          ['#0F172A', '#1E1B4B', '#2D1B69', '#0F0B2E'] as const,
  purpleBtn:   ['rgba(124,58,237,0.45)', 'rgba(124,58,237,0.22)'] as const,
  goldBtn:     ['rgba(255,215,0,0.22)', 'rgba(255,215,0,0.06)'] as const,
  emeraldBtn:  ['rgba(16,185,129,0.25)', 'rgba(16,185,129,0.08)'] as const,
  card:        ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'] as const,
  heldDie:     ['rgba(245,158,11,0.35)', 'rgba(245,158,11,0.12)'] as const,
} as const;
