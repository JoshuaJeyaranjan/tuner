import { useState, useEffect, useRef } from 'react';

/**
 * Tracks notes that have been sustained within a frequency tolerance.
 *
 * @param {number} currentFrequency - The currently detected frequency
 * @param {number} targetFrequency - The target frequency to lock
 * @param {number} tolerance - Allowed deviation in Hz (default: 0.5Hz)
 * @param {number} sustainTime - Time in ms frequency must stay within tolerance
 * @param {Set<number>} [initialLocked] - Optional initial locked frequencies
 *
 * @returns {Set<number>} lockedFrequencies
 */
export function useSustainedFrequency(
  currentFrequency,
  targetFrequency,
  tolerance = 0.5,
  sustainTime = 1000,
  initialLocked = new Set()
) {
  const [locked, setLocked] = useState(initialLocked);
  const timerRef = useRef(null);
  const prevInRangeRef = useRef(false);

  const inRange = targetFrequency && currentFrequency
    ? Math.abs(currentFrequency - targetFrequency) <= tolerance
    : false;

  useEffect(() => {
    // Clear previous timer if out of range
    if (!inRange) {
      clearTimeout(timerRef.current);
      prevInRangeRef.current = false;
      return;
    }

    // Start timer if it just entered the range
    if (!prevInRangeRef.current) {
      prevInRangeRef.current = true;
      timerRef.current = setTimeout(() => {
        setLocked((prev) => new Set(prev).add(targetFrequency));
        prevInRangeRef.current = false;
      }, sustainTime);
    }

    return () => clearTimeout(timerRef.current);
  }, [inRange, targetFrequency, sustainTime]);

  return locked;
}