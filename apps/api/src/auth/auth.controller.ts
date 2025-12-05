import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
    Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.service';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    private readonly frontendUrl: string;

    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {
        this.frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }

    /**
     * GET /auth/github
     * Initiates GitHub OAuth flow
     */
    @Get('github')
    @UseGuards(GitHubAuthGuard)
    async githubAuth() {
        // Guard redirects to GitHub
    }

    /**
     * GET /auth/github/callback
     * GitHub OAuth callback - exchanges code for token
     */
    @Get('github/callback')
    @UseGuards(GitHubAuthGuard)
    async githubCallback(@Req() req: Request, @Res() res: Response) {
        const user = req.user as AuthUser;
        
        if (!user) {
            this.logger.error('GitHub callback: No user in request');
            return res.redirect(`${this.frontendUrl}?error=auth_failed`);
        }

        // Generate JWT
        const token = this.authService.generateToken(user);
        
        this.logger.log(`GitHub OAuth success for: ${user.email}`);

        // Redirect to frontend with token
        res.redirect(`${this.frontendUrl}?token=${token}&user=${encodeURIComponent(user.username)}`);
    }

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req: Request) {
        const user = req.user as AuthUser;
        const fullUser = await this.authService.getUserById(user.id);
        
        return {
            id: fullUser?.id,
            email: fullUser?.email,
            username: user.username,
            repoCount: fullUser?.repos.length || 0,
            secretCount: fullUser?.repos.reduce((sum, repo) => sum + repo.secrets.length, 0) || 0,
        };
    }

    /**
     * GET /auth/repos
     * Get user's connected repositories
     */
    @Get('repos')
    @UseGuards(JwtAuthGuard)
    async getUserRepos(@Req() req: Request) {
        const user = req.user as AuthUser;
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

    /**
     * GET /auth/status
     * Check authentication status (public)
     */
    @Get('status')
    async getAuthStatus() {
        const githubConfigured = !!(
            this.configService.get('GITHUB_CLIENT_ID') && 
            this.configService.get('GITHUB_CLIENT_SECRET')
        );

        return {
            githubOAuthEnabled: githubConfigured,
            loginUrl: githubConfigured ? '/auth/github' : null,
            message: githubConfigured 
                ? 'GitHub OAuth is configured' 
                : 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        };
    }

    /**
     * POST /auth/logout
     * Logout (client should clear token)
     */
    @Post('logout')
    async logout() {
        return { message: 'Logged out successfully. Please clear your token.' };
    }
}
