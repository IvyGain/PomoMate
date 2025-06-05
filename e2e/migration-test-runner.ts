import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  category: string;
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  duration?: number;
}

interface MigrationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  recommendation: string;
}

class MigrationTestRunner {
  private results: TestResult[] = [];
  private issues: MigrationIssue[] = [];
  private startTime: number = Date.now();

  async runTests() {
    console.log('🚀 Starting Supabase Migration Validation Tests...\n');

    try {
      // Run the Playwright tests
      const { stdout, stderr } = await execAsync(
        'npx playwright test e2e/supabase-migration-validation.spec.ts --reporter=json',
      );

      // Parse test results
      if (stdout) {
        const jsonResults = JSON.parse(stdout);
        this.parsePlaywrightResults(jsonResults);
      }

      if (stderr && !stderr.includes('Warning')) {
        console.error('Test execution errors:', stderr);
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
      this.analyzeTestFailure(error);
    }

    // Analyze results and identify issues
    this.analyzeResults();

    // Generate report
    await this.generateReport();
  }

  private parsePlaywrightResults(results: any) {
    // Parse Playwright JSON reporter output
    results.suites?.forEach((suite: any) => {
      suite.tests?.forEach((test: any) => {
        this.results.push({
          category: suite.title,
          test: test.title,
          status: test.status as 'passed' | 'failed' | 'skipped',
          error: test.error?.message,
          duration: test.duration,
        });

        // Identify issues from failed tests
        if (test.status === 'failed') {
          this.identifyIssueFromFailure(suite.title, test.title, test.error);
        }
      });
    });
  }

  private analyzeTestFailure(error: any) {
    const errorStr = error.toString();
    
    // Common migration issues
    if (errorStr.includes('SUPABASE_URL') || errorStr.includes('SUPABASE_ANON_KEY')) {
      this.issues.push({
        severity: 'critical',
        category: 'Environment Configuration',
        issue: 'Supabase environment variables not properly configured',
        recommendation: 'Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env file',
      });
    }

    if (errorStr.includes('Cannot find module') || errorStr.includes('Module not found')) {
      this.issues.push({
        severity: 'critical',
        category: 'Dependencies',
        issue: 'Missing required dependencies',
        recommendation: 'Run "npm install" to install all dependencies',
      });
    }

    if (errorStr.includes('TypeScript') || errorStr.includes('Type error')) {
      this.issues.push({
        severity: 'high',
        category: 'TypeScript',
        issue: 'TypeScript compilation errors',
        recommendation: 'Fix TypeScript errors by running "npx tsc --noEmit" and addressing issues',
      });
    }
  }

  private identifyIssueFromFailure(category: string, test: string, error: any) {
    const errorMessage = error?.message || '';

    // Authentication issues
    if (category.includes('Authentication')) {
      if (errorMessage.includes('Invalid login credentials')) {
        this.issues.push({
          severity: 'high',
          category: 'Authentication',
          issue: 'Supabase authentication not properly configured',
          recommendation: 'Verify Supabase auth settings and ensure email auth is enabled',
        });
      }
      if (errorMessage.includes('Network request failed')) {
        this.issues.push({
          severity: 'critical',
          category: 'Network',
          issue: 'Cannot connect to Supabase backend',
          recommendation: 'Check Supabase URL configuration and network connectivity',
        });
      }
    }

    // Store/State issues
    if (category.includes('Data Persistence')) {
      if (errorMessage.includes('localStorage') || errorMessage.includes('AsyncStorage')) {
        this.issues.push({
          severity: 'medium',
          category: 'Storage',
          issue: 'Storage adapter issues after migration',
          recommendation: 'Ensure proper storage adapter is configured for the platform',
        });
      }
    }

    // UI/Component issues
    if (errorMessage.includes('Cannot read properties of undefined')) {
      this.issues.push({
        severity: 'high',
        category: 'Runtime',
        issue: 'Undefined property access - likely missing null checks',
        recommendation: 'Add proper null/undefined checks in components accessing Supabase data',
      });
    }
  }

  private analyzeResults() {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    // Add summary issues based on test results
    if (failed > totalTests * 0.5) {
      this.issues.push({
        severity: 'critical',
        category: 'Overall Health',
        issue: 'More than 50% of tests failing',
        recommendation: 'Major issues with migration - review Supabase setup and configuration',
      });
    }

    // Check specific test categories
    const authTests = this.results.filter(r => r.category.includes('Authentication'));
    const authFailures = authTests.filter(r => r.status === 'failed').length;
    
    if (authFailures > 0) {
      this.issues.push({
        severity: 'critical',
        category: 'Authentication',
        issue: `${authFailures} authentication tests failing`,
        recommendation: 'Priority fix: Ensure Supabase auth is properly initialized and configured',
      });
    }

    // Add common migration issues not caught by tests
    this.addCommonMigrationIssues();
  }

  private addCommonMigrationIssues() {
    // Common Supabase migration issues
    this.issues.push({
      severity: 'medium',
      category: 'Security',
      issue: 'Row Level Security (RLS) policies need verification',
      recommendation: 'Review and enable RLS policies for all tables in Supabase dashboard',
    });

    this.issues.push({
      severity: 'low',
      category: 'Performance',
      issue: 'Database indexes may need optimization',
      recommendation: 'Monitor query performance and add indexes for frequently queried columns',
    });

    this.issues.push({
      severity: 'medium',
      category: 'Real-time',
      issue: 'Real-time subscriptions need testing',
      recommendation: 'Test real-time features if app uses Supabase real-time subscriptions',
    });
  }

  private async generateReport() {
    const duration = Date.now() - this.startTime;
    const reportTime = new Date().toISOString();

    const report = `# Supabase Migration Validation Report

Generated: ${reportTime}
Duration: ${(duration / 1000).toFixed(2)}s

## Test Summary

Total Tests: ${this.results.length}
✅ Passed: ${this.results.filter(r => r.status === 'passed').length}
❌ Failed: ${this.results.filter(r => r.status === 'failed').length}
⏭️  Skipped: ${this.results.filter(r => r.status === 'skipped').length}

## Test Results by Category

${this.generateCategoryResults()}

## Issues Found

${this.generateIssuesList()}

## Recommendations

${this.generateRecommendations()}

## Next Steps

1. Address all critical issues first
2. Fix high severity issues
3. Test authentication flow manually
4. Verify data persistence
5. Check real-time features if applicable
6. Run performance tests under load
7. Review security settings in Supabase dashboard

## Manual Testing Checklist

- [ ] Login with existing user
- [ ] Register new user
- [ ] Reset password flow
- [ ] Timer start/stop/reset
- [ ] Data saves correctly
- [ ] Offline mode handling
- [ ] Session persistence
- [ ] Social login (if applicable)
- [ ] Push notifications (if applicable)

## Environment Checklist

- [ ] .env file contains EXPO_PUBLIC_SUPABASE_URL
- [ ] .env file contains EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] Supabase project is active
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Email templates configured
- [ ] Storage buckets configured (if used)
`;

    // Save report
    const reportPath = path.join(process.cwd(), 'migration-report.md');
    await fs.writeFile(reportPath, report);
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    console.log('\n' + report);
  }

  private generateCategoryResults(): string {
    const categories = [...new Set(this.results.map(r => r.category))];
    
    return categories.map(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.status === 'passed').length;
      const failed = categoryResults.filter(r => r.status === 'failed').length;
      
      const details = categoryResults
        .filter(r => r.status === 'failed')
        .map(r => `  - ❌ ${r.test}: ${r.error || 'Unknown error'}`)
        .join('\n');
      
      return `### ${category}
Passed: ${passed}/${categoryResults.length}
${details ? '\nFailures:\n' + details : ''}`;
    }).join('\n\n');
  }

  private generateIssuesList(): string {
    const groupedIssues = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low'),
    };

    let output = '';

    if (groupedIssues.critical.length > 0) {
      output += '### 🚨 Critical Issues\n\n';
      output += groupedIssues.critical.map(i => 
        `- **${i.category}**: ${i.issue}\n  - *Fix*: ${i.recommendation}`,
      ).join('\n\n') + '\n\n';
    }

    if (groupedIssues.high.length > 0) {
      output += '### ⚠️  High Priority Issues\n\n';
      output += groupedIssues.high.map(i => 
        `- **${i.category}**: ${i.issue}\n  - *Fix*: ${i.recommendation}`,
      ).join('\n\n') + '\n\n';
    }

    if (groupedIssues.medium.length > 0) {
      output += '### ⚡ Medium Priority Issues\n\n';
      output += groupedIssues.medium.map(i => 
        `- **${i.category}**: ${i.issue}\n  - *Fix*: ${i.recommendation}`,
      ).join('\n\n') + '\n\n';
    }

    if (groupedIssues.low.length > 0) {
      output += '### 💡 Low Priority Issues\n\n';
      output += groupedIssues.low.map(i => 
        `- **${i.category}**: ${i.issue}\n  - *Fix*: ${i.recommendation}`,
      ).join('\n\n') + '\n\n';
    }

    return output || 'No issues found! 🎉';
  }

  private generateRecommendations(): string {
    const recommendations = [
      '1. **Environment Setup**: Double-check all environment variables are correctly set',
      '2. **Database Schema**: Verify all tables and relationships match your app requirements',
      '3. **Authentication**: Test all auth flows including edge cases',
      '4. **Error Handling**: Implement proper error boundaries and fallbacks',
      '5. **Monitoring**: Set up error tracking (Sentry) and analytics',
      '6. **Performance**: Use React.memo and useMemo for expensive operations',
      '7. **Security**: Enable RLS and review all security policies',
      '8. **Testing**: Add unit tests for critical business logic',
    ];

    return recommendations.join('\n');
  }
}

// Run the migration tests
if (require.main === module) {
  const runner = new MigrationTestRunner();
  runner.runTests().catch(console.error);
}

export { MigrationTestRunner };