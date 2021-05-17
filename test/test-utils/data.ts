import fetch from 'node-fetch';

export const data = [
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

export const dataString = [
    {
        id: 'age01_Car',
        type: 'Device',
        Start_Time: {
            type: 'String',
            value: '2021-03-11T14:22:08.953Z',
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
        Order: {
            type: 'String',
            value: '123z 345+234=7',
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

export const notification = {
    subscriptionId: '6061ee734c18649aeb0fb4d8',
    data: data
};

export const notificationString = {
    subscriptionId: '6061ee734c18649aeb0fb4d8',
    data: dataString
};

export async function createDB(dbname: string): Promise<void> {
    await fetch(`http://localhost:8087/query?q=CREATE DATABASE ${dbname}`, {
        method: 'POST',
        headers: {
            Authorization: 'Token juanjo:juanjofp'
        }
    });
}

export async function dropDB(dbname: string): Promise<void> {
    await fetch(`http://localhost:8087/query?q=DROP DATABASE ${dbname}`, {
        method: 'POST'
    });
}

type ORG = { id: string; name: string };
export const getOrganizationId = async (
    orgName: string
): Promise<string | null> => {
    const response = await fetch(`http://localhost:8086/api/v2/orgs`, {
        method: 'GET',
        headers: {
            Authorization:
                'Token 1apeD-rqRprWCsiGFN6I15yQhZrCJK3gRFgjfOnqRc0M8z0q0WU5qcGgiZ_VgWiDu_6BjkH5mhKnYaFJjVKjMw=='
        }
    });
    const data: { orgs: ORG[] } = await response.json();
    const result = data.orgs.find((org: ORG) => org.name === orgName);
    if (result) return result.id;
    return null;
};

const prepareBucket = async (bucketName: string) => ({
    orgID: await getOrganizationId('myorg'),
    name: bucketName,
    description: `Bucket for testing with name ${bucketName}`,
    retentionRules: [
        {
            type: 'expire',
            everySeconds: 86400,
            shardGroupDurationSeconds: 0
        }
    ],
    schemaType: 'implicit'
});

export async function createBucket(bucketName: string): Promise<void> {
    await fetch(`http://localhost:8086/api/v2/buckets`, {
        method: 'POST',
        headers: {
            Authorization:
                'Token 1apeD-rqRprWCsiGFN6I15yQhZrCJK3gRFgjfOnqRc0M8z0q0WU5qcGgiZ_VgWiDu_6BjkH5mhKnYaFJjVKjMw=='
        },
        body: JSON.stringify(await prepareBucket(bucketName))
    });
}
