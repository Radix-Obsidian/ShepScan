import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('ReposController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);

        // Create a test user
        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                authProvider: 'github',
            },
        });
        userId = user.id;
    });

    afterAll(async () => {
        // Cleanup
        if (userId) {
            await prisma.repo.deleteMany({ where: { userId } });
            await prisma.user.delete({ where: { id: userId } });
        }
        await app.close();
    });

    it('/repos (POST)', () => {
        return request(app.getHttpServer())
            .post('/repos')
            .send({
                provider: 'github',
                name: 'test-repo',
                url: 'https://github.com/test/test-repo',
                userId: userId,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.name).toBe('test-repo');
                expect(res.body.userId).toBe(userId);
            });
    });

    it('/repos (GET)', () => {
        return request(app.getHttpServer())
            .get('/repos')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                const repo = res.body.find((r) => r.name === 'test-repo' && r.userId === userId);
                expect(repo).toBeDefined();
            });
    });
});
