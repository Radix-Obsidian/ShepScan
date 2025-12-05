import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface ClassificationResult {
    isRealSecret: boolean;
    confidence: number; // 0-1
    secretType: string;
    reasoning: string;
}

export interface ExplanationResult {
    summary: string;           // One-line summary for founders
    risk: string;              // What could go wrong
    impact: string;            // Business impact
    remediation: string[];     // Steps to fix
    urgency: 'immediate' | 'high' | 'medium' | 'low';
}

export interface SecretForAnalysis {
    snippet: string;
    filePath: string;
    lineNumber: number;
    secretType: string;
    severity: string;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private openai: OpenAI | null = null;
    private anthropic: Anthropic | null = null;
    private provider: 'openai' | 'anthropic' | 'none' = 'none';

    constructor(private config: ConfigService) {
        this.initializeProviders();
    }

    private initializeProviders() {
        const openaiKey = this.config.get<string>('OPENAI_API_KEY');
        const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');

        if (anthropicKey) {
            this.anthropic = new Anthropic({ apiKey: anthropicKey });
            this.provider = 'anthropic';
            this.logger.log('AI Provider: Anthropic Claude initialized');
        } else if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey });
            this.provider = 'openai';
            this.logger.log('AI Provider: OpenAI initialized');
        } else {
            this.logger.warn('No AI API keys configured. AI features will use fallback mode.');
            this.provider = 'none';
        }
    }

    /**
     * Classify whether a detected pattern is a real secret or false positive
     */
    async classifySecret(secret: SecretForAnalysis): Promise<ClassificationResult> {
        const prompt = this.buildClassificationPrompt(secret);

        if (this.provider === 'none') {
            return this.fallbackClassification(secret);
        }

        try {
            const response = await this.callLLM(prompt, 'classification');
            return this.parseClassificationResponse(response, secret);
        } catch (error) {
            this.logger.error(`AI classification failed: ${error.message}`);
            return this.fallbackClassification(secret);
        }
    }

    /**
     * Generate a plain-English explanation of the secret for founders
     */
    async explainSecret(secret: SecretForAnalysis): Promise<ExplanationResult> {
        const prompt = this.buildExplanationPrompt(secret);

        if (this.provider === 'none') {
            return this.fallbackExplanation(secret);
        }

        try {
            const response = await this.callLLM(prompt, 'explanation');
            return this.parseExplanationResponse(response, secret);
        } catch (error) {
            this.logger.error(`AI explanation failed: ${error.message}`);
            return this.fallbackExplanation(secret);
        }
    }

    /**
     * Batch analyze multiple secrets for efficiency
     */
    async analyzeSecrets(secrets: SecretForAnalysis[]): Promise<{
        classifications: ClassificationResult[];
        explanations: ExplanationResult[];
    }> {
        const results = await Promise.all(
            secrets.map(async (secret) => {
                const [classification, explanation] = await Promise.all([
                    this.classifySecret(secret),
                    this.explainSecret(secret),
                ]);
                return { classification, explanation };
            })
        );

        return {
            classifications: results.map(r => r.classification),
            explanations: results.map(r => r.explanation),
        };
    }

    private buildClassificationPrompt(secret: SecretForAnalysis): string {
        return `You are a security expert analyzing potential secrets found in code repositories.

Analyze this potential secret and determine if it's a REAL leaked credential or a FALSE POSITIVE.

File: ${secret.filePath}
Line: ${secret.lineNumber}
Detected Type: ${secret.secretType}
Code Snippet: ${secret.snippet}

Consider:
1. Is this a placeholder/example value (like "your-api-key-here", "xxx", "test123")?
2. Is this in documentation showing example usage?
3. Does this look like a real credential format for ${secret.secretType}?
4. Is this a hash, UUID, or non-secret identifier?

Respond in JSON format ONLY:
{
  "isRealSecret": true/false,
  "confidence": 0.0-1.0,
  "secretType": "confirmed type or 'false_positive'",
  "reasoning": "brief explanation"
}`;
    }

    private buildExplanationPrompt(secret: SecretForAnalysis): string {
        return `You are a security advisor explaining a leaked secret to a non-technical founder.

Explain this security issue in plain English:

Secret Type: ${secret.secretType}
File: ${secret.filePath}
Severity: ${secret.severity}
Code Context: ${secret.snippet}

Provide a founder-friendly explanation. Respond in JSON format ONLY:
{
  "summary": "One sentence explaining what was found",
  "risk": "What bad things could happen if exploited",
  "impact": "Business impact (money, reputation, data)",
  "remediation": ["Step 1", "Step 2", "Step 3"],
  "urgency": "immediate|high|medium|low"
}`;
    }

    private async callLLM(prompt: string, type: 'classification' | 'explanation'): Promise<string> {
        if (this.provider === 'anthropic' && this.anthropic) {
            const message = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }],
            });
            const content = message.content[0];
            if (content.type === 'text') {
                return content.text;
            }
            throw new Error('Unexpected response type from Anthropic');
        }

        if (this.provider === 'openai' && this.openai) {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.1,
            });
            return completion.choices[0]?.message?.content || '';
        }

        throw new Error('No AI provider available');
    }

    private parseClassificationResponse(response: string, secret: SecretForAnalysis): ClassificationResult {
        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                isRealSecret: Boolean(parsed.isRealSecret),
                confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
                secretType: parsed.secretType || secret.secretType,
                reasoning: parsed.reasoning || 'AI analysis complete',
            };
        } catch (error) {
            this.logger.warn(`Failed to parse classification response: ${error.message}`);
            return this.fallbackClassification(secret);
        }
    }

    private parseExplanationResponse(response: string, secret: SecretForAnalysis): ExplanationResult {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                summary: parsed.summary || `${secret.secretType} detected in ${secret.filePath}`,
                risk: parsed.risk || 'Unauthorized access to connected services',
                impact: parsed.impact || 'Potential security breach and data exposure',
                remediation: Array.isArray(parsed.remediation) ? parsed.remediation : [
                    'Rotate the exposed credential immediately',
                    'Review git history for exposure duration',
                    'Check for unauthorized access in service logs',
                ],
                urgency: ['immediate', 'high', 'medium', 'low'].includes(parsed.urgency) 
                    ? parsed.urgency 
                    : this.mapSeverityToUrgency(secret.severity),
            };
        } catch (error) {
            this.logger.warn(`Failed to parse explanation response: ${error.message}`);
            return this.fallbackExplanation(secret);
        }
    }

    private fallbackClassification(secret: SecretForAnalysis): ClassificationResult {
        // Smart fallback using pattern analysis
        const snippet = secret.snippet.toLowerCase();
        const isFalsePositive = 
            snippet.includes('example') ||
            snippet.includes('your-') ||
            snippet.includes('xxx') ||
            snippet.includes('placeholder') ||
            snippet.includes('test') ||
            snippet.includes('<') && snippet.includes('>');

        return {
            isRealSecret: !isFalsePositive,
            confidence: isFalsePositive ? 0.7 : 0.6,
            secretType: secret.secretType,
            reasoning: isFalsePositive 
                ? 'Pattern suggests placeholder or example value'
                : 'Pattern matches known credential format - manual review recommended',
        };
    }

    private fallbackExplanation(secret: SecretForAnalysis): ExplanationResult {
        const explanations: Record<string, ExplanationResult> = {
            'AWS_ACCESS_KEY': {
                summary: 'An AWS access key was found that could grant access to your cloud infrastructure.',
                risk: 'Attackers could access your AWS account, spin up resources, access S3 buckets, or steal data.',
                impact: 'Financial charges from unauthorized resource usage, data breach, service disruption.',
                remediation: [
                    'Immediately deactivate this key in AWS IAM console',
                    'Create a new key pair and update your applications',
                    'Review CloudTrail logs for unauthorized access',
                    'Enable MFA on your AWS root account',
                ],
                urgency: 'immediate',
            },
            'AWS_SECRET_KEY': {
                summary: 'An AWS secret key was found - this is the password half of AWS credentials.',
                risk: 'Combined with an access key, this grants full programmatic access to AWS services.',
                impact: 'Complete AWS account compromise, potential for massive financial damage.',
                remediation: [
                    'Rotate the associated access key immediately',
                    'Check for any access keys that match this secret',
                    'Review and restrict IAM permissions',
                    'Consider using AWS Secrets Manager for credential storage',
                ],
                urgency: 'immediate',
            },
            'GITHUB_TOKEN': {
                summary: 'A GitHub personal access token was found in your code.',
                risk: 'Attackers could access private repositories, modify code, or impersonate the token owner.',
                impact: 'Source code theft, supply chain attacks, unauthorized commits.',
                remediation: [
                    'Revoke this token in GitHub Settings > Developer settings',
                    'Create a new token with minimal required permissions',
                    'Use GitHub Apps or deploy keys instead of PATs where possible',
                ],
                urgency: 'immediate',
            },
            'STRIPE_SECRET': {
                summary: 'A Stripe API key was found that could access your payment processing.',
                risk: 'Attackers could view customer payment data, create refunds, or access financial records.',
                impact: 'Financial fraud, PCI compliance violation, customer data breach.',
                remediation: [
                    'Roll the API key in Stripe Dashboard immediately',
                    'Review recent Stripe activity for unauthorized actions',
                    'Implement restricted API keys for specific use cases',
                ],
                urgency: 'immediate',
            },
            'DATABASE_URL': {
                summary: 'Database connection credentials were found, including host, username, and password.',
                risk: 'Direct database access could allow data theft, modification, or deletion.',
                impact: 'Complete data breach, regulatory penalties (GDPR, HIPAA), business disruption.',
                remediation: [
                    'Change database password immediately',
                    'Restrict database access to specific IPs/VPCs',
                    'Review database access logs',
                    'Consider using IAM database authentication',
                ],
                urgency: 'immediate',
            },
            'PRIVATE_KEY': {
                summary: 'A private cryptographic key was found in your repository.',
                risk: 'Private keys are used for authentication and encryption - exposure compromises both.',
                impact: 'Server impersonation, man-in-the-middle attacks, decryption of sensitive data.',
                remediation: [
                    'Generate a new key pair immediately',
                    'Revoke/replace certificates using the old key',
                    'Audit systems using this key for unauthorized access',
                ],
                urgency: 'immediate',
            },
        };

        // Find matching explanation or use generic
        const matchedKey = Object.keys(explanations).find(key => 
            secret.secretType.toUpperCase().includes(key) || key.includes(secret.secretType.toUpperCase())
        );

        if (matchedKey) {
            return explanations[matchedKey];
        }

        // Generic explanation
        return {
            summary: `A potential ${secret.secretType.replace(/_/g, ' ').toLowerCase()} was detected in your code.`,
            risk: 'Exposed credentials could allow unauthorized access to connected services.',
            impact: 'Security breach, data exposure, potential financial and reputational damage.',
            remediation: [
                'Identify what service this credential belongs to',
                'Rotate or revoke the credential immediately',
                'Update your application with new credentials',
                'Store sensitive values in environment variables or a secrets manager',
            ],
            urgency: this.mapSeverityToUrgency(secret.severity),
        };
    }

    private mapSeverityToUrgency(severity: string): 'immediate' | 'high' | 'medium' | 'low' {
        switch (severity.toLowerCase()) {
            case 'critical': return 'immediate';
            case 'high': return 'high';
            case 'medium': return 'medium';
            default: return 'low';
        }
    }

    /**
     * Check if AI services are available
     */
    getStatus(): { provider: string; available: boolean } {
        return {
            provider: this.provider,
            available: this.provider !== 'none',
        };
    }
}
