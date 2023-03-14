# CONTRIBUTING

## Running Locally

Start the application like this.

```sh
SPOTIFY_SECRET="<SECRET>" npx nx run-many --target=serve --projects=server,ui
```

Run this to check if the server is running.

```sh
curl localhost:8888/healthcheck
```

## Infrastructure

### Prerequisite Setup Steps (one-time)

1. Create Terraform Cloud project in `imyourmanzi` organization, `Spotify Playlist Manager`
   1. `terraform init` the [**infrastructure**](infrastructure/) workspace
      1. Add it to the Spotify Playlist Manager project
      1. Create a Terraform variable `authorized_source_ranges` with an HCL value of `["<personal_ip>/32"]` and description: "IPv4 network blocks allowed to access the built GKE resources"
   1. `terraform init` the [**kubernetes**](kubernetes/) workspace
      1. Add it to the Spotify Playlist Manager project
1. Create GCP project (ID: `imyourmanzi-spotifyplaylistmgr`)
   1. Create Firebase project associated with GCP project
   1. Enable APIs
      - Kubernetes Engine API
      - Compute Engine API
   1. Create `terraform@...` service account in GCP project (with Editor role)
      1. Create JSON key for account and download
      1. Copy key contents: `cat <key_file>.json | tr -d '\n' | pbcopy`
      1. Set the **sensitive** `GOOGLE_CREDENTIALS` environment variable in Terraform Cloud `infrastructure` workspace, description: "imyourmanzi-spotifyplaylistmgr project Terraform service account key ID: <key_ID>"
1. Create a service account for Firebase hosting deployments and add it to GitHub with: `npx firebase init hosting:github`
   1. The **firebase-hosting-merge.yml** can be deleted (that's handled by [**application-deploy.yml**](.github/workflows/application-deploy.yml))
1. Create a `production` environment on GitHub
   1. Add required reviewers
   1. Apply to only protected branches
