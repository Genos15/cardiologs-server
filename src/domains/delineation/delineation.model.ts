export type ECGWaveType = 'P' | 'QRS' | 'T' | 'INV'

export type ECGWave = {
    type: ECGWaveType
    onset: Date
    offset: Date
    tags?: string[]
}

export type QRSHeartRate = {
    heartRateBpm: number
    onsetTimestamp: number
    offsetTimestamp: number
}

export type HeartRateBoundary = {
    minHeartRate: QRSHeartRate | null
    maxHeartRate: QRSHeartRate | null
}
