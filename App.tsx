import { Forms } from './src/components/Forms';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <SafeAreaProvider>
      <Forms/>
      <Toast />
    </SafeAreaProvider>
  );
}
