/**
 * High-Performance Snapshot Debouncer Utility
 * Batches high-frequency Firestore onSnapshot events to preserve 60fps UI performance.
 */

export function debounceSnapshot<T>(
  callback: (data: T) => void,
  delayMs: number = 150
): (data: T) => void {
  let timer: NodeJS.Timeout | null = null;
  let latestData: T | null = null;

  return (data: T) => {
    latestData = data;
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (latestData !== null) {
        callback(latestData);
      }
    }, delayMs);
  };
}
