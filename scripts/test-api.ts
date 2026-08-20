import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';
import { isComplaintOverdue } from '../src/lib/overdue';

async function runTests() {
  console.log('🧪 Starting Day 1 Automated API & Core Logic Test Suite...\n');
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
    // 1. Password Hashing & Verification
    console.log('1. Authentication Utilities:');
    const pwd = 'TestSecretPassword123!';
    const hashed = await hashPassword(pwd);
    assert(await comparePassword(pwd, hashed), 'Password hashing and verification');
    assert(!(await comparePassword('WrongPassword', hashed)), 'Reject invalid password');

    // 2. JWT Sign & Verify
    const mockUser = {
      id: 'usr_test_123',
      name: 'Test Resident',
      email: 'test@example.com',
      role: 'RESIDENT' as const,
      flatNumber: 'C-301',
    };
    const token = signToken(mockUser);
    const decoded = verifyToken(token);
    assert(decoded !== null && decoded.email === mockUser.email, 'JWT sign & decode');
    assert(decoded?.role === 'RESIDENT', 'JWT preserves user role');

    // 3. Database Connection & Users
    console.log('\n2. Database & Role-Based Accounts:');
    const admin = await prisma.user.findUnique({ where: { email: 'admin@society.com' } });
    assert(admin !== null && admin.role === 'ADMIN', 'Admin user seeded with ADMIN role');

    const resident = await prisma.user.findUnique({ where: { email: 'john@society.com' } });
    assert(resident !== null && resident.role === 'RESIDENT', 'Resident user seeded with RESIDENT role');

    // 4. Complaint Creation & History Logging
    console.log('\n3. Complaint Lifecycle & Audit History:');
    const testComplaint = await prisma.complaint.create({
      data: {
        title: 'Water filter leakage',
        description: 'Water leaking on floor in clubhouse.',
        category: 'PLUMBING',
        status: 'OPEN',
        priority: 'MEDIUM',
        residentId: resident!.id,
      },
    });

    const initialHistory = await prisma.complaintStatusHistory.create({
      data: {
        complaintId: testComplaint.id,
        previousStatus: null,
        newStatus: 'OPEN',
        changedById: resident!.id,
        note: 'Complaint raised.',
      },
    });

    assert(testComplaint.status === 'OPEN', 'New complaint defaults to OPEN');
    assert(initialHistory.newStatus === 'OPEN', 'Status history logs initial OPEN event');

    // Status Transition 1: OPEN -> IN_PROGRESS
    const updatedToInProgress = await prisma.complaint.update({
      where: { id: testComplaint.id },
      data: { status: 'IN_PROGRESS' },
    });
    const progressHistory = await prisma.complaintStatusHistory.create({
      data: {
        complaintId: testComplaint.id,
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedById: admin!.id,
        note: 'Assigned plumber to inspect.',
      },
    });

    assert(updatedToInProgress.status === 'IN_PROGRESS', 'Complaint transitions to IN_PROGRESS');
    assert(progressHistory.previousStatus === 'OPEN' && progressHistory.newStatus === 'IN_PROGRESS', 'History records status change with previous & new status');

    // Status Transition 2: IN_PROGRESS -> RESOLVED
    const updatedToResolved = await prisma.complaint.update({
      where: { id: testComplaint.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
    const resolvedHistory = await prisma.complaintStatusHistory.create({
      data: {
        complaintId: testComplaint.id,
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedById: admin!.id,
        note: 'Leak repaired successfully.',
      },
    });

    assert(updatedToResolved.status === 'RESOLVED' && updatedToResolved.resolvedAt !== null, 'Complaint marked RESOLVED with timestamp');

    // Fetch full history
    const allHistory = await prisma.complaintStatusHistory.findMany({
      where: { complaintId: testComplaint.id },
      orderBy: { createdAt: 'asc' },
    });
    assert(allHistory.length === 3, 'Full 3-step audit trail preserved (OPEN -> IN_PROGRESS -> RESOLVED)');

    // 5. Overdue Detection Engine
    console.log('\n4. Overdue Detection Engine:');
    const today = new Date();
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    assert(isComplaintOverdue(fourDaysAgo, 'OPEN', 3) === true, 'Open complaint older than 3 days is OVERDUE');
    assert(isComplaintOverdue(today, 'OPEN', 3) === false, 'Open complaint from today is NOT overdue');
    assert(isComplaintOverdue(fourDaysAgo, 'RESOLVED', 3) === false, 'Resolved complaint is NEVER overdue');

    // 6. Notice Board & Pinned System
    console.log('\n5. Notice Board:');
    const notices = await prisma.notice.findMany({
      orderBy: [{ isImportant: 'desc' }, { createdAt: 'desc' }],
    });
    assert(notices.length >= 2, 'Notices retrieved successfully');
    assert(notices[0].isImportant === true, 'Important notices pinned to top');

    // Cleanup test complaint
    await prisma.complaintStatusHistory.deleteMany({ where: { complaintId: testComplaint.id } });
    await prisma.complaint.delete({ where: { id: testComplaint.id } });

    console.log(`\n🎉 Summary: ${passed}/${total} tests passed successfully!\n`);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
