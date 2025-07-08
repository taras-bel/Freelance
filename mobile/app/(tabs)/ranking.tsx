import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getProfile } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

// В api.ts пока нет getRanking, добавим временный мок ниже
async function getRanking(token: string) {
  // TODO: заменить на реальный API
  return [
    { id: 1, name: 'Алиса', level: 7, xp: 3200 },
    { id: 2, name: 'Боб', level: 6, xp: 2900 },
    { id: 3, name: 'Вы', level: 6, xp: 2700 },
    { id: 4, name: 'Крис', level: 5, xp: 2100 },
    { id: 5, name: 'Денис', level: 5, xp: 2000 },
  ];
}

export default function RankingScreen() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const [leaders, profile] = await Promise.all([
        getRanking(token),
        getProfile(token),
      ]);
      setRanking(leaders);
      setMe(profile);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки рейтинга');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.outer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00e1ff", "#a259ff"]}
            tintColor="#00e1ff"
          />
        }
      >
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Рейтинг</Text>
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
          ) : ranking.length === 0 ? (
            <EmptyOrError
              icon="podium-outline"
              title="Нет данных рейтинга"
              description="Рейтинг появится, когда появятся активные пользователи."
              accent="teal"
            />
          ) : (
            <>
              <RNView style={styles.tableHeader}>
                <Text style={styles.th}>#</Text>
                <Text style={styles.th}>Имя</Text>
                <Text style={styles.th}>Уровень</Text>
                <Text style={styles.th}>XP</Text>
              </RNView>
              {ranking.map((user, i) => (
                <RNView key={user.id || i} style={[styles.row, me && user.name === (me.name || 'Вы') && styles.meRow]}> 
                  <Text style={styles.td}>{i + 1}</Text>
                  <Text style={[styles.td, styles.nameCell]} accentColor={user.name === (me?.name || 'Вы') ? 'teal' : undefined}>{user.name}</Text>
                  <Text style={styles.td}>{user.level}</Text>
                  <Text style={styles.td}>{user.xp}</Text>
                </RNView>
              ))}
              {me && !ranking.some(u => u.name === me.name) && (
                <RNView style={[styles.row, styles.meRow]}>
                  <Text style={styles.td}>-</Text>
                  <Text style={[styles.td, styles.nameCell]} accentColor="teal">{me.name || 'Вы'}</Text>
                  <Text style={styles.td}>{me.level}</Text>
                  <Text style={styles.td}>{me.xp}</Text>
                </RNView>
              )}
            </>
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
  tableHeader: {
    flexDirection: 'row',
    width: 260,
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00e1ff',
    paddingBottom: 4,
  },
  th: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#00e1ff',
    width: 60,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    width: 260,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  meRow: {
    backgroundColor: 'rgba(0,225,255,0.18)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  td: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    width: 60,
    textAlign: 'center',
  },
  nameCell: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
  },
}); 