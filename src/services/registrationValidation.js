const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email.trim())
}

export function validateRegistration({ name, email, hostel, roomNumber, password, confirmPassword }) {
  if (![name, email, hostel, roomNumber, password, confirmPassword].every((value) => value.trim())) {
    return 'Please complete every field.'
  }
  if (!isValidEmail(email)) return 'Enter a valid campus email address.'
  if (!PASSWORD_PATTERN.test(password)) {
    return 'Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a symbol.'
  }
  if (password !== confirmPassword) return 'Passwords do not match. Please try again.'
  return ''
}
