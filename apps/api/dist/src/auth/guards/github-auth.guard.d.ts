import { ExecutionContext } from '@nestjs/common';
declare const GitHubAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GitHubAuthGuard extends GitHubAuthGuard_base {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
