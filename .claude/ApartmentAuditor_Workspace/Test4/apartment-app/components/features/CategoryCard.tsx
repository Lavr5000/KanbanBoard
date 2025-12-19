import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getStatusColor } from '../../constants/colors';
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
    if (percentage >= 80) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.error;
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
            color={colors.primary}
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
        <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.statsText}>
          {stats.total} проверок
        </Text>
        <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
        <Text style={styles.statsText}>
          {stats.inspected} выполнено
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});