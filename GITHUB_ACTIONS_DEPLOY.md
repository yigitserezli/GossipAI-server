# GitHub Actions VPS Deploy

This repository is prepared to auto-deploy on every push to the `main` branch.

## 1) Create your new GitHub repository

In this folder (`GossipAI-server`):

```bash
git branch -m main
git add .
git commit -m "chore: initialize server repo with CI deploy"
git remote add origin <YOUR_NEW_GITHUB_REPO_URL>
git push -u origin main
```

## 2) Configure GitHub Secrets

In your new repository, open **Settings > Secrets and variables > Actions** and add:

- `VPS_HOST`: your VPS IP or domain (example: `188.132.198.49`)
- `VPS_PORT`: `22`
- `VPS_USERNAME`: ssh user (example: `root`)
- `VPS_PASSWORD`: ssh password
- `VPS_DEPLOY_PATH`: absolute path on server (example: `/opt/gossipai`)
- `VPS_ENV_FILE`: full `.env` content as multiline secret

Use `.env.vps.example` in this repository as the template for `VPS_ENV_FILE`.

## 3) First-time VPS requirements

Install Docker + Docker Compose plugin on the server and ensure the deploy path exists:

```bash
sudo mkdir -p /opt/gossipai
```

## 4) Deployment flow

On every push to `main`, workflow will:

1. Check out code.
2. Create `.env` from `VPS_ENV_FILE`.
3. Copy repository files to server path.
4. Run `docker compose up -d --build --remove-orphans` on VPS.

## Notes

- Mobile app is intentionally not included in this repository.
- If your domain changes, update `DOMAIN` in the env secret and push again.
