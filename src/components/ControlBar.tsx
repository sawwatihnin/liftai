type ControlBarProps = {
  isRunning: boolean;
  isLoading: boolean;
  audioEnabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleAudio: () => void;
};

export function ControlBar({
  isRunning,
  isLoading,
  audioEnabled,
  onStart,
  onStop,
  onToggleAudio,
}: ControlBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={isRunning ? onStop : onStart}
        disabled={isLoading}
        className="rounded-full border border-rose/35 bg-gradient-to-r from-burgundy to-garnet px-6 py-3 font-semibold text-text shadow-burgundy transition hover:scale-[1.01] hover:from-garnet hover:to-rose disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Starting...' : isRunning ? 'Stop session' : 'Start camera'}
      </button>
      <button
        type="button"
        onClick={onToggleAudio}
        className="rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 font-semibold text-text transition hover:border-rose/35 hover:text-rose"
      >
        Voice feedback: {audioEnabled ? 'On' : 'Off'}
      </button>
    </div>
  );
}
