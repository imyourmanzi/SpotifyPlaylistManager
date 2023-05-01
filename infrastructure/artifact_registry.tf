resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "server-images"
  description   = "Docker container images for the server"
  format        = "DOCKER"
}

resource "google_artifact_registry_repository_iam_member" "server_deploy" {
  location   = google_artifact_registry_repository.main.location
  repository = google_artifact_registry_repository.main.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.server_deploy.email}"
}
