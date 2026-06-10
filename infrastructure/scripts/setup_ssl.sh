#!/usr/bin/env sh
set -eu

DOMAIN="${DOMAIN:-kujuatime.example}"
EMAIL="${EMAIL:-admin@$DOMAIN}"

certbot --nginx -d "$DOMAIN" --agree-tos --email "$EMAIL" --non-interactive
