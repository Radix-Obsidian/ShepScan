import { ConfigService } from '@nestjs/config';
export interface ClassificationResult {
    isRealSecret: boolean;
    confidence: number;
    secretType: string;
    reasoning: string;
}
export interface ExplanationResult {
    summary: string;
    risk: string;
    impact: string;
    remediation: string[];
    urgency: 'immediate' | 'high' | 'medium' | 'low';
}
export interface SecretForAnalysis {
    snippet: string;
    filePath: string;
    lineNumber: number;
    secretType: string;
    severity: string;
}
export declare class AiService {
    private config;
    private readonly logger;
    private openai;
    private anthropic;
    private provider;
    constructor(config: ConfigService);
    private initializeProviders;
    classifySecret(secret: SecretForAnalysis): Promise<ClassificationResult>;
    explainSecret(secret: SecretForAnalysis): Promise<ExplanationResult>;
    analyzeSecrets(secrets: SecretForAnalysis[]): Promise<{
        classifications: ClassificationResult[];
        explanations: ExplanationResult[];
    }>;
    private buildClassificationPrompt;
    private buildExplanationPrompt;
    private callLLM;
    private parseClassificationResponse;
    private parseExplanationResponse;
    private fallbackClassification;
    private fallbackExplanation;
    private mapSeverityToUrgency;
    getStatus(): {
        provider: string;
        available: boolean;
    };
}
