const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    blockList: [
      /android\/build\/.*/,
      /android\/app\/build\/.*/,
      /android\/\.gradle\/.*/,
      /node_modules\/.*\/android\/build\/.*/,
      /node_modules\/.*\/android\/\.cxx\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);