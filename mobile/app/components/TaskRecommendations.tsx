import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { getTaskRecommendations } from '../api';

export const TaskRecommendations = ({ token, onSelectTask }: { token: string, onSelectTask: (taskId: number) => void }) => {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecs();
  }, []);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await getTaskRecommendations(token);
      setRecs(data.recommendations || []);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>AI-рекомендации задач</Text>
      {loading && <ActivityIndicator style={{ marginVertical: 16 }} />}
      <FlatList
        data={recs}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelectTask(item.id)} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: '#666', marginBottom: 4 }}>{item.category}</Text>
            <Text numberOfLines={2}>{item.description}</Text>
            {item.reason && <Text style={{ color: '#2196f3', marginTop: 4 }}>AI: {item.reason}</Text>}
            <Button title="Подробнее" onPress={() => onSelectTask(item.id)} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text style={{ color: '#888', marginTop: 32 }}>Нет рекомендаций</Text> : null}
      />
    </View>
  );
}; 