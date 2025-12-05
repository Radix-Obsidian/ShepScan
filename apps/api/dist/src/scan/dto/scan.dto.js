"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanResponseDto = exports.DetectedSecretDto = exports.ScanRequestDto = void 0;
class ScanRequestDto {
    repoUrl;
    userId;
}
exports.ScanRequestDto = ScanRequestDto;
class DetectedSecretDto {
    filePath;
    lineNumber;
    secretType;
    secretName;
    severity;
    description;
    snippet;
    matchedPattern;
}
exports.DetectedSecretDto = DetectedSecretDto;
class ScanResponseDto {
    success;
    repoUrl;
    repoName;
    scannedAt;
    scanDurationMs;
    totalFiles;
    totalSecrets;
    overallSeverity;
    secrets;
    error;
}
exports.ScanResponseDto = ScanResponseDto;
//# sourceMappingURL=scan.dto.js.map