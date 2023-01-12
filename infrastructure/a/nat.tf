resource "google_compute_address" "web" {
  name   = "web"
  region = var.region
}

resource "google_compute_router" "web" {
  name    = "web"
  network = google_compute_network.custom.id
}

resource "google_compute_router_nat" "web" {
  name                               = "web"
  router                             = google_compute_router.web.name
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.web.self_link]
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
  subnetwork {
    name                    = google_compute_subnetwork.web.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
  depends_on = [google_compute_address.web]
}
