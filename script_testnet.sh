# AWS Nautilus values start
export PCR0=85dbd37e5de4e846b549187c1a2e527289648cf126e2c2077497da5065608cbd2e2c8fc5b80f1e55f603fc5bbe82fff1
export PCR1=85dbd37e5de4e846b549187c1a2e527289648cf126e2c2077497da5065608cbd2e2c8fc5b80f1e55f603fc5bbe82fff1
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

export ENCLAVE_PACKAGE_ID=0x4db142b98001936f97adcf1f15a625fef0a2f3b1a59ef36b23ecf26e938a33ac
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x437b5cfd73afb26e2dc43d1408a63c667fc2c076d29c9574d0205565474b9707
export ENCLAVE_CONFIG_OBJECT_ID=0x8b37c47b4fabc8bca75fefd4a2fc8f08f5378878cbe099c8459008f09f017d2f
export APP_PACKAGE_ID=0xe52429a171fc8d4ac6cea09b0d2f8891feb32e70577dfb16ecf9883bcc2e7eb2
export AGENT_REGISTRY=0x33e55f1c671fa5177c1b47c60909b87963f55f0ae4df164c4bec279527f30a91
export PROTOCOL_CONFIG_ID=0x2b7a0a34973bb8ea41de60e7631cedc58210c417a1de776b5208afba94598fc5

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0x7b48146b5b8ff2f75c26e1a826cd778654ae4dccc49790c7279d240be264986c

sui client call --function set_canonical_enclave --module sentinel --package $APP_PACKAGE_ID --args $PROTOCOL_CONFIG_ID $ENCLAVE_OBJECT_ID 0x6

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
