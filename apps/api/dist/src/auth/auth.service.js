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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateGitHubUser(profile) {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        this.logger.log(`GitHub OAuth for user: ${profile.username} (${email})`);
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    authProvider: 'github',
                },
            });
            this.logger.log(`Created new user: ${user.id}`);
        }
        return {
            id: user.id,
            email: user.email,
            username: profile.username,
            avatarUrl: profile.photos?.[0]?.value,
            accessToken: profile.accessToken,
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };
        return this.jwtService.sign(payload);
    }
    async validateJwtPayload(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            username: payload.username,
            accessToken: '',
        };
    }
    async getUserRepos(userId) {
        return this.prisma.repo.findMany({
            where: { userId },
            include: {
                secrets: {
                    select: {
                        id: true,
                        secretType: true,
                        severity: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                repos: {
                    include: {
                        secrets: true,
                    },
                },
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map