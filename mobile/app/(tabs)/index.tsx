import { StyleSheet, Pressable } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import GradientBackground from '@/components/GradientBackground';

export default function TabOneScreen() {
  return (
    <GradientBackground>
      <View style={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">
            Freelance Platform
          </Text>
          <Text style={styles.subtitle} accentColor="teal">
            Современный UI, AI и мобильность
          </Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText} accentColor="cyan">
              Неоновая кнопка
            </Text>
          </Pressable>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181820', // fallback, перекрывается темой
  },
  glassPanel: {
    padding: 32,
    minWidth: 320,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
  },
  button: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00e1ff',
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
