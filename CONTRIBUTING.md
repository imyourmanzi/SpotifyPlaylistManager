# CONTRIBUTING

## Running Locally

Start the application like this.

```sh
SPOTIFY_SECRET="<SECRET>" npx nx run-many --target=serve --projects=server,ui
```

Run this to check if the server is running.

```sh
curl localhost:8888/api/healthcheck
```

## Building the Server Container Locally

The command for building the server in the Docker image is contained in [**server/project.json**](/packages/server/project.json).

```sh
npx nx build:docker server
npx nx build:docker:m1 server # for M-series Macs
```

## Infrastructure

### Prerequisite Setup Steps (one-time)

Based on the infrastructure-as-code in this repository, these are the manual steps that would need to be completed to completely rebuild the project infrastructure & environment.

_\*Note: `<owner>` is currently `imyourmanzi`_

1. Create a GitHub repository: `<owner>/SpotifyPlaylistManager`
1. Create Terraform Cloud project in `<owner>` organization, `Spotify Playlist Manager`
   1. `terraform init` the [**infrastructure**](infrastructure/) workspace
      1. Add it to the "Spotify Playlist Manager" project
   1. Create a Terraform Cloud Team Token and save it in a GitHub secret (Settings > Secrets and variables > Actions > Repository secrets) named `TF_API_TOKEN`
1. Create GCP project (ID: `<owner>-spotifyplaylistmgr`)
   1. Create Firebase project associated with GCP project
   1. Enable APIs
      - Artifact Registry API
      - Cloud Run API
      - Secret Manager API
1. Store secrets in Terraform Cloud
   1. Create Terraform service account for GCP
      1. Create `terraform@...` service account in GCP project with roles:
         - Artifact Registry Administrator
         - Cloud Run Admin
         - Editor
         - Secret Manager Secret Accessor
      1. Create JSON key for account and download
      1. Copy key contents: `cat <key_file>.json | tr -d '\n' | pbcopy`
      1. Set the **sensitive** `GOOGLE_CREDENTIALS` environment variable in Terraform Cloud `infrastructure` workspace, description: "<owner>-spotifyplaylistmgr project Terraform service account key ID: <key_ID>"
   1. Set the **sensitive** `spotify_client_secret` Terraform variable in Terraform Cloud `infrastructure` workspace to the value from Spotify Developer UI, description: "Spotify Client Secret"
   1. Create a GitHub personal access token (fine-grained)
      - Name: `[SPM] Terraform Cloud Token`
      - Expiration: 1 year in the future
      - Description: "For Terraform runs from Terraform Cloud to access private/sensitive resources in the SpotifyPlaylistManager project."
      - Only select repositories: pick repo for SpotifyPlaylistManager
      - Repository permissions
        - Administration: `Read and write`
        - Environments: `Read and write`
        - Secrets: `Read and write`
      1. Set the **sensitive** `GITHUB_TOKEN` environment variable in Terraform Cloud `infrastructure` workspace, description: "GitHub token: [SPM] Terraform Cloud Token"
1. Create a service account for Firebase hosting deployments and add it to GitHub with: `npx firebase init hosting:github`
   1. The **firebase-hosting-merge.yml** can be deleted (that's handled by [**application-deploy.yml**](.github/workflows/application-deploy.yml))
1. Grant "Compute Engine default service account" the "Secret Manager Accessor Role"
1. An initial deployment must be run from `main`, since future deploys rely on the server container image and GitHub "production" environment that will be created in this initial deploy:
   1. Create initial infrastructure—this will fail to create the service but it will create the Artifact Registry repository which is what we need first (and yes there's a better way to do this that involves Terraform workspaces but we're not there yet)
      ```
      cd infrastructure/
      terraform init
      terraform apply
      ```
   1. Build and push the container image
      ```sh
      npx "nx@$(jq -r '.devDependencies["@nrwl/cli"]' package.json)" build:docker server
      docker tag spm-server:latest us-central1-docker.pkg.dev/imyourmanzi-spotifyplaylistmgr/server-images/server:latest
      gcloud auth configure-docker us-central1-docker.pkg.dev
      docker push us-central1-docker.pkg.dev/imyourmanzi-spotifyplaylistmgr/server-images/server:latest
      ```
   1. In GCP > Cloud Run > Services, delete the `server` service that failed initially—Terraform doesn't know it exists and will fail again if you don't delete it because it will try to create a new service with the same name
   1. Finish creating infrastructure
      ```sh
      terraform apply
      ```
