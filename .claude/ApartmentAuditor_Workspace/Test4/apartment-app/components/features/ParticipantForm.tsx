import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Participant } from '@/types';
import { colors } from '@/constants/colors';

interface ParticipantFormProps {
  initialParticipants?: Participant[];
  onSave: (participants: Participant[]) => void;
  onCancel: () => void;
}

export function ParticipantForm({ initialParticipants = [], onSave, onCancel }: ParticipantFormProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.length > 0
      ? initialParticipants
      : [
          { role: 'developer', fullName: '', position: '', organization: '' },
          { role: 'representative', fullName: '', position: '', organization: '' },
          { role: 'inspector', fullName: '', position: '', organization: '' }
        ]
  );

  const roleNames = {
    developer: 'Застройщик',
    representative: 'Представитель',
    inspector: 'Инспектор'
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    setParticipants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = () => {
    // Filter out empty participants
    const validParticipants = participants.filter(
      p => p.fullName.trim() !== '' && p.organization.trim() !== ''
    );
    onSave(validParticipants);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Участники проверки</Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {participants.map((participant, index) => (
        <View key={participant.role} style={styles.participantBlock}>
          <Text style={styles.roleLabel}>{roleNames[participant.role]}</Text>

          <TextInput
            style={styles.input}
            placeholder="ФИО"
            value={participant.fullName}
            onChangeText={(text) => updateParticipant(index, 'fullName', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Должность"
            value={participant.position}
            onChangeText={(text) => updateParticipant(index, 'position', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Организация"
            value={participant.organization}
            onChangeText={(text) => updateParticipant(index, 'organization', text)}
          />
        </View>
      ))}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  participantBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: 'white'
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600'
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600'
  }
});