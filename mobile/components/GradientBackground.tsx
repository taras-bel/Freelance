import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  const theme = useColorScheme() ?? 'light';
  const gradientColors = Colors[theme].gradient as string[];
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
}); 