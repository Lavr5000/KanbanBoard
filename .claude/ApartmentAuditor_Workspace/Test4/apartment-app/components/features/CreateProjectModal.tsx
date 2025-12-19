import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/services/store';
import { useTheme } from '../../hooks/useTheme';
import type { Participant } from '../../types';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ visible, onClose }: CreateProjectModalProps) {
  const { colors } = useTheme();
  const { createProject, setActiveProject } = useProjectStore();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      role: 'inspector',
      fullName: '',
      position: '',
      organization: ''
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название объекта');
      return;
    }

    setIsCreating(true);
    try {
      const projectId = createProject(title.trim(), address.trim());
      setActiveProject(projectId);

      // Reset form
      setTitle('');
      setAddress('');
      setParticipants([{
        role: 'inspector',
        fullName: '',
        position: '',
        organization: ''
      }]);

      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать объект');
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle('');
      setAddress('');
      setParticipants([{
        role: 'inspector',
        fullName: '',
        position: '',
        organization: ''
      }]);
      onClose();
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value
    };
    setParticipants(updatedParticipants);
  };

  const addParticipant = () => {
    setParticipants([
      ...participants,
      {
        role: 'representative',
        fullName: '',
        position: '',
        organization: ''
      }
    ]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                Новый объект
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={handleClose}
                disabled={isCreating}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Название объекта*"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={50}
                  editable={!isCreating}
                  autoFocus
                />
              </View>

              {/* Address Input */}
              <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Адрес объекта (необязательно)"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={100}
                  editable={!isCreating}
                  multiline
                />
              </View>

              {/* Participants Section */}
              <View style={styles.participantsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Участники
                  </Text>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={addParticipant}
                    disabled={isCreating}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {participants.map((participant, index) => (
                  <View key={index} style={[styles.participantCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.participantHeader}>
                      <TouchableOpacity
                        style={[styles.roleSelector, { backgroundColor: colors.background }]}
                        disabled={isCreating}
                      >
                        <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                          {participant.role === 'inspector' ? 'Инспектор' :
                           participant.role === 'developer' ? 'Застройщик' : 'Представитель'}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
                      </TouchableOpacity>

                      {participants.length > 1 && (
                        <TouchableOpacity
                          style={[styles.removeButton, { backgroundColor: colors.error }]}
                          onPress={() => removeParticipant(index)}
                          disabled={isCreating}
                        >
                          <Ionicons name="remove" size={14} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.participantFields}>
                      <View style={[styles.inputContainer, styles.participantInputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                          style={[styles.input, { fontSize: 14, color: colors.text }]}
                          value={participant.fullName}
                          onChangeText={(value) => updateParticipant(index, 'fullName', value)}
                          placeholder="ФИО*"
                          placeholderTextColor={colors.textSecondary}
                          editable={!isCreating}
                        />
                      </View>

                      <View style={[styles.inputContainer, styles.participantInputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                          style={[styles.input, { fontSize: 14, color: colors.text }]}
                          value={participant.position}
                          onChangeText={(value) => updateParticipant(index, 'position', value)}
                          placeholder="Должность"
                          placeholderTextColor={colors.textSecondary}
                          editable={!isCreating}
                        />
                      </View>

                      <View style={[styles.inputContainer, styles.participantInputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                          style={[styles.input, { fontSize: 14, color: colors.text }]}
                          value={participant.organization}
                          onChangeText={(value) => updateParticipant(index, 'organization', value)}
                          placeholder="Организация"
                          placeholderTextColor={colors.textSecondary}
                          editable={!isCreating}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={handleClose}
                disabled={isCreating}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText, { color: colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.createButton,
                  {
                    backgroundColor: isCreating ? colors.surface : colors.primary,
                    opacity: isCreating ? 0.6 : 1
                  }
                ]}
                onPress={handleCreateProject}
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? (
                  <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                    Создание...
                  </Text>
                ) : (
                  <Text style={styles.createButtonText}>
                    Создать
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    minHeight: 48,
  },
  // Override for participant inputs
  participantInputContainer: {
    marginBottom: 0,
    minHeight: 40,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    minHeight: 24,
  },
  inputIcon: {
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  createButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    fontWeight: '400',
  },
  createButtonText: {
    color: 'white',
  },
  // Participants section styles
  participantsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantFields: {
    gap: 8,
  },
});