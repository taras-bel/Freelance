import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import GradientBackground from '@/components/GradientBackground';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GradientBackground>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].accentViolet,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          tabBarStyle: {
            backgroundColor: 'rgba(24,24,32,0.5)',
            borderTopWidth: 0,
            elevation: 0,
            position: 'absolute',
          },
          headerShown: useClientOnlyValue(false, true),
        }}
      >
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Задачи',
            tabBarIcon: ({ color }) => <TabBarIcon name="tasks" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Чаты',
            tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          }}
        />
        <Tabs.Screen
          name="finance"
          options={{
            title: 'Финансы',
            tabBarIcon: ({ color }) => <TabBarIcon name="money" color={color} />,
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Достижения',
            tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Прогресс',
            tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: 'Рейтинг',
            tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Уведомления',
            tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Настройки',
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: 'AI',
            tabBarIcon: ({ color }) => <TabBarIcon name="bolt" color={color} />,
          }}
        />
        <Tabs.Screen
          name="twofa"
          options={{
            title: '2FA',
            tabBarIcon: ({ color }) => <TabBarIcon name="shield" color={color} />,
          }}
        />
        <Tabs.Screen
          name="kyc"
          options={{
            title: 'KYC',
            tabBarIcon: ({ color }) => <TabBarIcon name="id-card" color={color} />,
          }}
        />
        <Tabs.Screen
          name="escrow"
          options={{
            title: 'Эскроу',
            tabBarIcon: ({ color }) => <TabBarIcon name="lock" color={color} />,
          }}
        />
      </Tabs>
    </GradientBackground>
  );
}
