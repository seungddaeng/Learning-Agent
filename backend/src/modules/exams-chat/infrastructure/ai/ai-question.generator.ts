import { Injectable, Inject } from '@nestjs/common';
import type { DeepseekPort } from 'src/modules/deepseek/domain/ports/deepseek.port';
import { DEEPSEEK_PORT } from 'src/modules/deepseek/tokens';

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
  constructor(@Inject(DEEPSEEK_PORT) private readonly deepseek?: DeepseekPort) {}

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
    const resp: any = await this.deepseek.generateQuestion(textPrompt);
    return { text: resp?.question ?? resp?.questionText ?? textPrompt };
  }

  async generateOptions(questionText: string): Promise<GeneratedOptions> {
    if (!questionText?.trim()) throw new Error('Text required');
    const fallback: GeneratedOptions = {
      options: [`${questionText} — opción A`, `${questionText} — opción B`, `${questionText} — opción C`, `${questionText} — opción D`],
      correctIndex: null,
      confidence: null,
    };
    if (!this.deepseek) return fallback;
    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const resp: any = await this.deepseek.generateResponse(`Genera 4 opciones distintas para esta pregunta: "${questionText}"`);
        const candidate = (resp?.answer ?? resp?.explanatio ?? '').toString().trim();
        if (!candidate) continue;
        const parsed = this.parseCandidate(candidate);
        if (parsed && parsed.length >= 4) return { options: parsed.slice(0, 4), correctIndex: null, confidence: null };
      } catch (_) {}
    }
    return fallback;
  }
}
