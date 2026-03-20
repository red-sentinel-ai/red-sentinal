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

export ENCLAVE_PACKAGE_ID=0x74b12d0903b409cdcb1ce06280ff3eef7b35622ae164c1d7c4cd154231d89f25
echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x0e992899eeeea6a6a9e813b7b9e1e227cbc4266e3c8499127e5d122429a2121e
export ENCLAVE_CONFIG_OBJECT_ID=0xb26f65ee61b04683a1ceec33932ebb988cdd6532e06908d6c6209e3d83fa7f39
export APP_PACKAGE_ID=0x88b83f36dafcd5f6dcdcf1d2cb5889b03f61264ab3cee9cae35db7aa940a21b7
export AGENT_REGISTRY=0xc47564f5f14c12b31e0dfa1a3dc99a6380a1edf8929c28cb0eaa3359c8db36ac
export PROTOCOL_CONFIG_ID=0x2fa4fa4a1dd0498612304635ff9334e1b922e78af325000e9d9c0e88adea459f



# {
#   "ENCLAVE_PACKAGE_ID": "0x74b12d0903b409cdcb1ce06280ff3eef7b35622ae164c1d7c4cd154231d89f25",
#   "CAP_OBJECT_ID": "0x0e992899eeeea6a6a9e813b7b9e1e227cbc4266e3c8499127e5d122429a2121e",
#   "ENCLAVE_CONFIG_OBJECT_ID": "0xb26f65ee61b04683a1ceec33932ebb988cdd6532e06908d6c6209e3d83fa7f39",
#   "APP_PACKAGE_ID": "0x88b83f36dafcd5f6dcdcf1d2cb5889b03f61264ab3cee9cae35db7aa940a21b7",
#   "AGENT_REGISTRY": "0xc47564f5f14c12b31e0dfa1a3dc99a6380a1edf8929c28cb0eaa3359c8db36ac",
#   "PROTOCOL_CONFIG_ID": "0x2fa4fa4a1dd0498612304635ff9334e1b922e78af325000e9d9c0e88adea459f",
#   "ENCLAVE_OBJECT_ID": "0xfb1261aeb9583514cb1341a548a5ec12d1231bd96af22215f1792617a93e1213",
#   "CLOCK_OBJECT_ID": "0x6",
#   "GAS_BUDGET": 100000000
# }



echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "APP_PACKAGE_ID": $APP_PACKAGE_ID

# # this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$APP_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
sh register_enclave.sh $ENCLAVE_PACKAGE_ID $APP_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

# export ENCLAVE_OBJECT_ID=0x667e7657ad509710c42291d36e0a6d96c0f00db0469a8d94120d9d0ff137752d

# sui client call --function set_canonical_enclave --module sentinel --package $APP_PACKAGE_ID --args $PROTOCOL_CONFIG_ID $ENCLAVE_OBJECT_ID 0x6

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
