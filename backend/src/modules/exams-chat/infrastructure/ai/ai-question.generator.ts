import { Injectable, Inject } from '@nestjs/common';
import type { LlmPort } from '../../../llm/domain/ports/llm.port';
import { LLM_PORT } from '../../../llm/tokens';

export type GeneratedOptions = {
  options: string[];
  correctIndex: number | null;
  confidence: number | null;
};

export type GeneratedQuestion = {
  text: string;
};

@Injectable()
export class AIQuestionGenerator {
  constructor(@Inject(LLM_PORT) private readonly deepseek?: LlmPort) {}

  private normalizeLine(l: string) {
    return l.replace(/^[\d\)\.\-\s]+/, '').trim();
  }

  private parseCandidate(candidate: string): string[] | null {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed.length >= 4) return parsed.slice(0, 4).map(String);
      if (parsed && Array.isArray((parsed as any).options)) return (parsed as any).options.slice(0, 4).map(String);
    } catch (_) {}
    const lines = candidate.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(this.normalizeLine);
    if (lines.length >= 4) return lines.slice(0, 4);
    const pieces = candidate.split(/;|\/|\||\t/).map(p => p.trim()).filter(Boolean);
    if (pieces.length >= 4) return pieces.slice(0, 4);
    return null;
  }

  async generateQuestion(prompt?: string): Promise<GeneratedQuestion> {
    const textPrompt = prompt ?? 'Genera una pregunta sobre algoritmos de programación, de opción múltiple';
    if (!this.deepseek) return { text: textPrompt };
    const resp = await this.deepseek.complete(textPrompt, { model: { provider: 'deepseek', name: 'deepseek-chat' } });
    return { text: resp?.text ?? textPrompt };
  }

  async generateOptions(questionText: string): Promise<GeneratedOptions> {
    if (!questionText?.trim()) throw new Error('Text required');
    const fallback: GeneratedOptions = {
      options: [
        `${questionText} — opción A`,
        `${questionText} — opción B`,
        `${questionText} — opción C`,
        `${questionText} — opción D`,
      ],
      correctIndex: null,
      confidence: null,
    };
    if (!this.deepseek) return fallback;
    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const resp = await this.deepseek.complete(
          `Genera 4 opciones distintas para esta pregunta: "${questionText}"`,
          { model: { provider: 'deepseek', name: 'deepseek-chat' } },
        );
        const candidate = (resp?.text ?? '').toString().trim();
        if (!candidate) continue;
        const parsed = this.parseCandidate(candidate);
        if (parsed && parsed.length >= 4) return { options: parsed.slice(0, 4), correctIndex: null, confidence: null };
      } catch (_) {}
    }
    return fallback;
  }
}
