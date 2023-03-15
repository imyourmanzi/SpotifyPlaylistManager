terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "imyourmanzi"

    workspaces {
      name = "kubernetes"
    }
  }
  required_providers {
    tfe = {
      source  = "hashicorp/tfe"
      version = "~> 0.42.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.47"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "tfe" {
  hostname     = "app.terraform.io"
  organization = "imyourmanzi"
}

data "tfe_outputs" "infrastructure" {
  organization = "imyourmanzi"
  workspace    = "infrastructure"
}

# Retrieve GKE cluster information
provider "google" {
  project = data.tfe_outputs.infrastructure.values.project_id
  region  = data.tfe_outputs.infrastructure.values.region
}

# Configure kubernetes provider with Oauth2 access token.
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/client_config
# This fetches a new token, which will expire in 1 hour.
data "google_client_config" "default" {}

data "google_container_cluster" "backend" {
  name     = data.tfe_outputs.infrastructure.values.kubernetes_cluster_name
  location = data.tfe_outputs.infrastructure.values.region
}

provider "kubernetes" {
  host = data.tfe_outputs.infrastructure.values.kubernetes_cluster_host

  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(data.google_container_cluster.backend.master_auth[0].cluster_ca_certificate)
}

resource "kubernetes_deployment" "nginx" {
  metadata {
    name = "nginx-proxy"
    labels = {
      App = "SpotifyPlaylistManager"
    }
  }

  spec {
    replicas = 2
    selector {
      match_labels = {
        App = "SpotifyPlaylistManager"
      }
    }
    template {
      metadata {
        labels = {
          App = "SpotifyPlaylistManager"
        }
      }
      spec {
        container {
          image = "nginx:1.22"
          name  = "nginx"

          port {
            container_port = 80
          }

          resources {
            limits = {
              cpu    = "0.5"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "50Mi"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "nginx" {
  metadata {
    name = "nginx"
  }
  spec {
    selector = {
      App = kubernetes_deployment.nginx.spec.0.template.0.metadata[0].labels.App
    }
    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}

output "lb_ip" {
  value = kubernetes_service.nginx.status.0.load_balancer.0.ingress.0.ip
}
