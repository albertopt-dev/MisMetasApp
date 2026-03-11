const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Workaround para Firebase Auth + Expo/Metro
config.resolver.unstable_enablePackageExports = false;

// Ayuda a resolver algunos paquetes CommonJS de Firebase
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
