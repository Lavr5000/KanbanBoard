import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import type { ProcessedPhoto, PhotoProcessProgress } from '@/types';

const BATCH_SIZE = 5;
const MAX_PHOTO_WIDTH = 800;
const JPEG_QUALITY = 0.7;

export class PhotoProcessor {
  /**
   * Process array of file:// URIs in batches
   * Resizes to max 800px width, converts to Base64
   */
  async processPhotosInBatches(
    photoUris: string[],
    onProgress?: (progress: PhotoProcessProgress) => void
  ): Promise<ProcessedPhoto[]> {
    const results: ProcessedPhoto[] = [];

    for (let i = 0; i < photoUris.length; i += BATCH_SIZE) {
      const batch = photoUris.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(uri => this.resizeAndConvert(uri))
      );

      results.push(...batchResults);

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + batch.length,
          total: photoUris.length,
          percentage: Math.round(((i + batch.length) / photoUris.length) * 100)
        });
      }

      // Give JS engine time for GC
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Resize single photo and convert to Base64
   */
  private async resizeAndConvert(uri: string): Promise<ProcessedPhoto> {
    try {
      // Resize using expo-image-manipulator
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: MAX_PHOTO_WIDTH } }],
        { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
      );

      // Convert to Base64
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: 'base64',
      });

      return {
        base64: `data:image/jpeg;base64,${base64}`,
        width: manipResult.width,
        height: manipResult.height,
        originalUri: uri
      };
    } catch (error) {
      console.error(`Failed to process photo: ${uri}`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Photo processing failed: ${errorMessage}`);
    }
  }
}

export const photoProcessor = new PhotoProcessor();