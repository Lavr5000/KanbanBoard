import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const itemSize = (screenWidth - 48) / 3; // 3 columns with padding
const aspectRatio = 4 / 3;

export interface PhotoGridProps {
  photos: string[]; // file:// URIs
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
  maxPhotos?: number;
}

export function PhotoGrid({
  photos,
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 10,
}: PhotoGridProps) {
  const handleRemovePhoto = (uri: string) => {
    Alert.alert(
      'Удалить фото',
      'Вы уверены, что хотите удалить это фото?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => onRemovePhoto(uri) },
      ]
    );
  };

  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
    <View style={[styles.photoContainer, { width: itemSize, height: itemSize / aspectRatio }]}>
      <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemovePhoto(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = () => {
    if (photos.length >= maxPhotos) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.addPhotoButton, { width: itemSize, height: itemSize / aspectRatio }]}
        onPress={onAddPhoto}
        activeOpacity={0.7}
      >
        <Ionicons name="camera" size={24} color="#999" />
        <Text style={styles.addPhotoText}>Добавить</Text>
      </TouchableOpacity>
    );
  };

  const data = [...photos];
  if (photos.length < maxPhotos) {
    data.push('add-button');
  }

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    if (item === 'add-button') {
      return renderAddButton();
    }
    return renderPhotoItem({ item, index });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Фотографии ({photos.length})</Text>
        {photos.length < maxPhotos && (
          <TouchableOpacity onPress={onAddPhoto} activeOpacity={0.7}>
            <Text style={styles.addLinkText}>Добавить</Text>
          </TouchableOpacity>
        )}
      </View>

      {photos.length === 0 ? (
        <TouchableOpacity
          style={[styles.emptyState, { height: itemSize / aspectRatio }]}
          onPress={onAddPhoto}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={32} color="#CCC" />
          <Text style={styles.emptyText}>Нажмите, чтобы добавить фото</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item === 'add-button' ? 'add-button' : item}
          numColumns={3}
          scrollEnabled={false}
          style={styles.photoGrid}
          contentContainerStyle={styles.photoGridContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addLinkText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  photoGrid: {
    flexGrow: 0,
  },
  photoGridContent: {
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
});