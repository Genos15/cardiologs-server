import {MultipartFile} from "@fastify/multipart";

export abstract class FastifyCsvParser {
    parse({file, mimetype}: MultipartFile): Promise<string> {
        if (mimetype !== 'text/csv') {
            throw new Error('Unsupported file');
        }

        return new Promise(async (resolve, reject) => {
            const contentBuffer: Uint8Array[] = []

            file.on('data', (chunk) => {
                contentBuffer.push(chunk)
            });

            file.on('end', () => {
                const fileContent = Buffer.concat(contentBuffer).toString('utf-8');
                resolve(fileContent)
            });

            file.on('error', (error) => {
                reject(error)
            });
        });
    }
}
