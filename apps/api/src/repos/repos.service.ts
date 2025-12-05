import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Repo, Prisma } from '@prisma/client';

@Injectable()
export class ReposService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.RepoCreateInput): Promise<Repo> {
        return this.prisma.repo.create({
            data,
        });
    }

    async findAll(): Promise<Repo[]> {
        return this.prisma.repo.findMany();
    }

    async findOne(id: string): Promise<Repo | null> {
        return this.prisma.repo.findUnique({
            where: { id },
        });
    }
}
