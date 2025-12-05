import {
    Controller,
    Post,
    Get,
    Body,
    Logger,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { SecretForAnalysisDto, AnalyzeRequestDto } from './dto/ai.dto';

@Controller('ai')
export class AiController {
    private readonly logger = new Logger(AiController.name);

    constructor(private readonly aiService: AiService) { }

    /**
     * POST /ai/analyze
     * Analyze secrets with AI classification and explanation
     */
    @Post('analyze')
    async analyzeSecrets(@Body() request: AnalyzeRequestDto) {
        this.logger.log(`Analyzing ${request.secrets.length} secrets with AI`);

        const { classifications, explanations } = await this.aiService.analyzeSecrets(request.secrets);

        const results = request.secrets.map((secret, index) => ({
            secret,
            classification: classifications[index],
            explanation: explanations[index],
        }));

        return {
            success: true,
            results,
            aiProvider: this.aiService.getStatus().provider,
        };
    }

    /**
     * POST /ai/classify
     * Classify a single secret as real or false positive
     */
    @Post('classify')
    async classifySecret(@Body() secret: SecretForAnalysisDto) {
        this.logger.log(`Classifying secret: ${secret.secretType} in ${secret.filePath}`);
        return this.aiService.classifySecret(secret);
    }

    /**
     * POST /ai/explain
     * Get a founder-friendly explanation of a secret
     */
    @Post('explain')
    async explainSecret(@Body() secret: SecretForAnalysisDto) {
        this.logger.log(`Explaining secret: ${secret.secretType} in ${secret.filePath}`);
        return this.aiService.explainSecret(secret);
    }

    /**
     * GET /ai/status
     * Check AI service status and provider
     */
    @Get('status')
    getStatus() {
        const status = this.aiService.getStatus();
        return {
            ...status,
            message: status.available 
                ? `AI powered by ${status.provider}` 
                : 'AI running in fallback mode (no API key configured)',
        };
    }
}
