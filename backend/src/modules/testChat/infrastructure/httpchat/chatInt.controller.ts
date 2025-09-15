import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QuestionResponse } from './dtoChat/question-response';
import { ChatAnswer } from './dtoChat/generate-advice';
import { DsService } from 'src/modules/reinforcement/infrastructure/ds.service';

interface CoachingResponse {
  generated_question: string;
  user_response: string;
  coaching_advice: string;
}

@Controller('chatint')
export class ChatIntController {
  constructor(private readonly dsService: DsService) {}

  // Get a new question
  @Get('question')
  async generateQuestion(
    @Query('topico') topico: string,
  ): Promise<QuestionResponse> {
    return this.dsService.generateQuestion(topico);
  }

  // Get advice for an answer
  @Post('advice')
  async generateAdvice(
    @Body() chatAnswer: ChatAnswer,
  ): Promise<CoachingResponse> {
    console.log('answer:', chatAnswer);
    const respDs = await this.dsService.generateAdvise(
      chatAnswer.question,
      chatAnswer.answer,
      chatAnswer.topic,
    );
    return respDs;
  }
}
