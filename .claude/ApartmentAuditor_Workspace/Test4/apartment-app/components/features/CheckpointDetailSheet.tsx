import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RoomSelector } from './RoomSelector';
import { PhotoGrid } from './PhotoGrid';
import { usePhotoPicker } from '@/hooks/usePhotoPicker';
import { defaultColors, SIZES, TEXT_STYLES } from '@/constants/colors';
import type { DBCheckpoint, CheckpointStatus } from '@/types/database.types';

const { height: screenHeight } = Dimensions.get('window');

export interface CheckpointDetailSheetProps {
  visible: boolean;
  checkpoint: DBCheckpoint | null;
  projectId: string;
  onClose: () => void;
  onStatusChange?: (checkpointId: string, status: CheckpointStatus, data: {
    selectedRoom?: string;
    photos: string[];
    comment: string;
  }) => void;
}

export function CheckpointDetailSheet({
  visible,
  checkpoint,
  projectId,
  onClose,
  onStatusChange,
}: CheckpointDetailSheetProps) {
  const { showPickerOptions } = usePhotoPicker();

  // State for form data
  const [selectedStatus, setSelectedStatus] = useState<CheckpointStatus | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when checkpoint changes
  useEffect(() => {
    if (checkpoint) {
      setSelectedStatus(checkpoint.status || null);
      setSelectedRoom(checkpoint.selectedRoom || null);
      setPhotos(checkpoint.userPhotos || []);
      setComment(checkpoint.userComment || '');
    } else {
      setSelectedStatus(null);
      setSelectedRoom(null);
      setPhotos([]);
      setComment('');
    }
  }, [checkpoint]);

  // Handle photo operations
  const handleAddPhoto = async () => {
    try {
      const uri = await showPickerOptions();
      if (uri && checkpoint) {
        const newPhotos = [...photos, uri];
        setPhotos(newPhotos);
        // Update in store would be handled by parent
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить фото. Проверьте разрешения в настройках.');
    }
  };

  const handleRemovePhoto = (uri: string) => {
    const newPhotos = photos.filter(photo => photo !== uri);
    setPhotos(newPhotos);
  };

  // Handle status change with validation
  const handleStatusPress = async (status: CheckpointStatus) => {
    if (status === 'defect') {
      if (photos.length === 0) {
        Alert.alert('Требуется фото', 'Добавьте хотя бы одно фото для фиксации дефекта');
        return;
      }
      if (!selectedRoom || selectedRoom.length === 0) {
        Alert.alert('Укажите помещение', 'Выберите помещение, где обнаружен дефект');
        return;
      }
    }

    if (!checkpoint) return;

    setIsSubmitting(true);
    try {
      // Call the onStatusChange callback with all data
      onStatusChange?.(checkpoint.id, status, {
        selectedRoom: selectedRoom || undefined,
        photos,
        comment
      });
      onClose();
    } catch (error) {
      console.error('Failed to save checkpoint status:', error);
      Alert.alert('Ошибка сохранения', 'Не удалось сохранить изменения. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if defect button should be enabled
  const canMarkDefect = photos.length > 0 && selectedRoom !== null;

  if (!checkpoint) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Reference Image Section (30% height) */}
              {checkpoint.referenceImageUrl && (
                <View style={styles.imageSection}>
                  <View style={styles.imageContainer}>
                    {/* We'd use expo-image or fast-image for production */}
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image" size={48} color="#CCC" />
                      <Text style={styles.placeholderText}>Эталонное фото</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Scrollable Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Title */}
                <Text style={styles.title}>{checkpoint.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{checkpoint.hintLayman}</Text>

                {/* Technical Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Допуск:</Text>
                    <Text style={styles.detailValue}>{checkpoint.tolerance}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Метод:</Text>
                    <Text style={styles.detailValue}>{checkpoint.method}</Text>
                  </View>
                  <View style={styles.detailItemLast}>
                    <Text style={styles.detailLabel}>Норматив:</Text>
                    <Text style={styles.detailValue}>{checkpoint.standardReference}</Text>
                  </View>
                </View>

                {/* Room Selector */}
                <RoomSelector
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                />

                {/* Photo Grid */}
                <PhotoGrid
                  photos={photos}
                  onAddPhoto={handleAddPhoto}
                  onRemovePhoto={handleRemovePhoto}
                />

                {/* Comment */}
                <View style={styles.commentSection}>
                  <Text style={styles.sectionLabel}>Комментарий:</Text>
                  <TextInput
                    style={styles.commentInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Добавьте комментарий..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              {/* Footer with Status Buttons */}
              <View style={styles.footer}>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      styles.notInspectedButton,
                      selectedStatus === 'not_inspected' && styles.activeButton,
                    ]}
                    onPress={() => handleStatusPress('not_inspected')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedStatus === 'not_inspected' ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="help-circle" size={20} color="white" />
                        <Text style={styles.buttonText}>Не осмотрено</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      styles.compliesButton,
                      selectedStatus === 'complies' && styles.activeButton,
                    ]}
                    onPress={() => handleStatusPress('complies')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedStatus === 'complies' ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.buttonText}>Соответствует</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      styles.defectButton,
                      selectedStatus === 'defect' && styles.activeButton,
                      !canMarkDefect && styles.disabledButton,
                    ]}
                    onPress={() => handleStatusPress('defect')}
                    disabled={isSubmitting || !canMarkDefect}
                  >
                    {isSubmitting && selectedStatus === 'defect' ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text style={styles.buttonText}>Дефект</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: defaultColors.card,
    height: screenHeight * 0.85,
    borderTopLeftRadius: SIZES.borderRadius.xl,
    borderTopRightRadius: SIZES.borderRadius.xl,
    overflow: 'hidden',
    ...SIZES.shadow.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: defaultColors.border,
    borderRadius: SIZES.borderRadius.sm,
    alignSelf: 'center',
    marginTop: SIZES.margin.sm,
    marginBottom: SIZES.margin.sm,
  },
  imageSection: {
    height: screenHeight * 0.25,
    backgroundColor: defaultColors.background,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.divider,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  placeholderText: {
    marginTop: SIZES.margin.sm,
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: defaultColors.textTertiary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding.lg,
  },
  title: {
    fontSize: TEXT_STYLES.h2.fontSize,
    fontWeight: TEXT_STYLES.h2.fontWeight,
    color: defaultColors.text,
    marginBottom: SIZES.margin.sm,
  },
  description: {
    fontSize: TEXT_STYLES.body.fontSize,
    lineHeight: 24,
    color: defaultColors.textSecondary,
    marginBottom: SIZES.margin.lg,
  },
  detailsSection: {
    backgroundColor: defaultColors.background,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.lg,
    ...SIZES.shadow.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin.sm,
  },
  detailItemLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: defaultColors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: defaultColors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: SIZES.margin.md,
  },
  commentSection: {
    marginBottom: SIZES.margin.lg,
  },
  sectionLabel: {
    fontSize: TEXT_STYLES.body.fontSize,
    fontWeight: '600',
    color: defaultColors.text,
    marginBottom: SIZES.margin.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: defaultColors.border,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.padding.md,
    fontSize: TEXT_STYLES.body.fontSize,
    color: defaultColors.text,
    minHeight: 80,
    backgroundColor: defaultColors.surface,
  },
  footer: {
    backgroundColor: defaultColors.card,
    borderTopWidth: 1,
    borderTopColor: defaultColors.divider,
    padding: SIZES.padding.lg,
    paddingBottom: SIZES.padding.xl + 8, // Extra padding for bottom nav
  },
  statusButtons: {
    flexDirection: 'row',
    gap: SIZES.margin.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.margin.sm,
    ...SIZES.shadow.sm,
  },
  notInspectedButton: {
    backgroundColor: defaultColors.warning,
  },
  compliesButton: {
    backgroundColor: defaultColors.success,
  },
  defectButton: {
    backgroundColor: defaultColors.error,
  },
  activeButton: {
    borderWidth: 2,
    borderColor: defaultColors.text,
  },
  disabledButton: {
    backgroundColor: defaultColors.textTertiary,
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    fontWeight: '600',
  },
});