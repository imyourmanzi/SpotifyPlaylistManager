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

data "google_iam_policy" "spotify_client_secret_access" {
  binding {
    role    = "roles/secretmanager.secretAccessor"
    members = ["serviceAccount:${google_service_account.server_run.email}"]
  }
}

resource "google_secret_manager_secret_iam_policy" "spotify_client_secret_access" {
  secret_id = google_secret_manager_secret.spotify_client_secret.secret_id

  policy_data = data.google_iam_policy.spotify_client_secret_access.policy_data
}
