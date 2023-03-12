data "google_project" "default" {
  provider = google-beta
}

# Firebase projects don't have a `data` type and it has been created manually, so this is
# here as a stand-in documentation
# resource "google_firebase_project" "default" {
#   provider = google-beta
#   project  = data.google_project.default.project_id
# }
