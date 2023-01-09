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
  }
}

provider "google-beta" {
  project = "imyourmanzi-spm"
}
