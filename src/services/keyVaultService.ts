// src/services/keyVaultService.ts
// Hybrid configuration service: Local env vars (dev) + Azure App Service config (prod)

class ConfigurationService {
  private cache: Map<string, { value: string; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = 'https://perfectzenkai-api.azurewebsites.net/api';

  /**
   * Gets configuration value using hybrid approach:
   * - Development: Uses local environment variables
   * - Production: Uses Azure Function App environment variables via API
   */
  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`🔄 Using cached secret: ${secretName}`);
      return cached.value;
    }

    // Development: Use local environment variables
    if (import.meta.env.DEV) {
      const envValue = this.getLocalEnvVar(secretName);
      if (envValue) {
        console.log(`🏠 Using local environment variable: ${secretName}`);
        this.cache.set(secretName, { value: envValue, timestamp: Date.now() });
        return envValue;
      }
    }

    // Production: Use Azure Function App environment variables
    try {
      console.log(`🌐 Fetching configuration from Azure Function App: ${secretName}`);
      
      const response = await fetch(`${this.API_BASE_URL}/get-secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secretName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.value) {
        throw new Error(`Configuration ${secretName} has no value`);
      }

      // Cache the secret
      this.cache.set(secretName, {
        value: data.value,
        timestamp: Date.now()
      });

      console.log(`✅ Successfully retrieved configuration from Azure: ${secretName}`);
      return data.value;
    } catch (error) {
      console.error(`❌ Failed to get configuration ${secretName}:`, error);
      
      // Final fallback: Try local env vars even in production
      const fallbackValue = this.getLocalEnvVar(secretName);
      if (fallbackValue) {
        console.warn(`⚠️ Using fallback local environment variable: ${secretName}`);
        return fallbackValue;
      }
      
      throw error;
    }
  }

  /**
   * Maps secret names to environment variable names
   */
  private getLocalEnvVar(secretName: string): string | undefined {
    const envMap: Record<string, string> = {
      'supabase-url': 'VITE_SUPABASE_URL',
      'supabase-anon-key': 'VITE_SUPABASE_ANON_KEY',
      'openai-direct-api-key': 'VITE_OPENAI_API_KEY'
    };

    const envVarName = envMap[secretName];
    if (!envVarName) {
      console.warn(`⚠️ No environment variable mapping for secret: ${secretName}`);
      return undefined;
    }

    return import.meta.env[envVarName];
  }

  async getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
    try {
      console.log('🔧 Loading Supabase configuration...');
      
      const [url, anonKey] = await Promise.all([
        this.getSecret('supabase-url'),
        this.getSecret('supabase-anon-key')
      ]);

      const configSource = import.meta.env.DEV ? 'local environment' : 'Azure configuration';
      console.log(`✅ Supabase configuration loaded from ${configSource}`);
      return { url, anonKey };
    } catch (error) {
      console.error('❌ Failed to load Supabase configuration:', error);
      throw new Error('Could not load Supabase configuration. Please check your environment variables or Azure Function deployment.');
    }
  }

  async getOpenAIKey(): Promise<string> {
    try {
      console.log('🔧 Loading OpenAI API key...');
      const apiKey = await this.getSecret('openai-direct-api-key');
      const configSource = import.meta.env.DEV ? 'local environment' : 'Azure configuration';
      console.log(`✅ OpenAI API key loaded from ${configSource}`);
      return apiKey;
    } catch (error) {
      console.error('❌ Failed to load OpenAI API key:', error);
      throw new Error('Could not load OpenAI API key. Please check your environment variables or Azure Function deployment.');
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Configuration cache cleared');
  }

  /**
   * Gets current configuration source for debugging
   */
  getConfigSource(): string {
    return import.meta.env.DEV ? 'Local Environment Variables' : 'Azure Function App Settings';
  }
}

// Export with legacy name for backward compatibility
export const keyVaultService = new ConfigurationService();
export const configurationService = keyVaultService; 