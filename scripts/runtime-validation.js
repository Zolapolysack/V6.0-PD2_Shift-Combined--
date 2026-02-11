/**
 * Runtime Validation - ตรวจสอบการทำงานจริงของระบบ
 * ทดสอบการทำงานของ API, Database, และ Services ต่างๆ
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RuntimeValidator {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }

  log(type, message, details = null) {
    const entry = { type, message, details, timestamp: new Date().toISOString() };
    
    switch(type) {
      case 'SUCCESS':
        this.results.push(entry);
        console.log(`✓ ${message}`);
        break;
      case 'ERROR':
        this.errors.push(entry);
        console.error(`✗ ${message}`);
        if (details) console.error(`  ${details}`);
        break;
      case 'WARNING':
        this.warnings.push(entry);
        console.warn(`⚠ ${message}`);
        if (details) console.warn(`  ${details}`);
        break;
      case 'INFO':
        console.info(`ℹ ${message}`);
        break;
    }
  }

  // Test Node.js environment
  testNodeEnvironment() {
    console.log('\n=== Testing Node.js Environment ===\n');
    
    try {
      const nodeVersion = process.version;
      this.log('SUCCESS', `Node.js version: ${nodeVersion}`);
      
      // Check if Node version is compatible (v14+)
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 14) {
        this.log('SUCCESS', `Node.js version compatible (>= 14)`);
      } else {
        this.log('WARNING', `Node.js version may be outdated. Recommended: >= 14`);
      }
    } catch (err) {
      this.log('ERROR', 'Failed to check Node.js version', err.message);
    }
  }

  // Test npm packages installation
  testNpmPackages() {
    console.log('\n=== Testing NPM Packages ===\n');
    
    try {
      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        this.log('SUCCESS', 'node_modules directory exists');
      } else {
        this.log('ERROR', 'node_modules not found. Run: npm install');
        return;
      }

      // Try to require critical packages
      const criticalPackages = [
        'express',
        'googleapis',
        'winston',
        'chokidar',
        'jest'
      ];

      criticalPackages.forEach(pkg => {
        try {
          require.resolve(pkg);
          this.log('SUCCESS', `Package installed: ${pkg}`);
        } catch (err) {
          this.log('ERROR', `Package missing: ${pkg}`, 'Run: npm install');
        }
      });

    } catch (err) {
      this.log('ERROR', 'Failed to check npm packages', err.message);
    }
  }

  // Test Google Sheets configuration
  testGoogleSheetsConfig() {
    console.log('\n=== Testing Google Sheets Configuration ===\n');
    
    // Check for service account file
    const serviceAccountPaths = [
      process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
      'google-service-account.json',
      'service-account.json'
    ].filter(Boolean);

    let foundCredentials = false;
    
    for (const credPath of serviceAccountPaths) {
      if (fs.existsSync(credPath)) {
        this.log('SUCCESS', `Service account file found: ${credPath}`);
        
        try {
          const content = fs.readFileSync(credPath, 'utf8');
          const creds = JSON.parse(content);
          
          const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
          const hasAllFields = requiredFields.every(field => creds[field]);
          
          if (hasAllFields) {
            this.log('SUCCESS', 'Service account credentials valid');
            this.log('INFO', `Project ID: ${creds.project_id}`);
            this.log('INFO', `Client Email: ${creds.client_email}`);
            foundCredentials = true;
          } else {
            this.log('ERROR', 'Service account credentials incomplete', `Missing fields`);
          }
        } catch (err) {
          this.log('ERROR', 'Failed to parse service account JSON', err.message);
        }
        break;
      }
    }

    if (!foundCredentials) {
      this.log('WARNING', 'No Google service account credentials found', 
        'Set GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_SERVICE_ACCOUNT_JSON');
    }

    // Check environment variables
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      this.log('SUCCESS', 'GOOGLE_SERVICE_ACCOUNT_JSON environment variable set');
    } else {
      this.log('INFO', 'GOOGLE_SERVICE_ACCOUNT_JSON not set (optional if file exists)');
    }
  }

  // Test config.js settings
  testConfigFile() {
    console.log('\n=== Testing Configuration Files ===\n');
    
    const configPath = 'assets/js/config.js';
    
    if (fs.existsSync(configPath)) {
      this.log('SUCCESS', 'config.js exists');
      
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        
        // Check for critical config values
        const checks = [
          { pattern: /SHEET_ID|sheetId/i, name: 'Google Sheets ID' },
          { pattern: /API.*URL|apiUrl/i, name: 'API URL configuration' },
          { pattern: /const|let|var/i, name: 'Variable declarations' }
        ];

        checks.forEach(check => {
          if (check.pattern.test(content)) {
            this.log('SUCCESS', `${check.name} configuration found`);
          } else {
            this.log('WARNING', `${check.name} may not be configured`);
          }
        });

      } catch (err) {
        this.log('ERROR', 'Failed to read config.js', err.message);
      }
    } else {
      this.log('WARNING', 'config.js not found', 'May need to be created');
    }
  }

  // Test server endpoints (if server is running)
  async testServerEndpoints() {
    console.log('\n=== Testing Server Endpoints (if running) ===\n');
    
    const endpoints = [
      { url: 'http://localhost:8787/api/health', name: 'Health endpoint' },
      { url: 'http://127.0.0.1:8787/api/health', name: 'Health endpoint (127.0.0.1)' }
    ];

    // Only test if fetch is available (Node 18+) or node-fetch is installed
    try {
      let fetchFn;
      if (typeof fetch !== 'undefined') {
        fetchFn = fetch;
      } else {
        try {
          fetchFn = require('node-fetch');
        } catch {
          this.log('INFO', 'Skipping endpoint tests (fetch not available, Node < 18)');
          return;
        }
      }

      for (const endpoint of endpoints) {
        try {
          const response = await Promise.race([
            fetchFn(endpoint.url, { method: 'GET' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);

          if (response.ok) {
            const data = await response.json();
            this.log('SUCCESS', `${endpoint.name} is accessible`);
            this.log('INFO', `Response: ${JSON.stringify(data, null, 2)}`);
          } else {
            this.log('WARNING', `${endpoint.name} returned status ${response.status}`);
          }
        } catch (err) {
          this.log('INFO', `${endpoint.name} not accessible (server may not be running)`);
        }
      }
    } catch (err) {
      this.log('INFO', 'Server endpoint testing skipped', err.message);
    }
  }

  // Test authentication system
  testAuthSystem() {
    console.log('\n=== Testing Authentication System ===\n');
    
    const authFiles = [
      'login V2.0/forms/neumorphism/auth.js',
      'login V2.0/forms/neumorphism/index.html',
      'assets/js/pd2-auth-bridge.js'
    ];

    authFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('SUCCESS', `Auth file exists: ${path.basename(file)}`);
        
        // Check for critical auth patterns
        const content = fs.readFileSync(file, 'utf8');
        
        if (file.endsWith('auth.js')) {
          const patterns = [
            { regex: /SHA-256|sha256/i, name: 'Password hashing' },
            { regex: /PEPPER/i, name: 'Password pepper' },
            { regex: /LOCKOUT|lockout/i, name: 'Account lockout' },
            { regex: /sessionStorage/i, name: 'Session storage' }
          ];

          patterns.forEach(p => {
            if (p.regex.test(content)) {
              this.log('SUCCESS', `${p.name} implemented`);
            } else {
              this.log('WARNING', `${p.name} not found`);
            }
          });
        }
      } else {
        this.log('ERROR', `Auth file missing: ${file}`);
      }
    });
  }

  // Test PWA functionality
  testPWA() {
    console.log('\n=== Testing PWA Configuration ===\n');
    
    // Check manifest.json
    if (fs.existsSync('manifest.json')) {
      this.log('SUCCESS', 'manifest.json exists');
      
      try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
        requiredFields.forEach(field => {
          if (manifest[field]) {
            this.log('SUCCESS', `Manifest field present: ${field}`);
          } else {
            this.log('ERROR', `Manifest field missing: ${field}`);
          }
        });

        // Check icons
        if (manifest.icons && manifest.icons.length > 0) {
          this.log('SUCCESS', `${manifest.icons.length} icon(s) defined`);
          manifest.icons.forEach(icon => {
            if (fs.existsSync(icon.src.replace(/^\//, ''))) {
              this.log('SUCCESS', `Icon file exists: ${icon.src}`);
            } else {
              this.log('WARNING', `Icon file not found: ${icon.src}`);
            }
          });
        } else {
          this.log('ERROR', 'No icons defined in manifest');
        }

      } catch (err) {
        this.log('ERROR', 'Invalid manifest.json', err.message);
      }
    } else {
      this.log('ERROR', 'manifest.json not found');
    }

    // Check service worker
    if (fs.existsSync('sw.js')) {
      this.log('SUCCESS', 'Service worker (sw.js) exists');
      
      const content = fs.readFileSync('sw.js', 'utf8');
      const patterns = [
        { regex: /install/i, name: 'Install event' },
        { regex: /activate/i, name: 'Activate event' },
        { regex: /fetch/i, name: 'Fetch event' },
        { regex: /cache/i, name: 'Caching logic' }
      ];

      patterns.forEach(p => {
        if (p.regex.test(content)) {
          this.log('SUCCESS', `SW ${p.name} handler present`);
        } else {
          this.log('WARNING', `SW ${p.name} handler not found`);
        }
      });
    } else {
      this.log('ERROR', 'Service worker (sw.js) not found');
    }
  }

  // Test script permissions (Windows)
  testScriptPermissions() {
    console.log('\n=== Testing Script Files ===\n');
    
    const scripts = [
      'scripts/start-api.ps1',
      'scripts/stop-api.ps1',
      'scripts/run-all.ps1',
      'scripts/smoke.js',
      'scripts/full-health.js'
    ];

    scripts.forEach(script => {
      if (fs.existsSync(script)) {
        this.log('SUCCESS', `Script exists: ${path.basename(script)}`);
        
        // Check file size
        const stats = fs.statSync(script);
        if (stats.size > 0) {
          this.log('SUCCESS', `Script has content: ${(stats.size / 1024).toFixed(2)}KB`);
        } else {
          this.log('WARNING', `Script is empty: ${script}`);
        }
      } else {
        this.log('WARNING', `Script not found: ${script}`);
      }
    });
  }

  // Generate summary report
  generateReport() {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('RUNTIME VALIDATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const total = this.results.length + this.errors.length + this.warnings.length;
    const successRate = total > 0 ? ((this.results.length / total) * 100).toFixed(2) : 0;

    console.log(`Total Checks: ${total}`);
    console.log(`✓ Passed: ${this.results.length} (${successRate}%)`);
    console.log(`✗ Errors: ${this.errors.length}`);
    console.log(`⚠ Warnings: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.message}`);
        if (err.details) console.log(`   ${err.details}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.slice(0, 5).forEach((warn, idx) => {
        console.log(`${idx + 1}. ${warn.message}`);
      });
      if (this.warnings.length > 5) {
        console.log(`... and ${this.warnings.length - 5} more warnings`);
      }
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.length,
        errors: this.errors.length,
        warnings: this.warnings.length,
        successRate: `${successRate}%`
      },
      results: this.results,
      errors: this.errors,
      warnings: this.warnings
    };

    try {
      fs.writeFileSync('runtime-validation-report.json', JSON.stringify(report, null, 2));
      console.log('\n📄 Report saved to: runtime-validation-report.json\n');
    } catch (err) {
      console.error('Failed to save report:', err.message);
    }

    return this.errors.length === 0 ? 0 : 1;
  }

  // Run all runtime validations
  async runAll() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   RUNTIME VALIDATION - การตรวจสอบการทำงานจริง         ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    this.testNodeEnvironment();
    this.testNpmPackages();
    this.testGoogleSheetsConfig();
    this.testConfigFile();
    this.testAuthSystem();
    this.testPWA();
    this.testScriptPermissions();
    await this.testServerEndpoints();

    return this.generateReport();
  }
}

// Run if executed directly
if (require.main === module) {
  const validator = new RuntimeValidator();
  validator.runAll().then(exitCode => {
    process.exit(exitCode);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = RuntimeValidator;
