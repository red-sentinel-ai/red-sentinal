# AWS Nautilus values start
export PCR0=5e5da68b807a668e688f972d5087c8f77e885cf1410069dac9ad0651984eeb16010444c4f1a613daf84a9746ba8eda45
export PCR1=5e5da68b807a668e688f972d5087c8f77e885cf1410069dac9ad0651984eeb16010444c4f1a613daf84a9746ba8eda45
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

export ENCLAVE_PACKAGE_ID=0xcf2957005fcbb2fd4c4601d08a4869f9b3cd01632844d68356846ec83189d497
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x55e00df6be91e2fbde037f70bd0aa76dcc137a4a5249e787cd39e8259cbf946f
export ENCLAVE_CONFIG_OBJECT_ID=0xd506a0fd1d430e8a1ea56aa13775a3a4eb533d0b8c484f5e4449ecb053d8129b
export APP_PACKAGE_ID=0x77f8bc360582dcc5c31ccb5f550e2649981ad05d62eb2df24728a5a4c7befce9
export AGENT_REGISTRY=0x29580d8160573f38f3ee4740b393b1ddec2655e5f9374f9e7cdf1c1f5d120794
export PROTOCOL_CONFIG_ID=0xe634b68d0ddb96ae946d26602e674dd0c34796f8f0d99b32e392769a5542c549

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

# export ENCLAVE_OBJECT_ID=0xba571019c601097db3263b7b0dc52e25a0f2f0e451198be9795ab3149b2c1e2f

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
