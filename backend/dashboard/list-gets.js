const fs = require('fs');

// Read the navigation file
const content = fs.readFileSync('./lib/navigation.ts', 'utf8');

// Extract the SERVICES array using regex
const match = content.match(/export const SERVICES: ServiceInfo\[\] = (\[[\s\S]*?\]);$/m);

if (!match) {
  console.log('Could not find SERVICES array');
  process.exit(1);
}

try {
  // Parse the services data
  const servicesString = match[1];
  const services = eval(servicesString);
  
  console.log('📋 GET Endpoints by Service:\n');
  console.log('='.repeat(80) + '\n');
  
  services.forEach(service => {
    const getEndpoints = service.endpoints.filter(ep => ep.method === 'GET');
    
    console.log(`🔷 ${service.name}`);
    console.log(`   ID: ${service.id}`);
    console.log(`   Base URL: ${service.baseUrl}`);
    console.log(`   GET Endpoints: ${getEndpoints.length}/${service.endpointCount}`);
    console.log('');
    
    if (getEndpoints.length > 0) {
      getEndpoints.forEach((ep, index) => {
        console.log(`   ${index + 1}. GET ${ep.path}`);
        console.log(`      Summary: ${ep.summary || ep.operationId || 'No summary'}`);
        if (ep.parameters && ep.parameters.length > 0) {
          const params = ep.parameters.map(p => `${p.name}(${p.in})`).join(', ');
          console.log(`      Parameters: ${params}`);
        }
        console.log('');
      });
    } else {
      console.log('   ❌ No GET endpoints found\n');
    }
    
    console.log('-'.repeat(80) + '\n');
  });
  
  // Summary statistics
  const totalGets = services.reduce((acc, service) => 
    acc + service.endpoints.filter(ep => ep.method === 'GET').length, 0);
  
  const totalEndpoints = services.reduce((acc, service) => acc + service.endpointCount, 0);
  
  console.log('📊 SUMMARY:');
  console.log(`   Total Services: ${services.length}`);
  console.log(`   Total GET Endpoints: ${totalGets}`);
  console.log(`   Total All Endpoints: ${totalEndpoints}`);
  console.log(`   GET Percentage: ${((totalGets / totalEndpoints) * 100).toFixed(1)}%`);
  
} catch (error) {
  console.error('Error parsing services:', error.message);
}
