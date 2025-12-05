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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const github_auth_guard_1 = require("./guards/github-auth.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
let AuthController = AuthController_1 = class AuthController {
    authService;
    configService;
    logger = new common_1.Logger(AuthController_1.name);
    frontendUrl;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
        this.frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }
    async githubAuth() {
    }
    async githubCallback(req, res) {
        const user = req.user;
        if (!user) {
            this.logger.error('GitHub callback: No user in request');
            return res.redirect(`${this.frontendUrl}?error=auth_failed`);
        }
        const token = this.authService.generateToken(user);
        this.logger.log(`GitHub OAuth success for: ${user.email}`);
        res.redirect(`${this.frontendUrl}?token=${token}&user=${encodeURIComponent(user.username)}`);
    }
    async getCurrentUser(req) {
        const user = req.user;
        const fullUser = await this.authService.getUserById(user.id);
        return {
            id: fullUser?.id,
            email: fullUser?.email,
            username: user.username,
            repoCount: fullUser?.repos.length || 0,
            secretCount: fullUser?.repos.reduce((sum, repo) => sum + repo.secrets.length, 0) || 0,
        };
    }
    async getUserRepos(req) {
        const user = req.user;
        const repos = await this.authService.getUserRepos(user.id);
        return repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            url: repo.url,
            provider: repo.provider,
            secretCount: repo.secrets.length,
            criticalCount: repo.secrets.filter(s => s.severity === 'critical').length,
            highCount: repo.secrets.filter(s => s.severity === 'high').length,
            createdAt: repo.createdAt,
        }));
    }
    async getAuthStatus() {
        const githubConfigured = !!(this.configService.get('GITHUB_CLIENT_ID') &&
            this.configService.get('GITHUB_CLIENT_SECRET'));
        return {
            githubOAuthEnabled: githubConfigured,
            loginUrl: githubConfigured ? '/auth/github' : null,
            message: githubConfigured
                ? 'GitHub OAuth is configured'
                : 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        };
    }
    async logout() {
        return { message: 'Logged out successfully. Please clear your token.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('github'),
    (0, common_1.UseGuards)(github_auth_guard_1.GitHubAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubAuth", null);
__decorate([
    (0, common_1.Get)('github/callback'),
    (0, common_1.UseGuards)(github_auth_guard_1.GitHubAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubCallback", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('repos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserRepos", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthStatus", null);
__decorate([
    (0, common_1.Post)('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map