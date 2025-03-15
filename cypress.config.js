import { defineConfig } from 'cypress';
import http from 'http';
import { URL } from 'url';

// Try multiple ports where Vite might be running
const possiblePorts = [5173, 5174, 5175, 5176, 5177];
const baseUrlPrefix = 'http://localhost:';

// Helper to check if a port is in use using Node's http module instead of fetch
const checkPortInUse = (port) => {
  return new Promise((resolve) => {
    const parsedUrl = new URL(`${baseUrlPrefix}${port}`);
    
    const req = http.get({
      hostname: parsedUrl.hostname,
      port: port,
      path: '/',
      timeout: 1000
    }, (res) => {
      // If we get any response, the port is in use
      resolve(true);
      res.resume(); // Consume response data to free up memory
    });

    req.on('error', () => {
      // If there's an error connecting, the port is not in use
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Find the first responsive port
const findActivePort = async () => {
  for (const port of possiblePorts) {
    const isInUse = await checkPortInUse(port);
    if (isInUse) {
      console.log(`Found Vite server running on port ${port}`);
      return port;
    }
  }
  console.warn('No active Vite server found! Using default port 5173');
  return 5173;
};

export default defineConfig({
  e2e: {
    baseUrl: null, // Will be set dynamically
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    setupNodeEvents(on, config) {
      // Before tests run, dynamically determine the port
      return findActivePort().then(port => {
        config.baseUrl = `${baseUrlPrefix}${port}`;
        return config;
      });
    },
    experimentalStudio: true,
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
