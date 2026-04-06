# MasTrade Deployment Guide

This guide will help you deploy MasTrade to a Hostinger VPS running Ubuntu 24.04 using Docker and Traefik.

## Prerequisites

- Ubuntu 24.04 VPS on Hostinger
- SSH access to your VPS
- Root or sudo access
- At least 2GB RAM and 20GB disk space
- Hostinger's native Traefik reverse proxy (or Docker Traefik)

## Prerequisites

- Ubuntu 24.04 VPS on Hostinger
- SSH access to your VPS
- Root or sudo access
- At least 2GB RAM and 20GB disk space

## Step 1: Initial VPS Setup

Connect to your VPS via SSH:
```bash
ssh root@your_vps_ip
```

### Update System
```bash
apt update && apt upgrade -y
```

### Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker root

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Install Additional Tools
```bash
apt install -y curl wget git ufw
```

## Step 2: Firewall Configuration

```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Check status
ufw status
```

## Step 3b: Configure Hostinger Traefik (if available)

If your Hostinger VPS has native Traefik support:
1. Log into your Hostinger control panel
2. Navigate to Traefik/Reverse Proxy settings
3. Configure routing rules for your services
4. No additional configuration needed in docker-compose

## Step 3: Clone and Prepare Application

```bash
# Navigate to home directory or your preferred location
cd /opt  # or /home/username

# Clone your repository (adjust URL as needed)
git clone https://github.com/AIMonad/mastrade.git mastrade
cd mastrade

# Create necessary directories
mkdir -p backend/data
mkdir -p backend/logs
mkdir -p nginx/ssl

# Make deploy script executable
chmod +x deploy.sh
```

## Step 4: Configure Environment

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your settings
nano .env.production
```

**Key settings to update:**
- `SECRET_KEY`: Generate a random secure key (min 32 characters)
  ```bash
  openssl rand -hex 32
  ```
- `DOMAIN_NAME`: Your VPS IP or domain (e.g., `192.168.1.1` or `myapp.com`)
- `CERTIFICATE_EMAIL`: Your email (for SSL certificate notifications)
- Optional: Cloudflare API credentials for DNS validation

## Step 5: Deploy Application

```bash
# Run the deployment script
./deploy.sh
```

Or manually:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Step 6: Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-health endpoint
curl http://localhost/health

# View Traefik dashboard (if enabled)
# Access at: http://your_vps_ip:8080
```

## Accessing Your Application

Once deployed, access your application at:
- **Frontend**: `http://your_vps_ip`
- **API**: `http://your_vps_ip/api/`
- **Traefik Dashboard**: `http://your_vps_ip:8080` (local access)
http://your_vps_ip
```

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs traefik

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Redeploy
./deploy.sh
```

## Database Backup

Your SQLite database is stored in `backend/data/mastrade.db`. To backup:

```bash
# Backup database
cp backend/data/mastrade.db backend/data/mastrade.db.backup.$(date +%Y%m%d-%H%M%S)

# Or copy to local machine
scp root@your_vps_ip:/opt/mastrade/backend/data/mastrade.db ./backup/
```

## SSL/HTTPS Setup with Let's Encrypt

Traefik can automatically generate and renew SSL certificates with Let's Encrypt:

### 1. Update .env.production
```bash
DOMAIN_NAME=yourdomain.com
CERTIFICATE_EMAIL=your-email@example.com
```

### 2. Point your domain to VPS
In your domain registrar, set DNS A record to your VPS IP

### 3. Enable HTTPS in Traefik config

Edit `traefik/traefik.yml` and uncomment the certificatesResolvers section, then update the labels in docker-compose.prod.yml:

```yaml
labels:
  - "traefik.http.routers.backend.rule=PathPrefix(`/api`)"
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
  - "traefik.http.routers.frontend.rule=PathPrefix(`/`)"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### 4. Redeploy
```bash
./deploy.sh
```

Traefik will automatically obtain and renew certificates!

## Traefik Dashboard

Access the Traefik dashboard for monitoring:
- **URL**: `http://your_vps_ip:8080`
- Shows: Routers, Services, Middleware, SSL Certificates

## Troubleshooting

### Containers not starting
```bash
# Check detailed logs
docker-compose -f docker-compose.prod.yml logs

# Check Docker daemon
systemctl status docker

# Restart Docker
systemctl restart docker
```

### Out of disk space
```bash
# Check disk usage
df -h

# Clean up old Docker images
docker image prune -a

# Clean up dangling volumes
docker volume prune
```

### Port already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process if needed
sudo kill -9 <PID>
```

## Performance Monitoring

Monitor your application:

```bash
# Check resource usage
docker stats

# Check running containers
docker ps

# View container details
docker inspect mastrade-backend
```

## Support and Maintenance

- Keep system updated: `apt update && apt upgrade`
- Regularly backup your database
- Monitor logs for errors: `docker-compose -f docker-compose.prod.yml logs`
- Set up log rotation for Nginx
- Monitor disk space

## Notes

- The application runs on port 80 (HTTP) and 443 (HTTPS via Traefik)
- Backend runs internally on port 5000
- Frontend runs internally on port 3000
- Traefik handles routing, SSL termination, and load balancing
- Traefik dashboard available on port 8080 (local only)
- SQLite database persists in `backend/data/`
- All application logs can be viewed via: `docker-compose -f docker-compose.prod.yml logs`
- Traefik automatically discovers and configures services via Docker labels
- Traefik can automatically renew SSL certificates via Let's Encrypt

## Performance Benefits of Traefik

✅ Automatic service discovery from Docker   
✅ Built-in HTTP/2 and WebSocket support  
✅ Automatic SSL certificate management  
✅ Request throttling and rate limiting  
✅ Access logs in JSON format  
✅ Native Docker Compose support via labels  
✅ Zero downtime deployments  
✅ Minimal resource usage

---

For issues or questions, check the logs and refer to the Docker and Docker Compose documentation.
