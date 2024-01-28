import {FastifyCsvParser} from "@shared/utils/csv.parser";
import {MultipartFile} from "@fastify/multipart";
import {ECGWave, ECGWaveType} from "@domains/delineation";

export class DelineationCsvParser extends FastifyCsvParser {
    private static readonly ECG_KPI_DELIMITER: string = ','
    private static supportedECGTypes = new Set(['P', 'QRS', 'T', 'INV'])


    private readonly part: MultipartFile
    private readonly delimiter: RegExp
    private readonly timestampMs: number;


    constructor(part: MultipartFile, delimiter: RegExp, startingDate: Date) {
        super();
        this.part = part
        this.delimiter = delimiter

        this.timestampMs = startingDate.getTime()
    }

    private async getECGRows(): Promise<string[]> {
        const content = await this.parse(this.part)
        return content.split(this.delimiter)
    }

    async getECGWaves(): Promise<ECGWave[]> {
        const ecgRows = await this.getECGRows()
        const ecgWaves: ECGWave[] = []

        for (const ecgRow of ecgRows) {
            const [type, startAtMs, endAtMs, ...tags] = ecgRow.split(DelineationCsvParser.ECG_KPI_DELIMITER)

            if (!DelineationCsvParser.supportedECGTypes.has(type)) {
                continue
            }

            const waveType = type as ECGWaveType
            const onsetTimestamp = this.timestampMs + Number(startAtMs)
            const offsetTimestamp = this.timestampMs + Number(endAtMs)

            const wave: ECGWave = {
                type: waveType,
                onset: new Date(onsetTimestamp),
                offset: new Date(offsetTimestamp),
                tags: tags
            }

            ecgWaves.push(wave)
        }

        return ecgWaves
    }
}
