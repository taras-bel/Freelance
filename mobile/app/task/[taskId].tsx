import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, TextInput, Modal, View as RNView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getTaskById, respondToTask, updateTask, deleteTask, getApplication } from '../api';

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState(false);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getTaskById(token, taskId as string);
      setTask(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка загрузки задачи');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplication = async () => {
    setAiLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      if (task && task.applications) {
        const myId = task.applicant_id || task.applicant?.id;
        const myApp = task.applications.find((a: any) => a.applicant_id === myId);
        if (myApp) {
          const app = await getApplication(token, myApp.id);
          setMyApplication(app);
        }
      }
    } catch (e) {
      setMyApplication(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRespond = async () => {
    setResponding(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await respondToTask(token, taskId as string);
      Alert.alert('Успех', 'Вы откликнулись на задачу!');
      fetchData();
      fetchMyApplication();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка отклика');
    } finally {
      setResponding(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await updateTask(token, taskId as string, { title, description });
      setEditing(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await deleteTask(token, taskId as string);
      setModal(false);
      router.replace('/tasks');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { fetchData(); fetchMyApplication(); }, [taskId]);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Детали задачи</Text>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : !task ? (
            <Text style={styles.empty}>Задача не найдена</Text>
          ) : editing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Заголовок"
                placeholderTextColor="#b0b8d1"
                value={title}
                onChangeText={setTitle}
                editable={!saving}
              />
              <TextInput
                style={styles.input}
                placeholder="Описание"
                placeholderTextColor="#b0b8d1"
                value={description}
                onChangeText={setDescription}
                editable={!saving}
                multiline
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} disabled={saving}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.taskTitle} accentColor="teal">{task.title}</Text>
              <Text style={styles.taskDesc}>{task.description}</Text>
              <RNView style={styles.row}>
                <Text style={styles.taskMeta}>AI-сложность: {task.ai_complexity ?? '-'}</Text>
                <Text style={styles.taskMeta}>AI-цена: {task.ai_price_min ?? '-'}–{task.ai_price_max ?? '-'}</Text>
                <Text style={styles.taskMeta}>Уровень: {task.level ?? '-'}</Text>
              </RNView>
              <Text style={styles.label}>Статус: <Text style={styles.value}>{task.status || '-'}</Text></Text>
              <Text style={styles.label}>Клиент: <Text style={styles.value}>{task.client_name || task.client || '-'}</Text></Text>
              <Text style={styles.label}>Исполнитель: <Text style={styles.value}>{task.freelancer_name || task.freelancer || '-'}</Text></Text>
              {task.can_respond && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleRespond} disabled={responding}>
                  <Text style={styles.actionBtnText}>{responding ? '...' : 'Откликнуться'}</Text>
                </TouchableOpacity>
              )}
              {task.can_edit && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(true)}>
                  <Text style={styles.actionBtnText}>Редактировать</Text>
                </TouchableOpacity>
              )}
              {task.can_delete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setModal(true)}>
                  <Text style={styles.deleteBtnText}>Удалить</Text>
                </TouchableOpacity>
              )}
              {myApplication && (
                <View style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#00e1ff' }}>AI-скрининг заявки</Text>
                  <Text>Статус: {myApplication.screening_status || '-'}</Text>
                  <Text>Оценка: {myApplication.screening_score ?? '-'}</Text>
                  <Text>Комментарий: {myApplication.screening_comment || '-'}</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={fetchMyApplication} disabled={aiLoading}>
                    <Text style={styles.actionBtnText}>{aiLoading ? '...' : 'Обновить статус AI'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <Modal visible={modal} transparent animationType="fade">
        <RNView style={styles.modalBg}>
          <View glass style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Удалить задачу?</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} disabled={deleting}>
                <Text style={styles.actionBtnText}>{deleting ? '...' : 'Удалить'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)} disabled={deleting}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
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
  taskTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
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
    marginBottom: 8,
  },
  taskMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    marginRight: 8,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginTop: 8,
  },
  value: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  input: {
    width: 220,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
  cancelBtn: {
    backgroundColor: '#a259ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cancelBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    marginRight: 8,
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
  deleteBtn: {
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#ff3b3b',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
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
    color: '#ff3b3b',
    marginBottom: 12,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
    textAlign: 'center',
  },
}); 