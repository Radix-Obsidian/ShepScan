"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanModule = void 0;
const common_1 = require("@nestjs/common");
const scan_controller_1 = require("./scan.controller");
const scan_service_1 = require("./scan.service");
const secret_detector_service_1 = require("./secret-detector.service");
const git_service_1 = require("./git.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ScanModule = class ScanModule {
};
exports.ScanModule = ScanModule;
exports.ScanModule = ScanModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [scan_controller_1.ScanController],
        providers: [scan_service_1.ScanService, secret_detector_service_1.SecretDetectorService, git_service_1.GitService],
        exports: [scan_service_1.ScanService],
    })
], ScanModule);
//# sourceMappingURL=scan.module.js.map