export type ErrorDetails = {
  name: string;
  message: string;
  stack?: string;
  eventType?: string;
  target?: string;
};

export function normalizeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error instanceof Event) {
    const target = resolveEventTarget(error);
    return {
      name: 'Event',
      message: target
        ? `Event "${error.type}" fired while loading ${target}.`
        : `Event "${error.type}" fired during MediaPipe startup.`,
      eventType: error.type,
      target,
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    };
  }

  return {
    name: 'UnknownError',
    message: safeStringify(error),
  };
}

function resolveEventTarget(event: Event) {
  const target = event.target;
  if (
    target &&
    typeof target === 'object' &&
    ('src' in target || 'href' in target || 'currentSrc' in target)
  ) {
    const src =
      typeof (target as { currentSrc?: unknown }).currentSrc === 'string'
        ? (target as { currentSrc: string }).currentSrc
        : undefined;
    const directSrc =
      typeof (target as { src?: unknown }).src === 'string'
        ? (target as { src: string }).src
        : undefined;
    const href =
      typeof (target as { href?: unknown }).href === 'string'
        ? (target as { href: string }).href
        : undefined;

    return src || directSrc || href;
  }

  return undefined;
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
