import { Request, Response } from 'express';

// Mocking Prisma Client to run tests in-memory without a running database server
const mockDb = new Set<string>();

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => {
            return {
                candidate: {
                    create: jest.fn().mockImplementation(async ({ data }) => {
                        if (mockDb.has(data.email)) {
                            // Simulate Prisma unique constraint error
                            const error = new Error('Unique constraint failed');
                            (error as any).code = 'P2002';
                            throw error;
                        }
                        mockDb.add(data.email);
                        return { id: 1, ...data };
                    }),
                    findUnique: jest.fn().mockImplementation(async ({ where }) => {
                        if (mockDb.has(where.email)) {
                            return { id: 1, email: where.email, firstName: 'Juan', lastName: 'Pérez' };
                        }
                        return null;
                    }),
                    deleteMany: jest.fn().mockImplementation(async () => {
                        mockDb.clear();
                        return { count: 0 };
                    })
                },
                education: {
                    create: jest.fn().mockImplementation(async ({ data }) => ({ id: 1, ...data })),
                    deleteMany: jest.fn().mockImplementation(async () => ({ count: 0 }))
                },
                workExperience: {
                    create: jest.fn().mockImplementation(async ({ data }) => ({ id: 1, ...data })),
                    deleteMany: jest.fn().mockImplementation(async () => ({ count: 0 }))
                },
                resume: {
                    create: jest.fn().mockImplementation(async ({ data }) => ({ id: 1, ...data })),
                    deleteMany: jest.fn().mockImplementation(async () => ({ count: 0 }))
                },
                $disconnect: jest.fn()
            };
        }),
        Prisma: {
            PrismaClientInitializationError: class extends Error {},
            PrismaClientKnownRequestError: class extends Error {}
        }
    };
});

import { addCandidateController } from '../presentation/controllers/candidateController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Candidate Insertion Integration Tests (ADLC)', () => {
    const testEmail = 'test-adlc@example.com';

    beforeEach(async () => {
        // Clean up mock database
        await prisma.candidate.deleteMany({});
    });

    it('should register a candidate successfully with minimum required fields', async () => {
        const candidateData = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: testEmail
        };

        const req = {
            body: candidateData
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as unknown as Response;

        await addCandidateController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Candidate added successfully',
                data: expect.objectContaining({
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: testEmail
                })
            })
        );

        // Verify it was written to mock database
        const dbCandidate = await prisma.candidate.findUnique({
            where: { email: testEmail }
        });
        expect(dbCandidate).toBeTruthy();
        expect(dbCandidate?.firstName).toBe('Juan');
    });

    it('should return validation error (400) when required fields are missing or invalid', async () => {
        const candidateData = {
            firstName: 'J', // Invalid name (too short, min 2 chars)
            lastName: 'Pérez',
            email: 'invalid-email' // Invalid email format
        };

        const req = {
            body: candidateData
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as unknown as Response;

        await addCandidateController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Error adding candidate'
            })
        );
    });

    it('should return duplicate email error (400) when registering email already in database', async () => {
        // First insertion
        const candidateData = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: testEmail
        };

        const req1 = {
            body: candidateData
        } as unknown as Request;

        const res1 = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as unknown as Response;

        await addCandidateController(req1, res1);
        expect(res1.status).toHaveBeenCalledWith(201);

        // Second insertion with duplicate email
        const req2 = {
            body: candidateData
        } as unknown as Request;

        const res2 = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as unknown as Response;

        await addCandidateController(req2, res2);

        expect(res2.status).toHaveBeenCalledWith(400);
        expect(res2.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Error adding candidate',
                error: 'The email already exists in the database'
            })
        );
    });

    it('should register a candidate successfully with full nested payload', async () => {
        const candidateData = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: testEmail,
            phone: '600000000',
            address: 'Calle Falsa 123',
            educations: [
                {
                    institution: 'Universidad de Prueba',
                    title: 'Ingeniería Informática',
                    startDate: '2020-01-01',
                    endDate: '2024-01-01'
                }
            ],
            workExperiences: [
                {
                    company: 'Empresa de Prueba',
                    position: 'Desarrollador',
                    description: 'Desarrollo de software',
                    startDate: '2024-02-01'
                }
            ],
            cv: {
                filePath: 'uploads/test-cv.pdf',
                fileType: 'application/pdf'
            }
        };

        const req = {
            body: candidateData
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as unknown as Response;

        await addCandidateController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });
});
