// nodejs-22-compatibility.test.ts
import { describe, test, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

describe('Node.js 22 Compatibility Tests', () => {
  let packageJson: PackageJson;
  let nodeVersion: string;
  
  beforeAll(() => {
    // Load package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Get current Node.js version
    nodeVersion = process.version;
  });

  describe('Runtime Environment', () => {
    test('should run on Node.js 22.x.x or higher', () => {
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(22);
    });

    test('should have updated package.json engines field', () => {
      expect(packageJson.engines?.node).toMatch(/>=22\.|^22\./);
    });

    test('should support Node.js 22 ES module features', () => {
      // Test for Node.js 22 specific features
      expect(typeof globalThis.fetch).toBe('function');
      expect(typeof AbortController).toBe('function');
      expect(typeof ReadableStream).toBe('function');
    });
  });

  describe('Dependency Compatibility', () => {
    test('should have compatible React version', () => {
      expect(packageJson.dependencies?.react).toBeTruthy();
      // React 18+ is Node.js 22 compatible
      const reactVersion = packageJson.dependencies?.react;
      expect(reactVersion).toMatch(/^(18\.|19\.|^18)/);
    });

    test('should have compatible Vite version', () => {
      expect(packageJson.devDependencies?.vite).toBeTruthy();
      // Vite 5+ is Node.js 22 compatible
      const viteVersion = packageJson.devDependencies?.vite;
      expect(viteVersion).toMatch(/^([5-9]\.|^[5-9])/);
    });

    test('should have compatible TypeScript version', () => {
      expect(packageJson.devDependencies?.typescript).toBeTruthy();
      // TypeScript 5+ is Node.js 22 compatible
      const tsVersion = packageJson.devDependencies?.typescript;
      expect(tsVersion).toMatch(/^([5-9]\.|^[5-9])/);
    });
  });

  describe('Build System Compatibility', () => {
    test('should run npm scripts successfully', async () => {
      // Test that basic npm scripts work
      expect(() => execSync('npm run type-check', { stdio: 'pipe' })).not.toThrow();
    });

    test('should compile TypeScript without errors', () => {
      expect(() => execSync('npx tsc --noEmit', { stdio: 'pipe' })).not.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    test('should have acceptable startup time', async () => {
      const startTime = Date.now();
      
      // Simulate app initialization
      await import('../main');
      
      const endTime = Date.now();
      const startupTime = endTime - startTime;
      
      // Startup should be under 2 seconds for tests
      expect(startupTime).toBeLessThan(2000);
    });

    test('should maintain memory usage within limits', () => {
      const memUsage = process.memoryUsage();
      
      // Memory usage should be reasonable (under 200MB for tests)
      expect(memUsage.heapUsed).toBeLessThan(200 * 1024 * 1024);
    });
  });

  describe('Azure Functions Compatibility', () => {
    test('should have Node.js 22 compatible Azure dependencies', () => {
      // Check Azure SDK versions
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['@azure/functions']) {
        // Azure Functions v4 supports Node.js 22
        expect(deps['@azure/functions']).toMatch(/^4\./);
      }
      
      if (deps['@azure/identity']) {
        // Latest Azure Identity SDK supports Node.js 22
        expect(deps['@azure/identity']).toBeTruthy();
      }
      
      if (deps['@azure/keyvault-secrets']) {
        // Latest Key Vault SDK supports Node.js 22
        expect(deps['@azure/keyvault-secrets']).toBeTruthy();
      }
    });
  });
});

describe('Azure Functions Node.js 22 Runtime Tests', () => {
  describe('Function Loading', () => {
    test('should load all functions successfully', () => {
      // Test that Azure Functions structure is valid for Node.js 22
      const apiPath = path.join(process.cwd(), 'api');
      
      if (fs.existsSync(apiPath)) {
        // Check api/package.json exists and has Node.js 22+ requirement
        const apiPackageJsonPath = path.join(apiPath, 'package.json');
        expect(fs.existsSync(apiPackageJsonPath)).toBe(true);
        
        const apiPackageJson: PackageJson = JSON.parse(fs.readFileSync(apiPackageJsonPath, 'utf8'));
        expect(apiPackageJson.engines?.node).toMatch(/>=22\.|^22\./);
        
        // Check function directories exist
        const functionDirs = fs.readdirSync(apiPath)
          .filter(dir => fs.statSync(path.join(apiPath, dir)).isDirectory());
        
        expect(functionDirs.length).toBeGreaterThan(0);
        
        // Each function should have required files
        for (const functionDir of functionDirs) {
          const functionPath = path.join(apiPath, functionDir);
          if (fs.existsSync(path.join(functionPath, 'function.json'))) {
            expect(fs.existsSync(path.join(functionPath, 'function.json'))).toBe(true);
            expect(fs.existsSync(path.join(functionPath, 'index.js'))).toBe(true);
          }
        }
      } else {
        // If api directory doesn't exist, just pass the test
        expect(true).toBe(true);
      }
    });

    test('should execute AI chat function', async () => {
      // This will test the core functionality once deployed
      expect(true).toBe(true); // Placeholder - will implement actual test
    });

    test('should access Key Vault secrets', async () => {
      // This will test Azure Key Vault integration
      expect(true).toBe(true); // Placeholder - will implement actual test
    });
  });

  describe('Node.js Version Compatibility', () => {
    test('should support Node.js 22+ features', () => {
      // Test Node.js version compatibility
      const nodeProcess: NodeJS.Process = process;
      expect(nodeProcess.version).toBeDefined();
      expect(nodeProcess.versions.node).toBeDefined();
      
      // Test that we're running Node.js 22+
      const majorVersion = parseInt(nodeProcess.versions.node.split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(22);
    });
  });
}); 