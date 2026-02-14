const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom resolver to handle node: protocol imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle node: protocol imports
  if (moduleName.startsWith('node:')) {
    const actualModuleName = moduleName.slice(5); // Remove 'node:' prefix
    switch(actualModuleName) {
      case 'buffer':
        return {
          type: 'sourceFile',
          filePath: require.resolve('buffer'),
        };
      case 'stream':
        return {
          type: 'sourceFile',
          filePath: require.resolve('stream-browserify'),
        };
      case 'util':
        return {
          type: 'sourceFile',
          filePath: require.resolve('util'),
        };
      case 'events':
        return {
          type: 'sourceFile',
          filePath: require.resolve('events'),
        };
      case 'path':
        return {
          type: 'sourceFile',
          filePath: require.resolve('path-browserify'),
        };
      case 'crypto':
        return {
          type: 'sourceFile',
          filePath: require.resolve('crypto-browserify'),
        };
      case 'http':
        return {
          type: 'sourceFile',
          filePath: require.resolve('stream-http'),
        };
      case 'https':
        return {
          type: 'sourceFile',
          filePath: require.resolve('https-browserify'),
        };
      case 'os':
        return {
          type: 'sourceFile',
          filePath: require.resolve('os-browserify/browser'),
        };
      case 'url':
        return {
          type: 'sourceFile',
          filePath: require.resolve('url'),
        };
      case 'zlib':
        return {
          type: 'sourceFile',
          filePath: require.resolve('browserify-zlib'),
        };
      default:
        return context.resolveRequest(context, actualModuleName, platform);
    }
  }
  
  // Default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

// Add asset extensions if needed
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'bin');

module.exports = config;