resource "google_artifact_registry_repository" "server_images" {
  location      = var.region
  repository_id = "server-images"
  description   = "Docker container images for the server"
  format        = "DOCKER"
}

data "google_iam_policy" "server_images_access" {
  binding {
    members = ["serviceAccount:${google_service_account.server_deploy.email}"]
    role    = "roles/artifactregistry.repoAdmin"
  }
}

resource "google_artifact_registry_repository_iam_policy" "server_images_access" {
  location   = google_artifact_registry_repository.server_images.location
  repository = google_artifact_registry_repository.server_images.name

  policy_data = data.google_iam_policy.server_images_access.policy_data
}
