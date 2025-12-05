import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const GitHubStrategy_base: new (...args: [options: import("passport-github2").StrategyOptionsWithRequest] | [options: import("passport-github2").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GitHubStrategy extends GitHubStrategy_base {
    private authService;
    private readonly logger;
    constructor(authService: AuthService, configService: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: Error | null, user?: any) => void): Promise<void>;
}
export {};
