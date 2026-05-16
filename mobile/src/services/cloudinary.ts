import * as ImageManipulator from 'expo-image-manipulator';
import api from './api';

export async function uploadImage(uri: string): Promise<string> {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );

  const formData = new FormData();
  formData.append('file', {
    uri: compressed.uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  const response = await api.post('uploads', formData, {
    timeout: 60000,
    headers: { 'Content-Type': null },
  });

  if (!response.data?.data?.url) {
    const msg = response.data?.error || response.data?.message || 'No URL returned from server';
    throw new Error(msg);
  }

  return response.data.data.url;
}
