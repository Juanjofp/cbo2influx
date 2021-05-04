import fetch from 'node-fetch';
import { App, buildApp } from '../src/app';
// import { buildConfig } from '../src/config';

jest.mock('../src/config', () => {
    return {
        buildConfig() {
            return {
                influx: {
                    host: 'http://localhost',
                    port: 8087,
                    db: 'centic',
                    token: 'juanjo:juanjofp'
                }
            };
        }
    };
});

const data = [
    {
        id: 'age01_Car',
        type: 'Device',
        Acceleration: {
            type: 'Number',
            value: 40,
            metadata: {
                dateCreated: {
                    type: 'DateTime',
                    value: '2021-03-11T14:22:08.953Z'
                },
                dateModified: {
                    type: 'DateTime',
                    value: '2021-03-29T15:16:44.983Z'
                }
            }
        },
        Engine_Oxigen: {
            type: 'Number',
            value: 0,
            metadata: {
                dateCreated: {
                    type: 'DateTime',
                    value: '2021-03-11T14:22:08.953Z'
                },
                dateModified: {
                    type: 'DateTime',
                    value: '2021-03-29T15:09:49.876Z'
                }
            }
        },
        Engine_Temperature: {
            type: 'Number',
            value: 20,
            metadata: {
                dateCreated: {
                    type: 'DateTime',
                    value: '2021-03-11T14:22:08.953Z'
                },
                dateModified: {
                    type: 'DateTime',
                    value: '2021-03-29T15:09:49.849Z'
                }
            }
        }
    }
];

const notification = {
    subscriptionId: '6061ee734c18649aeb0fb4d8',
    data: data
};

async function createDB(dbname: string) {
    await fetch(`http://localhost:8087/query?q=CREATE DATABASE ${dbname}`, {
        method: 'POST',
        headers: {
            Authorization: 'Token admin:juanjofp'
        }
    });
}

async function dropDB(dbname: string) {
    await fetch(`http://localhost:8087/query?q=DROP DATABASE ${dbname}`, {
        method: 'POST'
    });
}
describe('SubscriptionV1', () => {
    let app: App;

    beforeEach(async () => {
        app = await buildApp();
    });
    afterEach(async () => {
        await app.close();
    });

    test('should return 200 ok when receive a valid CBO notification', async () => {
        await createDB('centic');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v1',
            payload: notification
        });
        await dropDB('centic');
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(204);
        expect(body.url).toEqual('http://localhost:8087/write?db=centic');
        expect(body.body).toContain(
            'Acceleration,id=age01_Car,type=Device,host=localhost value=40'
        );
        expect(body.body).toContain(
            'Engine_Oxigen,id=age01_Car,type=Device,host=localhost value=0'
        );
        expect(body.body).toContain(
            'Engine_Temperature,id=age01_Car,type=Device,host=localhost value=20'
        );
    });

    test('should return 200 ok when receive a valid CBO notification with database', async () => {
        await createDB('fiware');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v1/fiware',
            payload: notification
        });
        await dropDB('fiware');

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(204);
        expect(body.url).toEqual('http://localhost:8087/write?db=fiware');
        expect(body.body).toContain(
            'Acceleration,id=age01_Car,type=Device,host=localhost value=40'
        );
        expect(body.body).toContain(
            'Engine_Oxigen,id=age01_Car,type=Device,host=localhost value=0'
        );
        expect(body.body).toContain(
            'Engine_Temperature,id=age01_Car,type=Device,host=localhost value=20'
        );
    });

    test('should return 400 when receive a invalid db', async () => {
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v1/invaliddb',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(404);
        expect(body.error).toBeDefined();
        expect(body.error.length).toBeGreaterThan(5);
        expect(body.url).toEqual('http://localhost:8087/write?db=invaliddb');
        expect(body.body).toContain(
            'Acceleration,id=age01_Car,type=Device,host=localhost value=40'
        );
        expect(body.body).toContain(
            'Engine_Oxigen,id=age01_Car,type=Device,host=localhost value=0'
        );
        expect(body.body).toContain(
            'Engine_Temperature,id=age01_Car,type=Device,host=localhost value=20'
        );
    });
});
