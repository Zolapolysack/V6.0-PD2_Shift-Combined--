/**
 * Master Validation Script - รันการตรวจสอบทั้งหมด
 * ตรวจสอบระบบอย่างครอบคลุมทุกด้าน
 */

const fs = require('fs');
const path = require('path');

// Import validators
const SystemValidator = require('./comprehensive-validation');
const RuntimeValidator = require('./runtime-validation');

class MasterValidator {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      system: null,
      runtime: null
    };
  }

  async runAllValidations() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                   ║');
    console.log('║        PD2 MASTER VALIDATION SYSTEM                               ║');
    console.log('║        ระบบตรวจสอบความถูกต้องครอบคลุมทั้งหมด                    ║');
    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Starting comprehensive system validation...');
    console.log(`Time: ${new Date().toLocaleString('th-TH')}\n`);

    let exitCode = 0;

    // Phase 1: System Structure Validation
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 1: SYSTEM STRUCTURE VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const systemValidator = new SystemValidator();
      const systemExitCode = await systemValidator.runAllValidations();
      this.results.system = {
        exitCode: systemExitCode,
        stats: systemValidator.stats,
        passed: systemValidator.results.passed.length,
        failed: systemValidator.results.failed.length,
        warnings: systemValidator.results.warnings.length
      };
      
      if (systemExitCode !== 0) exitCode = 1;
    } catch (err) {
      console.error('System validation failed:', err);
      exitCode = 1;
    }

    // Phase 2: Runtime Validation
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 2: RUNTIME VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const runtimeValidator = new RuntimeValidator();
      const runtimeExitCode = await runtimeValidator.runAll();
      this.results.runtime = {
        exitCode: runtimeExitCode,
        passed: runtimeValidator.results.length,
        errors: runtimeValidator.errors.length,
        warnings: runtimeValidator.warnings.length
      };
      
      if (runtimeExitCode !== 0) exitCode = 1;
    } catch (err) {
      console.error('Runtime validation failed:', err);
      exitCode = 1;
    }

    // Generate final summary
    this.generateFinalSummary(exitCode);

    return exitCode;
  }

  generateFinalSummary(exitCode) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                   ║');
    console.log('║                    FINAL VALIDATION REPORT                        ║');
    console.log('║                    รายงานผลการตรวจสอบสุดท้าย                     ║');
    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');

    // System Validation Results
    if (this.results.system) {
      console.log('📋 SYSTEM STRUCTURE VALIDATION:');
      console.log('   ─────────────────────────────────────────');
      console.log(`   ✓ Passed:   ${this.results.system.passed}`);
      console.log(`   ✗ Failed:   ${this.results.system.failed}`);
      console.log(`   ⚠ Warnings: ${this.results.system.warnings}`);
      console.log(`   Status:     ${this.results.system.exitCode === 0 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');
    }

    // Runtime Validation Results
    if (this.results.runtime) {
      console.log('🔧 RUNTIME VALIDATION:');
      console.log('   ─────────────────────────────────────────');
      console.log(`   ✓ Passed:   ${this.results.runtime.passed}`);
      console.log(`   ✗ Errors:   ${this.results.runtime.errors}`);
      console.log(`   ⚠ Warnings: ${this.results.runtime.warnings}`);
      console.log(`   Status:     ${this.results.runtime.exitCode === 0 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');
    }

    // Overall Status
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    if (exitCode === 0) {
      console.log('   ✅ ✅ ✅  OVERALL STATUS: PASSED  ✅ ✅ ✅');
      console.log('');
      console.log('   ระบบผ่านการตรวจสอบทั้งหมด พร้อมใช้งาน!');
      console.log('   System validation completed successfully!');
    } else {
      console.log('   ❌ ❌ ❌  OVERALL STATUS: FAILED  ❌ ❌ ❌');
      console.log('');
      console.log('   พบปัญหาที่ต้องแก้ไข กรุณาตรวจสอบรายงานด้านบน');
      console.log('   Issues found. Please review the reports above.');
    }
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`⏱  Total validation time: ${elapsed} seconds`);
    console.log(`📁 Detailed reports saved in current directory`);
    console.log('');

    // Save master report
    const masterReport = {
      timestamp: new Date().toISOString(),
      duration: `${elapsed}s`,
      overallStatus: exitCode === 0 ? 'PASSED' : 'FAILED',
      results: this.results
    };

    try {
      fs.writeFileSync('master-validation-report.json', JSON.stringify(masterReport, null, 2));
      console.log('📄 Master report: master-validation-report.json');
    } catch (err) {
      console.error('Failed to save master report:', err.message);
    }

    // Generate recommendations
    this.generateRecommendations(exitCode);
  }

  generateRecommendations(exitCode) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                         RECOMMENDATIONS                           ║');
    console.log('║                         คำแนะนำ                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');

    if (exitCode === 0) {
      console.log('✅ Your system is ready for production!');
      console.log('');
      console.log('Recommended next steps:');
      console.log('  1. Review any warnings in the detailed reports');
      console.log('  2. Run smoke tests: npm run smoke');
      console.log('  3. Test in staging environment before production');
      console.log('  4. Set up monitoring and logging');
      console.log('  5. Configure backup strategies');
      console.log('');
    } else {
      console.log('⚠️  System has issues that need attention!');
      console.log('');
      console.log('Required actions:');
      console.log('  1. Review detailed reports:');
      console.log('     - validation-report.json (system structure)');
      console.log('     - runtime-validation-report.json (runtime checks)');
      console.log('  2. Fix all critical errors (marked with ✗)');
      console.log('  3. Review and address warnings');
      console.log('  4. Re-run validation after fixes');
      console.log('');
      console.log('Common fixes:');
      console.log('  • Missing dependencies: npm install');
      console.log('  • Missing files: check file structure');
      console.log('  • Configuration issues: review .env and config files');
      console.log('  • Permission issues: check file permissions');
      console.log('');
    }

    // Additional recommendations based on specific issues
    if (this.results.system && this.results.system.failed > 0) {
      console.log('📋 System Structure Issues:');
      console.log('   Check validation-report.json for specific file/structure problems');
      console.log('');
    }

    if (this.results.runtime && this.results.runtime.errors > 0) {
      console.log('🔧 Runtime Issues:');
      console.log('   Check runtime-validation-report.json for configuration problems');
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
  }
}

// Run validation
if (require.main === module) {
  const validator = new MasterValidator();
  
  validator.runAllValidations()
    .then(exitCode => {
      console.log(`\nValidation completed with exit code: ${exitCode}\n`);
      process.exit(exitCode);
    })
    .catch(err => {
      console.error('\n❌ Fatal error during validation:', err);
      console.error(err.stack);
      process.exit(1);
    });
}

module.exports = MasterValidator;
