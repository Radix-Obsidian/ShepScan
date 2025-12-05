import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface GitHubProfile {
    id: string;
    username: string;
    displayName: string;
    emails: Array<{ value: string }>;
    photos: Array<{ value: string }>;
    accessToken: string;
}

export interface JwtPayload {
    sub: string;
    email: string;
    username: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    accessToken: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * Validate or create user from GitHub OAuth profile
     */
    async validateGitHubUser(profile: GitHubProfile): Promise<AuthUser> {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        
        this.logger.log(`GitHub OAuth for user: ${profile.username} (${email})`);

        // Find or create user
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

    /**
     * Generate JWT token for authenticated user
     */
    generateToken(user: AuthUser): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };
        return this.jwtService.sign(payload);
    }

    /**
     * Validate JWT payload and return user
     */
    async validateJwtPayload(payload: JwtPayload): Promise<AuthUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            username: payload.username,
            accessToken: '', // Not stored in JWT
        };
    }

    /**
     * Get user's connected repositories
     */
    async getUserRepos(userId: string) {
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

    /**
     * Get user by ID
     */
    async getUserById(userId: string) {
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
}
