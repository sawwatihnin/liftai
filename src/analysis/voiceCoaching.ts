import type { FormWarning, SquatMetrics } from '../pose/types';

type CoachingState = {
  previousCorrection: FormWarning | null;
  previousPhase: SquatMetrics['phase'] | null;
  previousRepCount: number;
};

const PHASE_MESSAGES: Partial<Record<SquatMetrics['phase'], string>> = {
  descending: 'Control the descent.',
  ascending: 'Drive through your heels.',
};

const CORRECTION_MESSAGES: Record<FormWarning, string> = {
  'Go deeper.': 'Go deeper.',
  'Keep your chest up.': 'Chest up.',
  'Knees out.': 'Drive your knees out.',
};

export function getCoachingCue(
  squat: SquatMetrics,
  warnings: FormWarning[],
  previous: CoachingState,
) {
  const prioritizedCorrection = prioritizeCorrection(warnings);
  const repCompleted = squat.repCount > previous.previousRepCount;
  const phaseChanged = previous.previousPhase !== squat.phase;
  const correctionChanged = previous.previousCorrection !== prioritizedCorrection;

  let message: string | null = null;
  if (repCompleted) {
    message = 'Nice rep.';
  } else if (correctionChanged && prioritizedCorrection) {
    message = CORRECTION_MESSAGES[prioritizedCorrection];
  } else if (phaseChanged) {
    if (squat.phase === 'bottom' && !prioritizedCorrection) {
      message = 'Great depth.';
    } else {
      message = PHASE_MESSAGES[squat.phase] ?? null;
    }
  }

  return {
    message,
    nextCorrection: prioritizedCorrection,
    nextPhase: squat.phase,
    nextRepCount: squat.repCount,
  };
}

function prioritizeCorrection(warnings: FormWarning[]) {
  if (warnings.includes('Knees out.')) {
    return 'Knees out.' as const;
  }

  if (warnings.includes('Keep your chest up.')) {
    return 'Keep your chest up.' as const;
  }

  if (warnings.includes('Go deeper.')) {
    return 'Go deeper.' as const;
  }

  return null;
}
