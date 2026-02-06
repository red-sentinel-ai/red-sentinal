// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
#![allow(warnings)]

use crate::models::Agent;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::response::Response;
use axum::Json;
use fastcrypto::ed25519::Ed25519KeyPair;
use serde_json::json;
use std::collections::HashMap;
use tokio::sync::RwLock;

pub mod app;
pub mod claude;
pub mod common;
pub mod constants;
pub mod models;

#[derive(Debug)]
pub struct AppState {
    pub eph_kp: Ed25519KeyPair,
    pub agents: RwLock<HashMap<String, Agent>>,
    pub agent_counter: RwLock<u64>,
    pub attack_object_usage: RwLock<HashMap<String, bool>>,
}

/// Implement IntoResponse for EnclaveError.
impl IntoResponse for EnclaveError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            EnclaveError::GenericError(e) => (StatusCode::BAD_REQUEST, e),
            EnclaveError::ReqwestError(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        };
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}

/// Enclave errors enum.
#[derive(Debug)]
pub enum EnclaveError {
    GenericError(String),
    ReqwestError(reqwest::Error),
}

impl From<reqwest::Error> for EnclaveError {
    fn from(err: reqwest::Error) -> Self {
        EnclaveError::ReqwestError(err)
    }
}
