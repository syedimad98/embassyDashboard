import jwt from 'jsonwebtoken'
import { ApiError } from './apiError.js'
import { getDatabase } from './database.js'

const tokenLifetime = '1h'
let userEmailIndex

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes.')
  }

  return secret
}

function validateCredentials({ email, password, registerAs }) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new ApiError(400, 'INVALID_EMAIL', 'Enter a valid email address.')
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(400, 'INVALID_PASSWORD', 'Password must be between 8 and 128 characters.')
  }

  if (registerAs !== undefined && registerAs !== 'user') {
    throw new ApiError(400, 'INVALID_REGISTRATION_ROLE', 'Public signup is available for standard users only.')
  }
}

function issueToken(user, secret) {
  return jwt.sign(
    { email: user.email, role: user.role },
    secret,
    { algorithm: 'HS256', subject: user._id.toString(), expiresIn: tokenLifetime },
  )
}

export async function signup(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'INVALID_REQUEST_BODY', 'Request body must be a JSON object.')
  }

  const { email, password, registerAs, regAs } = input
  const requestedRole = registerAs ?? regAs
  validateCredentials({ email, password, registerAs: requestedRole })
  const jwtSecret = getJwtSecret()

  const normalizedEmail = email.trim().toLowerCase()
  const users = (await getDatabase()).collection('users')
  if (!userEmailIndex) {
    userEmailIndex = users.createIndex({ email: 1 }, { unique: true }).catch((error) => {
      userEmailIndex = null
      throw error
    })
  }
  await userEmailIndex

  const user = {
    email: normalizedEmail,
    password: password, // Saving password in plain text
    role: 'user',
    createdAt: new Date(),
  }

  try {
    const { insertedId } = await users.insertOne(user)
    const createdUser = { _id: insertedId, email: user.email, role: user.role }

    return { user: createdUser, token: issueToken(createdUser, jwtSecret) }
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.')
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
    typeof email !== 'string'
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof password !== 'string'
    || password.length === 0
    || password.length > 128
  ) {
    throw new ApiError(400, 'INVALID_CREDENTIALS', 'Email and password are required.')
  }

  const jwtSecret = getJwtSecret()
  const normalizedEmail = email.trim().toLowerCase()
  const user = await (await getDatabase())
    .collection('users')
    .findOne({ email: normalizedEmail })

  // Compare plain text passwords directly
  const passwordMatches = user && user.password === password

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  const publicUser = { _id: user._id, email: user.email, role: user.role }
  return { user: publicUser, token: issueToken(publicUser, jwtSecret) }
}

export function authenticateToken(authorization) {
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'A valid Bearer token is required.')
  }

  try {
    return jwt.verify(authorization.slice(7), getJwtSecret(), { algorithms: ['HS256'] })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'INVALID_TOKEN', 'The authentication token is invalid or expired.')
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