import {initializeApp} from "./lifecycle";

(async () => {
    const app = await  initializeApp()
    try {
        await app.ready()
        await app.listen({port: app.config.PORT})
    } catch (exception) {
        app.log.error(exception)
        process.exit(1)
    }
})()
