import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Picker, ActivityIndicator, Alert, FlatList, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadKYC, getKYCStatus } from '../api';

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Паспорт' },
  { value: 'id_card', label: 'ID-карта' },
  { value: 'selfie', label: 'Селфи' },
  { value: 'inn', label: 'ИНН' },
];

export const KYCUpload = ({ token }: { token: string }) => {
  const [selectedType, setSelectedType] = useState('passport');
  const [file, setFile] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getKYCStatus(token);
      setStatus(data);
    } catch {
      setStatus([]);
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (res.type === 'success') setFile(res);
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Ошибка', 'Выберите файл');
      return;
    }
    setLoading(true);
    try {
      await uploadKYC(token, selectedType, file, comment);
      Alert.alert('Успех', 'Документ отправлен!');
      setFile(null);
      setComment('');
      fetchStatus();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить документ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Верификация KYC</Text>
      <Text style={{ marginBottom: 8 }}>Тип документа</Text>
      <Picker selectedValue={selectedType} onValueChange={setSelectedType} style={{ marginBottom: 8 }}>
        {DOCUMENT_TYPES.map(dt => (
          <Picker.Item key={dt.value} label={dt.label} value={dt.value} />
        ))}
      </Picker>
      <TouchableOpacity onPress={pickFile} style={{ marginBottom: 8, backgroundColor: '#eee', padding: 12, borderRadius: 8 }}>
        <Text>{file ? file.name : 'Выбрать файл'}</Text>
      </TouchableOpacity>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8, padding: 8 }}
        placeholder="Комментарий (необязательно)"
        value={comment}
        onChangeText={setComment}
      />
      <Button title="Загрузить документ" onPress={handleUpload} disabled={loading} />
      <Text style={{ fontWeight: 'bold', marginTop: 24, marginBottom: 8 }}>Ваши заявки KYC</Text>
      {loading && <ActivityIndicator />}
      <FlatList
        data={status}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <Text>Тип: {item.document_type}</Text>
            <Text>Статус: {item.status}</Text>
            <Text>Комментарий: {item.comment}</Text>
            <Text>Отправлено: {item.submitted_at}</Text>
            {item.reviewed_at && <Text>Проверено: {item.reviewed_at}</Text>}
          </View>
        )}
      />
    </View>
  );
}; 