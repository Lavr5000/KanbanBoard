import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { primary, textSecondary, card, border } from '../../constants/colors';

// Custom tab bar component
function TabBarIcon({ name, color }: { name: typeof Ionicons.defaultProps['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: textSecondary,
        tabBarStyle: {
          backgroundColor: card,
          borderTopWidth: 1,
          borderTopColor: border,
          paddingBottom: 5,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: card,
          borderBottomWidth: 1,
          borderBottomColor: border
        },
        headerTitleStyle: {
          fontWeight: '600'
        }
      }}
    >
      {/* Objects Tab - List of projects */}
      <Tabs.Screen
        name="objects"
        options={{
          title: 'Объекты',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-outline" color={color} />,
          headerShown: false
        }}
      />

      {/* Services Tab - App services and utilities */}
      <Tabs.Screen
        name="services"
        options={{
          title: 'Сервисы',
          tabBarIcon: ({ color }) => <TabBarIcon name="build-outline" color={color} />,
          headerShown: true
        }}
      />
    </Tabs>
  );
}