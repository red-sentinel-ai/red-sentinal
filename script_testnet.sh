# AWS Nautilus values start
export PCR0=cc3730aaf1b5927a3196c4ad514dc5e983482f2d8bd2eb089c6008551912d5bf5ea4d99af29a9c90fcc2c1fbef565e13
export PCR1=cc3730aaf1b5927a3196c4ad514dc5e983482f2d8bd2eb089c6008551912d5bf5ea4d99af29a9c90fcc2c1fbef565e13
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

export ENCLAVE_PACKAGE_ID=0xe3317997d10fd03ed8fc7eab44b2b25be3bef37b2519c6e6beb81e078e0a68db
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x2acefd40eb28cb5a650e568b76d0f74deec33436ab2ad7dfab4d4f7c8409b11a
export ENCLAVE_CONFIG_OBJECT_ID=0x20fa71800686f6a4549fd337303922f0d02bd4067fe25e3f617212a463e85d72
export APP_PACKAGE_ID=0x580bf20669dc05d90cc3a3449173e9808c192395146c21de481d3fc1936e16a4
export AGENT_REGISTRY=0x25df890e43ea61c4d4ab458a770f13c4262ece345683095079e8b042eb19e55d
export PROTOCOL_CONFIG_ID=0xeef6ed63b978db68dd3707168a712ec82a8862f5d3128db2759fbc393fe25f04

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0x28006db828f6e7d8a609b766923b644eb4d95ed46484f4ee24c314a9e2dd2aae

sui client call --function set_canonical_enclave --module sentinel --package $APP_PACKAGE_ID --args $PROTOCOL_CONFIG_ID $ENCLAVE_OBJECT_ID 0x6

echo "ENCLAVE_OBJECT_ID:" $ENCLAVE_OBJECT_ID

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
