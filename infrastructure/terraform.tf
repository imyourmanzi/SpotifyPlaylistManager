terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "imyourmanzi"

    workspaces {
      name = "infrastructure"
    }
  }
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.47"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.47"
    }
  }
}
