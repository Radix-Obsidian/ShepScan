import { PrismaService } from '../prisma/prisma.service';
import { Repo, Prisma } from '@prisma/client';
export declare class ReposService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.RepoCreateInput): Promise<Repo>;
    findAll(): Promise<Repo[]>;
    findOne(id: string): Promise<Repo | null>;
}
