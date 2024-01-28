import * as delineationService from "@domains/delineation/delineation.service"
import {errorCodes, FastifyBaseLogger, FastifyReply, FastifyRequest} from "fastify"
import {postDelineation} from "@domains/delineation"
import {MultipartFile} from "@fastify/multipart"

jest.mock('@domains/delineation/delineation.service', () => ({
    analyzeDelineation: jest.fn()
}))

const mockRequest: Partial<FastifyRequest<{ Querystring: { timestamp?: number } }>> = {
    query: {},
    file: () => Promise.resolve({} as MultipartFile),
    log: {
        error: jest.fn()
    } as unknown as FastifyBaseLogger,
};

const mockReply: Partial<FastifyReply> = {
    send: jest.fn(),
    status: jest.fn(() => mockReply) as any,
};

describe('postDelineation', () => {
    const mockedDelineationService = jest.mocked(delineationService)

    const fakeCurrentDate = new Date('2024-01-28T10:00:00.000Z')
    const goodResult = {
        meanHeartRate: 0,
        maxHeartRate: {
            heartRateBpm: 0,
            offsetTimestamp: 1,
            onsetTimestamp: 1
        },
        minHeartRate: {
            heartRateBpm: 0,
            offsetTimestamp: 1,
            onsetTimestamp: 1
        }
    }

    beforeAll(() => {
        jest.useFakeTimers()
    })

    beforeEach(() => {
        jest.setSystemTime(fakeCurrentDate)
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it(`
        Given request query without timestamp,
        When postDelineation is called,
        Then analyzeDelineation is called with corresponding current date timestamp
    `, async () => {
        mockedDelineationService.analyzeDelineation.mockResolvedValue(goodResult)

        await postDelineation({...mockRequest, query: {}} as unknown as FastifyRequest<{
            Querystring: { timestamp?: number }
        }>, mockReply as FastifyReply)

        expect(mockedDelineationService.analyzeDelineation).toBeCalledWith({}, new Date('1970-01-01T00:00:00.000Z'))
    })

    it(`
        Given request query with valid timestamp,
        When postDelineation is called,
        Then analyzeDelineation is called with corresponding timestamp passed in request
    `, async () => {
        mockedDelineationService.analyzeDelineation.mockResolvedValue(goodResult)
        const mockTimestamp = 1643836800000; // Example: February 3, 2022 12:00:00 AM UTC

        await postDelineation({...mockRequest, query: {timestamp: mockTimestamp}} as unknown as FastifyRequest<{
            Querystring: { timestamp?: number }
        }>, mockReply as FastifyReply)

        expect(mockedDelineationService.analyzeDelineation).toBeCalledWith({}, new Date('2022-02-02T00:00:00.000Z'))
    })

    it(`
        Given an invalid ECG file in request,
        When postDelineation is called,
        Then throw exception with 400 status code
    `, async () => {

        await postDelineation({...mockRequest, file: () => Promise.resolve()} as unknown as FastifyRequest<{
            Querystring: { timestamp?: number }
        }>, mockReply as FastifyReply)

        expect(mockReply.status).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith({success: false, reason: errorCodes.FST_ERR_BAD_STATUS_CODE()})
    });
});
