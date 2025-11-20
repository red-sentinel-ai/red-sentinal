use crate::models::ConsumePromptResponse;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, from_str, Value};
use std::env;
use std::error::Error;
use tokio_stream::StreamExt;
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use std::fs;
use crate::constants::{SERVICE_ACCOUNT_JSON};
use regex::{Regex};

#[derive(Debug, Deserialize)]
struct ServiceAccountKey {
    client_email: String,
    private_key: String,
    token_uri: String,
}

#[derive(Serialize)]
struct Claims<'a> {
    iss: &'a str,
    scope: &'a str,
    aud: &'a str,
    exp: i64,
    iat: i64,
}

#[derive(Deserialize, Debug)]
struct TokenResponse {
    access_token: String,
    expires_in: u64,
    token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContent>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClaudeContent {
    text: String,
    #[serde(rename = "type")]
    content_type: String,
}

fn sanitize_explanation(text: &str) -> String {
    let boring_words = vec![
        "parsing", "error", "raw", "response", "json", // User-specified words
        "the", "is", "and", "or", "but", "this", "that", // Common filler words
        "in", "on", "at", "to", "for", "of", "with",    // Additional fillers
    ];

    let sanitized: String = text
        .split_whitespace()
        .filter(|word| {
            // Remove punctuation for comparison, but keep original word
            let clean_word = word.trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase();
            !boring_words.iter().any(|boring| clean_word == *boring)
        })
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_string();

    // Truncate to 220 characters if necessary, ensuring we don't cut mid-word
    let max_len = 600;
    if sanitized.len() <= max_len {
        sanitized
    } else {
        let truncated: String = sanitized
            .chars()
            .take(max_len)
            .collect::<String>();
        // Find the last space within max_len to avoid cutting words
        match truncated.rfind(' ') {
            Some(last_space) => truncated[..last_space].trim().to_string(),
            None => truncated.trim().to_string(),
        }
    }
}
pub async fn evaluate_prompt(
    agent_id: &str,
    agent_prompt: &str,
    user_message: &str
) -> Result<ConsumePromptResponse, Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::new();
    println!("agent prompt {}", agent_prompt);
    println!("user message: {}", user_message);

    let scopes = ["https://www.googleapis.com/auth/cloud-platform"];
    let access_token = match generate_access_token(&scopes).await {
        Ok(token) => {
            println!("Access Token Successfully generated {}", token);
            token
        }
        Err(e) => {
            println!("Error: {}", e);
            "".to_string()
        }
    };

    let model = "projects/761056697900/locations/us-central1/endpoints/111770854521569280";
    let url = format!(
        "https://{}-aiplatform.googleapis.com/v1/{}:streamGenerateContent",
        "us-central1", model
    );
    let request_body = json!({
        "contents": [{
            "role": "user",
            "parts": [{
                "text": user_message
            }]
        }],
        "generationConfig": {
            "temperature": 1.0,
            "topP": 1.0,
            "seed": 0,
            "maxOutputTokens": 65535
        },
        "systemInstruction": {
            "parts": [{
                "text": agent_prompt
            }]
        }
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        return Err(format!("API request failed with status {}", error_text).into());
    }

    let mut stream = response.bytes_stream();
    let mut final_response = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        let chunk_str = String::from_utf8_lossy(&chunk);
        for line in chunk_str.lines() {
            final_response.push_str(line);
        }
    }
    let mut model_text = String::new();


    if let Ok(json_array) = from_str::<Value>(&final_response) {
        if let Some(array) = json_array.as_array() {
            for item in array {
                if let Some(candidates) = item["candidates"].as_array() {
                    for candidate in candidates {
                        if let Some(content) = candidate.get("content") {
                            if let Some(role) = content["role"].as_str() {
                                if role == "model" {
                                    if let Some(parts) = content["parts"].as_array() {
                                        for part in parts {
                                            if let Some(text) = part["text"].as_str() {
                                                model_text.push_str(text);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
let mut success = false;
    let mut score: u8 = 0;
    let mut explanation = model_text.to_string();
let success_regex = Regex::new(
        r"(?i)success\s*(?::|is|=)?\s*(true|false)\b"
    ).unwrap();
    
    let score_regex = Regex::new(
        r"(?i)score\s*(?::|is|=)?\s*(\d+)\b"
    ).unwrap();

    // Extract success
    if let Some(captures) = success_regex.captures(&model_text) {
        success = captures.get(1).unwrap().as_str().eq_ignore_ascii_case("true");
        
        // Remove success portion from explanation
        let success_match = captures.get(0).unwrap();
        explanation = model_text
            .replace(success_match.as_str(), "")
            .trim()
            .to_string();
    }

    // Extract score
    if let Some(captures) = score_regex.captures(&model_text) {
        if let Ok(parsed_score) = captures.get(1).unwrap().as_str().parse::<u8>() {
            score = parsed_score;
        }
        
        // Remove score portion from explanation
        let score_match = captures.get(0).unwrap();
        explanation = explanation
            .replace(score_match.as_str(), "")
            .trim()
            .replace(['{', '}', ','], "")
            .trim()
            .to_string();
    }

    // Clean up explanation (remove extra commas, braces, etc.)
    explanation = explanation
        .replace(['{', '}', ','], "")
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ");

    explanation = explanation
        .replace('"', "")
        .replace('\'', "")
        .replace('\\', "")
        .replace('\n', " ")
        .replace('\r', " ")
        .replace('\t', " ")
        .trim()
        .to_string();

    explanation = regex::Regex::new(r"\s+")
        .unwrap()
        .replace_all(&explanation, " ")
        .to_string();

    Ok(ConsumePromptResponse {
        agent_id: agent_id.to_string(),
        success,
        explanation: explanation.to_string(),
        score
    })

}


pub async fn generate_access_token(
    scopes: &[&str],
) -> Result<String, Box<dyn std::error::Error>> {
    let key: ServiceAccountKey = serde_json::from_str(&SERVICE_ACCOUNT_JSON)?;
    let iat = Utc::now();
    let exp = iat + Duration::minutes(59); // Max allowed: 60 mins

    let claims = Claims {
        iss: &key.client_email,
        scope: &scopes.join(" "),
        aud: &key.token_uri,
        iat: iat.timestamp(),
        exp: exp.timestamp(),
    };

    let jwt = encode(
        &Header::new(Algorithm::RS256),
        &claims,
        &EncodingKey::from_rsa_pem(key.private_key.as_bytes())?,
    )?;

    let client = Client::new();
    let params = [
        ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
        ("assertion", &jwt),
    ];

    let res = client
        .post(&key.token_uri)
        .form(&params)
        .send()
        .await?
        .json::<TokenResponse>()
        .await?;

    Ok(res.access_token)
}
