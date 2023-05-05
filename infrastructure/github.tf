data "github_repository" "main" {
  full_name = var.github_repository
}

resource "github_branch_protection" "main" {
  repository_id = data.github_repository.main.node_id
  pattern       = "main"

  required_status_checks {
    strict = true
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    required_approving_review_count = 1
  }
}

resource "github_actions_secret" "server_deploy_key" {
  repository      = data.github_repository.main.name
  secret_name     = "server_deploy_key"
  plaintext_value = google_service_account_key.server_deploy_key.private_key
}

resource "github_repository_environment" "production" {
  repository  = data.github_repository.main.name
  environment = "production"
  reviewers {
    users = [22562555]
  }
  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_repository_environment" "staging" {
  repository  = data.github_repository.main.name
  environment = "staging"
}
