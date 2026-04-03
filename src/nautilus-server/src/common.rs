// Copyright (c), Sui Sentinel
// SPDX-License-Identifier: Apache-2.0

use crate::models::{RegisterAgentResponse, ConsumePromptResponse};
use crate::AppState;
use crate::EnclaveError;
use axum::{extract::State, Json};
use fastcrypto::traits::Signer;
use fastcrypto::{encoding::Encoding, traits::ToFromBytes};
use fastcrypto::{encoding::Hex, traits::KeyPair as FcKeyPair};
use nsm_api::api::{Request as NsmRequest, Response as NsmResponse};
use nsm_api::driver;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use serde_repr::Deserialize_repr;
use serde_repr::Serialize_repr;
use std::collections::HashMap;
use std::fmt::Debug;
use std::sync::Arc;
use std::time::Duration;
use tracing::info;

use fastcrypto::ed25519::Ed25519KeyPair;

#[derive(Debug, Serialize, Deserialize)]
pub struct IntentMessage<T: Serialize> {
    pub intent: IntentScope,
    /// Timestamp in seconds (i64) to match Solana's Clock::unix_timestamp
    pub timestamp: i64,
    pub data: T,
}

#[derive(Serialize_repr, Deserialize_repr, Debug, Clone, Copy)]
#[repr(u8)]
pub enum IntentScope {
    Weather = 0,
    RegisterAgent = 1,
    ConsumePrompt = 2,
}

impl<T: Serialize + Debug> IntentMessage<T> {
    pub fn new(data: T, timestamp: i64, intent: IntentScope) -> Self {
        Self {
            data,
            timestamp,
            intent,
        }
    }
}

