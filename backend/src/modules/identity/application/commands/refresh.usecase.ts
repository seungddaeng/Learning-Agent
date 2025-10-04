import { Inject, Injectable } from '@nestjs/common';
import type { SessionRepositoryPort } from '../../domain/ports/session.repository.port';
import type { TokenServicePort } from '../../domain/ports/token-service.port';
import type { TokenExpirationService } from '../../domain/services/token-expiration.service';
import { SESSION_REPO, TOKEN_SERVICE, TOKEN_EXPIRATION_SERVICE } from '../../tokens';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(SESSION_REPO) private readonly sessions: SessionRepositoryPort,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenServicePort,
    @Inject(TOKEN_EXPIRATION_SERVICE) private readonly tokenExpiration: TokenExpirationService,
  ) {}

  async execute(input: { refreshToken: string }) {
    // 1) verifica firma y expiración
    const payload = this.tokens.verifyRefresh(input.refreshToken);

    // 2) busca la sesión en DB
    const session = await this.sessions.findByRefreshToken(input.refreshToken);
    if (
      !session ||
      session.userId !== payload.sub ||
      session.expiresAt < new Date()
    ) {
      throw new Error('Invalid session');
    }

    // 3) rota tokens (revoca sesión vieja y crea una nueva)
    await this.sessions.revokeById(session.id);

    const newAccess = this.tokens.signAccess({
      sub: payload.sub,
      email: payload.email,
    });
    const newRefresh = this.tokens.signRefresh({
      sub: payload.sub,
      email: payload.email,
    });

    const refreshTTL = process.env.JWT_REFRESH_TTL || '7d';
    const { expiresAt } = this.tokenExpiration.calculateExpiration(refreshTTL);

    await this.sessions.createSession({
      userId: payload.sub,
      token: newAccess,
      refreshToken: newRefresh,
      expiresAt,
    });

    return { accessToken: newAccess, refreshToken: newRefresh };
  }
}