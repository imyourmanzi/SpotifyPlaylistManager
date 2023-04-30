resource "google_cloud_run_v2_service" "main" {
  provider = google-beta

  name     = "server"
  location = var.region

  template {
    annotations = {
      "run.googleapis.com/client-name" = "terraform"
    }

    containers {
      image = "us-central1-docker.pkg.dev/imyourmanzi-spotifyplaylistmgr/server-images/server:latest"

      startup_probe {
        initial_delay_seconds = 10
        timeout_seconds       = 1
        period_seconds        = 5
        failure_threshold     = 3
        tcp_socket {
          port = 8080
        }
      }

      liveness_probe {
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 30
        failure_threshold     = 3
        http_get {
          path = "/healthcheck"
        }
      }

      env {
        name = "SPOTIFY_SECRET"
        value_source {
          secret_key_ref {
            version = "latest"
            secret  = google_secret_manager_secret.spotify_client_secret.name
          }
        }
      }

      env {
        name  = "SPOTIFY_CLIENT_ID"
        value = "b80440eadf0a4f989bba93e5b4ff2fc5"
      }

      ports {
        container_port = 8080
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "server_deploy" {
  project  = google_cloud_run_v2_service.main.project
  location = google_cloud_run_v2_service.main.location
  name     = google_cloud_run_v2_service.main.name

  role   = "roles/run.developer"
  member = "serviceAccount:${google_service_account.server_deploy.email}"
}


data "google_iam_policy" "public_access" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_v2_service_iam_policy" "public_access" {
  location = google_cloud_run_v2_service.main.location
  project  = google_cloud_run_v2_service.main.project
  name     = google_cloud_run_v2_service.main.name

  policy_data = data.google_iam_policy.public_access.policy_data
}
