import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'OVERDUE_DAYS_THRESHOLD' },
    update: { value: '3' },
    create: {
      key: 'OVERDUE_DAYS_THRESHOLD',
      value: '3',
      description: 'Number of days after which an unresolved complaint is marked overdue',
    },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@society.com' },
    update: {},
    create: {
      name: 'Society Administrator',
      email: 'admin@society.com',
      passwordHash,
      role: 'ADMIN',
      phoneNumber: '+91 9876543210',
    },
  });

  const resident1 = await prisma.user.upsert({
    where: { email: 'john@society.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@society.com',
      passwordHash,
      role: 'RESIDENT',
      flatNumber: 'A-402',
      phoneNumber: '+91 9123456780',
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: 'sarah@society.com' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'sarah@society.com',
      passwordHash,
      role: 'RESIDENT',
      flatNumber: 'B-105',
      phoneNumber: '+91 9123456781',
    },
  });

  console.log('👤 Users created: admin@society.com, john@society.com, sarah@society.com (Password: Password@123)');

  // 3. Complaints & History
  // Clean existing complaints for fresh seed
  await prisma.complaintStatusHistory.deleteMany();
  await prisma.complaint.deleteMany();

  // Complaint 1: Plumbing (Open, Overdue - 5 days ago)
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const c1 = await prisma.complaint.create({
    data: {
      title: 'Severe Water Leakage in Kitchen Sink',
      description: 'The kitchen pipe burst and water is flooding the cabinet underneath.',
      category: 'PLUMBING',
      status: 'OPEN',
      priority: 'HIGH',
      residentId: resident1.id,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: c1.id,
      previousStatus: null,
      newStatus: 'OPEN',
      changedById: resident1.id,
      note: 'Complaint raised by resident.',
      createdAt: fiveDaysAgo,
    },
  });

  // Complaint 2: Elevator (In Progress)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const c2 = await prisma.complaint.create({
    data: {
      title: 'Block B Elevator Making Grinding Noise',
      description: 'Passenger lift 2 vibrates violently when reaching the 4th floor.',
      category: 'ELEVATOR',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      residentId: resident2.id,
      createdAt: twoDaysAgo,
      updatedAt: new Date(),
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: c2.id,
        previousStatus: null,
        newStatus: 'OPEN',
        changedById: resident2.id,
        note: 'Complaint submitted.',
        createdAt: twoDaysAgo,
      },
      {
        complaintId: c2.id,
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedById: admin.id,
        note: 'Technician dispatched from Otis elevator maintenance team.',
        createdAt: new Date(),
      },
    ],
  });

  // Complaint 3: Electrical (Resolved)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  const c3 = await prisma.complaint.create({
    data: {
      title: 'Corridor Light Flickering on 4th Floor',
      description: 'Light bulb outside flat 402 is blinking and needs replacement.',
      category: 'ELECTRICAL',
      status: 'RESOLVED',
      priority: 'LOW',
      residentId: resident1.id,
      createdAt: oneWeekAgo,
      resolvedAt: sixDaysAgo,
      updatedAt: sixDaysAgo,
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: c3.id,
        previousStatus: null,
        newStatus: 'OPEN',
        changedById: resident1.id,
        note: 'Complaint logged.',
        createdAt: oneWeekAgo,
      },
      {
        complaintId: c3.id,
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedById: admin.id,
        note: 'Electrician assigned.',
        createdAt: oneWeekAgo,
      },
      {
        complaintId: c3.id,
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedById: admin.id,
        note: 'LED fixture replaced and tested successfully.',
        createdAt: sixDaysAgo,
      },
    ],
  });

  // 4. Notices
  await prisma.notice.deleteMany();
  await prisma.notice.createMany({
    data: [
      {
        title: '⚠️ Scheduled Water Tank Cleaning This Saturday',
        content: 'Please note that society overhead water tanks will be cleaned on Saturday between 9:00 AM and 2:00 PM. Water supply will remain paused during this period.',
        isImportant: true,
        createdById: admin.id,
      },
      {
        title: 'Annual General Meeting (AGM) Notice',
        content: 'The AGM is scheduled for the upcoming month. All flat owners are requested to attend the clubhouse meeting hall at 6:00 PM.',
        isImportant: false,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully with sample data!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
