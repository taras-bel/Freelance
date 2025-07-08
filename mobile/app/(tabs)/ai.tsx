import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { sendAiMessage } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function AIScreen() {
  const [messages, setMessages] = useState<any[]>([]); // {role: 'user'|'ai', text: string}
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setText('');
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const res = await sendAiMessage(token, userMsg.text);
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer || res.text || '...' }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setError(e.message || 'Ошибка AI-ассистента');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setMessages([]);
    setRefreshing(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.outer}>
          <View glass style={styles.glassPanel}>
            <Text style={styles.title} accentColor="violet">AI Ассистент</Text>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#00e1ff", "#a259ff"]}
                  tintColor="#00e1ff"
                />
              }
            >
              {error ? (
                <EmptyOrError
                  icon="alert-circle-outline"
                  title="Ошибка"
                  description={error}
                  actionText="Очистить"
                  onAction={() => { setMessages([]); setError(null); }}
                  accent="violet"
                />
              ) : messages.length === 0 ? (
                <EmptyOrError
                  icon="chatbubble-ellipses-outline"
                  title="AI-ассистент"
                  description="Задайте вопрос ассистенту…"
                  accent="teal"
                />
              ) : messages.map((msg, i) => (
                <View key={i} style={[styles.msgBubble, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                  <Text style={styles.msgText}>{msg.text}</Text>
                  <Text style={styles.msgMeta}>{msg.role === 'user' ? 'Вы' : 'AI'}</Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.msgBubble, styles.aiMsg]}>
                  <ActivityIndicator color="#00e1ff" />
                </View>
              )}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Введите вопрос..."
                placeholderTextColor="#b0b8d1"
                value={text}
                onChangeText={setText}
                editable={!loading}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading || !text.trim()}>
                <Text style={styles.sendBtnText}>{loading ? '...' : '➤'}</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 16,
  },
  glassPanel: {
    flex: 1,
    padding: 16,
    minWidth: 320,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  messagesContainer: {
    flexGrow: 1,
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 320,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
    textAlign: 'center',
  },
  msgBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 16,
    marginBottom: 8,
    padding: 12,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,225,255,0.18)',
  },
  aiMsg: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(162,89,255,0.18)',
  },
  msgText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 4,
  },
  msgMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sendBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#181820',
    textAlign: 'center',
  },
}); 