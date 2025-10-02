import { Inject, Injectable } from '@nestjs/common';
import type { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import type { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import type { TokenServicePort } from '../../domain/ports/token-service.port';
import { HASHER, SESSION_REPO, TOKEN_SERVICE, USER_REPO } from '../../tokens';
import type { SessionRepositoryPort } from '../../domain/ports/session.repository.port';
import { JwtPayload } from 'jsonwebtoken';
import {
  InvalidCredentialsError,
  InactiveUserError,
} from '../../domain/exceptions/auth.exceptions';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPO) private readonly users: UserRepositoryPort,
    @Inject(HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenServicePort,
    @Inject(SESSION_REPO) private readonly sessions: SessionRepositoryPort,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }) {
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new InvalidCredentialsError();
    }

    await this.sessions.revokeAll(user.id);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.tokens.signAccess(payload); // TTL corto (ej: 15m)
    const refreshToken = this.tokens.signRefresh(payload);

    const expiresAt = this.addTTLToDate(process.env.JWT_REFRESH_TTL || '7d');
    await this.sessions.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
      ipAddress: input.ip,
      userAgent: input.userAgent,
    });

    return { accessToken, refreshToken };
  }

  private addTTLToDate(ttl: string): Date {
    const num = parseInt(ttl, 10);
    const unit = ttl.replace(String(num), '');
    const d = new Date();
    const map: Record<string, number> = { m: 60000, h: 3600000, d: 86400000 };
    d.setTime(d.getTime() + num * (map[unit] ?? 0));
    return d;
  }
}
