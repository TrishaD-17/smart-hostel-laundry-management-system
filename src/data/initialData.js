export const statusSteps = [
  'Received',
  'Sorting',
  'Washing',
  'Drying',
  'Ready for Collection',
  'Collected',
]

export const students = [
  { id: 's001', name: 'Ananya Sen', email: 'ananya.sen@campus.edu', room: 'Maple Hall · 204', initials: 'AS', color: 'lavender' },
  { id: 's002', name: 'Rohan Kapoor', email: 'rohan.k@campus.edu', room: 'Cedar Hall · 118', initials: 'RK', color: 'blue' },
  { id: 's003', name: 'Isha Patel', email: 'isha.patel@campus.edu', room: 'Maple Hall · 312', initials: 'IP', color: 'peach' },
  { id: 's004', name: 'Dev Malhotra', email: 'dev.m@campus.edu', room: 'Pine Hall · 026', initials: 'DM', color: 'mint' },
]

const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const initialData = {
  students,
  requests: [
    { id: 'r101', token: 'WL-24081', studentId: 's001', submittedAt: daysFromNow(-1), expectedDate: daysFromNow(2), status: 'Washing', items: [{ type: 'Shirts', quantity: 4 }, { type: 'Jeans', quantity: 2 }, { type: 'Towels', quantity: 1 }], notes: 'Please wash the blue shirt separately.' },
    { id: 'r102', token: 'WL-24072', studentId: 's001', submittedAt: daysFromNow(-5), expectedDate: daysFromNow(0), status: 'Ready for Collection', items: [{ type: 'Bedsheets', quantity: 2 }, { type: 'Towels', quantity: 2 }], notes: '' },
    { id: 'r103', token: 'WL-24083', studentId: 's002', submittedAt: daysFromNow(0), expectedDate: daysFromNow(3), status: 'Received', items: [{ type: 'Shirts', quantity: 5 }, { type: 'Trousers', quantity: 2 }], notes: '' },
    { id: 'r104', token: 'WL-24064', studentId: 's003', submittedAt: daysFromNow(-3), expectedDate: daysFromNow(1), status: 'Drying', items: [{ type: 'Dresses', quantity: 2 }, { type: 'Tops', quantity: 3 }], notes: 'Gentle cycle, please.' },
    { id: 'r105', token: 'WL-24055', studentId: 's004', submittedAt: daysFromNow(-8), expectedDate: daysFromNow(-4), status: 'Collected', items: [{ type: 'Shirts', quantity: 3 }, { type: 'Jeans', quantity: 1 }], notes: '' },
    { id: 'r106', token: 'WL-24086', studentId: 's002', submittedAt: daysFromNow(-2), expectedDate: daysFromNow(1), status: 'Sorting', items: [{ type: 'Towels', quantity: 3 }, { type: 'Bedsheets', quantity: 1 }], notes: '' },
    { id: 'r107', token: 'WL-24037', studentId: 's003', submittedAt: daysFromNow(-10), expectedDate: daysFromNow(-6), status: 'Collected', items: [{ type: 'Kurtas', quantity: 2 }, { type: 'Trousers', quantity: 2 }], notes: '' },
  ],
  notifications: [
    { id: 'n1', studentId: 's001', title: 'Laundry is ready', message: 'Your bedsheets and towels are ready to collect.', createdAt: daysFromNow(0), read: false, requestId: 'r102' },
    { id: 'n2', studentId: 's001', title: 'Laundry received', message: 'Your laundry has been checked in and is in the queue.', createdAt: daysFromNow(-1), read: true, requestId: 'r101' },
    { id: 'n3', studentId: 's002', title: 'Laundry received', message: 'Your laundry has been checked in and is in the queue.', createdAt: daysFromNow(0), read: false, requestId: 'r103' },
  ],
  complaints: [
    { id: 'c1', studentId: 's003', requestId: 'r107', token: 'WL-24037', category: 'Missing item', description: 'One white kurta was not in the collection bag.', status: 'Open', createdAt: daysFromNow(-1) },
  ],
  schedules: [
    { id: 'sch1', day: 'Monday – Friday', time: '8:00 AM – 10:00 AM', location: 'Laundry room · Ground floor', note: 'Morning drop-off' },
    { id: 'sch2', day: 'Monday – Saturday', time: '4:00 PM – 7:00 PM', location: 'Laundry room · Ground floor', note: 'Collection window' },
  ],
}
