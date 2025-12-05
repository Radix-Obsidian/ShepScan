import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { SecretDetectorService } from './secret-detector.service';
import { GitService } from './git.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ScanController],
    providers: [ScanService, SecretDetectorService, GitService],
    exports: [ScanService],
})
export class ScanModule { }
