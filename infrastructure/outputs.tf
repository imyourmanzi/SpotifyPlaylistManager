output "region" {
  value       = var.region
  description = "GCloud Region"
}

output "project_id" {
  value       = data.google_project.default.project_id
  description = "GCloud Project ID"
}

output "kubernetes_cluster_name" {
  value       = google_container_cluster.backend.name
  description = "GKE Cluster Name"
}

output "kubernetes_cluster_host" {
  value       = google_container_cluster.backend.endpoint
  description = "GKE Cluster Host"
}
