import {MultipartFile} from "@fastify/multipart";
import {DelineationCsvParser} from "@shared/utils/delineation.csv.parser";
import {ECGWave} from "@domains/delineation/delineation.model";
import {analyzeDelineation} from "@domains/delineation/delineation.service";

jest.mock("@shared/utils/delineation.csv.parser");

describe("Test Delineation Service", () => {
    const mockCsvParserGetECGWaves = jest.fn()

    const mockWaves: ECGWave[] = [
        {
            type: 'P',
            onset: new Date(),
            offset: new Date()
        },
        {
            type: 'QRS',
            onset: new Date(37675979),
            offset: new Date(37676070)
        },
        {
            type: 'QRS',
            onset: new Date(37676920),
            offset: new Date(37677000)
        },
        {
            type: 'QRS',
            onset: new Date(37678122),
            offset: new Date(37678213)
        },
        {
            type: 'QRS',
            onset: new Date(37679297),
            offset: new Date(37679388)
        },
        {
            type: 'T',
            onset: new Date(),
            offset: new Date()
        },
    ];

    beforeEach(() => {
        jest.spyOn(DelineationCsvParser.prototype, "getECGWaves").mockImplementation(mockCsvParserGetECGWaves)
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    it(`
        Given good ecg file,
        When analyzeDelineation is called,
        Then return corresponding mean heart rate
    `, async () => {
        const mockFile = {
            filename: "mock.csv",
            encoding: "utf-8",
            mimetype: "text/csv",
        } as MultipartFile

        const mockDelineationDate = new Date()
        mockCsvParserGetECGWaves.mockResolvedValue(mockWaves)

        const result = await analyzeDelineation(mockFile, mockDelineationDate)
        expect(result.meanHeartRate?.toFixed(2)).toEqual('54.91')
    })

    it(`
        Given good ecg file,
        When analyzeDelineation is called,
        Then return good heart rate KPIs
    `, async () => {
        const mockFile = {
            filename: "mock.csv",
            encoding: "utf-8",
            mimetype: "text/csv",
        } as MultipartFile

        const mockDelineationDate = new Date()

        mockCsvParserGetECGWaves.mockResolvedValue(mockWaves)
        
        const result = await analyzeDelineation(mockFile, mockDelineationDate)
        expect(result.minHeartRate?.heartRateBpm?.toFixed(2)).toEqual('49.92')
    })



    it(`
        Given good ecg file,
        When analyzeDelineation is called with only one wave,
        Then return empty heart rate KPIs
    `, async () => {
        const mockFile = {
            filename: "mock.csv",
            encoding: "utf-8",
            mimetype: "text/csv",
        } as MultipartFile

        const mockDelineationDate = new Date()
        const uniqueWave = {
            onset: new Date(mockDelineationDate.getTime() + 40438),
            offset: new Date(mockDelineationDate.getTime() + 40532)
        }
        const mockWaves: ECGWave[] = [
            {
                type: 'QRS', ...uniqueWave
            },
        ];

        mockCsvParserGetECGWaves.mockResolvedValue(mockWaves)

        const result = await analyzeDelineation(mockFile, mockDelineationDate)
        expect(result.meanHeartRate).toEqual(null)
        expect(result.maxHeartRate).toEqual(null)
        expect(result.minHeartRate).toEqual(null)
    })

    it(`
        Given invalid ecg file,
        When analyzeDelineation is called,
        Then throw an error for unsupported csv file
    `, async () => {
        const mockFile = {
            filename: "unsupported.txt",
            encoding: "utf-8",
            mimetype: "text/plain",
        } as MultipartFile

        const mockDelineationDate = new Date()

        mockCsvParserGetECGWaves.mockResolvedValue([])

        await expect(analyzeDelineation(mockFile, mockDelineationDate)).rejects.toThrowError("unsupported csv file")
    })
})
