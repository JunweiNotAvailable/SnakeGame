import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

// get random int
export const randInt = (start: number, end: number) => {
  return Math.floor(Math.random() * (end - start)) + start;
}

// create random color
export const getRandomHexColor = (): string => `#${Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0')}`;

// generate random string with given length
export const getRandomString = (length: number): string => {
  return Array.from({ length: length }, () =>
      Math.random().toString(36).charAt(2)
  ).join('');
}

// sleep function
export const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

// use interval
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])
  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return
    }
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}