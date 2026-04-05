# MasTrade - Production Deployment Checklist

## Pre-Deployment

- [ ] Ubuntu 24.04 VPS provisioned
- [ ] SSH access verified
- [ ] Domain name ready (optional)
- [ ] All sensitive data removed from code
- [ ] Environment variables configured

## VPS Setup

- [ ] System updated (`apt update && apt upgrade`)
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Git installed
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Repository cloned

## Application Configuration

- [ ] `.env.production` file created with:
  - [ ] `SECRET_KEY` generated
  - [ ] `NEXT_PUBLIC_API_URL` set correctly
  - [ ] Database path configured
- [ ] `.dockerignore` files in backend/ and frontend/
- [ ] Directories created: `backend/data`, `backend/logs`, `nginx/ssl`
- [ ] `deploy.sh` made executable: `chmod +x deploy.sh`
- [ ] Git remotes configured

## Deployment

- [ ] Run: `./deploy.sh`
- [ ] Monitor output for errors
- [ ] Verify containers are running: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Check logs: `docker-compose -f docker-compose.prod.yml logs`
- [ ] Test endpoints:
  - [ ] `curl http://your_vps_ip/health`
  - [ ] Visit `http://your_vps_ip` in browser

## Post-Deployment

- [ ] Monitor application for 24 hours
- [ ] Check resource usage: `docker stats`
- [ ] Verify database persistence
- [ ] Test all critical features
- [ ] Set up log monitoring
- [ ] Configure automated backups

## SSL/HTTPS (Optional)

- [ ] Domain pointed to VPS IP
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Nginx configuration updated
- [ ] Application redeployed

## Monitoring & Maintenance

- [ ] Set up log rotation
- [ ] Schedule regular backups
- [ ] Monitor disk space
- [ ] Plan update strategy
- [ ] Document any customizations

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _______________________________________________

