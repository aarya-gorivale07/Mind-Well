import { useTheme } from './theme.jsx';

export default function ThemeButton() {
  const { theme, toggle } = useTheme();
  return (
    <button className="ghost" onClick={toggle} aria-label="Switch between light and dark mode">
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
