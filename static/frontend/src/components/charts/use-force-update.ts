import { useState } from 'react';

export function useForceUpdate(): () => void {
  const [, setValue] = useState<number>(0);
  return () => setValue((value: number) => value + 1); // update state to force render
} 