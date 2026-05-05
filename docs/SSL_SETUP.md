# SSL Setup (Let's Encrypt)

## 1) Update VPS_ENV_FILE secret

Set these lines in your `VPS_ENV_FILE` secret:

- `DOMAIN=gossip-ai.site www.gossip-ai.site`
- `CERTBOT_PRIMARY_DOMAIN=gossip-ai.site`
- `CERTBOT_EMAIL=devserezli@gmail.com`

## 2) Deploy updated nginx/compose config

Push to `main` so GitHub Actions updates VPS files and restarts services.

## 3) Issue certificate on VPS (one-time)

Run on VPS:

```bash
cd /opt/gossipai
mkdir -p certbot/www certbot/conf

docker run --rm \
  -v /opt/gossipai/certbot/www:/var/www/certbot \
  -v /opt/gossipai/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d gossip-ai.site -d www.gossip-ai.site \
  --email devserezli@gmail.com \
  --agree-tos --no-eff-email

docker compose up -d nginx
```

## 4) Auto-renew (monthly)

Add root crontab entry on VPS:

```bash
0 4 1 * * cd /opt/gossipai && docker run --rm -v /opt/gossipai/certbot/www:/var/www/certbot -v /opt/gossipai/certbot/conf:/etc/letsencrypt certbot/certbot renew --webroot -w /var/www/certbot && docker compose up -d nginx
```

## 5) Verify

```bash
curl -I https://gossip-ai.site
curl -I https://gossip-ai.site/api/health
```
