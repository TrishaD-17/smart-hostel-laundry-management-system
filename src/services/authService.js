import { students as demoStudents } from '../data/initialData.js'

const CREDENTIALS_KEY = 'washday-student-credentials-v1'
const SESSION_KEY = 'washday-session-v1'
export const STAFF_EMAIL = 'laundry@campus.edu'
const PBKDF2_ITERATIONS = 120000

export const normalizeEmail = (email) => email.trim().toLowerCase()

function readCredentials() {
  const saved = localStorage.getItem(CREDENTIALS_KEY)
  return saved ? JSON.parse(saved) : []
}

function encodeBytes(bytes) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function decodeBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function derivePasswordHash(password, salt, iterations = PBKDF2_ITERATIONS) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Password verification is unavailable in this browser. Use localhost or HTTPS.')
  }
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const result = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return encodeBytes(new Uint8Array(result))
}

function equalHash(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export async function createCredential(studentId, email, password) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Password verification is unavailable in this browser. Use localhost or HTTPS.')
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  return {
    studentId,
    email: normalizeEmail(email),
    salt: encodeBytes(salt),
    hash: await derivePasswordHash(password, salt),
    iterations: PBKDF2_ITERATIONS,
  }
}

export function saveCredential(credential) {
  const credentials = readCredentials()
  if (credentials.some((item) => item.email === credential.email)) {
    throw new Error('An account with this campus email already exists.')
  }
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify([...credentials, credential]))
}

export function removeCredential(studentId) {
  const credentials = readCredentials().filter((item) => item.studentId !== studentId)
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
}

export async function authenticate(role, email, password, allStudents) {
  const normalizedEmail = normalizeEmail(email)
  if (!password.trim()) return null

  if (role === 'staff') {
    return normalizedEmail === STAFF_EMAIL ? { role: 'staff' } : null
  }
  if (role !== 'student') return null

  const student = allStudents.find((item) => normalizeEmail(item.email) === normalizedEmail)
  if (!student) return null

  if (demoStudents.some((item) => item.id === student.id)) {
    return { role: 'student', studentId: student.id }
  }

  const credential = readCredentials().find((item) => item.studentId === student.id)
  if (!credential) return null
  const candidate = await derivePasswordHash(password, decodeBytes(credential.salt), credential.iterations || PBKDF2_ITERATIONS)
  return equalHash(candidate, credential.hash) ? { role: 'student', studentId: student.id } : null
}

export function readSession(allStudents) {
  const saved = localStorage.getItem(SESSION_KEY)
  if (!saved) return null
  const session = JSON.parse(saved)
  if (session?.role === 'staff') return session
  if (session?.role === 'student' && allStudents.some((item) => item.id === session.studentId)) return session
  localStorage.removeItem(SESSION_KEY)
  return null
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
