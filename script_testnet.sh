# AWS Nautilus values start
export PCR0=dc6d3e30b938afdfb08ba522c2dde20051f28b0af063a41b6e87f8cf5222166b8afeb03e547e0803eeebb22304ed66db
export PCR1=dc6d3e30b938afdfb08ba522c2dde20051f28b0af063a41b6e87f8cf5222166b8afeb03e547e0803eeebb22304ed66db
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

export ENCLAVE_PACKAGE_ID=0x8be4085c406f962366f76869f747f04aba34e57386f1b069c63f6135e0b10a78
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x1af34ce7b3c65817d6bdd5b9186f2d8bd1641e65c980cb1918de9091bbe337c1
export ENCLAVE_CONFIG_OBJECT_ID=0x7c77a3f3c25ddf6520a2570148dcc537ae9ab29cd3c37245204d343dbcaf8540
export APP_PACKAGE_ID=0x487c9f46f99f2ea824db30b089c9bd8b104de252ed27950efcf8ecf0115cd75a
export AGENT_REGISTRY=0xa1a717c5caebe7b645ed9d40ee571129cc89efa320f6318ed7b525d4690f3949
export PROTOCOL_CONFIG_ID=0xf6d08d6600b5559c8953dbba34ae1c2e19e6467140ad840bdaadd310090d2d27

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0x261c18a1889ade27b027e5008b25f0b632f932b1e42998e294da29921b2a3438

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
