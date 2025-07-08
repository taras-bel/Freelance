import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { sendAiMessage } from '../api';

export default function AiAssistantScreen() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const res = await sendAiMessage(token, input);
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer || 'Нет ответа от AI' }]);
      setInput('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'ai', text: e.message || 'Ошибка AI' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.outer}>
          <View glass style={styles.glassPanel}>
            <Text style={styles.title} accentColor="violet">AI-ассистент</Text>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chat}
              contentContainerStyle={{ paddingBottom: 16 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 && (
                <Text style={styles.empty}>Задайте вопрос ассистенту…</Text>
              )}
              {messages.map((msg, i) => (
                <View key={i} style={[styles.msgRow, msg.role === 'user' ? styles.userRow : styles.aiRow]}>
                  <Text style={[styles.msgText, msg.role === 'user' ? styles.userText : styles.aiText]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ваш вопрос…"
                placeholderTextColor="#b0b8d1"
                value={input}
                onChangeText={setInput}
                editable={!loading}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable style={styles.sendButton} onPress={handleSend} disabled={loading || !input.trim()}>
                <Text style={styles.sendText} accentColor="cyan">Отправить</Text>
              </Pressable>
            </View>
            {loading && <ActivityIndicator style={{ marginTop: 8 }} color="#00e1ff" />}
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
  aiRow: {
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
  aiText: {
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