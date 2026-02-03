use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: String,
    pub system_prompt: String,
    pub cost_per_message: u64,
    pub is_defeated: bool,
    pub creator: String,
    pub model_provider: String,
    pub model_name: String,
    pub api_base_url: Option<String>,
    pub api_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterAgentRequest {
    pub system_prompt: String,
    pub private_prompt: Option<String>,
    pub attack_goal: String,
    pub jury_prompt: String,
    pub cost_per_message: u64,
    pub creator: String,
    pub model_provider: String,
    pub model_name: String,
    pub api_base_url: Option<String>,
    pub api_key: Option<String>,
    pub sentinel_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegisterAgentResponse {
    pub agent_id: String,
    pub cost_per_message: u64,
    pub system_prompt: String,
    pub is_defeated: bool,
    pub creator: [u8; 32],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConsumePromptRequest {
    pub agent_id: String,
    pub message: String,
    pub attack_object_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConsumePromptResponse {
    pub agent_id: String,
    pub success: bool,
    pub score: u8,
    pub attacker: [u8; 32],
    pub nonce: u64,
    pub message_hash: [u8; 32],
    pub agent_response: String,
    pub jury_response: String,
    pub fun_response: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}
