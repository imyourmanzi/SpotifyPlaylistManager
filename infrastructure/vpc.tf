resource "google_compute_network" "custom" {
  name                    = "custom"
  auto_create_subnetworks = "false"
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "web" {
  name          = "web"
  ip_cidr_range = "10.10.10.0/24"
  network       = google_compute_network.custom.id
  region        = var.region

  secondary_ip_range = [
    {
      range_name    = "services"
      ip_cidr_range = "10.10.11.0/24"
    },
    {
      range_name    = "pods"
      ip_cidr_range = "10.1.0.0/20"
    }
  ]

  private_ip_google_access = true
}
