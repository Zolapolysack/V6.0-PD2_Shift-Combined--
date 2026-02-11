// Performance Testing Script
// ทดสอบระบบสามารถรับโหลด 20-40 users พร้อมกันได้หรือไม่

import http from 'http';
import { performance } from 'perf_hooks';

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8787';
const API_TOKEN = process.env.API_TOKEN || 'test-token';
const SPREADSHEET_ID = process.env.TEST_SPREADSHEET_ID || 'YOUR_TEST_SPREADSHEET_ID';
const NUM_USERS = parseInt(process.env.NUM_USERS || '40');
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || '5');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║   PD2 Load Testing - ${NUM_USERS} Concurrent Users   ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

// Stats tracking
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: {},
  latencies: [],
  start: 0,
  end: 0
};

// Simulate single API request
async function apiRequest(endpoint, method = 'POST', body = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (method !== 'GET' && body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Simulate single user workflow
async function simulateUser(userId) {
  const results = [];
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const start = performance.now();
    
    try {
      // Mix of reads and writes
      let response;
      if (i % 3 === 0) {
        // Write operation (append)
        response = await apiRequest('/api/sheets/append', 'POST', {
          spreadsheetId: SPREADSHEET_ID,
          range: 'TestSheet!A:A',
          values: [[`User ${userId} - Request ${i} - ${new Date().toISOString()}`]]
        });
      } else {
        // Read operation
        response = await apiRequest('/api/sheets/read', 'POST', {
          spreadsheetId: SPREADSHEET_ID,
          range: 'TestSheet!A1:A100'
        });
      }
      
      const latency = performance.now() - start;
      
      stats.total++;
      stats.latencies.push(latency);
      
      if (response.status === 200) {
        stats.success++;
        results.push({ success: true, latency, cached: response.data?.cached });
      } else if (response.status === 429) {
        stats.failed++;
        stats.errors['Rate Limited'] = (stats.errors['Rate Limited'] || 0) + 1;
        results.push({ success: false, error: 'Rate Limited', latency });
      } else {
        stats.failed++;
        stats.errors[`HTTP ${response.status}`] = (stats.errors[`HTTP ${response.status}`] || 0) + 1;
        results.push({ success: false, error: `HTTP ${response.status}`, latency });
      }
      
    } catch (err) {
      const latency = performance.now() - start;
      stats.total++;
      stats.failed++;
      stats.latencies.push(latency);
      stats.errors[err.code || err.message] = (stats.errors[err.code || err.message] || 0) + 1;
      results.push({ success: false, error: err.message, latency });
    }
    
    // Small delay between requests (simulate real user)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }
  
  return results;
}

// Calculate statistics
function calculateStats() {
  const sorted = stats.latencies.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length || 0;
  const min = sorted[0] || 0;
  const max = sorted[sorted.length - 1] || 0;
  
  return { p50, p90, p99, avg, min, max };
}

// Print results
function printResults() {
  const duration = (stats.end - stats.start) / 1000;
  const throughput = stats.total / duration;
  const latencyStats = calculateStats();
  
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}              TEST RESULTS                 ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.blue}Test Configuration:${colors.reset}`);
  console.log(`  Concurrent Users:     ${NUM_USERS}`);
  console.log(`  Requests per User:    ${REQUESTS_PER_USER}`);
  console.log(`  Total Requests:       ${stats.total}`);
  console.log(`  Duration:             ${duration.toFixed(2)}s`);
  console.log(`  Throughput:           ${throughput.toFixed(2)} req/s\n`);
  
  const successRate = (stats.success / stats.total * 100).toFixed(2);
  const successColor = successRate >= 95 ? colors.green : successRate >= 80 ? colors.yellow : colors.red;
  
  console.log(`${colors.blue}Results:${colors.reset}`);
  console.log(`  ${colors.green}✓ Successful:${colors.reset}        ${stats.success} (${successColor}${successRate}%${colors.reset})`);
  console.log(`  ${colors.red}✗ Failed:${colors.reset}            ${stats.failed}\n`);
  
  if (Object.keys(stats.errors).length > 0) {
    console.log(`${colors.red}Error Breakdown:${colors.reset}`);
    Object.entries(stats.errors).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}`);
    });
    console.log('');
  }
  
  console.log(`${colors.blue}Latency (ms):${colors.reset}`);
  console.log(`  Min:     ${latencyStats.min.toFixed(2)}ms`);
  console.log(`  Average: ${latencyStats.avg.toFixed(2)}ms`);
  console.log(`  P50:     ${latencyStats.p50.toFixed(2)}ms`);
  console.log(`  P90:     ${latencyStats.p90.toFixed(2)}ms`);
  console.log(`  P99:     ${latencyStats.p99.toFixed(2)}ms`);
  console.log(`  Max:     ${latencyStats.max.toFixed(2)}ms\n`);
  
  // Assessment
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}              ASSESSMENT                   ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
  
  const assessments = [];
  
  if (successRate >= 95) {
    assessments.push(`${colors.green}✓ Excellent success rate${colors.reset}`);
  } else if (successRate >= 80) {
    assessments.push(`${colors.yellow}⚠ Acceptable success rate, but could be better${colors.reset}`);
  } else {
    assessments.push(`${colors.red}✗ Poor success rate - system overloaded${colors.reset}`);
  }
  
  if (latencyStats.p90 < 500) {
    assessments.push(`${colors.green}✓ Good latency (P90 < 500ms)${colors.reset}`);
  } else if (latencyStats.p90 < 1000) {
    assessments.push(`${colors.yellow}⚠ Acceptable latency (P90 < 1s)${colors.reset}`);
  } else {
    assessments.push(`${colors.red}✗ High latency (P90 > 1s) - performance issue${colors.reset}`);
  }
  
  if (stats.errors['Rate Limited']) {
    const rateLimitedPct = (stats.errors['Rate Limited'] / stats.total * 100).toFixed(1);
    assessments.push(`${colors.red}✗ Rate limiting detected (${rateLimitedPct}% requests)${colors.reset}`);
  }
  
  if (throughput >= 10) {
    assessments.push(`${colors.green}✓ Good throughput (${throughput.toFixed(1)} req/s)${colors.reset}`);
  } else {
    assessments.push(`${colors.yellow}⚠ Low throughput (${throughput.toFixed(1)} req/s)${colors.reset}`);
  }
  
  assessments.forEach(a => console.log(`  ${a}`));
  
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
  
  // Final recommendation
  if (successRate >= 95 && latencyStats.p90 < 500 && !stats.errors['Rate Limited']) {
    console.log(`${colors.green}🎉 System ready for ${NUM_USERS} concurrent users!${colors.reset}\n`);
  } else if (successRate >= 80) {
    console.log(`${colors.yellow}⚠️  System may work but needs optimization${colors.reset}`);
    console.log(`${colors.yellow}   Recommendations:${colors.reset}`);
    if (stats.errors['Rate Limited']) {
      console.log(`   - Increase rate limits`);
    }
    if (latencyStats.p90 >= 500) {
      console.log(`   - Enable caching`);
      console.log(`   - Enable clustering`);
    }
    console.log('');
  } else {
    console.log(`${colors.red}❌ System NOT ready for production${colors.reset}`);
    console.log(`${colors.red}   Critical issues detected - review configuration${colors.reset}\n`);
  }
}

