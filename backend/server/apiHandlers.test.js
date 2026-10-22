import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import { adminReportHandler, parseRequestBody, signupHandler } from './apiHandlers.js'
import { ApiError } from './apiError.js'
import { handler as adminSummaryHandler } from '../netlify/functions/admin-summary.js'

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-bytes-long'

test('signup rejects public attempts to self-register as admin', async () => {
  await assert.rejects(
    signupHandler({ email: 'admin@example.com', password: 'long-password', registerAs: 'admin' }),
    (error) => error instanceof ApiError && error.statusCode === 400,
  )
})

test('signup rejects invalid email before database access', async () => {
  await assert.rejects(
    signupHandler({ email: 'not-an-email', password: 'short', registerAs: 'user' }),
    (error) => error instanceof ApiError && error.code === 'INVALID_EMAIL',
  )
})

test('request JSON parsing rejects malformed JSON', () => {
  assert.throws(
    () => parseRequestBody('{'),
    (error) => error instanceof ApiError && error.code === 'INVALID_JSON',
  )
})

test('admin report endpoints reject requests without a bearer token', async () => {
  await assert.rejects(
    adminReportHandler('summary', undefined, {}),
    (error) => error instanceof ApiError && error.statusCode === 401,
  )
})

test('standard-user tokens cannot access admin reports', async () => {
  const token = jwt.sign(
    { role: 'user', email: 'user@example.com' },
    process.env.JWT_SECRET,
    { subject: 'user-id', expiresIn: '1h' },
  )

  await assert.rejects(
    adminReportHandler('summary', `Bearer ${token}`, {}),
    (error) => error instanceof ApiError && error.statusCode === 403,
  )
})

test('Netlify admin function returns unauthorized without a token', async () => {
  const response = await adminSummaryHandler({ headers: {}, queryStringParameters: {} })
  assert.equal(response.statusCode, 401)
  assert.equal(JSON.parse(response.body).error.code, 'AUTHENTICATION_REQUIRED')
})
