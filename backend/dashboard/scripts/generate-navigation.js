// scripts/generate-navigation.js
// Build-time script to generate navigation from OpenAPI specs

const fs = require('fs');
const path = require('path');

const SPECS_DIR = path.join(__dirname, '../../l-shell-agent/specs');
const OUTPUT_FILE = path.join(__dirname, '../lib/navigation.ts');

function generateNavigation() {
  console.log('🔧 Generating navigation from OpenAPI specs...');
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Read all spec files
  const specFiles = fs.readdirSync(SPECS_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  console.log(`📋 Found ${specFiles.length} OpenAPI specs`);
  
  const services = [];
  
  for (const file of specFiles) {
    try {
      const filePath = path.join(SPECS_DIR, file);
      const spec = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const serviceName = path.basename(file, '.json');
      const title = spec.info?.title || serviceName;
      const description = spec.info?.description || '';
      const baseUrl = spec.servers?.[0]?.url || `http://localhost:8000`;
      
      // Extract endpoints
      const endpoints = [];
      const paths = spec.paths || {};
      
      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods)) {
          if (typeof details === 'object' && details !== null) {
            endpoints.push({
              method: method.toUpperCase(),
              path,
              operationId: details.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
              summary: details.summary || `${method.toUpperCase()} ${path}`,
              description: details.description || '',
              parameters: details.parameters || [],
              requestBody: details.requestBody || null,
              responses: details.responses || {}
            });
          }
        }
      }
      
      services.push({
        id: serviceName,
        name: title,
        description,
        baseUrl,
        endpointCount: endpoints.length,
        endpoints
      });
      
      console.log(`  ✅ ${serviceName}: ${endpoints.length} endpoints`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  }
  
  // Generate TypeScript navigation file
  const navigationContent = `// Auto-generated from OpenAPI specs - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}

export interface EndpointParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required?: boolean;
  schema?: any;
}

export interface EndpointRequestBody {
  required?: boolean;
  content?: any;
}

export interface ServiceEndpoint {
  method: string;
  path: string;
  operationId: string;
  summary: string;
  description: string;
  parameters: EndpointParameter[];
  requestBody: EndpointRequestBody | null;
  responses: any;
}

export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  endpointCount: number;
  endpoints: ServiceEndpoint[];
}

export const SERVICES: ServiceInfo[] = ${JSON.stringify(services, null, 2)};

export const SERVICE_MAP = new Map(SERVICES.map(service => [service.id, service]));

export function getService(id: string): ServiceInfo | undefined {
  return SERVICE_MAP.get(id);
}

export function getAllServices(): ServiceInfo[] {
  return SERVICES;
}

export function getFirstService(): ServiceInfo | undefined {
  return SERVICES[0];
}
`;
  
  fs.writeFileSync(OUTPUT_FILE, navigationContent, 'utf8');
  
  console.log(`🎉 Navigation generated: ${services.length} services, ${services.reduce((sum, s) => sum + s.endpointCount, 0)} total endpoints`);
  console.log(`📝 Output: ${OUTPUT_FILE}`);
}

if (require.main === module) {
  generateNavigation();
}

module.exports = { generateNavigation };
