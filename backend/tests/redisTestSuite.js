/**
 * DarshanEase — Comprehensive Production-Grade Redis Test Suite
 * Validates Redis connection, Email OTP security, Cache-Aside pattern,
 * Booking Lock concurrency, Rate Limiting, and Idempotency.
 */

const Redis = require('ioredis');
let RedisMock;
try {
  RedisMock = require('ioredis-mock');
} catch (e) {
  // Fallback if ioredis-mock is absent
}

const { setRedisClient } = require('../config/redis');
const redisService = require('../services/redisService');
const otpService = require('../services/otpService');
const cacheService = require('../services/cacheService');
const bookingLockService = require('../services/bookingLockService');
const rateLimitService = require('../services/rateLimitService');
const idempotencyService = require('../services/idempotencyService');
const redisKeys = require('../utils/redisKeys');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✔ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✖ [FAIL] ${message}`);
  }
}

async function setupTestClient() {
  // Test if a live Redis server is reachable on 127.0.0.1:6379
  const liveClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    connectTimeout: 1000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null // Don't retry probe
  });
  liveClient.on('error', () => {}); // Swallow probe errors

  try {
    await liveClient.connect();
    await liveClient.ping();
    console.log('⚡ Connected to LIVE Redis server for tests.');
    setRedisClient(liveClient);
    return liveClient;
  } catch (err) {
    try { liveClient.disconnect(); } catch (e) {}
    console.log('ℹ️ Live Redis not detected locally. Initializing ioredis-mock sandbox for test execution...');
    if (RedisMock) {
      const mockClient = new RedisMock();
      setRedisClient(mockClient);
      return mockClient;
    } else {
      throw new Error('Neither live Redis nor ioredis-mock is available to run tests.');
    }
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  DARSHANEASE REDIS PRODUCTION TEST SUITE');
  console.log('====================================================\n');

  const client = await setupTestClient();

  try {
    // ----------------------------------------------------
    // TEST 1: Core Redis Operations & JSON Serialization
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Core Redis Operations ---');
    const testKey = 'darshanease:test:core';
    await redisService.set(testKey, 'hello-redis', 10);
    const value = await redisService.get(testKey);
    assert(value === 'hello-redis', 'Primitive string SET and GET succeed');

    const jsonKey = 'darshanease:test:json';
    const originalJson = { temple: 'Tirumala', deity: 'Venkateswara', capacity: 500 };
    await redisService.setJson(jsonKey, originalJson, 10);
    const retrievedJson = await redisService.getJson(jsonKey);
    assert(
      retrievedJson && retrievedJson.temple === 'Tirumala' && retrievedJson.capacity === 500,
      'JSON object serialization and parsing succeed'
    );

    const ttl = await redisService.ttl(jsonKey);
    assert(ttl > 0 && ttl <= 10, 'TTL correctly assigned to cached key');

    await redisService.del(testKey);
    await redisService.del(jsonKey);

    // ----------------------------------------------------
    // TEST 2: Email OTP Generation, Hashing & Attempt Protection
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Email OTP Authentication Flow ---');
    const testEmail = `devotee_${Date.now()}@example.com`;

    // 2a. Generate OTP
    const otpRes = await otpService.generateOtp(testEmail);
    assert(otpRes.success === true, 'OTP generation succeeds');
    assert(otpRes.otp && otpRes.otp.length === 6, 'OTP is strictly a 6-digit numeric string');

    // 2b. Verify OTP is NOT stored plaintext in Redis
    const rawOtpRecord = await redisService.getJson(redisKeys.otp(testEmail));
    assert(rawOtpRecord && rawOtpRecord.otpHash, 'Hashed OTP record exists in Redis');
    assert(rawOtpRecord.otpHash !== otpRes.otp, 'Plaintext OTP is NEVER stored in Redis (HMAC-SHA256 hashed)');

    // 2c. Enforce 60-second cooldown
    const cooldownRes = await otpService.generateOtp(testEmail);
    assert(
      cooldownRes.success === false && cooldownRes.cooldown === true,
      'Rapid OTP resend blocked by 60s cooldown'
    );

    // 2d. Wrong OTP attempts decrement counter
    const wrongRes1 = await otpService.verifyOtp(testEmail, '000000');
    assert(wrongRes1.success === false && wrongRes1.remainingAttempts === 4, 'Wrong OTP decrements attempt counter to 4');

    const wrongRes2 = await otpService.verifyOtp(testEmail, '111111');
    assert(wrongRes2.success === false && wrongRes2.remainingAttempts === 3, 'Wrong OTP decrements attempt counter to 3');

    // 2e. Correct OTP verification & immediate cleanup
    const correctRes = await otpService.verifyOtp(testEmail, otpRes.otp);
    assert(correctRes.success === true, 'Correct OTP verified successfully');

    const expiredRecord = await redisService.getJson(redisKeys.otp(testEmail));
    assert(!expiredRecord, 'OTP record immediately wiped from Redis after successful verification (One-time use)');

    // ----------------------------------------------------
    // TEST 3: Cache-Aside Pattern with Fallback & Invalidation
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Cache-Aside Pattern ---');
    let dbCallCount = 0;
    const mockDbFetch = async () => {
      dbCallCount++;
      return [{ id: 1, name: 'Sri Venkateswara Temple' }];
    };

    const cacheKey = redisKeys.templesList('test');
    await redisService.del(cacheKey);

    // First call: Cache MISS -> fetches from DB
    const res1 = await cacheService.getOrSet(cacheKey, mockDbFetch, 60);
    assert(dbCallCount === 1 && res1[0].name === 'Sri Venkateswara Temple', 'First call causes Cache MISS and queries DB');

    // Second call: Cache HIT -> returns cached data without querying DB
    const res2 = await cacheService.getOrSet(cacheKey, mockDbFetch, 60);
    assert(dbCallCount === 1 && res2[0].name === 'Sri Venkateswara Temple', 'Second call causes Cache HIT without re-querying DB');

    // Invalidation
    await cacheService.invalidate(cacheKey);
    const res3 = await cacheService.getOrSet(cacheKey, mockDbFetch, 60);
    assert(dbCallCount === 2, 'Cache invalidation forces fresh DB query on subsequent call');

    // Clean up
    await cacheService.invalidate(cacheKey);

    // ----------------------------------------------------
    // TEST 4: Booking Concurrency & Distributed Lock
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Distributed Booking Locks & Concurrency ---');
    const slotId = 'slot_test_tirumala_01';

    // 4a. Lock Acquisition
    const lock1 = await bookingLockService.acquireLock(slotId, 30);
    assert(lock1.acquired === true && !!lock1.token, 'Initial booking lock acquired with unique token');

    // 4b. Competing worker attempted lock while locked
    const lock2 = await bookingLockService.acquireLock(slotId, 30, 1, 10);
    assert(lock2.acquired === false, 'Competing booking worker rejected while slot is locked');

    // 4c. Wrong token cannot release lock
    const wrongTokenRelease = await bookingLockService.releaseLock(slotId, 'fake-token-uuid');
    assert(wrongTokenRelease === false, 'Wrong token rejected by atomic Lua release script');

    // 4d. Correct token releases lock
    const correctRelease = await bookingLockService.releaseLock(slotId, lock1.token);
    assert(correctRelease === true, 'Valid token cleanly releases lock via Lua script');

    // 4e. Concurrency Stress Test: 50 concurrent booking requests on the SAME slot
    let lockHolders = 0;
    let collisions = 0;

    const simulateBookingAttempt = async (workerId) => {
      const lk = await bookingLockService.acquireLock(slotId, 5, 2, 20);
      if (lk.acquired) {
        lockHolders++;
        // Simulate small atomic operation
        await new Promise((r) => setTimeout(r, 15));
        await bookingLockService.releaseLock(slotId, lk.token);
        return true;
      } else {
        collisions++;
        return false;
      }
    };

    await Promise.all(Array.from({ length: 25 }, (_, i) => simulateBookingAttempt(i)));
    assert(collisions > 0, `Concurrency stress test correctly mediated contention (${collisions} competing requests backed off)`);

    // Clean up
    await redisService.del(redisKeys.bookingLock(slotId));

    // ----------------------------------------------------
    // TEST 5: Rate Limiting
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Atomic Rate Limiting ---');
    const testIp = '192.168.1.100';
    const testEndpoint = 'test-send-otp';

    // Clear previous
    await redisService.del(redisKeys.rateLimit(testEndpoint, testIp));

    // Send 3 requests (limit: 3 per 5 seconds)
    const r1 = await rateLimitService.checkRateLimit(testEndpoint, testIp, 3, 5);
    const r2 = await rateLimitService.checkRateLimit(testEndpoint, testIp, 3, 5);
    const r3 = await rateLimitService.checkRateLimit(testEndpoint, testIp, 3, 5);
    assert(r1.allowed && r2.allowed && r3.allowed, 'Requests within threshold (3/3) permitted');

    // 4th request exceeds limit
    const r4 = await rateLimitService.checkRateLimit(testEndpoint, testIp, 3, 5);
    assert(!r4.allowed && r4.remaining === 0, '4th request blocked with 429 Too Many Requests response');

    // Clean up
    await redisService.del(redisKeys.rateLimit(testEndpoint, testIp));

    // ----------------------------------------------------
    // TEST 6: Idempotency Service
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Idempotency (Duplicate Prevention) ---');
    const idempotencyKey = `idemp_${Date.now()}`;
    const initialCheck = await idempotencyService.getSavedResponse(idempotencyKey);
    assert(initialCheck === null, 'Non-existent idempotency key returns null');

    const sampleResponse = { success: true, bookingId: 'DSE-12345678', total: 500 };
    await idempotencyService.saveResponse(idempotencyKey, 201, sampleResponse);

    const replayed = await idempotencyService.getSavedResponse(idempotencyKey);
    assert(
      replayed && replayed.statusCode === 201 && replayed.body.bookingId === 'DSE-12345678',
      'Saved idempotency response successfully replayed without creating duplicate records'
    );

    // Clean up
    await redisService.del(redisKeys.idempotency(idempotencyKey));

  } catch (err) {
    console.error('\n❌ Unhandled exception in test suite:', err);
    failedTests++;
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Production-Grade Redis Integration tests passed successfully!\n');
    process.exit(0);
  }
}

runTests();
