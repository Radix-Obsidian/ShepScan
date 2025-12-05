import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(config: ConfigService) {
        const connectionString = config.get('DATABASE_URL');
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}
