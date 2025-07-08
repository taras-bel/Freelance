import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';

interface EmptyOrErrorProps {
  icon?: string; // Ionicons name
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  accent?: 'teal' | 'violet' | 'cyan';
}

export default function EmptyOrError({
  icon = 'alert-circle-outline',
  title,
  description,
  actionText,
  onAction,
  accent = 'teal',
}: EmptyOrErrorProps) {
  const colorScheme = useColorScheme();
  const accentColor = accent === 'teal' ? '#00e1ff' : accent === 'violet' ? '#a259ff' : '#38bdf8';
  const bg = colorScheme === 'dark' ? 'rgba(24,24,32,0.7)' : 'rgba(255,255,255,0.7)';
  const text = colorScheme === 'dark' ? '#fff' : '#181820';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: accentColor }]}> 
      <Ionicons name={icon as any} size={48} color={accentColor} style={styles.icon} />
      <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      {description ? <Text style={[styles.desc, { color: text }]}>{description}</Text> : null}
      {actionText && onAction ? (
        <TouchableOpacity style={[styles.button, { borderColor: accentColor }]} onPress={onAction}>
          <Text style={[styles.buttonText, { color: accentColor }]}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    marginVertical: 24,
    minWidth: 220,
    maxWidth: 320,
    alignSelf: 'center',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 