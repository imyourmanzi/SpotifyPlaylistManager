resource "google_secret_manager_secret" "spotify_client_secret" {
  secret_id = "spotify-client-secret"
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "latest" {
  enabled = true
  secret  = google_secret_manager_secret.spotify_client_secret.id

  secret_data = var.spotify_client_secret
}
