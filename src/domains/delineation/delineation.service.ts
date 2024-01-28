import {MultipartFile} from "@fastify/multipart";
import {DelineationCsvParser} from "@shared/utils/delineation.csv.parser";
import {constants as sharedConstants} from "@shared/constants";
import {UNIT_PER_MINUTE, UNIT_PER_SECOND} from "@domains/delineation";
import {ECGWave, ECGWaveType, HeartRateBoundary, QRSHeartRate} from "@domains/delineation/delineation.model";


const getQRSHeartRates = (qrsWaves: ECGWave[]): QRSHeartRate[] => {
    if (qrsWaves.length < 2) {
        return []
    }

    const qrsHeartRates: QRSHeartRate[] = [];

    for (let i = 0; i < qrsWaves.length - 1; i++) {
        const currentWave = qrsWaves[i]
        const nextWave = qrsWaves?.[i + 1]

        const wavesIntervalPerMillisecond = nextWave.onset.getTime() - currentWave.onset.getTime()

        const waveIntervalInSecond = wavesIntervalPerMillisecond / UNIT_PER_SECOND

        const heartRateBpm = UNIT_PER_MINUTE / waveIntervalInSecond

        qrsHeartRates.push({
            onsetTimestamp: currentWave.onset.getTime(),
            offsetTimestamp: nextWave.onset.getTime(),
            heartRateBpm: heartRateBpm
        })
    }

    return qrsHeartRates
}

const filterWavesByType = (waves: ECGWave[], supportedTypes: Set<ECGWaveType>): ECGWave[] => {
    return waves.filter((wave) => supportedTypes.has(wave.type))
}

const calculateMeanHeartRate = (qrsIntervals: QRSHeartRate[]): number | null => {
    const totalHeartRate = qrsIntervals.length
    if (!totalHeartRate) {
        return null
    }

    const sumHeartRate = qrsIntervals.reduce((meanAccumulator, interval) => meanAccumulator + interval.heartRateBpm, 0)

    return sumHeartRate / totalHeartRate;
}

const calculateMinimumAndMaximumHeartRate = (qrsHeartRates: QRSHeartRate[]): HeartRateBoundary => {
    let minHeartRate: QRSHeartRate | null = null
    let maxHeartRate: QRSHeartRate | null = null

    for (const qrsHeartRate of qrsHeartRates) {
        if (!minHeartRate || minHeartRate.heartRateBpm > qrsHeartRate.heartRateBpm) {
            minHeartRate = qrsHeartRate
        }

        if (!maxHeartRate || maxHeartRate.heartRateBpm < qrsHeartRate.heartRateBpm) {
            maxHeartRate = qrsHeartRate
        }
    }

    return {minHeartRate, maxHeartRate}
}

export const analyzeDelineation = async (part: MultipartFile, startingDate: Date) => {
    const parser = new DelineationCsvParser(part, sharedConstants.csvRowDelimiter, startingDate)

    const waves = await parser.getECGWaves()

    if (waves.length === 0) {
        throw new Error('unsupported csv file')
    }

    const qrsWaves = filterWavesByType(waves, new Set<ECGWaveType>(['QRS']))

    const qrsHeartRates = getQRSHeartRates(qrsWaves)

    const meanHeartRate = calculateMeanHeartRate(qrsHeartRates)

    const {minHeartRate, maxHeartRate} = calculateMinimumAndMaximumHeartRate(qrsHeartRates)

    return {
        meanHeartRate,
        minHeartRate,
        maxHeartRate
    }
}
