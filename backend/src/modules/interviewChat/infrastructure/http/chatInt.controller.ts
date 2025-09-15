import { Controller, Get, Query } from '@nestjs/common';
import {
  DoubleOptionResponse,
  MultipleSelectionResponse,
} from 'src/modules/reinforcement/infrastructure/http/dto/response';
import { DsIntService } from '../dsInt.service';

// interface CoachingResponse {
//   generated_question: string;
//   user_response: string;
//   coaching_advice: string;
// }

@Controller('chatint')
export class ChatIntController {
  constructor(private readonly dsService: DsIntService) {}
  @Get('multipleSelection')
  async generateMultipleSelection(
    @Query('topico') topico: string,
  ): Promise<MultipleSelectionResponse> {
    return await this.dsService.generateMultipleSelection(topico);
  }
  @Get('doubleOption')
  async generateDoubleOption(
    @Query('topico') topico: string,
  ): Promise<DoubleOptionResponse> {
    return await this.dsService.generatedoubleOption(topico);
  }
}
