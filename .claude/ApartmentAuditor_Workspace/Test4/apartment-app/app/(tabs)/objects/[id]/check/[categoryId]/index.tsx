import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';

// Import store hooks and utilities
import { useProjectStore, useCheckpointStore, useUIStore } from '@/services/store';
import checkpointsDB from '@/constants/checkpoints_v2.1.json';
import { defaultColors, getStatusColor } from '@/constants/colors';
import type { DBCheckpoint, CheckpointStatus } from '@/types/database.types';

// Import components
import { CheckpointDetailSheet } from '@/components/features/CheckpointDetailSheet';

// Checkpoint item component
function CheckpointItem({
  checkpoint,
  status,
  photos,
  comment,
  onPress
}: {
  checkpoint: DBCheckpoint;
  status: CheckpointStatus | null;
  photos: string[];
  comment: string;
  onPress: () => void;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'complies':
        return 'checkmark-circle';
      case 'defect':
        return 'close-circle';
      case 'not_inspected':
        return 'help-circle';
      default:
        return 'radio-button-off';
    }
  };

  const getStatusIconColor = () => {
    switch (status) {
      case 'complies':
        return defaultColors.success;
      case 'defect':
        return defaultColors.error;
      case 'not_inspected':
        return defaultColors.warning;
      default:
        return defaultColors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.checkpointItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.checkpointLeft}>
        <Ionicons
          name={getStatusIcon()}
          size={20}
          color={getStatusIconColor()}
        />
      </View>

      <View style={styles.checkpointContent}>
        <View style={styles.checkpointHeader}>
          <Text style={styles.checkpointTitle} numberOfLines={1}>
            {checkpoint.title}
          </Text>
          {photos.length > 0 && (
            <View style={styles.photosCount}>
              <Ionicons name="images" size={14} color={defaultColors.primary} />
              <Text style={styles.photosCountText}>{photos.length}</Text>
            </View>
          )}
        </View>

        <Text style={styles.checkpointDescription} numberOfLines={2}>
          {checkpoint.description}
        </Text>

        {comment && (
          <View style={styles.commentContainer}>
            <Ionicons name="chatbubbles-outline" size={14} color={defaultColors.textSecondary} />
            <Text style={styles.commentText} numberOfLines={2}>
              {comment}
            </Text>
          </View>
        )}

        <View style={styles.checkpointMeta}>
          <Text style={styles.metaText}>
            {checkpoint.tolerance}
          </Text>
          <Ionicons name="document-text-outline" size={14} color={defaultColors.textSecondary} />
          <Text style={styles.metaText}>
            {checkpoint.standardReference}
          </Text>
        </View>
      </View>

      <View style={styles.checkpointRight}>
        <Ionicons name="chevron-forward" size={20} color={defaultColors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}


export default function CategoryChecklist() {
  const navigation = useNavigation();
  const { id: projectId, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const insets = useSafeAreaInsets();

  const { projects } = useProjectStore();
  const {
    setProjectId,
    updateCheckpointStatus,
    setRoom,
    setComment,
    getCategoryCheckpoints,
    getCategoryStats
  } = useCheckpointStore();
  const { finishMode } = useUIStore();

  const project = projects.find(p => p.id === projectId);
  const category = checkpointsDB.categories[categoryId as keyof typeof checkpointsDB.categories];

  // Set project ID in checkpoint store when screen loads
  React.useEffect(() => {
    setProjectId(projectId);
  }, [projectId, setProjectId]);

  if (!project || !category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Категория не найдена</Text>
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

  // Get checkpoints for current category and mode
  const checkpoints = getCategoryCheckpoints(categoryId, finishMode);
  const stats = getCategoryStats(projectId!, categoryId, finishMode);

  // State for checkpoint actions
  const [selectedCheckpointId, setSelectedCheckpointId] = React.useState<string | null>(null);
  const [showDetailSheet, setShowDetailSheet] = React.useState(false);

  const handleCheckpointPress = (checkpointId: string) => {
    setSelectedCheckpointId(checkpointId);
    setShowDetailSheet(true);
  };

  const handleStatusChange = (checkpointId: string, status: CheckpointStatus, data: {
    selectedRoom?: string;
    photos: string[];
    comment: string;
  }) => {
    // Update checkpoint status and additional data
    updateCheckpointStatus(checkpointId, status);

    if (data.selectedRoom) {
      setRoom(checkpointId, data.selectedRoom);
    }

    if (data.comment) {
      setComment(checkpointId, data.comment);
    }

    const currentIndex = checkpoints.findIndex(cp => cp.id === checkpointId);
    const nextCheckpoint = checkpoints[currentIndex + 1];

    if (nextCheckpoint) {
      // Auto-transition to next checkpoint
      setSelectedCheckpointId(nextCheckpoint.id);
      setShowDetailSheet(true);
    } else {
      // Last checkpoint - close and show completion message
      setShowDetailSheet(false);
      setSelectedCheckpointId(null);
      Alert.alert(
        'Категория завершена',
        `Все ${checkpoints.length} проверок в категории завершены`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={defaultColors.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.statusText}>
            {stats.inspected} из {stats.total} проверок
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Прогресс: {stats.percentage}%
          </Text>
          <Text style={styles.checkpointsCount}>
            {stats.total} пунктов
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.percentage}%`,
                backgroundColor: stats.percentage >= 80 ? defaultColors.success :
                               stats.percentage >= 50 ? defaultColors.warning : defaultColors.error
              }
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.checkpointsList}>
          {checkpoints.map((checkpoint: DBCheckpoint) => (
            <CheckpointItem
              key={checkpoint.id}
              checkpoint={checkpoint}
              status={checkpoint.status}
              photos={checkpoint.userPhotos || []}
              comment={checkpoint.userComment || ''}
              onPress={() => handleCheckpointPress(checkpoint.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Checkpoint Detail Sheet */}
      <CheckpointDetailSheet
        visible={showDetailSheet}
        checkpoint={
          selectedCheckpointId
            ? checkpoints.find(cp => cp.id === selectedCheckpointId) || null
            : null
        }
        projectId={projectId!}
        onClose={() => {
          setShowDetailSheet(false);
          setSelectedCheckpointId(null);
        }}
        onStatusChange={handleStatusChange}
      />
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
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: defaultColors.text,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: defaultColors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: defaultColors.card,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.border,
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
    fontWeight: '600',
  },
  checkpointsCount: {
    fontSize: 14,
    color: defaultColors.textSecondary,
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
  content: {
    flex: 1,
  },
  checkpointsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  checkpointItem: {
    backgroundColor: defaultColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkpointLeft: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkpointContent: {
    flex: 1,
  },
  checkpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkpointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: defaultColors.text,
    flex: 1,
    marginRight: 8,
  },
  photosCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: defaultColors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  photosCountText: {
    fontSize: 12,
    color: defaultColors.primary,
    fontWeight: '600',
  },
  checkpointDescription: {
    fontSize: 14,
    color: defaultColors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: defaultColors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: defaultColors.text,
    flex: 1,
    lineHeight: 18,
  },
  checkpointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: defaultColors.textSecondary,
    opacity: 0.8,
  },
  checkpointRight: {
    paddingLeft: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: defaultColors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: defaultColors.text,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: defaultColors.background,
    borderRadius: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: defaultColors.text,
    fontWeight: '500',
  }
});