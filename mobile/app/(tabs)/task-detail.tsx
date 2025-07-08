import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTaskById, respondToTask, deleteTask } from '../api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) throw new Error('Нет токена');
        const data = await getTaskById(token, id as string);
        setTask(data);
      } catch (e: any) {
        Alert.alert('Ошибка', e.message || 'Ошибка загрузки задачи');
        router.replace('/(tabs)/tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleRespond = async () => {
    setResponding(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await respondToTask(token, id as string);
      Alert.alert('Успех', 'Вы откликнулись на задачу!');
      router.replace('/(tabs)/tasks');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка отклика');
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await deleteTask(token, id as string);
      Alert.alert('Успех', 'Задача удалена');
      router.replace('/(tabs)/tasks');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Детали задачи</Text>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : task ? (
            <>
              <Text style={styles.taskTitle} accentColor="teal">{task.title}</Text>
              <Text style={styles.taskDesc}>{task.description}</Text>
              {task.complexity_level && (
                <Text style={styles.complexity} accentColor="violet">
                  AI-сложность: {task.complexity_level}
                </Text>
              )}
              {task.ai_price_min && task.ai_price_max && (
                <Text style={styles.price} accentColor="cyan">
                  AI-цена: {task.ai_price_min} – {task.ai_price_max} ₽
                </Text>
              )}
              <Text style={styles.label}>Клиент:</Text>
              <Text style={styles.value}>{task.client_name || task.client_id}</Text>
              {task.status && (
                <Text style={styles.status} accentColor="teal">Статус: {task.status}</Text>
              )}
              {/* Для фрилансера — кнопка отклика, для клиента — редактировать/удалить */}
              {task.is_client ? (
                <>
                  <Pressable style={styles.button} onPress={() => router.push({ pathname: '/(tabs)/edit-task', params: { id: task.id } })}>
                    <Text style={styles.buttonText} accentColor="teal">Редактировать</Text>
                  </Pressable>
                  <Pressable style={styles.button} onPress={handleDelete} disabled={deleting}>
                    <Text style={styles.buttonText} accentColor="violet">Удалить</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.button} onPress={handleRespond} disabled={responding}>
                  <Text style={styles.buttonText} accentColor="cyan">Откликнуться</Text>
                </Pressable>
              )}
              {(responding || deleting) && <ActivityIndicator style={{ marginTop: 16 }} color="#00e1ff" />}
            </>
          ) : null}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181820',
    paddingVertical: 32,
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
    marginBottom: 16,
  },
  taskTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    marginBottom: 8,
  },
  taskDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 8,
  },
  complexity: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  price: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 12,
  },
  value: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  status: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    marginBottom: 8,
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