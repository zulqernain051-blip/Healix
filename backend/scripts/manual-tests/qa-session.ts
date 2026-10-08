import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/common/config/database';
import { config } from '../../src/common/config';

/** Fixture sessions exercise the production guard, and exist only in the isolated test schema. */
const tokens = new Map<string, Promise<string>>();
export function qaToken(user: { id: string; role: string }): Promise<string> {
  require('../dev/jest-isolation.cjs');
  if (!tokens.has(user.id)) tokens.set(user.id, prisma.session.create({ data: {
    userId: user.id, refreshTokenHash: randomUUID(), expiresAt: new Date(Date.now() + 3600000),
  } }).then(session => jwt.sign({ id: user.id, role: user.role, sid: session.id }, config.JWT_SECRET, { expiresIn: '1h' })));
  return tokens.get(user.id)!;
}
