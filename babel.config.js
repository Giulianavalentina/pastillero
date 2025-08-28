// PASTILLERO/babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Asegúrate de que este plugin esté configurado correctamente
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // Esto es importante para que Jest y Babel resuelvan rutas como '@/components'
            // Tus alias deberían apuntar a la raíz del proyecto para '@/...'
            '@': './',
            // Si tienes otras carpetas alias, por ejemplo:
            // '@components': './components',
            // '@hooks': './hooks',
            // etc.
          },
        },
      ],
      // Si usas React Native Reanimated, asegúrate de que este plugin sea el ÚLTIMO en la lista
      'react-native-reanimated/plugin',
    ],
  };
};