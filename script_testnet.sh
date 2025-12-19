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

export ENCLAVE_PACKAGE_ID=0xd7c8b80cd4465f2eb65f9cda8f8d21c5ebfd078c2f1af250c6d1bc227c069f87
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x46cb4bbdedf4332a8049a85a72abaf88ac0bb6074a8c95b0ac4a2401632e95ae
export ENCLAVE_CONFIG_OBJECT_ID=0x613bc939a609f59d7ceff21234e4a1e3b6aa3c1ce7af68f804c9ecf9d95e0cbe
export APP_PACKAGE_ID=0x92c7717c9588d33497444ecffe4f5b8fe8c597cd83ac17b9b74f9704fa40b24a
export AGENT_REGISTRY=0x67f38bcf41e9bd13231e18137e2d575eb857e3e5842630808c89867bf7ba7769
export PROTOCOL_CONFIG_ID=0x844c54cccca8fcd45c16fec805c53cb2619a00767856e04f3c8eed412bfba2f9

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

# export ENCLAVE_OBJECT_ID=0xd6f87f884d2f9452f504674f271d0f21ce40d6b4a2273bbca830e8af9cb25845

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
