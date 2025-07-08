import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getTransactions } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function FinanceHistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getTransactions(token);
      setTransactions(data.transactions || data || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки истории');
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
          <Text style={styles.title} accentColor="violet">История операций</Text>
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
          ) : transactions.length === 0 ? (
            <EmptyOrError
              icon="card-outline"
              title="Нет операций"
              description="Пока не было ни одной финансовой операции."
              accent="teal"
            />
          ) : transactions.map((tx, i) => (
            <View key={tx.id || i} style={styles.txCard} glass>
              <Text style={styles.txType} accentColor={tx.type === 'deposit' ? 'teal' : tx.type === 'withdraw' ? 'violet' : undefined}>
                {tx.type === 'deposit' ? 'Пополнение' : tx.type === 'withdraw' ? 'Вывод' : 'Операция'}
              </Text>
              <Text style={styles.txAmount}>{tx.amount} ₽</Text>
              <Text style={styles.txDate}>{tx.date || tx.created_at}</Text>
              {tx.status && <Text style={styles.txStatus}>{tx.status}</Text>}
            </View>
          ))}
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
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
  },
  txCard: {
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
  txType: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    marginBottom: 2,
  },
  txAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#00e1ff',
    marginBottom: 2,
  },
  txDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  txStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#00e1ff',
    textAlign: 'right',
    marginTop: 2,
  },
}); 