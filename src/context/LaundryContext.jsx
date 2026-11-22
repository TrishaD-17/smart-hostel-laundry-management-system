import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { initialData, statusSteps, students as demoStudents } from '../data/initialData.js'
import {
  authenticate, clearSession, createCredential, normalizeEmail, readSession,
  removeCredential, saveCredential, saveSession, STAFF_EMAIL,
} from '../services/authService.js'

const STORAGE_KEY = 'washday-laundry-data'
const LaundryContext = createContext(null)

function readData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return initialData
  const parsed = JSON.parse(saved)
  return { ...initialData, ...parsed, students: Array.isArray(parsed.students) ? parsed.students : demoStudents }
}

const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function LaundryProvider({ children }) {
  const [data, setData] = useState(readData)
  const [session, setSession] = useState(() => readSession(data.students))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const value = useMemo(() => ({
    ...data,
    session,
    async signIn({ role, email, password }) {
      const nextSession = await authenticate(role, email, password, data.students)
      if (!nextSession) throw new Error('Those sign-in details do not match an account.')
      saveSession(nextSession)
      setSession(nextSession)
      return nextSession
    },
    async registerStudent({ name, email, hostel, roomNumber, password }) {
      const normalizedEmail = normalizeEmail(email)
      if (normalizedEmail === STAFF_EMAIL || data.students.some((item) => normalizeEmail(item.email) === normalizedEmail)) {
        throw new Error('An account with this campus email already exists.')
      }

      let studentId
      do {
        studentId = newId('s')
      } while (data.students.some((item) => item.id === studentId))
      const student = {
        id: studentId,
        name: name.trim(),
        email: normalizedEmail,
        hostel: hostel.trim(),
        roomNumber: roomNumber.trim(),
        room: `${hostel.trim()} · ${roomNumber.trim()}`,
        initials: name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
        color: ['lavender', 'blue', 'peach', 'mint'][data.students.length % 4],
      }
      const credential = await createCredential(studentId, normalizedEmail, password)
      saveCredential(credential)
      const updatedData = { ...data, students: [...data.students, student] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
      } catch (error) {
        removeCredential(studentId)
        throw error
      }
      setData(updatedData)
      return student
    },
    signOut() {
      clearSession()
      setSession(null)
    },
    createRequest({ studentId, items, expectedDate, notes }) {
      let token
      do {
        token = `WL-${Math.floor(10000 + Math.random() * 90000)}`
      } while (data.requests.some((item) => item.token === token))
      const request = {
        id: newId('r'),
        token,
        studentId,
        submittedAt: new Date().toISOString().slice(0, 10),
        expectedDate,
        status: statusSteps[0],
        items,
        notes: notes.trim(),
      }
      setData((current) => ({
        ...current,
        requests: [request, ...current.requests],
        notifications: [{
          id: newId('n'), studentId, title: 'Laundry request received',
          message: `Your request ${request.token} is in the queue.`,
          createdAt: request.submittedAt, read: false, requestId: request.id,
        }, ...current.notifications],
      }))
      return request
    },
    updateStatus(requestId, status) {
      setData((current) => {
        const request = current.requests.find((item) => item.id === requestId)
        const changed = current.requests.map((item) => item.id === requestId ? { ...item, status } : item)
        const notifications = request && request.status !== status
          ? [{
            id: newId('n'),
            studentId: request.studentId,
            title: status === 'Ready for Collection' ? 'Laundry is ready' : 'Laundry status updated',
            message: status === 'Ready for Collection'
              ? `Your laundry ${request.token} is ready to collect.`
              : `Your laundry ${request.token} is now ${status.toLowerCase()}.`,
            createdAt: new Date().toISOString().slice(0, 10),
            read: false,
            requestId,
          }, ...current.notifications]
          : current.notifications
        return { ...current, requests: changed, notifications }
      })
    },
    updateExpectedDate(requestId, expectedDate) {
      setData((current) => ({
        ...current,
        requests: current.requests.map((item) => item.id === requestId ? { ...item, expectedDate } : item),
      }))
    },
    confirmCollection(requestId) {
      setData((current) => ({
        ...current,
        requests: current.requests.map((item) => item.id === requestId ? { ...item, status: 'Collected' } : item),
      }))
    },
    addComplaint({ studentId, requestId, category, description }) {
      const request = data.requests.find((item) => item.id === requestId)
      const complaint = { id: newId('c'), studentId, requestId, token: request?.token ?? '', category, description: description.trim(), status: 'Open', createdAt: new Date().toISOString().slice(0, 10) }
      setData((current) => ({ ...current, complaints: [complaint, ...current.complaints] }))
      return complaint
    },
    updateComplaint(complaintId, status) {
      setData((current) => ({
        ...current,
        complaints: current.complaints.map((item) => item.id === complaintId ? { ...item, status } : item),
      }))
    },
    markNotificationRead(notificationId) {
      setData((current) => ({
        ...current,
        notifications: current.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item),
      }))
    },
    addSchedule(schedule) {
      setData((current) => ({ ...current, schedules: [...current.schedules, { ...schedule, id: newId('sch') }] }))
    },
    removeSchedule(scheduleId) {
      setData((current) => ({ ...current, schedules: current.schedules.filter((item) => item.id !== scheduleId) }))
    },
  }), [data, session])

  return <LaundryContext.Provider value={value}>{children}</LaundryContext.Provider>
}

export function useLaundry() {
  const context = useContext(LaundryContext)
  if (!context) throw new Error('useLaundry must be used within LaundryProvider')
  return context
}
