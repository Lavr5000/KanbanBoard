import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import type { ReportGenerationProgress } from '@/services/domain/report/ReportBuilder';
import { defaultColors } from '@/constants/colors';

interface ExportProgressModalProps {
  visible: boolean;
  progress: ReportGenerationProgress | null;
}

export function ExportProgressModal({ visible, progress }: ExportProgressModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ActivityIndicator size="large" color={defaultColors.primary} />

          <Text style={styles.message}>
            {progress?.message || 'Подготовка...'}
          </Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress?.percentage || 0}%` }
              ]}
            />
          </View>

          <Text style={styles.percentage}>
            {progress?.percentage || 0}%
          </Text>

          {progress?.photoProgress && (
            <Text style={styles.detail}>
              Обработано фото: {progress.photoProgress.current} из {progress.photoProgress.total}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center'
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: defaultColors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center'
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: defaultColors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: defaultColors.primary,
    borderRadius: 4
  },
  percentage: {
    fontSize: 14,
    color: defaultColors.textSecondary,
    marginBottom: 8
  },
  detail: {
    fontSize: 12,
    color: defaultColors.textSecondary,
    marginTop: 4
  }
});