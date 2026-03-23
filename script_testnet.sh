# AWS Nautilus values start
export PCR0=b8715f9f324b7e608ba265c3b43a2bc95bc93cd9b9129f4ad45edfe7fa548028179fe76e0977e3244a32778badd09690
export PCR1=b8715f9f324b7e608ba265c3b43a2bc95bc93cd9b9129f4ad45edfe7fa548028179fe76e0977e3244a32778badd09690
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

export ENCLAVE_PACKAGE_ID=0xda8ef0b4dc346ba48e84b1babb83d43066d3e74a4c2abf17860881ea6d4127d5
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x9d968531cf5699ea9e58dc2d09ad280a42072161951b25b886361cdd754060e2
export ENCLAVE_CONFIG_OBJECT_ID=0x7c7bde1f1026d9ae7672593a1c860e629e98a2855fa0fabc429faba382c37277
export APP_PACKAGE_ID=0x69615c3a87ad8288e78cc4c6482d2e5921ce71bf56ba56ba757b01ac439cea76
export AGENT_REGISTRY=0x29e941ef8ab71e09d23336f34c7535983586e071eee107f927e3dcffa8cb8fbe
export PROTOCOL_CONFIG_ID=0x168ce294a3b3ca3456f505ae0fd58fe0bbe660725b7fce41c3263f3aade0094d



echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# # this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0x667e7657ad509710c42291d36e0a6d96c0f00db0469a8d94120d9d0ff137752d

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
