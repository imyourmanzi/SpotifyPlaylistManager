resource "google_compute_firewall" "web" {
  name    = "allow-only-authorized-networks"
  network = google_compute_network.custom.name

  allow {
    protocol = "tcp"
  }

  priority = 1000

  source_ranges = var.authorized_source_ranges
}
