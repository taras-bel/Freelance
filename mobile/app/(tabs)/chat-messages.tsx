import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router';
import { getMessages, sendMessage } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function ChatMessagesScreen() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getMessages(token, chatId as string);
      setMessages(data);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки сообщений');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await sendMessage(token, chatId as string, input);
      setInput('');
      await fetchData();
    } catch (e: any) {
      setMessages((prev) => [...prev, { id: 'err', text: e.message || 'Ошибка отправки', sender: 'system' }]);
    } finally {
      setSending(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.outer}>
          <View glass style={styles.glassPanel}>
            <Text style={styles.title} accentColor="violet">Сообщения</Text>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chat}
              contentContainerStyle={{ paddingBottom: 16 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#00e1ff", "#a259ff"]}
                  tintColor="#00e1ff"
                />
              }
            >
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
              ) : messages.length === 0 ? (
                <EmptyOrError
                  icon="chatbubble-ellipses-outline"
                  title="Нет сообщений"
                  description="Начните диалог первым!"
                  accent="teal"
                />
              ) : messages.map((msg, i) => (
                <View key={msg.id || i} style={[styles.msgRow, msg.sender === 'me' ? styles.userRow : styles.partnerRow]}>
                  <Text style={[styles.msgText, msg.sender === 'me' ? styles.userText : styles.partnerText]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Сообщение…"
                placeholderTextColor="#b0b8d1"
                value={input}
                onChangeText={setInput}
                editable={!sending}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable style={styles.sendButton} onPress={handleSend} disabled={sending || !input.trim()}>
                <Text style={styles.sendText} accentColor="cyan">Отправить</Text>
              </Pressable>
            </View>
            {sending && <ActivityIndicator style={{ marginTop: 8 }} color="#00e1ff" />}
          </View>
        </View>
      </KeyboardAvoidingView>
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
    flex: 1,
    padding: 24,
    minWidth: 320,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    marginVertical: 24,
    width: 340,
    maxWidth: '95%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 12,
  },
  chat: {
    flex: 1,
    width: '100%',
    marginBottom: 12,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 32,
    textAlign: 'center',
  },
  msgRow: {
    marginBottom: 8,
    maxWidth: '90%',
  },
  userRow: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,225,255,0.10)',
    borderRadius: 16,
    padding: 10,
  },
  partnerRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(162,89,255,0.10)',
    borderRadius: 16,
    padding: 10,
  },
  msgText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  userText: {
    color: '#00e1ff',
  },
  partnerText: {
    color: '#a259ff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#181820',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#b0b8d1',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#00e1ff',
  },
  sendText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 