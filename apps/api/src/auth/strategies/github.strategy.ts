import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService, GitHubProfile } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    private readonly logger = new Logger(GitHubStrategy.name);

    constructor(
        private authService: AuthService,
        configService: ConfigService,
    ) {
        const clientID = configService.get('GITHUB_CLIENT_ID');
        const clientSecret = configService.get('GITHUB_CLIENT_SECRET');
        const callbackURL = configService.get('GITHUB_CALLBACK_URL') || 'http://localhost:3001/auth/github/callback';

        super({
            clientID: clientID || 'not-configured',
            clientSecret: clientSecret || 'not-configured',
            callbackURL,
            scope: ['user:email', 'read:user'],
        });

        if (!clientID || !clientSecret) {
            this.logger.warn('GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
        } else {
            this.logger.log('GitHub OAuth strategy initialized');
        }
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: Error | null, user?: any) => void,
    ): Promise<void> {
        try {
            const githubProfile: GitHubProfile = {
                id: profile.id,
                username: profile.username || profile.displayName,
                displayName: profile.displayName,
                emails: profile.emails || [],
                photos: profile.photos || [],
                accessToken,
            };

            const user = await this.authService.validateGitHubUser(githubProfile);
            done(null, user);
        } catch (error) {
            this.logger.error(`GitHub OAuth validation failed: ${error.message}`);
            done(error, null);
        }
    }
}
