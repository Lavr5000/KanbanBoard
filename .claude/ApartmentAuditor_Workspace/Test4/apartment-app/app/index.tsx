import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import colors
import {
  primary,
  success,
  background,
  card,
  text,
  textSecondary
} from '../constants/colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleScreenTap = () => {
    router.push('/(tabs)/objects');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.content} onPress={handleScreenTap}>
        <View style={styles.appIconContainer}>
          <Ionicons name="list-outline" size={80} color={primary} />
        </View>

        <Text style={styles.appName}>Аудитор Квартир</Text>
        <Text style={styles.appTagline}>
          Профессиональный инструмент для проверки квартир
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={success} />
            <Text style={styles.featureText}>383 чекпинта по 9 категориям</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={success} />
            <Text style={styles.featureText}>Автоматическая генерация отчетов</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={success} />
            <Text style={styles.featureText}>Сохранение на устройстве</Text>
          </View>
        </View>

  
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Версия 1.0.0</Text>
          <Text style={styles.versionMeta}>383 чекпоинта • 9 категорий</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: text,
    marginBottom: 8,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 18,
    color: textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: card,
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: text,
    fontWeight: '500',
    flex: 1,
  },
  versionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    color: textSecondary,
    fontWeight: '500',
  },
  versionMeta: {
    fontSize: 12,
    color: textSecondary,
    opacity: 0.7,
  },
});