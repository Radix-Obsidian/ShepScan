import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export interface GitHubProfile {
    id: string;
    username: string;
    displayName: string;
    emails: Array<{
        value: string;
    }>;
    photos: Array<{
        value: string;
    }>;
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
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateGitHubUser(profile: GitHubProfile): Promise<AuthUser>;
    generateToken(user: AuthUser): string;
    validateJwtPayload(payload: JwtPayload): Promise<AuthUser | null>;
    getUserRepos(userId: string): Promise<({
        secrets: {
            id: string;
            secretType: string;
            severity: string;
        }[];
    } & {
        url: string;
        name: string;
        id: string;
        provider: string;
        userId: string;
        createdAt: Date;
    })[]>;
    getUserById(userId: string): Promise<({
        repos: ({
            secrets: {
                id: string;
                createdAt: Date;
                filePath: string;
                lineNumber: number;
                secretType: string;
                severity: string;
                aiExplanation: string | null;
                repoId: string;
            }[];
        } & {
            url: string;
            name: string;
            id: string;
            provider: string;
            userId: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        email: string;
        authProvider: string;
    }) | null>;
}
