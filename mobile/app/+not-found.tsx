import { StyleSheet, Pressable } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <GradientBackground>
      <View style={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">
            404
          </Text>
          <Text style={styles.subtitle} accentColor="teal">
            Страница не найдена
          </Text>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText} accentColor="cyan">
              На главную
            </Text>
          </Pressable>
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
    backgroundColor: '#181820',
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
    fontSize: 48,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
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
});
