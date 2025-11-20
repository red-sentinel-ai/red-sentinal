#!/bin/bash

# This script re-configures the EC2 host and the Nitro Enclave based on the
# contents of src/nautilus-server/allowed_endpoints.yaml.
#
# Run this script any time you modify the allowed_endpoints.yaml file.
# It will automatically rebuild and restart the enclave with the new configuration.
#
# Usage:
# 1. SSH into your EC2 instance.
# 2. Edit src/nautilus-server/allowed_endpoints.yaml to add or remove endpoints.
# 3. Run this script from the root of the 'nautilus' project directory:
#    sudo ./update_endpoints.sh
#

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)."
  exit 1
fi

# It's assumed this script is run from the project root, where the Makefile is.
if [ ! -f "Makefile" ]; then
    echo "Error: This script must be run from the root of the 'nautilus' project directory."
    exit 1
fi

REPO_DIR=$(pwd)
# The user that owns the repository files.
REPO_OWNER="ec2-user"

echo "--> Reading endpoints from src/nautilus-server/allowed_endpoints.yaml..."
# Ensure yq is available
if ! command -v yq >/dev/null 2>&1; then
  echo "Error: yq is not installed. Please install it (e.g., 'sudo yum install yq')."
  exit 1
fi

# Read endpoints as the user who owns the file.
ENDPOINTS=$(sudo -u $REPO_OWNER yq e '.endpoints | join(" ")' src/nautilus-server/allowed_endpoints.yaml)
if [ -z "$ENDPOINTS" ]; then
    echo "Warning: No endpoints found in src/nautilus-server/allowed_endpoints.yaml."
fi

echo "--> Stopping existing services (enclave, socat, vsock-proxy)..."
pkill socat || true
pkill vsock-proxy || true
# Terminate enclave if it's running
ENCLAVE_ID=$(nitro-cli describe-enclaves | jq -r ".[0].EnclaveID" 2>/dev/null)
if [ -n "$ENCLAVE_ID" ] && [ "$ENCLAVE_ID" != "null" ]; then
    nitro-cli terminate-enclave --enclave-id "$ENCLAVE_ID"
fi

echo "--> Re-configuring host networking..."

# Overwrite the vsock-proxy config file to ensure it's clean.
# The base file is expected to be minimal. We add all endpoints from our yaml.
VSOCK_PROXY_CONFIG="/etc/nitro_enclaves/vsock-proxy.yaml"
echo "services:" > $VSOCK_PROXY_CONFIG
for ep in $ENDPOINTS; do
    echo "  - {address: $ep, port: 443}" >> $VSOCK_PROXY_CONFIG
done

echo "Starting vsock-proxy processes for all endpoints..."
PORT=8101
for ep in $ENDPOINTS; do
    vsock-proxy $PORT $ep 443 &
    PORT=$((PORT+1))
done

echo "--> Re-configuring enclave run.sh script..."
# This section modifies src/nautilus-server/run.sh, which is part of the source code.
# We run it as the repository owner to maintain correct file permissions.
sudo -u $REPO_OWNER bash -c "
    set -e
    cd '$REPO_DIR'
    ENDPOINTS=\"$(yq e '.endpoints | join(" ")' src/nautilus-server/allowed_endpoints.yaml)\" 

    # Regenerate /etc/hosts entries in run.sh
    ip=64
    endpoints_config=\"\"
    for ep in \$ENDPOINTS; do
        endpoints_config=\"\${endpoints_config}echo \\\"127.0.0.\\\$ip   \\\" \\" \\" \$ep\\\" >> /etc/hosts\\\"\\n\\\""
        ip=\$((ip+1))
    done

    # Use sed to replace the block of host entries. The exclamation mark as a delimiter avoids issues with slashes.
    sed -i '/# Add a hosts record/,/# End of hosts record/c# Add a hosts record\n    echo \"127.0.0.1   localhost\" > /etc/hosts\n# End of hosts record' src/nautilus-server/run.sh
    sed -i \"/# End of hosts record/i \$endpoints_config\" src/nautilus-server/run.sh

    # Regenerate traffic_forwarder.py entries in run.sh
    ip_forwarder=64
    port_forwarder=8101
    traffic_config=\"\"
    for ep in \$ENDPOINTS; do
        traffic_config=\"\${traffic_config}python3 /traffic_forwarder.py 127.0.0.\\$ip_forwarder 443 3 \\\$port_forwarder &\\n\"
        ip_forwarder=\$((ip_forwarder+1))
        port_forwarder=\$((port_forwarder+1))
    done

    # Replace the block of traffic forwarder entries
    sed -i '/# Traffic-forwarder-block/,/# End of traffic-forwarder-block/c# Traffic-forwarder-block\n# End of traffic-forwarder-block' src/nautilus-server/run.sh
    sed -i \"/# End of traffic-forwarder-block/i \$traffic_config\" src/nautilus-server/run.sh
"

echo "--> Rebuilding the enclave image (make)..."
# Make must be run as the user who owns the source files.
sudo -u $REPO_OWNER make

echo "--> Running the new enclave (make run)..."
# 'make run' executes 'sudo nitro-cli...', so it needs root.
make run

echo "--> Exposing the enclave (expose_enclave.sh)..."
# Run expose_enclave.sh in the background as the repo owner.
sudo -u $REPO_OWNER ./expose_enclave.sh &

sleep 2 # Give socat a moment to start.

echo ""
echo "✅ Done! The enclave has been updated and is running with the new configuration."
echo "You can check the running enclave with 'nitro-cli describe-enclaves'."
echo "You can see the forwarded ports with 'ps aux | grep socat'."
