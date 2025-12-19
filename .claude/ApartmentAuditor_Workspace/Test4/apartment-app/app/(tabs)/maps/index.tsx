import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export default function MapsScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useTheme();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      backgroundColor: themeColors.colors.background
    }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="map-outline" size={80} color={themeColors.colors.primary} />
        </View>

        <Text style={[styles.title, { color: themeColors.colors.text }]}>
          Карты
        </Text>

        <Text style={[styles.description, { color: themeColors.colors.textSecondary }]}>
          Здесь будет доступна функциональность карт для визуализации объектов проверки
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="location-outline" size={20} color={themeColors.colors.primary} />
            <Text style={[styles.featureText, { color: themeColors.colors.textSecondary }]}>
              Геолокация объектов
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="navigate-outline" size={20} color={themeColors.colors.primary} />
            <Text style={[styles.featureText, { color: themeColors.colors.textSecondary }]}>
              Навигация по адресам
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="camera-outline" size={20} color={themeColors.colors.primary} />
            <Text style={[styles.featureText, { color: themeColors.colors.textSecondary }]}>
              Привязка фото к местоположению
            </Text>
          </View>
        </View>

        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderText, { color: themeColors.colors.textTertiary }]}>
            Функционал карт будет доступен в следующих версиях приложения
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  placeholderContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});