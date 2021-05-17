import { App, buildApp } from '../src/app';
import {
    notification,
    notificationString,
    createDB,
    dropDB
} from './test-utils/data';

const defaultDB = 'mydatabase';
jest.mock('../src/config', () => {
    return {
        buildConfig() {
            return {
                influx: {
                    host: 'http://localhost',
                    port: 8087,
                    db: defaultDB,
                    token: 'juanjo:juanjofp'
                }
            };
        }
    };
});

describe('SubscriptionV1', () => {
    let app: App;

    beforeEach(async () => {
        app = await buildApp();
    });
    afterEach(async () => {
        await app.close();
    });

    test('should return 200 ok when receive a valid CBO notification', async () => {
        await createDB(defaultDB);
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v1',
            payload: notification
        });
        await dropDB(defaultDB);
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(204);
        expect(body.url).toEqual('http://localhost:8087/write?db=' + defaultDB);
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

    test('should return 200 ok when receive a valid CBO notification containing a string', async () => {
        await createDB('fiware');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v1/fiware',
            payload: notificationString
        });
        await dropDB('fiware');

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(204);
        expect(body.url).toEqual('http://localhost:8087/write?db=fiware');
        expect(body.body).toContain(
            'Start_Time,id=age01_Car,type=Device,host=localhost value="2021-03-11T14:22:08.953Z"'
        );
        expect(body.body).toContain(
            'Order,id=age01_Car,type=Device,host=localhost value="123z 345+234=7"'
        );
        expect(body.body).toContain(
            'Engine_Temperature,id=age01_Car,type=Device,host=localhost value=20'
        );
    });
});
