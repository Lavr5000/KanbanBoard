import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';

// Import store hooks and utilities
import { useProjectStore, useUIStore, useCheckpointStore } from '@/services/store';
import checkpointsDB from '@/constants/checkpoints_v2.1.json';
import { defaultColors, getStatusColor } from '@/constants/colors';

// Import PDF generation components
import { ParticipantForm } from '@/components/features/ParticipantForm';
import { ExportProgressModal } from '@/components/features/ExportProgressModal';
import { reportBuilder } from '@/services/domain/report/ReportBuilder';
import type { Participant } from '@/types';
import type { ReportGenerationProgress } from '@/services/domain/report/ReportBuilder';

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

// Dashboard card component for category overview
function CategoryCard({
  categoryId,
  categoryName,
  stats,
  onPress,
  currentMode
}: {
  categoryId: string;
  categoryName: string;
  stats: { total: number; inspected: number; percentage: number };
  onPress: () => void;
  currentMode: 'draft' | 'finish';
}) {
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

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.percentage}%`,
                backgroundColor: getProgressColor(stats.percentage)
              }
            ]}
          />
        </View>
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

export default function ProjectDashboard() {
  const navigation = useNavigation();
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { projects, updateProject } = useProjectStore();
  const { finishMode, toggleFinishMode } = useUIStore();
  const { getCategoryStats, setProjectId } = useCheckpointStore();

  // Set project ID in checkpoint store when component mounts
  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    }
  }, [projectId, setProjectId]);

  const project = projects.find(p => p.id === projectId);

  // State for PDF export functionality
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState<ReportGenerationProgress | null>(null);

  if (!project) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Объект не найден</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Handle category navigation
  const handleCategoryPress = (categoryId: string) => {
    (navigation.navigate as any)('(tabs)/objects/[id]/check/[categoryId]', {
      id: projectId,
      categoryId
    });
  };

  // Handle mode switching
  const handleModeToggle = () => {
    const newMode = finishMode === 'draft' ? 'finish' : 'draft';

    // Update UI store first
    toggleFinishMode();

    // Then sync to project
    updateProject(project.id, { finishMode: newMode });
  };

  // Helper function to get all checkpoints for current project
  const getCategoryCheckpoints = (categoryId: string, mode: 'draft' | 'finish') => {
    const category = checkpointsDB.categories[categoryId as keyof typeof checkpointsDB.categories];
    if (!category) return [];

    // Use store method to get merged checkpoints
    return useCheckpointStore.getState().getCategoryCheckpoints(categoryId, mode);
  };

  const generateReport = async (reportType: 'inspection' | 'complaint') => {
    try {
      setShowProgress(true);

      // Get all checkpoints for current project
      const allCheckpoints = Object.entries(checkpointsDB.categories).flatMap(
        ([categoryId, _]) => getCategoryCheckpoints(categoryId, finishMode)
      );

      await reportBuilder.generateReport(
        project,
        allCheckpoints,
        reportType,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setShowProgress(false);
      Alert.alert('Успех', 'Отчет создан и готов к отправке');
    } catch (error: any) {
      setShowProgress(false);
      Alert.alert('Ошибка', error?.message || 'Неизвестная ошибка');
    }
  };

  const handleSaveParticipants = (participants: Participant[]) => {
    updateProject(project.id, { participants });
    setShowParticipantForm(false);
  };

  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={defaultColors.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
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
        </View>

        <TouchableOpacity
          style={[styles.modeToggle, { backgroundColor: finishMode === 'finish' ? defaultColors.primary : defaultColors.background }]}
          onPress={handleModeToggle}
        >
          <Text style={[
            styles.modeToggleText,
            { color: finishMode === 'finish' ? 'white' : defaultColors.text }
          ]}>
            {finishMode === 'finish' ? 'Чистовая' : 'Черновая'}
          </Text>
          <Ionicons
            name={finishMode === 'finish' ? "checkmark" : "pencil"}
            size={16}
            color={finishMode === 'finish' ? 'white' : defaultColors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Категории проверок</Text>

          {Object.entries(checkpointsDB.categories).map(([categoryId, category]: [string, any]) => {
            const stats = getCategoryStats(projectId!, categoryId, finishMode);
            return (
              <CategoryCard
                key={categoryId}
                categoryId={categoryId}
                categoryName={category.name}
                stats={stats}
                onPress={() => handleCategoryPress(categoryId)}
                currentMode={finishMode}
              />
            );
          })}
        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              // Check if participants exist
              if (!project.participants || project.participants.length === 0) {
                setShowParticipantForm(true);
                return;
              }

              // Ask for report type
              Alert.alert(
                'Выберите тип отчета',
                'Какой документ создать?',
                [
                  {
                    text: 'Акт осмотра',
                    onPress: () => generateReport('inspection')
                  },
                  {
                    text: 'Претензия',
                    onPress: () => generateReport('complaint')
                  },
                  { text: 'Отмена', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="document-outline" size={20} color={defaultColors.primary} />
            <Text style={styles.actionButtonText}>Экспорт отчёта</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {/* Future: Settings */}}
          >
            <Ionicons name="settings-outline" size={20} color={defaultColors.primary} />
            <Text style={styles.actionButtonText}>Настройки проекта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {showParticipantForm && (
        <Modal visible animationType="slide">
          <ParticipantForm
            initialParticipants={project.participants}
            onSave={handleSaveParticipants}
            onCancel={() => setShowParticipantForm(false)}
          />
        </Modal>
      )}

      <ExportProgressModal visible={showProgress} progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: defaultColors.error,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: defaultColors.text,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.border,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: defaultColors.text,
    marginBottom: 2,
  },
  projectMeta: {
    fontSize: 14,
    color: defaultColors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: defaultColors.textSecondary,
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: defaultColors.border,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: defaultColors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: defaultColors.card,
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
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: defaultColors.text,
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
    color: defaultColors.text,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: defaultColors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 14,
    color: defaultColors.textSecondary,
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: defaultColors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: defaultColors.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: defaultColors.primary,
    fontWeight: '600',
  },
});