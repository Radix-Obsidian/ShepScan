import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReposService } from './repos.service';
import { Repo, Prisma } from '@prisma/client';

@Controller('repos')
export class ReposController {
    constructor(private readonly reposService: ReposService) { }

    @Post()
    create(@Body() data: Prisma.RepoCreateInput): Promise<Repo> {
        return this.reposService.create(data);
    }

    @Get()
    findAll(): Promise<Repo[]> {
        return this.reposService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Repo | null> {
        return this.reposService.findOne(id);
    }
}
