import { extractHostname } from '../src/routes/subscriptions';

test('extractHostname should get a valid hostname or default', () => {
    expect(extractHostname('')).toEqual('default');
    expect(extractHostname((null as unknown) as string)).toEqual('default');
    expect(extractHostname('localhost')).toEqual('localhost');
});
