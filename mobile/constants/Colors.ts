const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// Неоновые акценты и фирменные цвета
const neonTeal = '#00ffe7';
const neonCyan = '#00e1ff';
const neonViolet = '#a259ff';
const glassBgLight = 'rgba(255,255,255,0.7)';
const glassBgDark = 'rgba(24,24,32,0.7)';
const glassBorder = 'rgba(255,255,255,0.18)';
const gradientLight = ['#e0e7ff', '#f0fdfa'];
const gradientDark = ['#232946', '#181820'];

export default {
  light: {
    text: '#181820',
    background: '#f7faff',
    tint: tintColorLight,
    tabIconDefault: '#b0b8d1',
    tabIconSelected: neonTeal,
    accentTeal: neonTeal,
    accentCyan: neonCyan,
    accentViolet: neonViolet,
    glassBg: glassBgLight,
    glassBorder,
    gradient: gradientLight,
  },
  dark: {
    text: '#f7faff',
    background: '#181820',
    tint: tintColorDark,
    tabIconDefault: '#444b6e',
    tabIconSelected: neonViolet,
    accentTeal: neonTeal,
    accentCyan: neonCyan,
    accentViolet: neonViolet,
    glassBg: glassBgDark,
    glassBorder,
    gradient: gradientDark,
  },
};
// Используйте accentTeal, accentCyan, accentViolet для неоновых акцентов
// glassBg и glassBorder — для стеклянных панелей
// gradient — для фонов с плавным переходом
