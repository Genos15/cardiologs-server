import {MultipartFile} from '@fastify/multipart';
import {ECGWave} from '@domains/delineation';
import {DelineationCsvParser} from "@shared/utils/delineation.csv.parser";

describe('Test DelineationCsvParser', () => {
    let part: MultipartFile
    let delimiter: RegExp
    let startingDate: Date
    let parser: DelineationCsvParser

    beforeEach(() => {
        part = {} as MultipartFile // Mock the MultipartFile
        delimiter = /\r?\n/
        startingDate = new Date()
        parser = new DelineationCsvParser(part, delimiter, startingDate)
    })

    afterAll(() => {
        jest.resetAllMocks()
    })

    it(`
        Given supported csv ECG file,
        When analyzing csv,
        Then parse file content into an array of ECG waves
    `, async () => {
        parser.parse = jest.fn().mockResolvedValue('P,100,200,tag1,tag2\nQRS,300,400,tag3,tag4')

        const expected: ECGWave[] = [
            {
                type: 'P',
                onset: new Date(startingDate.getTime() + 100),
                offset: new Date(startingDate.getTime() + 200),
                tags: ['tag1', 'tag2']
            },
            {
                type: 'QRS',
                onset: new Date(startingDate.getTime() + 300),
                offset: new Date(startingDate.getTime() + 400),
                tags: ['tag3', 'tag4']
            }
        ]

        const result = await parser.getECGWaves()
        expect(result).toEqual(expected)
    })

    it(`
        Given supported csv ECG file,
        When analyzing csv,
        Then parse is called with Part object
    `, async () => {
        const mockParse = jest.fn().mockResolvedValue('')
        parser.parse = mockParse
        await parser.getECGWaves()
        expect(mockParse).toHaveBeenCalledWith(part)
    })

    it(`
        Given an incorrect csv ECG file,
        When parse is called,
        Then should return an empty array
    `, async () => {
        parser.parse = jest.fn().mockResolvedValue('unsupported,100,200,tag1,tag2');

        const result = await parser.getECGWaves()
        expect(result).toEqual([])
    });
});
