// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::IntentMessage;
use crate::common::{to_signed_response, IntentScope, ProcessDataRequest, ProcessedDataResponse};
use crate::AppState;
use crate::EnclaveError;
use axum::extract::State;
use axum::{response::IntoResponse, Json};
use bcs;
use blake2::{
    digest::{Update, VariableOutput},
    Blake2bVar,
};
use fastcrypto::encoding::{decode_bytes_hex, Encoding, Hex};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::models::{
    Agent, ConsumePromptRequest, ConsumePromptResponse, ErrorResponse, RegisterAgentRequest,
    RegisterAgentResponse,
};

pub async fn register_agent(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterAgentRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<RegisterAgentResponse>>>, EnclaveError> {
    #[derive(Debug, Deserialize)]
    struct ExternalRegisterResponse {
        agent_id: u64,
        creator: String,
        status: String,
    }

    let client = Client::new();
    let external_response = client
        .post("https://redteam.suisentinel.xyz/register")
        .bearer_auth("suihero@345") // adds: Authorization: Bearer <token>
        .json(&payload)
        .send()
        .await
        .map_err(|e| {
            EnclaveError::GenericError(format!("Failed to call register endpoint: {}", e))
        })?;
    if !external_response.status().is_success() {
        let status = external_response.status();
        let error_text = external_response
            .text()
            .await
            .unwrap_or_else(|_| "unable to read error body".to_string());
        return Err(EnclaveError::GenericError(format!(
            "Register endpoint returned status {}: {}",
            status, error_text
        )));
    }

    let ExternalRegisterResponse { agent_id, .. } = external_response
        .json::<ExternalRegisterResponse>()
        .await
        .map_err(|e| {
            EnclaveError::GenericError(format!("Failed to parse register response: {}", e))
        })?;
    let agent_id = agent_id.to_string();
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_millis() as u64;

    let agent = Agent {
        id: agent_id.clone(),
        system_prompt: payload.system_prompt.clone(),
        cost_per_message: payload.cost_per_message,
        is_defeated: false,
        creator: payload.creator.clone(),
        model_provider: payload.model_provider.clone(),
        model_name: payload.model_name.clone(),
        api_base_url: payload.api_base_url.clone(),
        api_key: payload.api_key.clone(),
    };

    let mut agents = state.agents.write().await;
    agents.insert(agent_id.clone(), agent);

    Ok(Json(to_signed_response(
        &state.eph_kp,
        RegisterAgentResponse {
            agent_id: agent_id.to_string(),
            cost_per_message: payload.cost_per_message,
            system_prompt: payload.system_prompt,
            is_defeated: false,
            creator: decode_bytes_hex(&payload.creator).unwrap(),
        },
        current_timestamp,
        IntentScope::RegisterAgent,
    )))
}

pub async fn consume_prompt(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConsumePromptRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<ConsumePromptResponse>>>, EnclaveError> {
    let agents = state.agents.write().await;
    let attack_object_id = payload.attack_object_id.clone();
    {
        let mut attack_object_usage = state.attack_object_usage.write().await;
        if attack_object_usage.contains_key(&attack_object_id) {
            return Err(EnclaveError::GenericError(
                "Attack object has already been used".to_string(),
            ));
        }
        attack_object_usage.insert(attack_object_id.clone(), false);
    }
    let mut hasher = Blake2bVar::new(32)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to initialize hasher: {}", e)))?;
    let client = Client::new();
    let url = "https://fullnode.testnet.sui.io";
    let request_body = json!({
          "jsonrpc": "2.0",
        "id": 1,
      "method": "sui_getObject",
      "params": [
        payload.attack_object_id,
        {
          "showType": true,
          "showOwner": true,
          "showDisplay": false,
          "showContent": true
        }
      ]
    });

    let response = client
        .post(url)
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        return Err(EnclaveError::GenericError(format!(
            "Attack request object API failed with status {}",
            error_text
        )));
    }

    let response_json: Value = response.json().await?;

    let is_not_used = response_json
        .get("result")
        .and_then(|result| result.get("data"))
        .and_then(|data| data.get("content"))
        .and_then(|content| content.get("fields"))
        .and_then(|fields| fields.get("used"))
        .and_then(|used| used.as_bool())
        .map(|used| !used) // Negate the boolean value
        .unwrap_or(false); // Default to not used being false if not found, to be safe
    let attacker = response_json
        .get("result")
        .and_then(|result| result.get("data"))
        .and_then(|data| data.get("owner"))
        .and_then(|owner| owner.get("AddressOwner"))
        .and_then(|address_owner| address_owner.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| {
            EnclaveError::GenericError(
                "Could not retrieve attacker address from attack object".to_string(),
            )
        })?;

    let nonce = response_json
        .get("result")
        .and_then(|result| result.get("data"))
        .and_then(|data| data.get("content"))
        .and_then(|content| content.get("fields"))
        .and_then(|fields| fields.get("nonce"))
        .and_then(|nonce| nonce.as_str())
        .and_then(|nonce_str| nonce_str.parse::<u64>().ok())
        .ok_or_else(|| {
            EnclaveError::GenericError("Could not retrieve nonce from attack object".to_string())
        })?;

    if !is_not_used {
        return Err(EnclaveError::GenericError(
            "Attack object has already been used or is invalid".to_string(),
        ));
    }
    let attack_object_agent_id = response_json
        .get("result")
        .and_then(|result| result.get("data"))
        .and_then(|data| data.get("content"))
        .and_then(|content| content.get("fields"))
        .and_then(|fields| fields.get("agent_id"))
        .and_then(|agent_id| agent_id.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| {
            EnclaveError::GenericError("Could not retrieve agent_id from attack object".to_string())
        })?;

    // if attack_object_agent_id != payload.agent_id {
    //     return Err(EnclaveError::GenericError("Agent ID in attack object does not match payload agent ID".to_string()));
    // }

    let message_bytes = bcs::to_bytes(&payload.message).expect("Serialization failed");
    hasher.update(&message_bytes);
    let mut message_hash = [0u8; 32];
    hasher
        .finalize_variable(&mut message_hash)
        .map_err(|e| EnclaveError::GenericError(format!("Hashing failed: {}", e)))?;
    #[derive(Debug, Deserialize)]
    struct ExternalEvaluateResponse {
        agent_response: String,
        jury_response: String,
        success: bool,
        fun_response: String,
        score: u8,
    }

    let eval_url = format!(
        "https://redteam.suisentinel.xyz/evaluate/{}",
        payload.agent_id
    );

    let client = Client::new();
    let mut eval_request = client
        .post(&eval_url)
        .bearer_auth("suihero@345") // adds: Authorization: Bearer <token>
        .header("Content-Type", "application/json");

    let eval_response = eval_request
        .json(&json!({
            "user_prompt": payload.message,
            "attacker_address": attacker
        }))

        .send()
        .await
        .map_err(|e| {
            EnclaveError::GenericError(format!("Failed to call evaluate endpoint: {}", e))
        })?;

    if !eval_response.status().is_success() {
        let status = eval_response.status();
        let error_text = eval_response
            .text()
            .await
            .unwrap_or_else(|_| "unable to read error body".to_string());
        return Err(EnclaveError::GenericError(format!(
            "Evaluate endpoint returned status {}: {}",
            status, error_text
        )));
    }

    let ExternalEvaluateResponse {
        agent_response,
        jury_response,
        success,
        fun_response,
        score,
    } = eval_response
        .json::<ExternalEvaluateResponse>()
        .await
        .map_err(|e| {
            EnclaveError::GenericError(format!("Failed to parse evaluate response: {}", e))
        })?;

    let evaluation = ConsumePromptResponse {
        agent_id: payload.agent_id.clone(),
        success,
        score,
        attacker: decode_bytes_hex(&attacker).unwrap(),
        nonce,
        message_hash,
        agent_response,
        jury_response,
        fun_response,
    };

    // Get timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_millis() as u64;

    let response = to_signed_response(
        &state.eph_kp,
        evaluation,
        current_timestamp,
        IntentScope::ConsumePrompt,
    );

    {
        let mut attack_object_usage = state.attack_object_usage.write().await;
        attack_object_usage.insert(attack_object_id, true);
    }

    Ok(Json(response))
}

// #[cfg(test)]
// mod test {
//     use super::*;
//     use crate::common::IntentMessage;
//     use axum::{extract::State, Json};
//     use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};

//     #[tokio::test]
//     async fn test_process_data() {
//         let state = Arc::new(AppState {
//             eph_kp: Ed25519KeyPair::generate(&mut rand::thread_rng()),
//             api_key: "045a27812dbe456392913223221306".to_string(),
//         });
//         let signed_weather_response = process_data(
//             State(state),
//             Json(ProcessDataRequest {
//                 payload: WeatherRequest {
//                     location: "San Francisco".to_string(),
//                 },
//             }),
//         )
//         .await
//         .unwrap();
//         assert_eq!(
//             signed_weather_response.response.data.location,
//             "San Francisco"
//         );
//     }

//     #[test]
//     fn test_serde() {
//         // test result should be consistent with test_serde in `move/enclave/sources/enclave.move`.
//         use fastcrypto::encoding::{Encoding, Hex};
//         let payload = WeatherResponse {
//             location: "San Francisco".to_string(),
//             temperature: 13,
//         };
//         let timestamp = 1744038900000;
//         let intent_msg = IntentMessage::new(payload, timestamp, IntentScope::Weather);
//         let signing_payload = bcs::to_bytes(&intent_msg).expect("should not fail");
//         assert!(
//             signing_payload
//                 == Hex::decode("0020b1d110960100000d53616e204672616e636973636f0d00000000000000")
//                     .unwrap()
//         );
//     }
// }
