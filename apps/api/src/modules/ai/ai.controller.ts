import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize text' })
  summarize(@Body('text') text: string) {
    return this.aiService.summarize(text);
  }

  @Post('generate-quote')
  @ApiOperation({ summary: 'Generate quote from opportunity data' })
  generateQuote(@Body() opportunityData: any) {
    return this.aiService.generateQuote(opportunityData);
  }

  @Post('classify-lead')
  @ApiOperation({ summary: 'Classify lead quality/tier' })
  classifyLead(@Body() leadData: any) {
    return this.aiService.classifyLead(leadData);
  }

  @Post('predict-close')
  @ApiOperation({ summary: 'Predict close probability' })
  predictClose(@Body() opportunityData: any) {
    return this.aiService.predictClose(opportunityData);
  }

  @Post('suggest-next-action')
  @ApiOperation({ summary: 'Suggest next action for opportunity' })
  suggestNextAction(@Body() opportunityData: any) {
    return this.aiService.suggestNextAction(opportunityData);
  }

  @Post('analyze-Materialivity')
  @ApiOperation({ summary: 'Analyze user Materialivity' })
  analyzeMaterialivity(@Body() userData: any) {
    return this.aiService.analyzeMaterialivity(userData);
  }

  @Post('generate-email')
  @ApiOperation({ summary: 'Generate email draft' })
  generateEmail(@Body() emailContext: any) {
    return this.aiService.generateEmail(emailContext);
  }

  @Post('search-construction-prices')
  @ApiOperation({ summary: 'Search construction prices using Grok AI' })
  searchConstructionPrices(@Body('query') query: string) {
    return this.aiService.searchConstructionPrices(query);
  }
}
