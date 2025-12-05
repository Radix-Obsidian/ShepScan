import { Module } from '@nestjs/common';
import { ReposController } from './repos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReposService } from './repos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReposController],
  providers: [ReposService]
})
export class ReposModule { }
