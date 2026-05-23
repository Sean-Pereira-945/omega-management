import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'dev-secret'

export const hashPassword = async (password) => bcrypt.hash(password, 12)
export const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' })

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header' })
  }

  const token = header.replace('Bearer ', '')
  try {
    req.user = jwt.verify(token, jwtSecret)
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
