import {FastifyInstance} from 'fastify'
import * as delineationDomain from '@domains/delineation'

export async function delineationRouter(fastify: FastifyInstance) {

    fastify.route({
        method: 'POST',
        url: '/delineation',
        schema: {
            querystring: {
                type: "object",
                properties: {
                    timestamp: {
                        type: 'number',
                        nullable: true
                    }
                },
            },
        },
        handler: delineationDomain.postDelineation
    })
}
