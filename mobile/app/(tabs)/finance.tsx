import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Modal, TextInput, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getBalance, getTransactions, deposit, withdraw } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function FinanceScreen() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const bal = await getBalance(token);
      setBalance(bal.balance ?? bal);
      const txs = await getTransactions(token);
      setTransactions(txs.transactions || txs || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки финансов');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: 'deposit' | 'withdraw') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setProcessing(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      if (type === 'deposit') await deposit(token, Number(amount));
      if (type === 'withdraw') await withdraw(token, Number(amount));
      setModal(null);
      setAmount('');
      fetchData();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка операции');
    } finally {
      setProcessing(false);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00e1ff"]} tintColor="#00e1ff" />}
      >
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Финансы</Text>
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
          ) : (
            <>
              <Text style={styles.balanceLabel}>Баланс</Text>
              <Text style={styles.balanceValue}>{balance ?? 0} ₽</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setModal('deposit')}>
                  <Text style={styles.actionBtnText}>Пополнить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setModal('withdraw')}>
                  <Text style={styles.actionBtnText}>Вывести</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => (window as any).router?.push('/escrow')}>
                <Text style={styles.actionBtnText}>Эскроу-платежи</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle} accentColor="teal">История транзакций</Text>
              {transactions.length === 0 ? (
                <EmptyOrError
                  icon="card-outline"
                  title="Нет транзакций"
                  description="Пока не было ни одной финансовой операции."
                  accent="teal"
                />
              ) : transactions.map((tx, i) => (
                <View key={tx.id || i} style={styles.txCard} glass>
                  <Text style={styles.txType} accentColor={tx.type === 'deposit' ? 'teal' : 'violet'}>{tx.type === 'deposit' ? 'Пополнение' : tx.type === 'withdraw' ? 'Вывод' : 'Операция'}</Text>
                  <Text style={styles.txAmount}>{tx.amount} ₽</Text>
                  <Text style={styles.txDate}>{tx.date || tx.created_at}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <Modal visible={!!modal} transparent animationType="fade">
        <RNView style={styles.modalBg}>
          <View glass style={styles.modalPanel}>
            <Text style={styles.modalTitle}>{modal === 'deposit' ? 'Пополнить баланс' : 'Вывести средства'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Сумма"
              placeholderTextColor="#b0b8d1"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              editable={!processing}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(modal!)} disabled={processing || !amount}>
                <Text style={styles.actionBtnText}>{processing ? '...' : 'OK'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setModal(null)} disabled={processing}>
                <Text style={styles.actionBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNView>
      </Modal>
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
  balanceLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#00e1ff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  txCard: {
    width: 260,
    marginBottom: 12,
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(24,24,32,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPanel: {
    padding: 24,
    minWidth: 280,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(24,24,32,0.95)',
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#00e1ff',
    marginBottom: 12,
  },
  input: {
    width: 180,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
}); 