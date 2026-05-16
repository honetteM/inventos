import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { getProductByBarcode } from '@/src/services/inventory';

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-8">
        <Ionicons name="camera-outline" size={64} color="white" />
        <Text className="text-white text-xl font-bold mt-4 mb-2">Camera Permission Required</Text>
        <Text className="text-gray-400 text-center mb-8">
          Allow camera access to scan barcodes and quickly look up products.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4"
        >
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!scanning) return;
    setScanning(false);
    setError(null);

    try {
      const response = await getProductByBarcode(result.data);
      if (response?.data?.id) {
        router.replace(`/product/${response.data.id}`);
      } else {
        setError('Product not found for barcode: ' + result.data);
        setTimeout(() => setScanning(true), 2000);
      }
    } catch {
      setError('Product not found for this barcode');
      setTimeout(() => setScanning(true), 2000);
    }
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'itf14', 'codabar', 'qr'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View className="absolute inset-0">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Scan Barcode</Text>
          <View style={{ width: 28 }} />
        </View>

        <View className="flex-1 justify-center items-center">
          <View className="w-72 h-72 border-2 border-white/60 rounded-2xl relative">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl" />
          </View>
          <Text className="text-white/70 text-sm mt-6">
            Point camera at a barcode
          </Text>
        </View>

        <View className="pb-12 px-4">
          {error && (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 items-center">
              <Text className="text-red-400 text-sm">{error}</Text>
              <TouchableOpacity
                onPress={() => { setScanning(true); setError(null); }}
                className="mt-2"
              >
                <Text className="text-white text-sm font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
          {!error && !scanning && (
            <View className="bg-primary/20 border border-primary rounded-xl p-3 items-center">
              <Text className="text-primary text-sm">Processing...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
