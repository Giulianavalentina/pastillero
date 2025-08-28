import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font'; // Comenta esta línea
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme'; // Comenta o elimina si no lo usas temporalmente

export default function RootLayout() {
  const colorScheme = useColorScheme(); // Comenta o elimina si no lo usas temporalmente
  // const [loaded] = useFonts({ // Comenta estas líneas
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });

  // if (!loaded) { // Comenta o elimina este bloque condicional
  //   return null;
  // }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> {/* Puedes simplificar esto también temporalmente */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Asegúrate de que esta línea esté presente si tienes una página 404 */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}