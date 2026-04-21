#!/bin/bash

# Payload Testing Script for https://ainewsworld.ai/
# This script generates a large payload and sends it as a POST request

echo "=== Payload Testing Script ==="
echo "Generating 20MB payload..."

# Generate a 20MB payload
long_payload=$(head -c 20M /dev/urandom | base64)

echo "Payload generated successfully"
echo "Payload size: $(echo "$long_payload" | wc -c) characters"
echo "Sending POST request to https://ainewsworld.ai/..."

# Send it to the site (adjust the endpoint if you know one, or use the home page)
response=$(curl -X POST "https://ainewsworld.ai/" \
  -H "Content-Type: application/json" \
  -d "{\"data\": \"$long_payload\"}" \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\nSize: %{size_download} bytes\n" \
  -s)

echo "Response received:"
echo "$response"

echo "=== Test Complete ==="
