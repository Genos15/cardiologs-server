import fastify from 'fastify'
import pino from 'pino'

export const fastifyApp = fastify({
    logger: pino({level: 'info'}),
    ignoreDuplicateSlashes: true,
})



