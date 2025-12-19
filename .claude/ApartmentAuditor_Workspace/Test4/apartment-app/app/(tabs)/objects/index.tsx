import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import store hooks
import { useProjectStore, useCheckpointStore } from '@/services/store';
import type { Project } from '@/types/database';

// Import theme and colors
import { useTheme } from '../../../hooks/useTheme';
import { getStatusColor, error,
  background, card, surface, text, textSecondary, primary } from '../../../constants/colors';

// Import modal components
import { CreateProjectModal } from "../../../components/features/CreateProjectModal";
import { ParticipantModal } from "../../../components/features/ParticipantModal";
import type { Participant } from "../../../types";
// Calculate project progress
function getProjectProgress(projectId: string) {
  // Import here to avoid circular dependencies
  const checkpointsDB = require('../../../constants/checkpoints_v2.1.json');

  let totalCheckpoints = 0;
  let inspectedCheckpoints = 0;

  // Calculate stats for all categories
  Object.keys(checkpointsDB.categories).forEach(categoryId => {
    const category = checkpointsDB.categories[categoryId];
    const draftCount = category.draft.length;
    const finishCount = category.finish.length;

    // Use draft mode by default for project list
    totalCheckpoints += draftCount;

    // For now, assume 0% progress (since we don't have checkpoint data for project list yet)
    // In real implementation, this would query checkpointStore
    inspectedCheckpoints += 0; // Will be updated when checkpoint data is available
  });

  const percentage = totalCheckpoints > 0 ? Math.round((inspectedCheckpoints / totalCheckpoints) * 100) : 0;

  return {
    total: totalCheckpoints,
    inspected: inspectedCheckpoints,
    percentage
  };
}

// Simple list item component for projects
function ProjectListItem({ project, onPress, themeColors }: {
  project: Project;
  onPress: () => void;
  themeColors: any;
}) {
  const progress = getProjectProgress(project.id);

  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(project.finishMode === 'finish' ? 'complies' : 'not_inspected') }]}>
            <Ionicons name={project.finishMode === 'finish' ? "checkmark-circle" : "time-outline"} size={16} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.projectTitle, { color: themeColors.text }]} numberOfLines={1}>
              {project.title}
            </Text>
            <Text style={[styles.projectMeta, { color: themeColors.textSecondary }]}>
              {new Date(project.createdAt).toLocaleDateString('ru-RU')}
            </Text>
            {project.address && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.addressText, { color: themeColors.textSecondary }]}>{project.address}</Text>
              </View>
            )}

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                {progress.percentage}% завершено
              </Text>
              <View style={[styles.progressBar, { backgroundColor: themeColors.surface }]}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%`, backgroundColor: themeColors.primary }]} />
              </View>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ObjectsScreen() {
  const navigation = useNavigation();
  const { projects, createProject, setActiveProject } = useProjectStore();
  const { getCategoryStats, setProjectId } = useCheckpointStore();
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showActive, setShowActive] = useState(true); // Toggle for Актуальные/Архив
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);  const [showParticipantModal, setShowParticipantModal] = useState(false);  const [selectedProjectParticipants, setSelectedProjectParticipants] = useState<Participant[]>([]);

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setActiveProject(project.id);
    (navigation.navigate as any)("(tabs)/objects/[id]", { id: project.id });
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={[styles.emptyStateIconContainer, { backgroundColor: themeColors.surface }]}>
        <Ionicons name="folder-open-outline" size={64} color={themeColors.textSecondary} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: themeColors.text }]}>Нет объектов</Text>
      <Text style={[styles.emptyStateDescription, { color: themeColors.textSecondary }]}>
        Нажмите на кнопку + чтобы создать новый объект
      </Text>
    </View>
  );


  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Объекты</Text>
        <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
          {projects.length} {projects.length === 1 ? 'объект' : 'объектов'}
        </Text>
      </View>

      {/* Toggle for Active/Archive */}
      <View style={[styles.toggleContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showActive && styles.toggleButtonActive,
            showActive && { backgroundColor: themeColors.primary }
          ]}
          onPress={() => setShowActive(true)}
        >
          <Text style={[
            styles.toggleButtonText,
            { color: showActive ? '#FFFFFF' : themeColors.text }
          ]}>
            Актуальные
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showActive && styles.toggleButtonActive,
            !showActive && { backgroundColor: themeColors.primary }
          ]}
          onPress={() => setShowActive(false)}
        >
          <Text style={[
            styles.toggleButtonText,
            { color: !showActive ? '#FFFFFF' : themeColors.text }
          ]}>
            Архив
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Form */}

      {/* Projects List */}
      {projects.length > 0 ? (
        <FlatList<Project>
          data={projects}
          renderItem={({ item }: { item: Project }) => (
            <ProjectListItem
              project={item}
              onPress={() => handleProjectSelect(item)}
              themeColors={themeColors}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: error }]}
        onPress={() => setShowCreateProjectModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <CreateProjectModal
        visible={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
      />
      <ParticipantModal
        visible={showParticipantModal}
        initialParticipants={selectedProjectParticipants}
        onSave={(participants) => {
          setSelectedProjectParticipants(participants);
          setShowParticipantModal(false);
        }}
        onClose={() => setShowParticipantModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: textSecondary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemLeft: {
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
    color: text,
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 14,
    color: textSecondary,
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
    color: textSecondary,
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: text,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: textSecondary,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: primary,
    borderRadius: 2,
  },
  // Toggle styles
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    // Styles applied dynamically
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});