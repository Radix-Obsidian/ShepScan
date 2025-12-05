import { ScanService, ScanResponse } from './scan.service';
import { ScanRequestDto } from './dto/scan.dto';
export declare class ScanController {
    private readonly scanService;
    private readonly logger;
    constructor(scanService: ScanService);
    scanRepository(request: ScanRequestDto): Promise<ScanResponse>;
    quickScan(url: string): Promise<ScanResponse>;
    health(): {
        status: string;
        service: string;
        version: string;
        patterns: number;
        timestamp: string;
    };
}
