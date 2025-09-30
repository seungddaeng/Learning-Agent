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

  async generateQuestion(): Promise<GeneratedQuestion> {
    if (!this.deepseek)
      return {
        text: 'Genera una pregunta sobre algoritmos de programación, de opción múltiple',
      };
    
    const resp = await this.deepseek.complete(
      'Genera una pregunta sobre algoritmos de programación, de opción múltiple',
      { model: { provider: 'deepseek', name: 'deepseek-chat' } },
    );
    
    const text = resp?.text?.toString().trim() ?? 
      'Pregunta sobre algoritmos de programación, de opción múltiple';
    
    return { text };
  }

  async generateTrueFalseQuestion(): Promise<GeneratedQuestion> {
    if (!this.deepseek)
      return {
        text: 'El algoritmo de Quicksort siempre es estable. (Verdadero o Falso)',
      };
    
    const resp = await this.deepseek.complete(
      'Genera una pregunta de verdadero o falso sobre algoritmos de programación',
      { model: { provider: 'deepseek', name: 'deepseek-chat' } },
    );
    
    const text = resp?.text?.toString().trim() ?? 
      'Pregunta de verdadero o falso sobre algoritmos de programación';
    
    return { text };
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

        const lines = candidate
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map(this.normalizeLine);

        if (lines.length >= 4) {
          return {
            options: lines.slice(0, 4),
            correctIndex: null,
            confidence: null,
          };
        }

        const pieces = candidate
          .split(/;|\/|\||\t/)
          .map((p) => p.trim())
          .filter(Boolean);
          
        if (pieces.length >= 4) {
          return {
            options: pieces.slice(0, 4),
            correctIndex: null,
            confidence: null,
          };
        }

      } catch (err) {
        continue;
      }
    }
    
    return fallback;
  }
}