// Main test runner
async function runLoadTest() {
  console.log(`${colors.blue}Starting load test...${colors.reset}\n`);
  console.log(`Target: ${API_BASE}`);
  console.log(`Simulating ${NUM_USERS} users x ${REQUESTS_PER_USER} requests = ${NUM_USERS * REQUESTS_PER_USER} total requests\n`);
  
  // Health check first
  try {
    const health = await apiRequest('/api/health', 'GET');
    if (health.status !== 200) {
      console.log(`${colors.red}❌ Health check failed - server not ready${colors.reset}\n`);
      process.exit(1);
    }
    console.log(`${colors.green}✓ Health check passed${colors.reset}\n`);
  } catch (err) {
    console.log(`${colors.red}❌ Cannot connect to server: ${err.message}${colors.reset}\n`);
    process.exit(1);
  }
  
  stats.start = performance.now();
  
  // Simulate all users concurrently
  console.log(`${colors.cyan}Spawning ${NUM_USERS} concurrent users...${colors.reset}\n`);
  
  const userPromises = [];
  for (let i = 1; i <= NUM_USERS; i++) {
    userPromises.push(simulateUser(i));
    
    // Show progress
    if (i % 10 === 0) {
      process.stdout.write(`${colors.cyan}Spawned ${i}/${NUM_USERS} users...\r${colors.reset}`);
    }
  }
  
  console.log(`${colors.cyan}All users spawned, waiting for completion...${colors.reset}\n`);
  
  // Wait for all users to complete
  await Promise.all(userPromises);
  
  stats.end = performance.now();
  
  printResults();
}

// Run the test
runLoadTest().catch(err => {
  console.error(`${colors.red}Test failed: ${err.message}${colors.reset}`);
  process.exit(1);
});
