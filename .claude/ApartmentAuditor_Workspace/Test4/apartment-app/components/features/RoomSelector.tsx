import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';

const PREDEFINED_ROOMS = [
  'Гостиная',
  'Спальня',
  'Кухня',
  'Ванная',
  'Туалет',
  'Коридор',
  'Балкон',
];

export interface RoomSelectorProps {
  selectedRoom: string | null;
  onSelectRoom: (room: string) => void;
}

export function RoomSelector({ selectedRoom, onSelectRoom }: RoomSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRoom, setCustomRoom] = useState('');

  const handleRoomSelect = (room: string) => {
    onSelectRoom(room);
  };

  const handleCustomRoomSubmit = () => {
    if (customRoom.trim().length === 0) {
      Alert.alert('Ошибка', 'Введите название помещения');
      return;
    }

    handleRoomSelect(customRoom.trim());
    setCustomRoom('');
    setShowCustomInput(false);
  };

  const handleOtherPress = () => {
    setShowCustomInput(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Помещение:</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {PREDEFINED_ROOMS.map((room) => (
          <TouchableOpacity
            key={room}
            style={[
              styles.chip,
              selectedRoom === room && styles.selectedChip,
            ]}
            onPress={() => handleRoomSelect(room)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                selectedRoom === room && styles.selectedChipText,
              ]}
            >
              {room}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.chip,
            styles.otherChip,
          ]}
          onPress={handleOtherPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, styles.otherChipText]}>
            + Другое
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showCustomInput && (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            value={customRoom}
            onChangeText={setCustomRoom}
            placeholder="Введите название помещения"
            autoFocus
            onSubmitEditing={handleCustomRoomSubmit}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCustomRoomSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>Добавить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowCustomInput(false);
              setCustomRoom('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  scrollView: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedChipText: {
    color: 'white',
  },
  otherChip: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  otherChipText: {
    color: '#666',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  customInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});