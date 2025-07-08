/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'] & {
  neonAccent?: boolean;
  accentColor?: 'teal' | 'cyan' | 'violet';
};
export type ViewProps = ThemeProps & DefaultView['props'] & {
  glass?: boolean;
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, neonAccent, accentColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text') as string;
  const theme = useColorScheme() ?? 'light';
  let textStyle = [{ color }];
  if (neonAccent) {
    textStyle.push({ color: Colors[theme].accentCyan });
  }
  if (accentColor) {
    let accentMap = {
      teal: Colors[theme].accentTeal,
      cyan: Colors[theme].accentCyan,
      violet: Colors[theme].accentViolet,
    };
    textStyle.push({ color: accentMap[accentColor] });
  }
  return <DefaultText style={[...textStyle, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, glass, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background') as string;
  const theme = useColorScheme() ?? 'light';
  let viewStyle = [{ backgroundColor }];
  if (glass) {
    viewStyle.push({
      backgroundColor: Colors[theme].glassBg,
      // Для сложных эффектов используйте отдельные компоненты или библиотеки
    });
  }
  return <DefaultView style={[...viewStyle, style]} {...otherProps} />;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
