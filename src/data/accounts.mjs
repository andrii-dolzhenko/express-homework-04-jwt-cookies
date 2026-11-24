// Educational in-memory store: not shared with sample /users data.
// Values contain bcrypt hashes, never plaintext passwords.
export const accounts = new Map()