/// Wrapper struct containing the response (the intent message) and signature.
#[derive(Serialize, Deserialize)]
pub struct ProcessedDataResponse<T> {
    pub response: T,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessDataRequest<T> {
    pub payload: T,
}

/// Build signing payload for RegisterAgent matching Solana contract format:
/// intent(1) || timestamp(8, i64 LE) || agent_id(bytes) || cost(8, u64 LE) || prompt_hash(32) || creator(32)
fn build_register_agent_signing_payload(
    intent: IntentScope,
    timestamp: i64,
    data: &RegisterAgentResponse,
) -> Vec<u8> {
    let mut message = Vec::new();

    // Intent (1 byte)
    message.push(intent as u8);

    // Timestamp (8 bytes, i64 little-endian)
    message.extend_from_slice(&timestamp.to_le_bytes());

    // Agent ID (variable length, raw bytes)
    message.extend_from_slice(data.agent_id.as_bytes());

    // Cost per message (8 bytes, u64 little-endian)
    message.extend_from_slice(&data.cost_per_message.to_le_bytes());

    // Prompt hash (32 bytes) - already computed, use directly
    message.extend_from_slice(&data.prompt_hash);

    // Creator pubkey (32 bytes)
    message.extend_from_slice(&data.creator);

    message
}

/// Build signing payload for ConsumePrompt matching Solana contract format:
/// intent(1) || timestamp(8, i64 LE) || agent_id(bytes) || success(1) || score(8, u64 LE) || attacker(32) || nonce(8, u64 LE) || message_hash(32)
fn build_consume_prompt_signing_payload(
    intent: IntentScope,
    timestamp: i64,
    data: &ConsumePromptResponse,
) -> Vec<u8> {
    let mut message = Vec::new();

    // Intent (1 byte)
    message.push(intent as u8);

    // Timestamp (8 bytes, i64 little-endian)
    message.extend_from_slice(&timestamp.to_le_bytes());

    // Agent ID (variable length, raw bytes)
    message.extend_from_slice(data.agent_id.as_bytes());

    // Success (1 byte)
    message.push(if data.success { 1 } else { 0 });

    // Score (8 bytes, u64 little-endian) - convert u8 to u64
    message.extend_from_slice(&(data.score as u64).to_le_bytes());

    // Attacker pubkey (32 bytes)
    message.extend_from_slice(&data.attacker);

    // Nonce (8 bytes, u64 little-endian)
    message.extend_from_slice(&data.nonce.to_le_bytes());

    // Message hash (32 bytes)
    message.extend_from_slice(&data.message_hash);

    message
}

/// Sign a RegisterAgentResponse with the format expected by Solana contract
pub fn sign_register_agent_response(
    kp: &Ed25519KeyPair,
    payload: RegisterAgentResponse,
    timestamp: i64,
) -> ProcessedDataResponse<IntentMessage<RegisterAgentResponse>> {
    let intent = IntentScope::RegisterAgent;

    let signing_payload = build_register_agent_signing_payload(intent, timestamp, &payload);
    let sig = kp.sign(&signing_payload);

    let intent_msg = IntentMessage {
        intent,
        timestamp,
        data: payload,
    };

    ProcessedDataResponse {
        response: intent_msg,
        signature: Hex::encode(sig),
    }
}

/// Sign a ConsumePromptResponse with the format expected by Solana contract
pub fn sign_consume_prompt_response(
    kp: &Ed25519KeyPair,
    payload: ConsumePromptResponse,
    timestamp: i64,
) -> ProcessedDataResponse<IntentMessage<ConsumePromptResponse>> {
    let intent = IntentScope::ConsumePrompt;

    let signing_payload = build_consume_prompt_signing_payload(intent, timestamp, &payload);
    let sig = kp.sign(&signing_payload);

    let intent_msg = IntentMessage {
        intent,
        timestamp,
        data: payload,
    };

    ProcessedDataResponse {
        response: intent_msg,
        signature: Hex::encode(sig),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetAttestationResponse {
    pub attestation: String,
}

pub async fn get_attestation(
    State(state): State<Arc<AppState>>,
) -> Result<Json<GetAttestationResponse>, EnclaveError> {
    info!("get attestation called");

    let pk = state.eph_kp.public();
    let fd = driver::nsm_init();

    let request = NsmRequest::Attestation {
        user_data: None,
        nonce: None,
        public_key: Some(ByteBuf::from(pk.as_bytes().to_vec())),
    };

    let response = driver::nsm_process_request(fd, request);
    match response {
        NsmResponse::Attestation { document } => {
            driver::nsm_exit(fd);
            Ok(Json(GetAttestationResponse {
                attestation: Hex::encode(document),
            }))
        }
        _ => {
            driver::nsm_exit(fd);
            Err(EnclaveError::GenericError(
                "unexpected response".to_string(),
            ))
        }
    }
}

/// Health check response.
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthCheckResponse {
    /// Hex encoded public key booted on enclave.
    pub pk: String,
    /// Status of endpoint connectivity checks
    pub endpoints_status: HashMap<String, bool>,
}

/// Endpoint that health checks the enclave connectivity to all
/// domains and returns the enclave's public key.
pub async fn health_check(
    State(state): State<Arc<AppState>>,
) -> Result<Json<HealthCheckResponse>, EnclaveError> {
    let pk = state.eph_kp.public();

    // Create HTTP client with timeout
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| EnclaveError::GenericError(format!("Failed to create HTTP client: {}", e)))?;

    // Load allowed endpoints from YAML file
    let endpoints_status = match std::fs::read_to_string("allowed_endpoints.yaml") {
        Ok(yaml_content) => {
            match serde_yaml::from_str::<serde_yaml::Value>(&yaml_content) {
                Ok(yaml_value) => {
                    let mut status_map = HashMap::new();

                    if let Some(endpoints) =
                        yaml_value.get("endpoints").and_then(|e| e.as_sequence())
                    {
                        for endpoint in endpoints {
                            if let Some(endpoint_str) = endpoint.as_str() {
                                // Check connectivity to each endpoint
                                let url = if endpoint_str.contains(".amazonaws.com") {
                                    format!("https://{}/ping", endpoint_str)
                                } else {
                                    format!("https://{}", endpoint_str)
                                };

                                let is_reachable = match client.get(&url).send().await {
                                    Ok(response) => {
                                        if endpoint_str.contains(".amazonaws.com") {
                                            // For AWS endpoints, check if response body contains "healthy"
                                            match response.text().await {
                                                Ok(body) => body.to_lowercase().contains("healthy"),
                                                Err(e) => {
                                                    info!(
                                                        "Failed to read response body from {}: {}",
                                                        endpoint_str, e
                                                    );
                                                    false
                                                }
                                            }
                                        } else {
                                            // For non-AWS endpoints, check for 200 status
                                            response.status().is_success()
                                        }
                                    }
                                    Err(e) => {
                                        info!("Failed to connect to {}: {}", endpoint_str, e);
                                        false
                                    }
                                };

                                status_map.insert(endpoint_str.to_string(), is_reachable);
                                info!(
                                    "Checked endpoint {}: reachable = {}",
                                    endpoint_str, is_reachable
                                );
                            }
                        }
                    }

                    status_map
                }
                Err(e) => {
                    info!("Failed to parse YAML: {}", e);
                    HashMap::new()
                }
            }
        }
        Err(e) => {
            info!("Failed to read allowed_endpoints.yaml: {}", e);
            HashMap::new()
        }
    };

    Ok(Json(HealthCheckResponse {
        pk: Hex::encode(pk.as_bytes()),
        endpoints_status,
    }))
}
