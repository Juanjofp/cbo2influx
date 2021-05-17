import { App, buildApp } from '../src/app';
import { notification } from './test-utils/data';

jest.mock('../src/config', () => {
    return {
        buildConfig() {
            return {
                influx: {
                    host: 'http://invalidurl',
                    port: 6969,
                    db: 'nodabase',
                    org: 'noorg',
                    bucket: 'nobucket'
                }
            };
        }
    };
});

let app: App;

beforeEach(async () => {
    app = await buildApp();
});
afterEach(async () => {
    await app.close();
});

test('should thorw an exception when fails to parse response', async () => {
    const response = await app.getServer().inject({
        method: 'POST',
        url: '/v1',
        payload: notification
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.statusCode).toEqual(400);
    expect(body.error).toEqual('Invalid request');
    expect(body.message).toEqual(
        'request to http://invalidurl:6969/write?db=nodabase failed, reason: getaddrinfo ENOTFOUND invalidurl'
    );
});

test('should thorw an exception when fails to parse response', async () => {
    const response = await app.getServer().inject({
        method: 'POST',
        url: '/v2',
        payload: {}
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.statusCode).toEqual(400);
    expect(body.error).toEqual('Invalid request');
    expect(body.message).toEqual("Cannot read property 'forEach' of undefined");
});
