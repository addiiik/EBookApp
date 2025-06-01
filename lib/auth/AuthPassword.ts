import bcrypt from 'bcryptjs';

export async function comparePasswords(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
