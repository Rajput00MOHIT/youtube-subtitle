module.exports = {
    // ... other configurations
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
      },
    },
  };