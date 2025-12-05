import { AiService } from './ai.service';
import { SecretForAnalysisDto, AnalyzeRequestDto } from './dto/ai.dto';
export declare class AiController {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService);
    analyzeSecrets(request: AnalyzeRequestDto): Promise<{
        success: boolean;
        results: {
            secret: SecretForAnalysisDto;
            classification: import("./ai.service").ClassificationResult;
            explanation: import("./ai.service").ExplanationResult;
        }[];
        aiProvider: string;
    }>;
    classifySecret(secret: SecretForAnalysisDto): Promise<import("./ai.service").ClassificationResult>;
    explainSecret(secret: SecretForAnalysisDto): Promise<import("./ai.service").ExplanationResult>;
    getStatus(): {
        message: string;
        provider: string;
        available: boolean;
    };
}
