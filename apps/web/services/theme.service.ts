// hooks/useAppTheme.ts
import { useTheme } from 'next-themes';

export function useAppTheme() {
  const { setTheme } = useTheme();

  const applyTheme = (theme: 'LIGHT' | 'DARK' | 'SYSTEM' | undefined) => {
    switch (theme) {
      case 'LIGHT':
        setTheme('light');
        break;

      case 'DARK':
        setTheme('dark');
        break;

      default:
        setTheme('system');
    }
  };

  return { applyTheme };
}
