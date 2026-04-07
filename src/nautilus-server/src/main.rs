// Copyright (c), Sui Sentinel
// SPDX-License-Identifier: Apache-2.0
#![allow(warnings)]

use anyhow::Result;
use axum::{routing::get, routing::post, Router};
use dotenvy::dotenv;
use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};
use nautilus_server::app::{consume_prompt, register_agent};
use nautilus_server::common::{get_attestation, health_check};
use nautilus_server::AppState;
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();
    let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

    let state = Arc::new(AppState {
        eph_kp,
        agents: RwLock::new(HashMap::new()),
        agent_counter: RwLock::new(0),
        attack_object_usage: RwLock::new(HashMap::new()),
    });

    // Define your own restricted CORS policy here if needed.
    let cors = CorsLayer::new().allow_methods(Any).allow_headers(Any);

    let app = Router::new()
        .route("/get_attestation", get(get_attestation))
        .route("/:network/register-agent", post(register_agent))
        .route("/:network/consume-prompt", post(consume_prompt))
        .route("/health_check", get(health_check))
        .with_state(state)
        .layer(cors);

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app.into_make_service())
        .await
        .map_err(|e| anyhow::anyhow!("Server error: {}", e))
}
