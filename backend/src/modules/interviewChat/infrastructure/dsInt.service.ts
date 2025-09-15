import { PROMPT_TEMPLATE_PORT } from 'src/modules/prompt-template/tokens';
import type { PromptTemplatePort } from 'src/modules/prompt-template/domain/ports/prompt-template.port';
import { Inject, Injectable } from '@nestjs/common';
import type { LlmPort } from 'src/modules/llm/domain/ports/llm.port';
import { LLM_PORT } from 'src/modules/llm/tokens';
import {
  MultipleSelectionResponse,
  DoubleOptionResponse,
} from 'src/modules/reinforcement/infrastructure/http/dto/response';

@Injectable()
export class DsIntService {
  constructor(
    @Inject(LLM_PORT) private readonly llm: LlmPort,
    @Inject(PROMPT_TEMPLATE_PORT)
    private readonly promptTemplatePort: PromptTemplatePort,
  ) {}
  async generateMultipleSelection(
    topico: string,
  ): Promise<MultipleSelectionResponse> {
    try {
      const vars: Record<string, string> = {
        topico: topico,
      };
      const prompt = await this.promptTemplatePort.render(
        'interview.multipleSelection.v1',
        vars,
      );
      const resp = await this.llm.complete(prompt, {
        model: { provider: 'deepseek', name: 'deepseek-chat' },
        temperature: 0.7,
        metadata: {
          response_format: 'json_object',
        },
        maxTokens: 1000,
      });
      const responseContent = resp.text;
      console.log('responseContent:', responseContent);
      if (!responseContent) {
        throw new Error('No response from AI');
      }
      const response = JSON.parse(responseContent) as MultipleSelectionResponse;
      return response;
    } catch (error) {
      console.error('OpenAI Error in generateMultipleSelection:', error);
      throw new Error('Error generating multiple selection and question');
    }
  }
  async generatedoubleOption(topico: string): Promise<DoubleOptionResponse> {
    try {
      const vars: Record<string, string> = {
        topico: topico,
      };
      const prompt = await this.promptTemplatePort.render(
        'interview.doubleOption.v1',
        vars,
      );
      const resp = await this.llm.complete(prompt, {
        model: { provider: 'deepseek', name: 'deepseek-chat' },
        temperature: 0.7,
        metadata: {
          response_format: 'json_object',
        },
        maxTokens: 1000,
      });
      const responseContent = resp.text;
      console.log('responseContent:', responseContent);
      if (!responseContent) {
        throw new Error('No response from AI');
      }
      const responseDO = JSON.parse(responseContent) as DoubleOptionResponse;
      return responseDO;
    } catch (error) {
      console.error('OpenAI Error in generateMultipleSelection:', error);
      throw new Error('Error generating multiple selection and question');
    }
  }
}
