import React, { useState, useEffect } from 'react';
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
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import type { Participant } from '@/types';
import { ParticipantForm } from './ParticipantForm';

// Import Contacts
// import Contacts from 'react-native-contacts';

interface Contact {
  recordID: string;
  givenName: string;
  familyName: string;
  phoneNumbers: Array<{
    label: string;
    number: string;
  }>;
  emailAddresses: Array<{
    label: string;
    email: string;
  }>;
  company: string;
  jobTitle: string;
}

interface ParticipantModalProps {
  visible: boolean;
  initialParticipants?: Participant[];
  onSave: (participants: Participant[]) => void;
  onClose: () => void;
}

type InputMode = 'manual' | 'contacts';

export function ParticipantModal({
  visible,
  initialParticipants = [],
  onSave,
  onClose,
}: ParticipantModalProps) {
  const { colors } = useTheme();
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Request permission and load contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      let hasPermission = false;

      if (Platform.OS === 'android') {
        hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );

        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
          );
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else {
        // iOS handles permissions differently
        hasPermission = true; // Simplified for now
      }

      if (hasPermission) {
        // Contacts functionality temporarily disabled
        setContacts([]);
      } else {
        setContacts([]);
        Alert.alert('Нет доступа', 'Разрешите доступ к контактам для использования этой функции');
        setInputMode('manual');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить контакты');
      setInputMode('manual');
    } finally {
      setLoadingContacts(false);
    }
  };

  // Load contacts when switching to contacts mode
  useEffect(() => {
    if (inputMode === 'contacts' && contacts.length === 0 && !loadingContacts) {
      loadContacts();
    }
  }, [inputMode]);

  const handleContactSelect = (contact: Contact) => {
    const newSelection = new Set(selectedContacts);

    if (newSelection.has(contact.recordID)) {
      newSelection.delete(contact.recordID);
    } else {
      newSelection.add(contact.recordID);
    }

    setSelectedContacts(newSelection);
  };

  const createParticipantsFromContacts = (): Participant[] => {
    const selectedContactList = contacts.filter(contact =>
      selectedContacts.has(contact.recordID)
    );

    return selectedContactList.map((contact): Participant => {
      const fullName = `${contact.givenName} ${contact.familyName}`.trim();
      const organization = contact.company || '';
      const position = contact.jobTitle || '';

      // Determine role based on phone count or other logic (simplified)
      let role: Participant['role'] = 'representative';
      if (selectedContactList.indexOf(contact) === 0) role = 'developer';
      if (selectedContactList.indexOf(contact) === selectedContactList.length - 1 && selectedContactList.length > 2) {
        role = 'inspector';
      }

      return {
        role,
        fullName,
        position,
        organization,
      };
    });
  };

  const handleSaveFromContacts = () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Выбор контактов', 'Выберите хотя бы один контакт');
      return;
    }

    const participants = createParticipantsFromContacts();
    onSave(participants);
    handleClose();
  };

  const handleClose = () => {
    setSelectedContacts(new Set());
    setInputMode('manual');
    onClose();
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const fullName = `${item.givenName} ${item.familyName}`.trim();
    const isSelected = selectedContacts.has(item.recordID);

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          {
            backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleContactSelect(item)}
      >
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            {fullName || 'Без имени'}
          </Text>
          {item.company && (
            <Text style={[styles.contactCompany, { color: colors.textSecondary }]}>
              {item.company}
            </Text>
          )}
          {item.jobTitle && (
            <Text style={[styles.contactPosition, { color: colors.textSecondary }]}>
              {item.jobTitle}
            </Text>
          )}
        </View>
        <View style={[
          styles.checkbox,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: colors.primary,
          }
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
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
                Участники проверки
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={handleClose}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Mode Selector */}
            <View style={[styles.modeSelector, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  inputMode === 'manual' && {
                    backgroundColor: colors.primary,
                  }
                ]}
                onPress={() => setInputMode('manual')}
              >
                <Text style={[
                  styles.modeButtonText,
                  {
                    color: inputMode === 'manual' ? 'white' : colors.text,
                  }
                ]}>
                  Ручной ввод
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  inputMode === 'contacts' && {
                    backgroundColor: colors.primary,
                  }
                ]}
                onPress={() => setInputMode('contacts')}
              >
                <Text style={[
                  styles.modeButtonText,
                  {
                    color: inputMode === 'contacts' ? 'white' : colors.text,
                  }
                ]}>
                  Из контактов
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {inputMode === 'manual' ? (
                <ParticipantForm
                  initialParticipants={initialParticipants}
                  onSave={(participants) => {
                    onSave(participants);
                    handleClose();
                  }}
                  onCancel={handleClose}
                />
              ) : (
                <View style={styles.contactsContainer}>
                  {loadingContacts ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="reload" size={24} color={colors.primary} />
                      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Загрузка контактов...
                      </Text>
                    </View>
                  ) : contacts.length === 0 ? (
                    <View style={styles.emptyContactsContainer}>
                      <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Контакты не найдены
                      </Text>
                      <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                        onPress={loadContacts}
                      >
                        <Text style={styles.retryButtonText}>Обновить</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                        Выберите контакты для добавления в качестве участников:
                      </Text>
                      <FlatList
                        data={contacts}
                        renderItem={renderContactItem}
                        keyExtractor={(item) => item.recordID}
                        style={styles.contactsList}
                        showsVerticalScrollIndicator={false}
                      />
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Actions for Contacts Mode */}
            {inputMode === 'contacts' && (
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
                  onPress={handleClose}
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
                      backgroundColor: selectedContacts.size > 0 ? colors.primary : colors.surface,
                      opacity: selectedContacts.size > 0 ? 1 : 0.6,
                    }
                  ]}
                  onPress={handleSaveFromContacts}
                  disabled={selectedContacts.size === 0}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: selectedContacts.size > 0 ? 'white' : colors.textSecondary,
                    }
                  ]}>
                    Добавить ({selectedContacts.size})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    maxHeight: '90%',
  },
  modal: {
    width: '95%',
    maxHeight: '90%',
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
  modeSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contactsContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContactsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactPosition: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
});