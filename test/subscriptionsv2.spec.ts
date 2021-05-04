import { App, buildApp } from '../src/app';

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
            'http://localhost:8086/api/v2/write?org=overtel&bucket=centic&precision=ns'
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
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/centic',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=overtel&bucket=centic&precision=ns'
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
        const response = await app.getServer().inject({
            method: 'POST',
            url: '/v2/fiware',
            payload: notification
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toEqual(204);
        expect(body.url).toEqual(
            'http://localhost:8086/api/v2/write?org=overtel&bucket=fiware&precision=ns'
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
            'http://localhost:8086/api/v2/write?org=overtel&bucket=invalidbucket&precision=ns'
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
});
