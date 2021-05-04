import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fetch, { RequestInit, Response } from 'node-fetch';
import { Server } from 'node:http';
import { Config } from '../config';
import logger from '../logger';

export type SubscriptionAttribute = {
    type: string;
    value: number | string;
    metadata: {
        dateCreated: {
            type: 'DateTime';
            value: string;
        };
        dateModified: {
            type: 'DateTime';
            value: string;
        };
    };
};

export type Subscription = {
    subscriptionId: string;
    data: SubscriptionData[];
};
export type SubscriptionData = Record<string, string | SubscriptionAttribute>;
function extractHostname(hostname: string) {
    if (!hostname || typeof hostname !== 'string') {
        return 'default';
    }
    const index = hostname.indexOf(':');
    return index > 0 ? hostname.substring(0, index) : hostname;
}
const parseRequest = (request: FastifyRequest<{ Body: Subscription }>) => {
    logger.info('CBO Subscription');
    const { data } = request.body;
    const dateTime = Date.now() * 1000000;
    const hostname = extractHostname(request.hostname);
    const requests: string[] = [];
    data.forEach(element => {
        const { id, type } = element;
        Object.keys(element)
            .filter(key => key !== 'id' && key !== 'type')
            .forEach(key => {
                const value = element[key] as SubscriptionAttribute;
                const body = `${key},id=${id},type=${type},host=${hostname} value=${value.value} ${dateTime}`;
                requests.push(body);
            });
    });

    return requests.join('\n');
};

const parseResponse = async (
    response: Response,
    body: string,
    server: string
) => {
    let error: string | undefined;
    if (response.status >= 400) {
        const jsonError = await response.json();
        error = jsonError.error || jsonError.message;
    }
    logger.info({
        url: server,
        body,
        status: response.status,
        error
    });
    return {
        url: server,
        body,
        status: response.status,
        error
    };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function buildSubscriptionRoute(config: Config) {
    const { host, port, org } = config.influx;

    const createRequestParams = (body: string) => {
        const reqParams: RequestInit = {
            method: 'POST',
            body
        };
        if (config.influx.token) {
            reqParams.headers = {
                Authorization: 'Token ' + config.influx.token
            };
        }
        return reqParams;
    };

    // async function receiveSubscriptionV2(
    //     request: FastifyRequest<{
    //         Params: { bucket: string };
    //         Body: Subscription;
    //     }>,
    //     reply: FastifyReply<Server>
    // ) {
    //     const bucket = request.params.bucket ?? config.influx.bucket;
    //     const influxServerV2 = `${host}:${port}/api/v2/write?org=${org}&bucket=${bucket}&precision=ns`;
    //     const bodies = parseRequest(request);
    //     try {
    //         const responses: {
    //             url: string;
    //             body: string;
    //             status: number;
    //             error?: string;
    //         }[] = [];
    //         for (const body of bodies) {
    //             const response = await fetch(influxServerV2, {
    //                 method: 'POST',
    //                 headers: {
    //                     Authorization: 'Token ' + config.influx.token
    //                 },
    //                 body
    //             });
    //             let error: string | undefined;
    //             if (response.status >= 400) {
    //                 const jsonError = await response.json();
    //                 error = jsonError.error || jsonError.message;
    //             }
    //             logger.info({
    //                 url: influxServerV2,
    //                 body,
    //                 status: response.status,
    //                 error
    //             });
    //             responses.push({
    //                 url: influxServerV2,
    //                 body,
    //                 status: response.status,
    //                 error
    //             });
    //         }
    //         reply.status(200).send(responses);
    //     } catch (error) {
    //         logger.error(error);
    //         reply.status(500).send({ code: 500, error: error.message });
    //     }
    // }

    async function receiveSubscriptionV2(
        request: FastifyRequest<{
            Params: { bucket: string };
            Body: Subscription;
        }>,
        reply: FastifyReply<Server>
    ) {
        const bucket = request.params.bucket ?? config.influx.bucket;
        const influxServerV2 = `${host}:${port}/api/v2/write?org=${org}&bucket=${bucket}&precision=ns`;
        const body = parseRequest(request);
        try {
            const reqParams = createRequestParams(body);
            const influxResponse = await fetch(influxServerV2, reqParams);
            const response = await parseResponse(
                influxResponse,
                body,
                influxServerV2
            );
            reply.status(200).send(response);
        } catch (error) {
            logger.error(error);
            reply.status(500).send({ code: 500, error: error.message });
        }
    }

    async function receiveSubscriptionV1(
        request: FastifyRequest<{ Params: { db: string }; Body: Subscription }>,
        reply: FastifyReply<Server>
    ) {
        const db = request.params.db ?? config.influx.db;
        const influxServerV1 = `${host}:${port}/write?db=${db}`;
        const body = parseRequest(request);
        try {
            const reqParams = createRequestParams(body);
            const influxResponse = await fetch(influxServerV1, reqParams);
            const response = await parseResponse(
                influxResponse,
                body,
                influxServerV1
            );
            reply.status(200).send(response);
        } catch (error) {
            logger.error(error);
            reply.status(500).send({ code: 500, error: error.message });
        }
    }

    return function (
        fastify: FastifyInstance,
        opts: Record<string, unknown>,
        next: () => void
    ) {
        fastify.post(
            '/v2',
            { ...opts /*, schema: subscriptionSchema*/ },
            receiveSubscriptionV2
        );

        fastify.post(
            '/v2/:bucket',
            { ...opts /*, schema: subscriptionSchema*/ },
            receiveSubscriptionV2
        );

        fastify.post(
            '/v1/:db',
            { ...opts /*, schema: subscriptionSchema*/ },
            receiveSubscriptionV1
        );

        fastify.post(
            '/v1',
            { ...opts /*, schema: subscriptionSchema*/ },
            receiveSubscriptionV1
        );

        next();
    };
}
