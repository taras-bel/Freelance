import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getMessages, sendMessage } from '../api';

export default function ChatMessagesScreen() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getMessages(token, chatId as string);
      setMessages(data.messages || data || []);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await sendMessage(token, chatId as string, text);
      setText('');
      fetchData();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { fetchData(); }, [chatId]);

  // Автообновление раз в 10 секунд
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [chatId]);

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.outer}>
          <View glass style={styles.glassPanel}>
            <Text style={styles.title} accentColor="violet">Сообщения</Text>
            {loading ? (
              <ActivityIndicator color="#00e1ff" />
            ) : (
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.length === 0 ? (
                  <Text style={styles.empty}>Нет сообщений</Text>
                ) : messages.map((msg, i) => (
                  <View key={msg.id || i} style={[styles.msgBubble, msg.is_me && styles.myMsg]}>
                    <Text style={styles.msgText}>{msg.text}</Text>
                    <Text style={styles.msgMeta}>{msg.user_name || msg.user || ''} · {msg.date || msg.created_at}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Введите сообщение..."
                placeholderTextColor="#b0b8d1"
                value={text}
                onChangeText={setText}
                editable={!sending}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending || !text.trim()}>
                <Text style={styles.sendBtnText}>{sending ? '...' : '➤'}</Text>
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
  myMsg: {
    alignSelf: 'flex-end',
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