import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getTasks, getProfile } from '../api';
import { useRouter } from 'expo-router';
import EmptyOrError from '@/components/EmptyOrError';

const STATUS_OPTIONS = [
  { label: 'Все', value: '' },
  { label: 'Актуальные', value: 'open' },
  { label: 'Выполненные', value: 'done' },
];
const COMPLEXITY_OPTIONS = [
  { label: 'Все', value: '' },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [complexity, setComplexity] = useState('');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const profile = await getProfile(token);
      setUserLevel(profile.level ?? null);
      const data = await getTasks(token);
      setTasks(data.tasks || data || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTasks = tasks.filter((task) => {
    if (complexity && String(task.ai_complexity) !== String(complexity)) return false;
    if (status && String(task.status) !== String(status)) return false;
    if (userLevel && task.level && task.level > userLevel) return false;
    return true;
  });

  const resetFilters = () => {
    setStatus('');
    setComplexity('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.outer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00e1ff"]} tintColor="#00e1ff" />}
      >
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Задачи</Text>
          <View style={styles.filtersRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Статус:</Text>
              {STATUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.filterBtn, status === opt.value && styles.filterBtnActive]}
                  onPress={() => setStatus(opt.value)}
                >
                  <Text style={styles.filterBtnText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>AI-сложность:</Text>
              {COMPLEXITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.filterBtn, complexity === String(opt.value) && styles.filterBtnActive, userLevel && opt.value && Number(opt.value) > userLevel ? styles.filterBtnDisabled : undefined]}
                  onPress={() => userLevel && opt.value && Number(opt.value) > userLevel ? null : setComplexity(String(opt.value))}
                  disabled={!!(userLevel && opt.value && Number(opt.value) > userLevel)}
                >
                  <Text style={styles.filterBtnText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnText}>Сбросить</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-task')}>
            <Text style={styles.createBtnText}>Создать задачу</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : error ? (
            <EmptyOrError
              icon="alert-circle-outline"
              title="Ошибка"
              description={error}
              actionText="Повторить"
              onAction={fetchData}
              accent="violet"
            />
          ) : filteredTasks.length === 0 ? (
            <EmptyOrError
              icon="search-outline"
              title="Нет задач"
              description="Попробуйте изменить фильтры или создайте первую задачу!"
              actionText="Создать задачу"
              onAction={() => router.push('/create-task')}
              accent="teal"
            />
          ) : (
            filteredTasks.map((task, i) => (
              <TouchableOpacity
                key={task.id || i}
                style={styles.taskCard}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.taskTitle} accentColor="teal">{task.title}</Text>
                <Text style={styles.taskDesc}>{task.description}</Text>
                <RNView style={styles.row}>
                  <Text style={styles.taskMeta}>AI-сложность: {task.ai_complexity ?? '-'}</Text>
                  <Text style={styles.taskMeta}>AI-цена: {task.ai_price_min ?? '-'}–{task.ai_price_max ?? '-'}</Text>
                  <Text style={styles.taskMeta}>Уровень: {task.level ?? '-'}</Text>
                </RNView>
              </TouchableOpacity>
            ))
          )}
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
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  filterLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#b0b8d1',
    marginRight: 4,
  },
  filterBtn: {
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 2,
  },
  filterBtnActive: {
    backgroundColor: '#00e1ff',
  },
  filterBtnDisabled: {
    backgroundColor: '#222',
    opacity: 0.4,
  },
  filterBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#fff',
  },
  resetBtn: {
    backgroundColor: '#a259ff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  resetBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  createBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 16,
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
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
  },
  taskCard: {
    width: 260,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  taskTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  taskDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  taskMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    marginRight: 8,
  },
}); 