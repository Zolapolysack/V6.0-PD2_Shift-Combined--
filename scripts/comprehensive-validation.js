/**
 * PD2 Comprehensive System Validation
 * ตรวจสอบระบบทั้งหมดอย่างละเอียด - ครอบคลุมทุกไฟล์และการทำงาน
 * 
 * หมวดหมู่การตรวจสอบ:
 * 1. File Structure & Integrity (โครงสร้างไฟล์)
 * 2. Dependencies & Configuration (การตั้งค่าและ Dependencies)
 * 3. Frontend Components (ส่วนหน้าบ้าน)
 * 4. Backend Services (ส่วนหลังบ้าน)
 * 5. Authentication System (ระบบ Authentication)
 * 6. PWA & Service Worker (PWA และ Service Worker)
 * 7. Security & Best Practices (ความปลอดภัย)
 * 8. Performance & Optimization (ประสิทธิภาพ)
 */

const fs = require('fs');
const path = require('path');

class SystemValidator {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      info: []
    };
    this.stats = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningCount: 0
    };
  }

  log(type, category, message, details = null) {
    const entry = {
      type,
      category,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.stats.totalChecks++;
    
    switch(type) {
      case 'PASS':
        this.results.passed.push(entry);
        this.stats.passedChecks++;
        console.log(`✓ [${category}] ${message}`);
        break;
      case 'FAIL':
        this.results.failed.push(entry);
        this.stats.failedChecks++;
        console.error(`✗ [${category}] ${message}`);
        if (details) console.error(`  Details: ${JSON.stringify(details, null, 2)}`);
        break;
      case 'WARN':
        this.results.warnings.push(entry);
        this.stats.warningCount++;
        console.warn(`⚠ [${category}] ${message}`);
        if (details) console.warn(`  Details: ${JSON.stringify(details, null, 2)}`);
        break;
      case 'INFO':
        this.results.info.push(entry);
        console.info(`ℹ [${category}] ${message}`);
        break;
    }
  }

  fileExists(filePath, category = 'FILE') {
    const exists = fs.existsSync(filePath);
    if (exists) {
      this.log('PASS', category, `File exists: ${filePath}`);
    } else {
      this.log('FAIL', category, `File missing: ${filePath}`);
    }
    return exists;
  }

  checkFileContent(filePath, checks, category = 'CONTENT') {
    if (!this.fileExists(filePath, category)) return false;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let allPassed = true;

      checks.forEach(check => {
        const { pattern, description, required = true } = check;
        const found = typeof pattern === 'string' 
          ? content.includes(pattern)
          : pattern.test(content);

        if (found) {
          this.log('PASS', category, `${description} - Found in ${path.basename(filePath)}`);
        } else {
          if (required) {
            this.log('FAIL', category, `${description} - Missing in ${path.basename(filePath)}`);
            allPassed = false;
          } else {
            this.log('WARN', category, `${description} - Not found in ${path.basename(filePath)} (optional)`);
          }
        }
      });

      return allPassed;
    } catch (err) {
      this.log('FAIL', category, `Error reading ${filePath}`, err.message);
      return false;
    }
  }

  checkJSON(filePath, category = 'JSON') {
    if (!this.fileExists(filePath, category)) return null;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      this.log('PASS', category, `Valid JSON: ${path.basename(filePath)}`);
      return parsed;
    } catch (err) {
      this.log('FAIL', category, `Invalid JSON in ${path.basename(filePath)}`, err.message);
      return null;
    }
  }

  // ==================== 1. FILE STRUCTURE & INTEGRITY ====================
  
  validateFileStructure() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('1. FILE STRUCTURE & INTEGRITY VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    const criticalFiles = [
      'index.html',
      'package.json',
      'manifest.json',
      'sw.js',
      'pd2-notify.js',
      'README.md',
      'server/index.js',
      'server/package.json',
      'server/routes/sheets.js',
      'assets/js/pd2-auth-bridge.js',
      'assets/js/config.js',
      'login V2.0/forms/neumorphism/index.html',
      'login V2.0/forms/neumorphism/auth.js',
      'login V2.0/forms/neumorphism/script.js'
    ];

    criticalFiles.forEach(file => this.fileExists(file, 'STRUCTURE'));

    // Check for important directories
    const dirs = ['server', 'assets', 'scripts', 'login V2.0', '__tests__', 'dev'];
    dirs.forEach(dir => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        this.log('PASS', 'STRUCTURE', `Directory exists: ${dir}`);
      } else {
        this.log('FAIL', 'STRUCTURE', `Directory missing: ${dir}`);
      }
    });
  }

  // ==================== 2. DEPENDENCIES & CONFIGURATION ====================
  
  validateDependencies() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('2. DEPENDENCIES & CONFIGURATION VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check root package.json
    const rootPkg = this.checkJSON('package.json', 'DEPENDENCIES');
    if (rootPkg) {
      const requiredDeps = ['googleapis', 'winston', 'winston-daily-rotate-file'];
      const requiredDevDeps = ['chokidar', 'jest', 'jsdom', 'http-server', 'ws', 'jimp'];
      
      requiredDeps.forEach(dep => {
        if (rootPkg.dependencies && rootPkg.dependencies[dep]) {
          this.log('PASS', 'DEPENDENCIES', `Required dependency present: ${dep}`);
        } else {
          this.log('FAIL', 'DEPENDENCIES', `Missing dependency: ${dep}`);
        }
      });

      requiredDevDeps.forEach(dep => {
        if (rootPkg.devDependencies && rootPkg.devDependencies[dep]) {
          this.log('PASS', 'DEPENDENCIES', `Required devDependency present: ${dep}`);
        } else {
          this.log('WARN', 'DEPENDENCIES', `Missing devDependency: ${dep}`);
        }
      });

      // Check scripts
      const requiredScripts = ['start', 'start:api', 'test', 'smoke'];
      requiredScripts.forEach(script => {
        if (rootPkg.scripts && rootPkg.scripts[script]) {
          this.log('PASS', 'DEPENDENCIES', `Script defined: ${script}`);
        } else {
          this.log('FAIL', 'DEPENDENCIES', `Missing script: ${script}`);
        }
      });
    }

    // Check server package.json
    const serverPkg = this.checkJSON('server/package.json', 'DEPENDENCIES');
    if (serverPkg) {
      const serverDeps = ['express', 'googleapis', 'cors', 'helmet', 'dotenv'];
      serverDeps.forEach(dep => {
        if (serverPkg.dependencies && serverPkg.dependencies[dep]) {
          this.log('PASS', 'DEPENDENCIES', `Server dependency present: ${dep}`);
        } else {
          this.log('FAIL', 'DEPENDENCIES', `Missing server dependency: ${dep}`);
        }
      });
    }

    // Check manifest.json
    const manifest = this.checkJSON('manifest.json', 'CONFIG');
    if (manifest) {
      const manifestFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
      manifestFields.forEach(field => {
        if (manifest[field]) {
          this.log('PASS', 'CONFIG', `Manifest field present: ${field}`);
        } else {
          this.log('FAIL', 'CONFIG', `Missing manifest field: ${field}`);
        }
      });
    }
  }

  // ==================== 3. FRONTEND COMPONENTS ====================
  
  validateFrontend() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('3. FRONTEND COMPONENTS VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check index.html
    this.checkFileContent('index.html', [
      { pattern: '<!DOCTYPE html>', description: 'Valid HTML5 doctype' },
      { pattern: 'lang="th"', description: 'Thai language set' },
      { pattern: 'manifest.json', description: 'PWA manifest linked' },
      { pattern: 'pd2-notify.js', description: 'Notification module loaded' },
      { pattern: 'pd2-auth-bridge.js', description: 'Auth bridge loaded' },
      { pattern: 'sw.js', description: 'Service worker referenced' },
      { pattern: /viewport/, description: 'Viewport meta tag' },
      { pattern: /charset/, description: 'Character encoding set' }
    ], 'FRONTEND');

    // Check pd2-notify.js
    this.checkFileContent('pd2-notify.js', [
      { pattern: 'window.PD2Notify', description: 'PD2Notify global function defined' },
      { pattern: 'PD2NotifyState', description: 'State management present' },
      { pattern: 'ensureContainer', description: 'Container creation logic' },
      { pattern: /dedupe/i, description: 'Deduplication mechanism' }
    ], 'FRONTEND');

    // Check auth bridge
    this.checkFileContent('assets/js/pd2-auth-bridge.js', [
      { pattern: 'pd2-auth-overlay', description: 'Auth overlay ID defined' },
      { pattern: 'neuroAuth', description: 'Session storage key used' },
      { pattern: 'sessionStorage', description: 'Session storage usage' },
      { pattern: /postMessage|iframe/i, description: 'Cross-frame communication' }
    ], 'FRONTEND');

    // Check config file
    if (this.fileExists('assets/js/config.js', 'FRONTEND')) {
      this.checkFileContent('assets/js/config.js', [
        { pattern: /SHEET_ID|sheetId/i, description: 'Google Sheets configuration' },
        { pattern: /API|api/i, description: 'API configuration' }
      ], 'FRONTEND');
    }
  }

  // ==================== 4. BACKEND SERVICES ====================
  
  validateBackend() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('4. BACKEND SERVICES VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check server/index.js
    this.checkFileContent('server/index.js', [
      { pattern: 'express', description: 'Express framework imported' },
      { pattern: 'helmet', description: 'Helmet security middleware' },
      { pattern: 'cors', description: 'CORS middleware' },
      { pattern: /PORT.*process\.env/i, description: 'Port configuration from env' },
      { pattern: '/api/health', description: 'Health endpoint defined' },
      { pattern: 'rateLimit', description: 'Rate limiting implemented' },
      { pattern: 'ALLOW_ORIGINS', description: 'CORS origin whitelist' }
    ], 'BACKEND');

    // Check sheets router
    this.checkFileContent('server/routes/sheets.js', [
      { pattern: 'googleapis', description: 'Google APIs imported' },
      { pattern: 'loadCredentials', description: 'Credentials loading function' },
      { pattern: '/read', description: 'Read endpoint defined' },
      { pattern: '/append', description: 'Append endpoint defined' },
      { pattern: 'GOOGLE_SERVICE_ACCOUNT', description: 'Service account env var check' },
      { pattern: /sheetId.*range/i, description: 'Sheet parameters validation' }
    ], 'BACKEND');

    // Check logger
    if (this.fileExists('server/logger.js', 'BACKEND')) {
      this.checkFileContent('server/logger.js', [
        { pattern: 'winston', description: 'Winston logger imported' },
        { pattern: /DailyRotateFile|daily-rotate/i, description: 'Log rotation configured' }
      ], 'BACKEND');
    }

    // Check ecosystem config
    if (this.fileExists('ecosystem.config.js', 'BACKEND')) {
      this.checkFileContent('ecosystem.config.js', [
        { pattern: /apps|module\.exports/i, description: 'PM2 config structure' },
        { pattern: 'server/index.js', description: 'Server entry point specified' }
      ], 'BACKEND');
    }
  }

  // ==================== 5. AUTHENTICATION SYSTEM ====================
  
  validateAuthentication() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('5. AUTHENTICATION SYSTEM VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check auth.js
    this.checkFileContent('login V2.0/forms/neumorphism/auth.js', [
      { pattern: 'authenticate', description: 'Authenticate function defined' },
      { pattern: /SHA-256|sha256/i, description: 'SHA-256 hashing used' },
      { pattern: 'PEPPER', description: 'Password pepper defined' },
      { pattern: 'MAX_ATTEMPTS', description: 'Rate limiting (max attempts)' },
      { pattern: 'LOCKOUT', description: 'Account lockout mechanism' },
      { pattern: 'SESSION_TTL', description: 'Session timeout configured' },
      { pattern: 'neuroAuth', description: 'Session storage key' },
      { pattern: /crypto\.subtle/i, description: 'Web Crypto API usage' }
    ], 'AUTH');

    // Check login page
    this.checkFileContent('login V2.0/forms/neumorphism/index.html', [
      { pattern: 'auth.js', description: 'Auth module loaded' },
      { pattern: /form.*login|input.*password/i, description: 'Login form present' },
      { pattern: 'script.js', description: 'Form handler script' }
    ], 'AUTH');

    // Check script.js
    if (this.fileExists('login V2.0/forms/neumorphism/script.js', 'AUTH')) {
      this.checkFileContent('login V2.0/forms/neumorphism/script.js', [
        { pattern: /addEventListener.*submit/i, description: 'Form submit handler' },
        { pattern: /PD2NeuroAuth|authenticate/i, description: 'Auth integration' },
        { pattern: /preventDefault/i, description: 'Default form action prevented' }
      ], 'AUTH');
    }

    // Check auth bridge integration
    this.checkFileContent('assets/js/pd2-auth-bridge.js', [
      { pattern: 'mountLoginGate', description: 'Login gate mount function' },
      { pattern: 'isAuthed', description: 'Auth status check function' },
      { pattern: 'getSession', description: 'Session retrieval function' }
    ], 'AUTH');
  }

  // ==================== 6. PWA & SERVICE WORKER ====================
  
  validatePWA() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('6. PWA & SERVICE WORKER VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check service worker
    this.checkFileContent('sw.js', [
      { pattern: 'CACHE_NAME', description: 'Cache name defined' },
      { pattern: 'FILES_TO_CACHE', description: 'Cache file list defined' },
      { pattern: /addEventListener.*install/i, description: 'Install event handler' },
      { pattern: /addEventListener.*activate/i, description: 'Activate event handler' },
      { pattern: /addEventListener.*fetch/i, description: 'Fetch event handler' },
      { pattern: /caches\.open/i, description: 'Cache opening logic' },
      { pattern: /caches\.match/i, description: 'Cache matching logic' },
      { pattern: 'skipWaiting', description: 'Skip waiting implemented' }
    ], 'PWA');

    // Check manifest
    const manifest = this.checkJSON('manifest.json', 'PWA');
    if (manifest) {
      if (manifest.icons && Array.isArray(manifest.icons) && manifest.icons.length > 0) {
        this.log('PASS', 'PWA', 'Icons defined in manifest');
        manifest.icons.forEach(icon => {
          if (icon.src && icon.sizes && icon.type) {
            this.log('PASS', 'PWA', `Icon configured: ${icon.sizes} (${icon.type})`);
          } else {
            this.log('WARN', 'PWA', `Incomplete icon definition`, icon);
          }
        });
      } else {
        this.log('FAIL', 'PWA', 'No icons defined in manifest');
      }

      if (manifest.display) {
        this.log('PASS', 'PWA', `Display mode: ${manifest.display}`);
      } else {
        this.log('WARN', 'PWA', 'Display mode not specified');
      }
    }

    // Check SW registration in HTML
    this.checkFileContent('index.html', [
      { pattern: /navigator\.serviceWorker/i, description: 'Service worker registration code' }
    ], 'PWA');
  }

  // ==================== 7. SECURITY & BEST PRACTICES ====================
  
  validateSecurity() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('7. SECURITY & BEST PRACTICES VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check server security
    this.checkFileContent('server/index.js', [
      { pattern: 'helmet', description: 'Helmet security headers' },
      { pattern: /contentSecurityPolicy|CSP/i, description: 'CSP configured' },
      { pattern: 'rateLimit', description: 'Rate limiting' },
      { pattern: /cors.*origin/i, description: 'CORS origin validation' },
      { pattern: /x-powered-by.*disable/i, description: 'X-Powered-By header disabled' }
    ], 'SECURITY');

    // Check for sensitive data exposure
    const sensitiveFiles = ['server/index.js', 'server/routes/sheets.js'];
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const issues = [];

        // Check for hardcoded secrets (patterns that might indicate secrets)
        if (/password\s*[:=]\s*["'][^"']+["']/i.test(content)) {
          issues.push('Potential hardcoded password');
        }
        if (/api[_-]?key\s*[:=]\s*["'][^"']+["']/i.test(content) && !/process\.env/i.test(content)) {
          issues.push('Potential hardcoded API key');
        }

        if (issues.length > 0) {
          this.log('FAIL', 'SECURITY', `Sensitive data in ${path.basename(file)}`, issues);
        } else {
          this.log('PASS', 'SECURITY', `No obvious sensitive data in ${path.basename(file)}`);
        }

        // Check for proper env var usage
        if (/process\.env/i.test(content)) {
          this.log('PASS', 'SECURITY', `Environment variables used in ${path.basename(file)}`);
        } else {
          this.log('WARN', 'SECURITY', `No environment variables in ${path.basename(file)}`);
        }
      }
    });

    // Check auth security
    this.checkFileContent('login V2.0/forms/neumorphism/auth.js', [
      { pattern: /crypto\.subtle|Web Crypto/i, description: 'Secure crypto API used' },
      { pattern: /LOCKOUT|lockout/i, description: 'Brute force protection' }
    ], 'SECURITY');

    // Check for HTTPS references
    this.checkFileContent('index.html', [
      { pattern: /https:\/\//i, description: 'HTTPS used for external resources' }
    ], 'SECURITY');
  }

  // ==================== 8. PERFORMANCE & OPTIMIZATION ====================
  
  validatePerformance() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('8. PERFORMANCE & OPTIMIZATION VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check HTML performance optimizations
    this.checkFileContent('index.html', [
      { pattern: /defer|async/i, description: 'Script loading optimization (defer/async)' },
      { pattern: 'preconnect', description: 'DNS preconnect for external resources', required: false },
      { pattern: 'preload', description: 'Resource preloading', required: false },
      { pattern: /loading="lazy"/i, description: 'Lazy loading images', required: false }
    ], 'PERFORMANCE');

    // Check notification deduplication
    this.checkFileContent('pd2-notify.js', [
      { pattern: /dedupe/i, description: 'Notification deduplication' },
      { pattern: /maxVisible|limit/i, description: 'Max visible notifications limit' }
    ], 'PERFORMANCE');

    // Check for console.log in production files
    const productionFiles = ['pd2-notify.js', 'assets/js/pd2-auth-bridge.js', 'assets/js/config.js'];
    productionFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const consoleCount = (content.match(/console\.(log|debug|warn|error)/g) || []).length;
        if (consoleCount > 5) {
          this.log('WARN', 'PERFORMANCE', `Many console statements in ${path.basename(file)} (${consoleCount})`);
        } else {
          this.log('PASS', 'PERFORMANCE', `Reasonable console usage in ${path.basename(file)}`);
        }
      }
    });

    // Check file sizes
    const checkFileSize = (file, maxSizeKB) => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = stats.size / 1024;
        if (sizeKB > maxSizeKB) {
          this.log('WARN', 'PERFORMANCE', `${path.basename(file)} is large: ${sizeKB.toFixed(2)}KB (max: ${maxSizeKB}KB)`);
        } else {
          this.log('PASS', 'PERFORMANCE', `${path.basename(file)} size OK: ${sizeKB.toFixed(2)}KB`);
        }
      }
    };

    checkFileSize('index.html', 100);
    checkFileSize('sw.js', 20);
    checkFileSize('pd2-notify.js', 50);
  }

  // ==================== 9. TESTING & SCRIPTS ====================
  
  validateTestsAndScripts() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('9. TESTING & SCRIPTS VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check test files
    const testFiles = ['__tests__/pd2-notify.test.js'];
    testFiles.forEach(file => {
      if (this.fileExists(file, 'TESTING')) {
        this.checkFileContent(file, [
          { pattern: /describe|test|it/i, description: 'Test structure (describe/test/it)' },
          { pattern: /expect/i, description: 'Assertions present' }
        ], 'TESTING');
      }
    });

    // Check script files
    const scripts = [
      'scripts/smoke.js',
      'scripts/full-health.js',
      'scripts/healthcheck.js',
      'scripts/start-api.ps1',
      'scripts/stop-api.ps1',
      'scripts/run-all.ps1'
    ];

    scripts.forEach(script => {
      if (this.fileExists(script, 'SCRIPTS')) {
        this.log('PASS', 'SCRIPTS', `Script available: ${path.basename(script)}`);
      } else {
        this.log('WARN', 'SCRIPTS', `Script missing: ${path.basename(script)}`);
      }
    });

    // Check dev tools
    if (this.fileExists('dev/watch-and-reload.js', 'SCRIPTS')) {
      this.checkFileContent('dev/watch-and-reload.js', [
        { pattern: 'chokidar', description: 'File watcher (chokidar)' },
        { pattern: /WebSocket|ws/i, description: 'WebSocket for hot reload' }
      ], 'SCRIPTS');
    }
  }

  // ==================== 10. DOCUMENTATION ====================
  
  validateDocumentation() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('10. DOCUMENTATION VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');

    const docs = [
      'README.md',
      'SECURITY.md',
      'docs/ARCHITECTURE.md',
      'docs/RUNBOOK.md',
      'server/README.md',
      'login V2.0/README.md'
    ];

    docs.forEach(doc => {
      if (this.fileExists(doc, 'DOCUMENTATION')) {
        const content = fs.readFileSync(doc, 'utf8');
        const hasHeadings = /^#+\s/m.test(content);
        const hasContent = content.length > 100;

        if (hasHeadings && hasContent) {
          this.log('PASS', 'DOCUMENTATION', `${path.basename(doc)} has structure and content`);
        } else {
          this.log('WARN', 'DOCUMENTATION', `${path.basename(doc)} may be incomplete`);
        }
      }
    });
  }

  // ==================== REPORT GENERATION ====================
  
  generateReport() {
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('VALIDATION REPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const successRate = ((this.stats.passedChecks / this.stats.totalChecks) * 100).toFixed(2);
    const failureRate = ((this.stats.failedChecks / this.stats.totalChecks) * 100).toFixed(2);
    
    console.log(`Total Checks: ${this.stats.totalChecks}`);
    console.log(`✓ Passed: ${this.stats.passedChecks} (${successRate}%)`);
    console.log(`✗ Failed: ${this.stats.failedChecks} (${failureRate}%)`);
    console.log(`⚠ Warnings: ${this.stats.warningCount}`);
    console.log(`ℹ Info: ${this.results.info.length}\n`);

    if (this.stats.failedChecks > 0) {
      console.log('\n❌ CRITICAL ISSUES (Must Fix):');
      console.log('═══════════════════════════════════════════════════════');
      this.results.failed.forEach((fail, idx) => {
        console.log(`\n${idx + 1}. [${fail.category}] ${fail.message}`);
        if (fail.details) {
          console.log(`   Details: ${JSON.stringify(fail.details, null, 2)}`);
        }
      });
    }

    if (this.stats.warningCount > 0) {
      console.log('\n\n⚠️  WARNINGS (Should Review):');
      console.log('═══════════════════════════════════════════════════════');
      this.results.warnings.slice(0, 10).forEach((warn, idx) => {
        console.log(`\n${idx + 1}. [${warn.category}] ${warn.message}`);
      });
      if (this.results.warnings.length > 10) {
        console.log(`\n... and ${this.results.warnings.length - 10} more warnings`);
      }
    }

    // Save detailed report to file
    const reportPath = path.join(process.cwd(), 'validation-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.results,
      summary: {
        status: this.stats.failedChecks === 0 ? 'PASSED' : 'FAILED',
        successRate: `${successRate}%`,
        criticalIssues: this.stats.failedChecks,
        warnings: this.stats.warningCount
      }
    };

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n\n📄 Detailed report saved to: ${reportPath}`);
    } catch (err) {
      console.error(`\n\n❌ Failed to save report: ${err.message}`);
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    // Return exit code based on results
    return this.stats.failedChecks === 0 ? 0 : 1;
  }

  // ==================== MAIN VALIDATION RUNNER ====================
  
  async runAllValidations() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   PD2 COMPREHENSIVE SYSTEM VALIDATION                 ║');
    console.log('║   ระบบตรวจสอบการทำงานทั้งหมดอย่างละเอียด           ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');

    try {
      // Run all validation categories
      this.validateFileStructure();
      this.validateDependencies();
      this.validateFrontend();
      this.validateBackend();
      this.validateAuthentication();
      this.validatePWA();
      this.validateSecurity();
      this.validatePerformance();
      this.validateTestsAndScripts();
      this.validateDocumentation();

      // Generate final report
      const exitCode = this.generateReport();

      if (exitCode === 0) {
        console.log('✅ System validation completed successfully!');
        console.log('ระบบผ่านการตรวจสอบทั้งหมด พร้อมใช้งาน!\n');
      } else {
        console.log('❌ System validation found issues that need attention.');
        console.log('พบปัญหาที่ต้องแก้ไขก่อนใช้งาน กรุณาตรวจสอบรายละเอียดด้านบน\n');
      }

      return exitCode;
    } catch (err) {
      console.error('\n❌ Validation failed with error:', err);
      return 1;
    }
  }
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new SystemValidator();
  validator.runAllValidations().then(exitCode => {
    process.exit(exitCode);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = SystemValidator;
