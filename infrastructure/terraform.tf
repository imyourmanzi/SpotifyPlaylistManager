terraform {
  cloud {
    organization = "imyourmanzi"

    workspaces {
      name = "SpotifyPlaylistManager"
    }
  }
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.47.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.47.0"
    }
  }
}
