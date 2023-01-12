provider "google" {
  project = "imyourmanzi-spm"
  region  = var.region
}

provider "google-beta" {
  project = "imyourmanzi-spm"
  region  = var.region
}
