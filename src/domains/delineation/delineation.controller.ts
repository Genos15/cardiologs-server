import {FastifyReply, FastifyRequest} from "fastify"
import {errorCodes} from 'fastify'
import {analyzeDelineation} from "@domains/delineation/delineation.service";
import {setDateToBeginningOfDay} from "@shared/utils/date.utils";


export const postDelineation = async (request: FastifyRequest<{
    Querystring: { timestamp?: number }
}>, reply: FastifyReply) => {
    try {
        let delineationDate = new Date(0)

        if (!!request.query.timestamp) {
            delineationDate = new Date(request.query.timestamp)
        }

        delineationDate = setDateToBeginningOfDay(delineationDate)

        const kpiCsvFile = await request.file()

        if (!kpiCsvFile) {
            throw errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE()
        }

        const result = await analyzeDelineation(kpiCsvFile, delineationDate)
        reply.send({success: true, data: result})
    } catch (exception) {
        request.log.error(exception, 'postDelineation exception')

        return reply
            .status(400)
            .send({
                success: false,
                reason: errorCodes.FST_ERR_BAD_STATUS_CODE()
            })
    }
}
