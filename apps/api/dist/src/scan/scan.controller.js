"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ScanController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanController = void 0;
const common_1 = require("@nestjs/common");
const scan_service_1 = require("./scan.service");
const scan_dto_1 = require("./dto/scan.dto");
let ScanController = ScanController_1 = class ScanController {
    scanService;
    logger = new common_1.Logger(ScanController_1.name);
    constructor(scanService) {
        this.scanService = scanService;
    }
    async scanRepository(request) {
        this.logger.log(`Scan requested for: ${request.repoUrl}`);
        return this.scanService.scanRepository(request);
    }
    async quickScan(url) {
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
    health() {
        return {
            status: 'ok',
            service: 'ShepScan Secret Detection Engine',
            version: '1.0.0',
            patterns: 13,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ScanController = ScanController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_dto_1.ScanRequestDto]),
    __metadata("design:returntype", Promise)
], ScanController.prototype, "scanRepository", null);
__decorate([
    (0, common_1.Get)('quick'),
    __param(0, (0, common_1.Query)('url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScanController.prototype, "quickScan", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScanController.prototype, "health", null);
exports.ScanController = ScanController = ScanController_1 = __decorate([
    (0, common_1.Controller)('scan'),
    __metadata("design:paramtypes", [scan_service_1.ScanService])
], ScanController);
//# sourceMappingURL=scan.controller.js.map