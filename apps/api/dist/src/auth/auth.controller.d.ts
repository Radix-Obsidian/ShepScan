import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    private readonly logger;
    private readonly frontendUrl;
    constructor(authService: AuthService, configService: ConfigService);
    githubAuth(): Promise<void>;
    githubCallback(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request): Promise<{
        id: string | undefined;
        email: string | undefined;
        username: string;
        repoCount: number;
        secretCount: number;
    }>;
    getUserRepos(req: Request): Promise<{
        id: string;
        name: string;
        url: string;
        provider: string;
        secretCount: number;
        criticalCount: number;
        highCount: number;
        createdAt: Date;
    }[]>;
    getAuthStatus(): Promise<{
        githubOAuthEnabled: boolean;
        loginUrl: string | null;
        message: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
