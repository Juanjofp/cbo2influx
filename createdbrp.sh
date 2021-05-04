curl --request POST http://localhost:8086/api/v2/dbrps \
  --header "Authorization: Token 1apeD-rqRprWCsiGFN6I15yQhZrCJK3gRFgjfOnqRc0M8z0q0WU5qcGgiZ_VgWiDu_6BjkH5mhKnYaFJjVKjMw==" \
  --header 'Content-type: application/json' \
  --data '{
        "bucketID": "2e36558cbfa398cf",
        "database": "centic",
        "default": true,
        "org": "overtel",
        "retention_policy": "example-rp"
      }'