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
    // List of boring words to remove (case-insensitive)
    let boring_words = vec![
        "parsing", "error", "raw", "response", "json", // User-specified words
        "the", "is", "and", "or", "but", "this", "that", // Common filler words
        "in", "on", "at", "to", "for", "of", "with",    // Additional fillers
    ];

    // Split text into words, filter out boring words, and preserve punctuation/numbers
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
    user_message: &str,
    api_key: &str
) -> Result<ConsumePromptResponse, Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::new();
    println!("agent prompt {}", agent_prompt);
    println!("user message: {}", user_message);

    // let access_token = "ya29.a0AS3H6NxnZDYBgzCho1LynNOc4Ji031Tswtqz_YNKOnQzX6kgWpvI8ZaErun_MoJTUtGJfAFMzS5mMfI8L0gj293lGycP9eXx7_xVTxHg_gDjVqijUllKjATSEJmKAdZovvQMMzGSd3d7lB0mcUwvMgotyIJvBoIfdmaU1Ku0NpX6wQcaCgYKAc8SARASFQHGX2Mi8wMlG-giE3GQF5N9DDIBaw0182";

    let scopes = ["https://www.googleapis.com/auth/cloud-platform"];
    let access_token = match generate_access_token("service-account.json", &scopes).await {
        Ok(token) => {
            println!("Access Token: {}", token);
            token
        }
        Err(e) => {
            println!("Error: {}", e);
            "".to_string()
        }
    };

    let model = "projects/761056697900/locations/us-central1/endpoints/1636703322293403648";
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

    // Handle streaming response
    let mut stream = response.bytes_stream();
    let mut final_response = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        let chunk_str = String::from_utf8_lossy(&chunk);
        for line in chunk_str.lines() {
            final_response.push_str(line);
        }
    }
    println!("final response {}", final_response);
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

    println!("Final model text: {}", model_text);
    let mut explanation = model_text.clone();
    let mut success = false;
    let mut score: u8 = 0;

        if let Some(success_pos) = model_text.to_lowercase().find("success") {
        let remaining = &model_text[success_pos..];
        if let Some(captures) = regex::Regex::new(r"success\s+(true|false)")
            .unwrap()
            .captures(&remaining.to_lowercase())
        {
            success = captures.get(1).unwrap().as_str() == "true";
            explanation = model_text[..success_pos].trim_end().to_string();
        }
    }

    if let Some(score_pos) = model_text.to_lowercase().find("score") {
        let remaining = &model_text[score_pos..];
        if let Some(captures) = regex::Regex::new(r"score\s+(\d+)")
            .unwrap()
            .captures(&remaining)
        {
            if let Ok(parsed_score) = captures.get(1).unwrap().as_str().parse::<u8>() {
                score = parsed_score;
            }
            if !model_text.to_lowercase().contains("success") {
                explanation = model_text[..score_pos].trim_end().to_string();
            }
        }
    }

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



    // match serde_json::from_str::<serde_json::Value>(&response_text) {
    //     Ok(result) => {
    //         let success = result
    //             .get("success")
    //             .and_then(|v| v.as_bool())
    //             .unwrap_or(false);

    //         let explanation = result
    //             .get("explanation")
    //             .and_then(|v| v.as_str())
    //             .unwrap_or("No explanation provided");

    //         let sanitized_explanation = sanitize_explanation(explanation);

    //         let score = result
    //             .get("score")
    //             .and_then(|v| v.as_u64())
    //             .map(|s| s as u8)
    //             .unwrap_or(0);

    //         Ok(ConsumePromptResponse {
    //             agent_id: agent_id.to_string(),
    //             success,
    //             explanation: sanitized_explanation,
    //             score,
    //         })
    //     }
    //     Err(_) => {
    //         let success = response_text.to_lowercase().contains("success\": true");

    //         Ok(ConsumePromptResponse {
    //             agent_id: agent_id.to_string(),
    //             success,
    //             explanation: sanitize_explanation(&format!("Parsing error Raw response {}", response_text)),
    //             score: 0,
    //         })
    //     }
    // }
}


pub async fn generate_access_token(
    service_account_path: &str,
    scopes: &[&str],
) -> Result<String, Box<dyn std::error::Error>> {
    // Load and parse the service account key
    let key_data = fs::read_to_string(service_account_path)?;
    let key: ServiceAccountKey = serde_json::from_str(&key_data)?;

    // Set iat and exp
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
