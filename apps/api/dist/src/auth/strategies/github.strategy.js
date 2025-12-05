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
var GitHubStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_github2_1 = require("passport-github2");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let GitHubStrategy = GitHubStrategy_1 = class GitHubStrategy extends (0, passport_1.PassportStrategy)(passport_github2_1.Strategy, 'github') {
    authService;
    logger = new common_1.Logger(GitHubStrategy_1.name);
    constructor(authService, configService) {
        const clientID = configService.get('GITHUB_CLIENT_ID');
        const clientSecret = configService.get('GITHUB_CLIENT_SECRET');
        const callbackURL = configService.get('GITHUB_CALLBACK_URL') || 'http://localhost:3001/auth/github/callback';
        super({
            clientID: clientID || 'not-configured',
            clientSecret: clientSecret || 'not-configured',
            callbackURL,
            scope: ['user:email', 'read:user'],
        });
        this.authService = authService;
        if (!clientID || !clientSecret) {
            this.logger.warn('GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
        }
        else {
            this.logger.log('GitHub OAuth strategy initialized');
        }
    }
    async validate(accessToken, refreshToken, profile, done) {
        try {
            const githubProfile = {
                id: profile.id,
                username: profile.username || profile.displayName,
                displayName: profile.displayName,
                emails: profile.emails || [],
                photos: profile.photos || [],
                accessToken,
            };
            const user = await this.authService.validateGitHubUser(githubProfile);
            done(null, user);
        }
        catch (error) {
            this.logger.error(`GitHub OAuth validation failed: ${error.message}`);
            done(error, null);
        }
    }
};
exports.GitHubStrategy = GitHubStrategy;
exports.GitHubStrategy = GitHubStrategy = GitHubStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], GitHubStrategy);
//# sourceMappingURL=github.strategy.js.map