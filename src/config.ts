import convict from 'convict';

export type Config = {
    env: 'production' | 'development' | 'test';
    http: {
        host: string;
        port: number;
    };
    influx: {
        host: string;
        port: number;
        org: string;
        bucket: string;
        db: string;
        token: string;
    };
};

export function buildConfig(): Config {
    const config = convict<Config>({
        env: {
            doc: 'The application environment.',
            format: ['production', 'development', 'test'],
            default: 'development',
            env: 'NODE_ENV'
        },
        http: {
            host: {
                doc: 'The host ip address to bind the http server.',
                format: String,
                default: '0.0.0.0',
                env: 'HTTP_HOST'
            },
            port: {
                doc: 'The port to bind the http server.',
                format: 'port',
                default: 8889,
                env: 'HTTP_PORT'
            }
        },
        influx: {
            host: {
                doc: 'The host ip address to InfluxDb server.',
                format: String,
                default: 'http://localhost',
                env: 'INFLUX_HOST'
            },
            port: {
                doc: 'The port to bind the Influx server.',
                format: 'port',
                default: 8086,
                env: 'INFLUX_PORT'
            },
            org: {
                doc: 'The organization in InfluxDB',
                format: String,
                default: 'myorg',
                env: 'INFLUC_ORG'
            },
            bucket: {
                doc: 'The backet where write data',
                format: String,
                default: 'mybucket',
                env: 'INFLUX_BUCKET'
            },
            db: {
                doc: 'The default DB where write data',
                format: String,
                default: 'centic',
                env: 'INFLUX_DATABASE'
            },
            token: {
                doc: 'Token to access InfluxDB',
                format: String,
                default:
                    '1apeD-rqRprWCsiGFN6I15yQhZrCJK3gRFgjfOnqRc0M8z0q0WU5qcGgiZ_VgWiDu_6BjkH5mhKnYaFJjVKjMw==',
                env: 'INFLUX_TOKEN'
            }
        }
    });
    config.validate({ allowed: 'strict' });
    return config.getProperties();
}
