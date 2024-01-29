import fastifyEnv from "@fastify/env"
import fastifyMultipart from '@fastify/multipart'
import cors from '@fastify/cors'
import {environmentVars} from "@config/environment"
import {fastifyApp} from "./app"
import * as delineationDomain from '@domains/delineation'
import {errorCodes} from "fastify";


export const initializeApp = async () => {
    try {
        fastifyApp.register(fastifyEnv, environmentVars())

        await fastifyApp.after()

        fastifyApp.register(cors, {
            origin: fastifyApp.config.CLIENT_URL,
        })

        console.log('CORS', fastifyApp.config.CLIENT_URL)

        fastifyApp.register(fastifyMultipart, {
            limits: {
                files: 1, // max number of file fields
                fileSize: 20 * 1024 * 1024,  // 20mb limit
            },
        })

        await fastifyApp.after()

        await fastifyApp.register(delineationDomain.delineationRouter, {prefix: '/api/', logLevel: 'info'})

        if (!!process.env['NODE_ENV'] && process.env.NODE_ENV === 'production') {
            for (const signal of ['SIGINT', 'SIGTERM']) {
                process.on(signal, () =>
                    fastifyApp.close().then((exception) => {
                        fastifyApp.log.info(`close application on ${signal}`)
                        process.exit(exception ? 1 : 0)
                    }),
                )
            }
        }

        fastifyApp.setErrorHandler((error, _request, reply) => {
            if (error instanceof errorCodes.FST_ERR_BAD_STATUS_CODE) {
                fastifyApp.log.error(error)
                reply.status(500).send({ok: false})
            } else {
                reply.send(error)
            }

            fastifyApp.log.error(error, '[GLOBAL-HANDLER]')
        })


    } catch (exception) {
        fastifyApp.log.error(exception)
        console.error(exception)
    }


    return fastifyApp
}

process.on('unhandledRejection', (e) => {
    console.error(e)
    process.exit(1)
})



