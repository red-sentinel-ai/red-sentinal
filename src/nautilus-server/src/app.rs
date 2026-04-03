// Copyright (c), Sui Sentinel
// SPDX-License-Identifier: Apache-2.0

use crate::common::IntentMessage;
use crate::common::{sign_register_agent_response, sign_consume_prompt_response, ProcessedDataResponse};
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
use serde_json::{json, Value};
use sha2::{Sha256, Digest};
use std::sync::Arc;

use crate::models::{
    Agent, ConsumePromptRequest, ConsumePromptResponse, ErrorResponse, RegisterAgentRequest,
    RegisterAgentResponse,
};

/// Decode a base58-encoded Solana address to a 32-byte array
fn decode_solana_address(address: &str) -> Result<[u8; 32], EnclaveError> {
    let bytes = bs58::decode(address)
        .into_vec()
        .map_err(|e| EnclaveError::GenericError(format!("Failed to decode base58 address: {}", e)))?;

    if bytes.len() != 32 {
        return Err(EnclaveError::GenericError(format!(
            "Invalid Solana address length: expected 32 bytes, got {}",
            bytes.len()
        )));
    }

    let mut arr = [0u8; 32];
    arr.copy_from_slice(&bytes);
    Ok(arr)
}

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
    // Use seconds (i64) to match Solana's Clock::unix_timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_secs() as i64;

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

    // Decode creator address (base58 for Solana)
    let creator_bytes = decode_solana_address(&payload.creator)?;

    // Compute SHA256 hash of system_prompt (matches Solana's hash::hash)
    let prompt_hash: [u8; 32] = Sha256::digest(payload.system_prompt.as_bytes()).into();

    Ok(Json(sign_register_agent_response(
        &state.eph_kp,
        RegisterAgentResponse {
            agent_id: agent_id.to_string(),
            cost_per_message: payload.cost_per_message,
            prompt_hash,
            is_defeated: false,
            creator: creator_bytes,
        },
        current_timestamp,
    )))
}

pub async fn consume_prompt(
    Path(network): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConsumePromptRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<ConsumePromptResponse>>>, EnclaveError> {
    let agents = state.agents.write().await;
    let attack_account_pubkey = payload.attack_account_pubkey.clone();
    {
        let mut attack_object_usage = state.attack_object_usage.write().await;
        if attack_object_usage.contains_key(&attack_account_pubkey) {
            return Err(EnclaveError::GenericError(
                "Attack account has already been used".to_string(),
            ));
        }
        attack_object_usage.insert(attack_account_pubkey.clone(), false);
    }
    let mut hasher = Blake2bVar::new(32)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to initialize hasher: {}", e)))?;
    let client = Client::new();

    // Solana RPC endpoints
    let rpc_url = if network == "devnet" {
        "https://api.devnet.solana.com"
    } else if network == "testnet" {
        "https://api.testnet.solana.com"
    } else {
        "https://api.mainnet-beta.solana.com"
    };

    // Solana JSON-RPC call to get account info for the Attack account
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
            payload.attack_account_pubkey,
            {
                "encoding": "base64"
            }
        ]
    });

    let response = client
        .post(rpc_url)
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        return Err(EnclaveError::GenericError(format!(
            "Attack account API failed with status {}",
            error_text
        )));
    }

    let response_json: Value = response.json().await?;

    // Check if account exists
    let account_value = response_json
        .get("result")
        .and_then(|result| result.get("value"))
        .ok_or_else(|| {
            EnclaveError::GenericError("Attack account not found or invalid response".to_string())
        })?;

    if account_value.is_null() {
        return Err(EnclaveError::GenericError(
            "Attack account does not exist on Solana".to_string(),
        ));
    }

    // Parse base64 encoded account data
    let data_array = account_value
        .get("data")
        .and_then(|d| d.as_array())
        .ok_or_else(|| {
            EnclaveError::GenericError("Could not retrieve data from account".to_string())
        })?;

    let base64_data = data_array
        .get(0)
        .and_then(|d| d.as_str())
        .ok_or_else(|| {
            EnclaveError::GenericError("Invalid account data format".to_string())
        })?;

    // Decode base64 account data
    use base64::Engine;
    let account_data = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to decode base64 data: {}", e)))?;

    // Parse Anchor Attack account structure:
    // - 8 bytes: Anchor discriminator
    // - 32 bytes: agent (Pubkey)
    // - 32 bytes: attacker (Pubkey)
    // - 8 bytes: paid_amount (u64)
    // - 8 bytes: nonce (u64)
    // - 8 bytes: created_at (i64)
    // - 1 byte: bump (u8)
    // Total: 97 bytes minimum

    if account_data.len() < 97 {
        return Err(EnclaveError::GenericError(format!(
            "Invalid Attack account data length: expected at least 97 bytes, got {}",
            account_data.len()
        )));
    }

    // Skip 8-byte Anchor discriminator
    let data_offset = 8;

    // Extract agent pubkey (32 bytes)
    let _agent_pubkey_bytes: [u8; 32] = account_data[data_offset..data_offset + 32]
        .try_into()
        .map_err(|_| EnclaveError::GenericError("Invalid agent pubkey bytes".to_string()))?;

    // Extract attacker pubkey (32 bytes)
    let attacker_bytes: [u8; 32] = account_data[data_offset + 32..data_offset + 64]
        .try_into()
        .map_err(|_| EnclaveError::GenericError("Invalid attacker pubkey bytes".to_string()))?;
    let attacker = bs58::encode(&attacker_bytes).into_string();

    // Extract paid_amount (8 bytes, little-endian u64)
    let _paid_amount = u64::from_le_bytes(
        account_data[data_offset + 64..data_offset + 72]
            .try_into()
            .map_err(|_| EnclaveError::GenericError("Invalid paid_amount bytes".to_string()))?
    );

    // Extract nonce (8 bytes, little-endian u64)
    let nonce = u64::from_le_bytes(
        account_data[data_offset + 72..data_offset + 80]
            .try_into()
            .map_err(|_| EnclaveError::GenericError("Invalid nonce bytes".to_string()))?
    );

    // Extract created_at (8 bytes, little-endian i64)
    let _created_at = i64::from_le_bytes(
        account_data[data_offset + 80..data_offset + 88]
            .try_into()
            .map_err(|_| EnclaveError::GenericError("Invalid created_at bytes".to_string()))?
    );

    // Hash the message using BCS serialization (keeping original format)
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
    let eval_request = client
        .post(&eval_url)
        .bearer_auth("solhero@345")
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
        attacker: attacker_bytes,
        nonce,
        message_hash,
        agent_response,
        jury_response,
        fun_response,
    };

    // Get timestamp in seconds (i64) to match Solana's Clock::unix_timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_secs() as i64;

    let response = sign_consume_prompt_response(
        &state.eph_kp,
        evaluation,
        current_timestamp,
    );

    {
        let mut attack_object_usage = state.attack_object_usage.write().await;
        attack_object_usage.insert(attack_account_pubkey, true);
    }

    Ok(Json(response))
}
