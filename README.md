<img width="200" src="./logo.jpg" />

# CBO2Influx

Little tool to receive Orion Context Broken subscriptions and save data into InfluxDB.

## Docker

```
    cbo2influx:
        image: juanjofranco/cbo2influx
        ports:
            - '8889:8889'
        environment:
            # Where fastify is listen
            - HTTP_HOST=0.0.0.0
            # Where is InfluxDB
            - INFLUX_HOST=http://influxdb
            - INFLUX_PORT=8086
            # Info about ORG in InfluxDB v2
            - INFLUX_ORG=myorg
            # Default bucket for influxDB v2
            - INFLUX_BUCKET=mybucket
            # Default database for InfluxDB v1
            - INFLUX_DATABASE=centic
            # Security token from InfluxDB
            # Always required in influxdb v2
            # When security enabled in V1 use username:password
            - INFLUX_TOKEN=supersecrettokenfrominfluxdb
            - INFLUX_TOKEN=username:password
```

## Usage

Subscription for influxDB v1 in the default database

```
{
    "description": "Suscripcion InfluxDb v1",
    "subject": {
        "entities": [ { "idPattern": ".*", "type": "Device" } ],
        "condition": { "attrs": [ "Speed" ] } },
        "notification": { "attrs": [ "id", "Speed", "dateObserved" ],
        "http": { "url": "http://cbo2influx:8889/v1" },
        "metadata": [ "dateCreated", "dateModified" ]
    }
}
```

Subscription for influxDB v1 in database mydatabase

```
{
    "description": "Suscripcion InfluxDb v1 in mydatabase",
    "subject": {
        "entities": [ { "idPattern": ".*", "type": "Device" } ],
        "condition": { "attrs": [ "Speed" ] } },
        "notification": { "attrs": [ "id", "Speed", "dateObserved" ],
        "http": { "url": "http://cbo2influx:8889/v1/mydatabase" },
        "metadata": [ "dateCreated", "dateModified" ]
    }
}
```

Subscription for influxDB v2 in the default bucket

```
{
    "description": "Suscripcion InfluxDb v2",
    "subject": {
        "entities": [ { "idPattern": ".*", "type": "Device" } ],
        "condition": { "attrs": [ "Speed" ] } },
        "notification": { "attrs": [ "id", "Speed", "dateObserved" ],
        "http": { "url": "http://cbo2influx:8889/v2" },
        "metadata": [ "dateCreated", "dateModified" ]
    }
}
```

Subscription for influxDB v2 in bucket mybucket

```
{
    "description": "Suscripcion InfluxDb v2 in mybucket",
    "subject": {
        "entities": [ { "idPattern": ".*", "type": "Device" } ],
        "condition": { "attrs": [ "Speed" ] } },
        "notification": { "attrs": [ "id", "Speed", "dateObserved" ],
        "http": { "url": "http://cbo2influx:8889/v2/mybucket" },
        "metadata": [ "dateCreated", "dateModified" ]
    }
}
```
