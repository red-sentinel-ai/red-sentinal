// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::IntentMessage;
use crate::common::{to_signed_response, IntentScope, ProcessDataRequest, ProcessedDataResponse};
use crate::AppState;
use crate::EnclaveError;
use axum::extract::{Path, State};
use axum::{response::IntoResponse, Json};
use bcs;
use blake2::{
    digest::{Update, VariableOutput},
    Blake2bVar,
};
use fastcrypto::encoding::{decode_bytes_hex, Encoding, Hex};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

use crate::models::{
    Agent, ConsumePromptRequest, ConsumePromptResponse, ErrorResponse, RegisterAgentRequest,
    RegisterAgentResponse,
};

pub async fn register_agent(
    Path(network): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterAgentRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<RegisterAgentResponse>>>, EnclaveError> {
    #[derive(Debug, Deserialize)]
    struct ExternalRegisterResponse {
        sentinel_id: u64,
        sentinel_type: String,
        status: String,
        public_url: String,
    }

    // Build the new API request body according to v2 structure
    let sentinel_type = payload.sentinel_type.clone().unwrap_or_else(|| "basic".to_string());
    let hidden_instructions = payload.private_prompt.clone().unwrap_or_default();
    
    let mut request_body = json!({
        "sentinel_type": sentinel_type,
        "public_instructions": payload.system_prompt,
        "hidden_instructions": hidden_instructions,
        "attack_goal": payload.attack_goal,
        "judge_prompt": payload.jury_prompt,
        "model_provider": payload.model_provider,
        "model_name": payload.model_name,
        "creator": payload.creator
    });
    
    // Add api_key and api_base_url to request body if available
    if let Some(api_key) = &payload.api_key {
        request_body["api_key"] = json!(api_key);
    }
    if let Some(api_base_url) = &payload.api_base_url {
        request_body["api_base_url"] = json!(api_base_url);
    }

    let register_url = format!(
        "https://redteam.suisentinel.xyz/{}/sentinels",
        network
    );

    let client = Client::new();
    let external_response = client
        .post(&register_url)
        .bearer_auth("suihero@345") // adds: Authorization: Bearer <token>
        .json(&request_body)
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

    let ExternalRegisterResponse { sentinel_id, .. } = external_response
        .json::<ExternalRegisterResponse>()
        .await
        .map_err(|e| {
            EnclaveError::GenericError(format!("Failed to parse register response: {}", e))
        })?;
    let agent_id = sentinel_id.to_string();
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

    let creator_bytes: Vec<u8> = decode_bytes_hex(&payload.creator)
        .map_err(|e| EnclaveError::GenericError(format!("Invalid creator address: {}", e)))?;
    let creator: [u8; 20] = creator_bytes
        .try_into()
        .map_err(|_| EnclaveError::GenericError("Creator address must be 20 bytes (EVM address)".to_string()))?;

    Ok(Json(to_signed_response(
        &state.eph_kp,
        RegisterAgentResponse {
            agent_id: agent_id.to_string(),
            cost_per_message: payload.cost_per_message,
            system_prompt: payload.system_prompt,
            is_defeated: false,
            creator,
        },
        current_timestamp,
        IntentScope::RegisterAgent,
    )))
}

pub async fn consume_prompt(
    Path(network): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConsumePromptRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<ConsumePromptResponse>>>, EnclaveError> {
    let attacker = payload.wallet_address.clone();
    let nonce = payload.nonce;

    let mut hasher = Blake2bVar::new(32)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to initialize hasher: {}", e)))?;

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
        "https://redteam.suisentinel.xyz/{}/attack/{}",
        network, payload.agent_id
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

    let attacker_bytes: Vec<u8> = decode_bytes_hex(&attacker)
        .map_err(|e| EnclaveError::GenericError(format!("Invalid attacker address: {}", e)))?;
    let attacker_addr: [u8; 20] = attacker_bytes
        .try_into()
        .map_err(|_| EnclaveError::GenericError("Attacker address must be 20 bytes (EVM address)".to_string()))?;

    let evaluation = ConsumePromptResponse {
        agent_id: payload.agent_id.clone(),
        success,
        score,
        attacker: attacker_addr,
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
