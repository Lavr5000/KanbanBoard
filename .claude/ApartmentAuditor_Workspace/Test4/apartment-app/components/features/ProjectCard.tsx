import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getStatusColor } from '../../constants/colors';
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
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
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

        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});