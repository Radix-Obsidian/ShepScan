import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ScanController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('/scan/health (GET)', () => {
        it('should return health status', () => {
            return request(app.getHttpServer())
                .get('/scan/health')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                    expect(res.body.service).toBe('ShepScan Secret Detection Engine');
                    expect(res.body.patterns).toBeGreaterThan(0);
                });
        });
    });

    describe('/scan (POST)', () => {
        it('should reject invalid GitHub URL', () => {
            return request(app.getHttpServer())
                .post('/scan')
                .send({ repoUrl: 'not-a-valid-url' })
                .expect(400);
        });

        it('should handle non-existent repository', async () => {
            const response = await request(app.getHttpServer())
                .post('/scan')
                .send({ repoUrl: 'https://github.com/nonexistent-user-12345/nonexistent-repo-67890' })
                .expect(200);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });
    });
});
