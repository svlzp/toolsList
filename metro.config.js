// Примечание: этот файл может не понадобиться, если вы используете Expo
// Expo обычно сам настраивает Metro bundler

const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  return config;
})();
