import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServicesScreen() {
  const { colors: themeColors, themeMode, setThemeMode, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const themeOptions: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

  const getThemeLabel = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light': return 'Светлая';
      case 'dark': return 'Тёмная';
      case 'system': return 'Система';
      default: return mode;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Сервисы
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Управление приложением и настройками
          </Text>
        </View>

        {/* Theme Settings Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Оформление
          </Text>

          <View style={styles.themeSelector}>
            {themeOptions.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: themeMode === mode ? themeColors.primary : themeColors.surface,
                    borderColor: themeColors.border
                  }
                ]}
                onPress={() => setThemeMode(mode)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.themeButtonText,
                  {
                    color: themeMode === mode ? '#FFFFFF' : themeColors.text
                  }
                ]}>
                  {getThemeLabel(mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.themeDescription, { color: themeColors.textSecondary }]}>
            Текущая тема: {getThemeLabel(themeMode)}
            {themeMode === 'system' && ' (следует системным настройкам)'}
          </Text>
        </View>

        {/* App Info Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            О приложении
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={24} color={themeColors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: themeColors.text }]}>
                Apartment Auditor
              </Text>
              <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>
                Версия 1.0.0
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={24} color={themeColors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: themeColors.text }]}>
                Чекпоинтов в базе
              </Text>
              <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>
                383 контрольные точки
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="folder-outline" size={24} color={themeColors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: themeColors.text }]}>
                Категорий
              </Text>
              <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>
                10 категорий проверки
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Возможности
          </Text>

          <View style={styles.featureItem}>
            <Ionicons name="phone-portrait-outline" size={20} color={themeColors.primary} />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Офлайн-режим для работы без интернета
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="camera-outline" size={20} color={themeColors.primary} />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Фотосъёмка дефектов с привязкой к чекпоинтам
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="document-text-outline" size={20} color={themeColors.primary} />
            <Text style={[styles.featureText, { color: themeColors.textSecondary }]}>
              Генерация отчётов в формате PDF
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});