// src/config/bpGoals.ts

export const GOAL_SYSTOLIC = {
  min: 90,
  max: 160,
}

export const GOAL_DIASTOLIC = {
  min: 60,
  max: 100,
}

/**
 * Returns true if either systolic or diastolic is outside the goal range.
 */
export function isAbnormal(systolic: number, diastolic: number): boolean {
  return (
    systolic < GOAL_SYSTOLIC.min ||
    systolic > GOAL_SYSTOLIC.max ||
    diastolic < GOAL_DIASTOLIC.min ||
    diastolic > GOAL_DIASTOLIC.max
  )
}
