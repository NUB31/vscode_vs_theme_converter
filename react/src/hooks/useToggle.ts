import { useCallback, useState } from "react";

export const useToggle = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((v: boolean) => !v);
  }, []);

  return [value, toggle] as [boolean, () => void];
};
