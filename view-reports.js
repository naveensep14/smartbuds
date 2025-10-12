require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function viewReports() {
  console.log('📊 Fetching question reports...\n');

  try {
    const { data: reports, error, count } = await supabase
      .from('question_reports')
      .select('*', { count: 'exact' })
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching reports:', error.message);
      return;
    }

    console.log(`✅ Found ${count || 0} report(s)\n`);
    console.log('='.repeat(100));

    if (!reports || reports.length === 0) {
      console.log('\n📭 No reports found in the database.');
      console.log('\nTo submit a test report:');
      console.log('1. Go to any test page');
      console.log('2. Click "Report Issue" button on a question');
      console.log('3. Select an issue type and submit');
      console.log('\nThen run this script again to see the reports.\n');
      return;
    }

    reports.forEach((report, index) => {
      console.log(`\n📋 REPORT #${index + 1}`);
      console.log('-'.repeat(100));
      console.log(`🆔 ID: ${report.id}`);
      console.log(`👤 User ID: ${report.user_id}`);
      console.log(`📝 Test: ${report.test_title}`);
      console.log(`📚 Subject: ${report.test_subject} | Grade: ${report.test_grade} | Board: ${report.test_board}`);
      if (report.test_chapter) {
        console.log(`📖 Chapter: ${report.test_chapter}`);
      }
      console.log(`\n❓ Question: ${report.question_text}`);
      console.log(`\n🔤 Options:`);
      report.question_options.forEach((option, idx) => {
        const label = String.fromCharCode(65 + idx);
        const isCorrect = idx === report.correct_answer;
        const isUserAnswer = idx === report.user_answer;
        let marker = '';
        if (isCorrect) marker = ' ✓ (Correct Answer)';
        if (isUserAnswer && !isCorrect) marker = ' ✗ (User Answer)';
        console.log(`   ${label}. ${option}${marker}`);
      });
      
      console.log(`\n🚨 Issue Type: ${report.issue_type}`);
      console.log(`📋 Status: ${report.status.toUpperCase()}`);
      
      if (report.description) {
        console.log(`\n💬 Description: ${report.description}`);
      }
      
      if (report.admin_notes) {
        console.log(`\n🔧 Admin Notes: ${report.admin_notes}`);
      }
      
      console.log(`\n🕐 Reported At: ${new Date(report.reported_at).toLocaleString()}`);
      
      if (report.resolved_at) {
        console.log(`✅ Resolved At: ${new Date(report.resolved_at).toLocaleString()}`);
      }
      
      console.log('='.repeat(100));
    });

    console.log(`\n✨ Total: ${reports.length} report(s) displayed\n`);
    
    // Summary by status
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Summary by Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Summary by issue type
    const issueCounts = reports.reduce((acc, report) => {
      acc[report.issue_type] = (acc[report.issue_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Summary by Issue Type:');
    Object.entries(issueCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewReports();

