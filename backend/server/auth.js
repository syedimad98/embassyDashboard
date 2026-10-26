import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ApiError } from './apiError.js'
import { getDatabase } from './database.js'

const passwordRounds = 12
const tokenLifetime = '1h'
let userEmailIndex

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes.')
  }

  return secret
}

function normalizeRole(role) {
  if (role === 'client') return 'user'
  return role
}

function validateCredentials({ email, password }) {
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new ApiError(400, 'INVALID_EMAIL', 'Enter a valid email address.')
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw new ApiError(
      400,
      'INVALID_PASSWORD',
      'Password must be between 8 and 128 characters.'
    )
  }
}

function issueToken(user, secret) {
  return jwt.sign(
    { email: user.email, role: user.role },
    secret,
    {
      algorithm: 'HS256',
      subject: user._id.toString(),
      expiresIn: tokenLifetime,
    }
  )
}

export async function signup(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'INVALID_REQUEST_BODY', 'Request body must be a JSON object.')
  }

  const { email, password } = input
  const role = normalizeRole(input.registerAs ?? input.regAs ?? input.role ?? 'user')

  validateCredentials({ email, password })

  if (!['user', 'ad-ops', 'admin'].includes(role)) {
    throw new ApiError(400, 'INVALID_REGISTRATION_ROLE', 'Please select a valid role.')
  }

  console.log(
  'Admin signup setting:',
  process.env.ALLOW_PUBLIC_ADMIN_SIGNUP
)
  // Public Admin signup is for local testing only. Keep disabled in production.
  if (role === 'admin' && process.env.ALLOW_PUBLIC_ADMIN_SIGNUP !== 'true') {
    throw new ApiError(
      403,
      'ADMIN_SIGNUP_DISABLED',
      'Admin signup is disabled. An authorized administrator must create or promote this account.'
    )
  }

  const normalizedEmail = email.trim().toLowerCase()
  const users = (await getDatabase()).collection('users')

  if (!userEmailIndex) {
    userEmailIndex = users.createIndex(
      { email: 1 },
      { unique: true }
    ).catch((error) => {
      userEmailIndex = null
      throw error
    })
  }

  await userEmailIndex

  const user = {
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, passwordRounds),
    role,
    createdAt: new Date(),
  }

  try {
    const { insertedId } = await users.insertOne(user)

    // Signup creates the account; the user must log in separately.
    return {
      user: {
        _id: insertedId,
        email: user.email,
        role: user.role,
      },
      message: 'Registration successful. Please log in.',
    }
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        'This email is already registered. Please log in.'
      )
    }

    throw error
  }
}

export async function login(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'INVALID_REQUEST_BODY', 'Request body must be a JSON object.')
  }

  const { email, password } = input

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' ||
    password.length === 0 ||
    password.length > 128
  ) {
    throw new ApiError(400, 'INVALID_CREDENTIALS', 'Enter your email and password.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const users = (await getDatabase()).collection('users')
  const user = await users.findOne({ email: normalizedEmail })

  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  const publicUser = {
    _id: user._id,
    email: user.email,
    role: normalizeRole(user.role),
  }

  return {
    user: publicUser,
    token: issueToken(publicUser, getJwtSecret()),
  }
}

export function authenticateToken(authorization) {
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Bearer ')
  ) {
    throw new ApiError(
      401,
      'AUTHENTICATION_REQUIRED',
      'A valid Bearer token is required.'
    )
  }

  try {
    return jwt.verify(
      authorization.slice(7),
      getJwtSecret(),
      { algorithms: ['HS256'] }
    )
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      throw new ApiError(
        401,
        'INVALID_TOKEN',
        'The authentication token is invalid or expired.'
      )
    }

    throw error
  }
}

export function requireAdmin(authorization) {
  const user = authenticateToken(authorization)

  if (user.role !== 'admin') {
    throw new ApiError(403, 'ADMIN_REQUIRED', 'Admin access is required.')
  }

  return user
}
