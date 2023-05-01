variable "region" {
  default     = "us-central1"
  type        = string
  description = "Region where resources will be created"
}

variable "github_repository" {
  default     = "imyourmanzi/SpotifyPlaylistManager"
  type        = string
  description = "GitHub repository where the project is deployed from (format: <user|org>/<repo>)"
}

variable "spotify_client_secret" {
  default     = "UNSET"
  type        = string
  sensitive   = true
  description = "Spotify Client Secret"
}
