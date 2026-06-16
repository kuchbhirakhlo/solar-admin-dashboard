'use client';

import { useState } from 'react';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UploadProgress {
  progress: number;
  error: string | null;
}

export function useFirebaseStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    filePath: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const fileRef = ref(storage, filePath);
      const snapshot = await uploadBytes(fileRef, file);
      
      if (onProgress) {
        onProgress(100);
      }

      const downloadUrl = await getDownloadURL(snapshot.ref);
      setUploading(false);
      return downloadUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploading(false);
      throw new Error(errorMessage);
    }
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getDownloadUrl = async (filePath: string): Promise<string> => {
    try {
      const fileRef = ref(storage, filePath);
      return await getDownloadURL(fileRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get URL';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    uploadFile,
    deleteFile,
    getDownloadUrl,
    uploading,
    error,
  };
}
