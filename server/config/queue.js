const { Queue, Worker, QueueEvents } = require('bullmq');

// ─── Redis connection config ───────────────────────────────────────────────────
// Falls back gracefully if Redis is not running
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
};

let reminderQueue = null;
let reminderWorker = null;
let redisAvailable = false;

// ─── Initialize queue (called from server index.js) ───────────────────────────
const initQueue = async () => {
  try {
    reminderQueue = new Queue('reminders', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    // ─── Worker: processes reminder jobs ──────────────────────────────────────
    reminderWorker = new Worker(
      'reminders',
      async (job) => {
        const { userId, applicationId, taskId, taskTitle, companyName, roleTitle, dueAt } = job.data;
        // In production: send email via Nodemailer here
        // For now: log the reminder (console acts as notification stub)
        console.log(`\n🔔 REMINDER FIRED`);
        console.log(`   Task: "${taskTitle}"`);
        console.log(`   Job: ${roleTitle} @ ${companyName}`);
        console.log(`   Due: ${new Date(dueAt).toLocaleString()}`);
        console.log(`   User: ${userId}\n`);
      },
      { connection: redisConnection }
    );

    reminderWorker.on('completed', (job) => {
      console.log(`✅ Reminder job ${job.id} completed`);
    });

    reminderWorker.on('failed', (job, err) => {
      console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
    });

    redisAvailable = true;
    console.log('📬 BullMQ reminder queue initialized (Redis connected)');
  } catch (err) {
    redisAvailable = false;
    console.warn('⚠️  Redis not available — reminders disabled. Start Redis to enable.');
  }
};

// ─── Schedule a reminder job ──────────────────────────────────────────────────
const scheduleReminder = async (jobData) => {
  if (!redisAvailable || !reminderQueue) {
    console.warn('⚠️  Reminder not scheduled (Redis unavailable)');
    return null;
  }

  const { dueAt } = jobData;
  if (!dueAt) return null;

  const dueTime = new Date(dueAt).getTime();
  const now = Date.now();
  // Fire 30 minutes before due time; if already past, fire in 5 seconds
  const delay = Math.max(5000, dueTime - now - 30 * 60 * 1000);

  try {
    const job = await reminderQueue.add('notify', jobData, { delay });
    console.log(`⏰ Reminder scheduled: "${jobData.taskTitle}" in ${Math.round(delay / 60000)} min`);
    return job.id;
  } catch (err) {
    console.error('Failed to schedule reminder:', err.message);
    return null;
  }
};

// ─── Remove a scheduled reminder ─────────────────────────────────────────────
const cancelReminder = async (jobId) => {
  if (!redisAvailable || !reminderQueue || !jobId) return;
  try {
    const job = await reminderQueue.getJob(jobId);
    if (job) await job.remove();
  } catch (err) {
    // silent
  }
};

module.exports = { initQueue, scheduleReminder, cancelReminder, isRedisAvailable: () => redisAvailable };
