const envSchema = {
    type: 'object',
    required: ['PORT'],
    properties: {
        PORT: {
            type: 'number',
            default: 3000
        },
        SERVER_LOGGER_LEVEL: {
            type: 'string',
            default: 'info'
        }
    }
}

const envOptions = {
    schema: envSchema,
    data: process.env,
    dotenv: true,
}

export const environmentVars = () => envOptions

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            PORT: number,
            SERVER_LOGGER_LEVEL: string,
        };
    }
}
