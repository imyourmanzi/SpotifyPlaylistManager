data "google_project" "default" {
  provider = google-beta
}

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = data.google_project.default.project_id
}
