"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var SecretDetectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretDetectorService = void 0;
const common_1 = require("@nestjs/common");
const secret_patterns_1 = require("./secret-patterns");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let SecretDetectorService = SecretDetectorService_1 = class SecretDetectorService {
    logger = new common_1.Logger(SecretDetectorService_1.name);
    async scanDirectory(dirPath, repoUrl) {
        const startTime = Date.now();
        const secrets = [];
        let totalFiles = 0;
        const files = await this.getFilesToScan(dirPath);
        totalFiles = files.length;
        this.logger.log(`Scanning ${totalFiles} files in ${dirPath}`);
        for (const file of files) {
            try {
                const fileSecrets = await this.scanFile(file, dirPath);
                secrets.push(...fileSecrets);
            }
            catch (error) {
                this.logger.warn(`Failed to scan file ${file}: ${error.message}`);
            }
        }
        const scanDurationMs = Date.now() - startTime;
        this.logger.log(`Scan complete: ${secrets.length} secrets found in ${totalFiles} files (${scanDurationMs}ms)`);
        return {
            repoUrl,
            scannedAt: new Date(),
            totalFiles,
            totalSecrets: secrets.length,
            secrets,
            scanDurationMs,
        };
    }
    async getFilesToScan(dirPath) {
        const files = [];
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                if (!secret_patterns_1.SKIP_DIRECTORIES.has(entry.name)) {
                    const subFiles = await this.getFilesToScan(fullPath);
                    files.push(...subFiles);
                }
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (!secret_patterns_1.SKIP_EXTENSIONS.has(ext)) {
                    try {
                        const stats = await fs.stat(fullPath);
                        if (stats.size <= secret_patterns_1.MAX_FILE_SIZE) {
                            files.push(fullPath);
                        }
                    }
                    catch {
                    }
                }
            }
        }
        return files;
    }
    async scanFile(filePath, basePath) {
        const secrets = [];
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = path.relative(basePath, filePath);
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNumber = lineIndex + 1;
            for (const pattern of secret_patterns_1.SECRET_PATTERNS) {
                pattern.regex.lastIndex = 0;
                let match;
                while ((match = pattern.regex.exec(line)) !== null) {
                    const snippet = this.createRedactedSnippet(line, match[0]);
                    const isDuplicate = secrets.some((s) => s.filePath === relativePath &&
                        s.lineNumber === lineNumber &&
                        s.secretType === pattern.type);
                    if (!isDuplicate) {
                        secrets.push({
                            filePath: relativePath,
                            lineNumber,
                            secretType: pattern.type,
                            secretName: pattern.name,
                            severity: pattern.severity,
                            description: pattern.description,
                            snippet,
                            matchedPattern: pattern.name,
                        });
                    }
                }
            }
        }
        return secrets;
    }
    createRedactedSnippet(line, secret) {
        const maxLength = 100;
        let redactedLine = line;
        if (secret.length > 8) {
            const redacted = `${secret.slice(0, 2)}${'*'.repeat(Math.min(secret.length - 4, 20))}${secret.slice(-2)}`;
            redactedLine = line.replace(secret, redacted);
        }
        else {
            redactedLine = line.replace(secret, '*'.repeat(secret.length));
        }
        if (redactedLine.length > maxLength) {
            redactedLine = redactedLine.slice(0, maxLength) + '...';
        }
        return redactedLine.trim();
    }
    calculateOverallSeverity(secrets) {
        if (secrets.some((s) => s.severity === 'critical'))
            return 'critical';
        if (secrets.some((s) => s.severity === 'high'))
            return 'high';
        if (secrets.some((s) => s.severity === 'medium'))
            return 'medium';
        if (secrets.some((s) => s.severity === 'low'))
            return 'low';
        return 'none';
    }
};
exports.SecretDetectorService = SecretDetectorService;
exports.SecretDetectorService = SecretDetectorService = SecretDetectorService_1 = __decorate([
    (0, common_1.Injectable)()
], SecretDetectorService);
//# sourceMappingURL=secret-detector.service.js.map