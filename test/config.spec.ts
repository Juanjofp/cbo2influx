import { buildConfig, Config } from '../src/config';

describe('Config', () => {
    let config: Config;
    beforeAll(() => {
        config = buildConfig();
    });

    test('should return default values of host and port', () => {
        expect(config.http.host).toEqual('0.0.0.0');
        expect(config.http.port).toBe(8889);
        expect(config.env).toEqual('test');
    });
});
