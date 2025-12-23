# AWS Nautilus values start
export PCR0=e03aee6fb8da69f0092221b7a43e81c4d929128ab12e7cfb7a0a3a6683945bd8c9b893372b882e46aa18d84a79e1ef93
export PCR1=e03aee6fb8da69f0092221b7a43e81c4d929128ab12e7cfb7a0a3a6683945bd8c9b893372b882e46aa18d84a79e1ef93
export PCR2=21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a
export ENCLAVE_URL=http://18.213.79.225:3000

# AWS Nautilus values end

export MODULE_NAME=sentinel
export OTW_NAME=SENTINEL

echo "PCRS"
echo 0x$PCR0
echo 0x$PCR1
echo 0x$PCR2

echo "module name": $MODULE_NAME
echo "otw name": $OTW_NAME
echo "ENCLAVE_URL: " $ENCLAVE_URL

export ENCLAVE_PACKAGE_ID=0xd952ecf806710d4eb07d255944e05cb58a55b197e22fe35bc3fcdf2064825ca2
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x6abe5e51231b830b96905eea3f69d4ce4adcdd40549c0de662e12ca894eecb6e
export ENCLAVE_CONFIG_OBJECT_ID=0x751aa55d01859dd003b2d63add665e4b65f9c2d359311c19358c00803581ef2c
export APP_PACKAGE_ID=0x674de62e8b8ae71280b9ccf0be5e2d037e64ca8f124415889de346f05cf1ed2e
export AGENT_REGISTRY=0xa175bab0d35db58989c1ac4d3703ce88a37059bc6515238a660f6d46a58bc88b
export PROTOCOL_CONFIG_ID=0x5d5afd57682c674dda890ebec45d36b14b753fbfaec3b279d6f920d633f17775

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

# export ENCLAVE_OBJECT_ID=0x8da3dac1de4c79db363d3b370163424aa65a14e481a86c9e7ce737f75130d665

# echo "ENCLAVE_OBJECT_ID:" $ENCLAVE_OBJECT_ID

# sh register_agent.sh \
#   $APP_PACKAGE_ID \
#   $MODULE_NAME \
#   $OTW_NAME \
#   $ENCLAVE_OBJECT_ID \
#   "11b59e066aa41bfed2e39d455acb63e8196ead1aca555afbd2b259b85f88045fbabc5257e04313ff624e813ff0f257b2735b2d53a98742b5edf0f61d7b54130e" \
#   1747937545289 \
#   "3" \
#   $AGENT_REGISTRY \
#   1 \
#   "0x123"

# sh consume_prompt.sh \
#   $APP_PACKAGE_ID \
#   $MODULE_NAME \
#   $OTW_NAME \
#   $ENCLAVE_OBJECT_ID \
#   "e10e3a321c918fb6a4be62f02829da3e45006066d5506d303489dff1ee6f0a57e28f1704c035139f65d84ed85e39cceb3f2a7de0075bd1cd499a06d98fc28500" \
#   1747937756872 \
#   "3" \
#   $AGENT_REGISTRY
