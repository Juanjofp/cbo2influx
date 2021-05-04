import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import logger from './logger';
import { buildConfig } from './config';
import { buildSubscriptionRoute } from './routes/subscriptions';

export type App = {
    close(): Promise<void>;
    getServer(): FastifyInstance;
};

export async function buildApp(): Promise<App> {
    const server = fastify({ logger });
    const config = buildConfig();
    server.register(buildSubscriptionRoute(config));
    return {
        async close(): Promise<void> {
            await server.close();
        },
        getServer(): FastifyInstance {
            return server;
        }
    };
}
