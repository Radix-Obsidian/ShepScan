export interface CloneResult {
    success: boolean;
    localPath: string;
    error?: string;
}
export declare class GitService {
    private readonly logger;
    private readonly tempBaseDir;
    constructor();
    private ensureTempDir;
    parseGitHubUrl(url: string): {
        owner: string;
        repo: string;
    } | null;
    cloneRepo(repoUrl: string): Promise<CloneResult>;
    cleanup(localPath: string): Promise<void>;
    private parseGitError;
    getRepoInfo(owner: string, repo: string): Promise<{
        name: string;
        description: string;
        defaultBranch: string;
    } | null>;
}
