import { ReposService } from './repos.service';
import { Repo, Prisma } from '@prisma/client';
export declare class ReposController {
    private readonly reposService;
    constructor(reposService: ReposService);
    create(data: Prisma.RepoCreateInput): Promise<Repo>;
    findAll(): Promise<Repo[]>;
    findOne(id: string): Promise<Repo | null>;
}
