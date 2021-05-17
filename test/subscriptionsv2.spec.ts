import { App, buildApp } from '../src/app';
import {
    notification,
    createBucket,
    notificationString
} from './test-utils/data';

describe('SubscriptionV2', () => {
    let app: App;

    beforeEach(async () => {
        app = await buildApp();
    });
    afterEach(async () => {
        await app.close();
    });
    test('should return 200 with v2', async () => {
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=ns'
        );
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

    test('should return 200 with v2 and bucket', async () => {
        await createBucket('centic');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/centic',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=myorg&bucket=centic&precision=ns'
        );
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

    test('should return 200 with v2 and bucket fiware', async () => {
        await createBucket('fiware');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/fiware',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=myorg&bucket=fiware&precision=ns'
        );
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

    test('should return 400 with v2 and invalid bucket', async () => {
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/invalidbucket',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(404);
        expect(body.error).toBeDefined();
        expect(body.error.length).toBeGreaterThan(5);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=myorg&bucket=invalidbucket&precision=ns'
        );
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
        await createBucket('fiware');
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/fiware',
            payload: notificationString
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);

        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=myorg&bucket=fiware&precision=ns'
        );
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
