# resource "google_compute_firewall" "mysql" {
#   name    = "allow-only-gke-cluster"
#   network = google_compute_network.custom.name

#   allow {
#     protocol = "tcp"
#     ports    = ["3306"]
#   }

#   priority = 1000

#   source_ranges = ["10.10.10.0/24"]
# }

resource "google_compute_firewall" "web" {
  name    = "allow-only-authorized-networks"
  network = google_compute_network.custom.name

  allow {
    protocol = "tcp"
  }

  priority = 1000

  source_ranges = var.authorized_source_ranges
}
