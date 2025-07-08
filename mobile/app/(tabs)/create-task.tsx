import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, View as RNView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { createTask, getAiRecommendation } from '../api';

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiComplexity, setAiComplexity] = useState<number | null>(null);
  const [aiPriceMin, setAiPriceMin] = useState<number | null>(null);
  const [aiPriceMax, setAiPriceMax] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  const handleAI = async () => {
    setAiLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const res = await getAiRecommendation(token, { title, description });
      setAiComplexity(res.complexity_level);
      setAiPriceMin(res.price_min);
      setAiPriceMax(res.price_max);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка AI-рекомендации');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data: any = { title, description };
      if (aiComplexity) data.complexity_level = aiComplexity;
      if (aiPriceMin) data.ai_price_min = aiPriceMin;
      if (aiPriceMax) data.ai_price_max = aiPriceMax;
      await createTask(token, data);
      Alert.alert('Успех', 'Задача создана!');
      router.replace('/(tabs)/tasks');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка создания задачи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Создать задачу</Text>
          <TextInput
            style={styles.input}
            placeholder="Заголовок"
            placeholderTextColor="#b0b8d1"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Описание"
            placeholderTextColor="#b0b8d1"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <RNView style={styles.aiRow}>
            <Pressable style={styles.aiButton} onPress={handleAI} disabled={aiLoading}>
              <Text style={styles.buttonText} accentColor="cyan">AI-рекомендации</Text>
            </Pressable>
            {aiLoading && <ActivityIndicator color="#00e1ff" style={{ marginLeft: 12 }} />}
          </RNView>
          {aiComplexity && (
            <Text style={styles.aiInfo} accentColor="violet">AI-сложность: {aiComplexity}</Text>
          )}
          {aiPriceMin && aiPriceMax && (
            <Text style={styles.aiInfo} accentColor="cyan">AI-цена: {aiPriceMin} – {aiPriceMax} ₽</Text>
          )}
          <Pressable style={styles.button} onPress={handleCreate} disabled={loading}>
            <Text style={styles.buttonText} accentColor="teal">Создать задачу</Text>
          </Pressable>
          {loading && <ActivityIndicator style={{ marginTop: 16 }} color="#00e1ff" />}
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
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 24,
  },
  input: {
    width: 240,
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#181820',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#b0b8d1',
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiButton: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#00e1ff',
  },
  aiInfo: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    marginBottom: 4,
  },
  button: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
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