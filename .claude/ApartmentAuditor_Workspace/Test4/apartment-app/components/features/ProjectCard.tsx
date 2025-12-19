import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { defaultColors, getStatusColor, SIZES, TEXT_STYLES } from '../../constants/colors';
import { ProgressBar } from '../ui/ProgressBar';
import type { Project } from '../../types/database';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  showProgress?: boolean;
}

export function ProjectCard({ project, onPress, showProgress = true }: ProjectCardProps) {
  // Calculate project progress (simplified for now)
  const progress = {
    percentage: 0, // Will be calculated from checkpoint data in real implementation
    total: 383,    // Total checkpoints in database
    inspected: 0   // Will be calculated from checkpoint data
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(project.finishMode === 'finish' ? 'complies' : 'not_inspected') }]}>
            <Ionicons name={project.finishMode === 'finish' ? "checkmark-circle" : "time-outline"} size={16} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {project.title}
            </Text>
            <Text style={styles.projectMeta}>
              {new Date(project.createdAt).toLocaleDateString('ru-RU')}
            </Text>
            {project.address && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={defaultColors.textSecondary} />
                <Text style={styles.addressText}>{project.address}</Text>
              </View>
            )}

            {showProgress && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {progress.percentage}% завершено
                </Text>
                <ProgressBar percentage={progress.percentage} />
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={defaultColors.textSecondary} />
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
    ...SIZES.shadow.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: SIZES.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin.sm,
    ...SIZES.shadow.sm,
  },
  textContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: TEXT_STYLES.body.fontSize,
    fontWeight: '600',
    color: defaultColors.text,
    marginBottom: SIZES.margin.xs,
  },
  projectMeta: {
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: defaultColors.textSecondary,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin.xs,
    gap: SIZES.margin.xs,
  },
  addressText: {
    fontSize: TEXT_STYLES.caption.fontSize,
    color: defaultColors.textSecondary,
    flex: 1,
  },
  progressContainer: {
    marginTop: SIZES.margin.sm,
    gap: SIZES.margin.xs,
  },
  progressText: {
    fontSize: TEXT_STYLES.caption.fontSize,
    color: defaultColors.textSecondary,
    fontWeight: '500',
  },
});