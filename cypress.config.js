const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5175',
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
