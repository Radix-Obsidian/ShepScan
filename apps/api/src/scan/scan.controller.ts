import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ScanService, ScanResponse } from './scan.service';
import { ScanRequestDto } from './dto/scan.dto';

@Controller('scan')
export class ScanController {
    private readonly logger = new Logger(ScanController.name);

    constructor(private readonly scanService: ScanService) { }

    /**
     * POST /scan
     * Trigger a manual scan of a GitHub repository
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async scanRepository(@Body() request: ScanRequestDto) {
        this.logger.log(`Scan requested for: ${request.repoUrl}`);
        return this.scanService.scanRepository(request);
    }

    /**
     * GET /scan/quick?url=...
     * Quick scan endpoint for GET requests (useful for testing)
     */
    @Get('quick')
    async quickScan(@Query('url') url: string): Promise<ScanResponse> {
        if (!url) {
            return {
                success: false,
                repoUrl: '',
                repoName: '',
                scannedAt: new Date().toISOString(),
                scanDurationMs: 0,
                totalFiles: 0,
                totalSecrets: 0,
                overallSeverity: 'none',
                secrets: [],
                error: 'URL query parameter is required',
            };
        }

        this.logger.log(`Quick scan requested for: ${url}`);
        return this.scanService.scanRepository({ repoUrl: url });
    }

    /**
     * GET /scan/health
     * Health check endpoint for the scan service
     */
    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'ShepScan Secret Detection Engine',
            version: '1.0.0',
            patterns: 13, // Number of secret patterns
            timestamp: new Date().toISOString(),
        };
    }
}
