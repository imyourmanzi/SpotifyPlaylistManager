provider "google" {
  project = "imyourmanzi-spotifyplaylistmgr"
  region  = var.region
}

provider "google-beta" {
  project = "imyourmanzi-spotifyplaylistmgr"
  region  = var.region
}
