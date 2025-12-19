import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusColor, SIZES, TEXT_STYLES, defaultColors } from '../../constants/colors';
import { ProgressBar } from '../ui/ProgressBar';

interface CategoryCardProps {
  categoryId: string;
  categoryName: string;
  stats: { total: number; inspected: number; percentage: number };
  onPress: () => void;
  currentMode: 'draft' | 'finish';
}

// Category icons mapping
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  floor: 'layers-outline',
  walls: 'square-outline',
  ceiling: 'stats-chart-outline',
  windows: 'aperture-outline',
  doors: 'enter-outline',
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  hvac: 'thermometer-outline',
  gas_supply: 'flame-outline',
  fire_safety: 'alert-circle-outline'
};

export function CategoryCard({
  categoryId,
  categoryName,
  stats,
  onPress,
  currentMode
}: CategoryCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return defaultColors.success;
    if (percentage >= 50) return defaultColors.warning;
    return defaultColors.error;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryTitleContainer}>
          <Ionicons
            name={categoryIcons[categoryId] || 'folder-outline'}
            size={24}
            color={defaultColors.primary}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryName}>{categoryName}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(currentMode === 'finish' ? 'complies' : 'not_inspected') }
        ]}>
          <Text style={styles.statusBadgeText}>
            {currentMode === 'finish' ? 'Чистовая' : 'Черновая'}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {stats.inspected} из {stats.total}
          </Text>
          <Text style={[styles.percentageText, { color: getProgressColor(stats.percentage) }]}>
            {stats.percentage}%
          </Text>
        </View>

        <ProgressBar
          percentage={stats.percentage}
          color={getProgressColor(stats.percentage)}
        />
      </View>

      <View style={styles.statsRow}>
        <Ionicons name="document-text-outline" size={16} color={defaultColors.textSecondary} />
        <Text style={styles.statsText}>
          {stats.total} проверок
        </Text>
        <Ionicons name="checkmark-circle-outline" size={16} color={defaultColors.textSecondary} style={{ marginLeft: 'auto' }} />
        <Text style={styles.statsText}>
          {stats.inspected} выполнено
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: defaultColors.card,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.sm,
    ...SIZES.shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin.sm,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SIZES.margin.sm,
  },
  categoryIcon: {
    marginRight: SIZES.margin.xs,
  },
  categoryName: {
    fontSize: TEXT_STYLES.h3.fontSize,
    fontWeight: TEXT_STYLES.h3.fontWeight,
    color: defaultColors.text,
  },
  statusBadge: {
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.borderRadius.lg,
  },
  statusBadgeText: {
    fontSize: TEXT_STYLES.caption.fontSize,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    marginBottom: SIZES.margin.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin.sm,
  },
  progressText: {
    fontSize: TEXT_STYLES.body.fontSize,
    color: defaultColors.text,
  },
  percentageText: {
    fontSize: TEXT_STYLES.body.fontSize,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.xs,
  },
  statsText: {
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: defaultColors.textSecondary,
  },
});