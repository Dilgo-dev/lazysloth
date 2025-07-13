use std::collections::HashMap;
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use anyhow::{anyhow, Result};

// Structures de données pour la réponse HTTP
#[derive(Debug, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub elapsed_ms: u64,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn make_request(
    url: String,
    method: String,
    headers_str: String,
    body: String,
) -> Result<HttpResponse, String> {
    // Mesurer le temps d'exécution
    let start_time = Instant::now();
    
    // Créer le client HTTP avec timeout
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    
    // Parser les headers depuis la string JSON
    let headers_map: HashMap<String, String> = if headers_str.trim().is_empty() {
        HashMap::new()
    } else {
        serde_json::from_str(&headers_str)
            .map_err(|e| format!("Invalid headers format: {}", e))?
    };
    
    // Construire la requête
    let mut request_builder = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        "HEAD" => client.head(&url),
        "OPTIONS" => client.request(reqwest::Method::OPTIONS, &url),
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };
    
    // Ajouter les headers
    for (key, value) in headers_map {
        request_builder = request_builder.header(&key, &value);
    }
    
    // Ajouter le body si ce n'est pas vide et si la méthode le permet
    if !body.trim().is_empty() && !matches!(method.to_uppercase().as_str(), "GET" | "HEAD" | "OPTIONS") {
        request_builder = request_builder.body(body);
    }
    
    // Exécuter la requête
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    // Calculer le temps écoulé
    let elapsed = start_time.elapsed();
    
    // Extraire les données de la réponse
    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason()
        .unwrap_or("Unknown")
        .to_string();
    
    // Convertir les headers de la réponse
    let mut response_headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(value_str) = value.to_str() {
            response_headers.insert(key.to_string(), value_str.to_string());
        }
    }
    
    // Lire le body de la réponse
    let response_body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    
    // Retourner la réponse structurée
    Ok(HttpResponse {
        status,
        status_text,
        headers: response_headers,
        body: response_body,
        elapsed_ms: elapsed.as_millis() as u64,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, make_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
