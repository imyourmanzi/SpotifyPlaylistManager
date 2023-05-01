## server-deploy
resource "google_service_account" "server_deploy" {
  account_id   = "server-deploy"
  display_name = "Server Deploy Service Account"
  description  = "Service account to deploy new versions of the server"
}

resource "time_rotating" "server_deploy_key_rotation" {
  rotation_days = 30
}

resource "google_service_account_key" "server_deploy_key" {
  service_account_id = google_service_account.server_deploy.name
  private_key_type   = "TYPE_GOOGLE_CREDENTIALS_FILE"

  keepers = {
    rotation_time = time_rotating.server_deploy_key_rotation.rotation_rfc3339
  }
}

data "google_iam_policy" "server_deploy_access" {
  binding {
    role = "roles/run.serviceAgent"

    members = [
      "serviceAccount:${google_service_account.server_deploy.email}",
    ]
  }
}

resource "google_service_account_iam_policy" "server_deploy_access" {
  service_account_id = google_service_account.server_deploy.name

  policy_data = data.google_iam_policy.server_deploy_access.policy_data
}

## server-run
resource "google_service_account" "server_run" {
  account_id   = "server-run"
  display_name = "server Service Account"
  description  = "Service account that identifies the Cloud Run \"server\" service"
}
