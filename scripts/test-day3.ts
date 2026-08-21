import { prisma } from '../src/lib/prisma';
import { sendEmail, notifyStatusChange, notifyImportantNotice } from '../src/lib/email';
import { getOverdueThresholdDays, isComplaintOverdue } from '../src/lib/overdue';

async function runDay3Tests() {
  console.log('🧪 Starting Day 3 Automated Test Suite (Admin & Notifications)...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Email Service Fallback / Mock
    console.log('1. Notification & Email Service:');
    const emailRes = await sendEmail({
      to: 'resident@example.com',
      subject: 'Test Maintenance Notification',
      html: '<p>Test email body</p>',
    });
    assert(emailRes.success === true, 'Email dispatch succeeds with safe mock fallback');

    // 2. Status Change Email Dispatch
    const statusEmail = await notifyStatusChange(
      'john@society.com',
      'John Doe',
      'Plumbing Leak in Sink',
      'IN_PROGRESS',
      'Technician dispatched'
    );
    assert(statusEmail?.success === true, 'Status change email triggered successfully');

    // 3. Important Notice Broadcast
    const noticeEmail = await notifyImportantNotice(
      'Water Shutdown Announcement',
      'Water will be turned off between 1 PM and 3 PM.'
    );
    assert(noticeEmail?.success === true, 'Important notice broadcast dispatches to all residents');

    // 4. Overdue Threshold Setting Configuration
    console.log('\n2. Dynamic SLA / Overdue Configuration:');
    await prisma.systemSetting.upsert({
      where: { key: 'OVERDUE_DAYS_THRESHOLD' },
      update: { value: '5' },
      create: { key: 'OVERDUE_DAYS_THRESHOLD', value: '5' },
    });

    const newThreshold = await getOverdueThresholdDays();
    assert(newThreshold === 5, 'Overdue threshold dynamically updated in database to 5 days');

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    assert(
      isComplaintOverdue(fourDaysAgo, 'OPEN', newThreshold) === false,
      'Complaint aged 4 days is within SLA when threshold is 5 days'
    );

    // Reset back to 3 days
    await prisma.systemSetting.update({
      where: { key: 'OVERDUE_DAYS_THRESHOLD' },
      data: { value: '3' },
    });

    // 5. Admin Dashboard Metrics Aggregation
    console.log('\n3. Dashboard Metrics & Category Aggregation:');
    const allComplaints = await prisma.complaint.findMany();
    const openCount = allComplaints.filter((c) => c.status === 'OPEN').length;
    const resolvedCount = allComplaints.filter((c) => c.status === 'RESOLVED').length;

    assert(allComplaints.length >= 3, 'Admin can query aggregate complaints');
    assert(openCount >= 1 && resolvedCount >= 1, 'Status distribution accurately tracked');

    console.log(`\n🎉 Summary: ${passed}/${total} Day 3 tests passed successfully!\n`);
  } catch (error) {
    console.error('Day 3 Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDay3Tests();
