import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, View as RNView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { createTask, getAiRecommendation } from './api';
import { useRouter } from 'expo-router';

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ai, setAi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleAI = async () => {
    if (!title.trim() && !description.trim()) return;
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const res = await getAiRecommendation(token, { title, description });
      setAi(res);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка AI-рекомендации');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await createTask(token, { title, description });
      router.replace('/tasks');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка создания задачи');
    } finally {
      setCreating(false);
    }
  };

  return (
    <GradientBackground>
      <View glass style={styles.glassPanel}>
        <Text style={styles.title} accentColor="violet">Создать задачу</Text>
        <TextInput
          style={styles.input}
          placeholder="Заголовок"
          placeholderTextColor="#b0b8d1"
          value={title}
          onChangeText={setTitle}
          editable={!creating}
        />
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Описание"
          placeholderTextColor="#b0b8d1"
          value={description}
          onChangeText={setDescription}
          editable={!creating}
          multiline
        />
        <TouchableOpacity style={styles.aiBtn} onPress={handleAI} disabled={loading || creating || (!title && !description)}>
          <Text style={styles.aiBtnText}>{loading ? 'AI...' : 'AI-рекомендация'}</Text>
        </TouchableOpacity>
        {ai && (
          <View style={styles.aiPanel} glass>
            <Text style={styles.aiTitle} accentColor="teal">AI рекомендует</Text>
            <Text style={styles.aiText}>Сложность: {ai.complexity ?? '-'}</Text>
            <Text style={styles.aiText}>Цена: {ai.price_min ?? '-'} – {ai.price_max ?? '-'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating || !title.trim() || !description.trim()}>
          <Text style={styles.createBtnText}>{creating ? 'Создание...' : 'Создать'}</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  glassPanel: {
    marginTop: 64,
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
    marginBottom: 24,
  },
  input: {
    width: 220,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
  },
  aiBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  aiBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
  aiPanel: {
    width: 220,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  aiTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    marginBottom: 2,
  },
  aiText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#b0b8d1',
    marginBottom: 2,
  },
  createBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  createBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
}); 