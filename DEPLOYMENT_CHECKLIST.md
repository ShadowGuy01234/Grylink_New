# 🚀 Production Deployment Checklist

Complete this checklist before deploying Gryork to production.

---

## 🌐 Current Vercel Deployments

| Portal | Vercel URL | Description |
|--------|------------|-------------|
| **Backend API** | https://grylink-backend.vercel.app | REST API Server |
| **Gryork Public** | https://gryork-public.vercel.app | Public Marketing Website |
| **Sub-Contractor Portal** | https://app-gryork.vercel.app | Sub-Contractor Dashboard |
| **GryLink Portal** | https://link-gryork.vercel.app | EPC/NBFC Onboarding Portal |
| **Partner Portal** | https://partner-gryork.vercel.app | Partner Dashboard (EPC & NBFC) |
| **Official Portal** | https://official-gryork.vercel.app | Internal Admin (Sales, Ops, RMT) |

### Vercel Environment Variables

Each frontend portal needs:
```bash
VITE_API_URL=https://grylink-backend.vercel.app/api
```

Backend needs:
```bash
NODE_ENV=production
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_secure_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
EMAIL_HOST=<your_smtp_host>
EMAIL_PORT=587
EMAIL_USER=<your_email_user>
EMAIL_PASS=<your_email_password>
```

---

## 📋 Pre-Deployment Checklist

### 🔐 Security

#### Backend
- [ ] Change `JWT_SECRET` to a strong, random string (minimum 64 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS to allow only production frontend URLs
- [ ] Enable HTTPS/TLS for all API endpoints
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Configure rate limiting on all endpoints
- [ ] Add request validation middleware
- [ ] Implement API key authentication for admin endpoints
- [ ] Set up proper environment variable management (AWS Secrets Manager, Vault)
- [ ] Configure database connection with SSL
- [ ] Review and update .gitignore (ensure .env is ignored)

#### Frontend
- [ ] Remove all console.log statements
- [ ] Disable React DevTools in production build
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Enable HTTPS only
- [ ] Set secure storage for tokens
- [ ] Implement XSS protection
- [ ] Add CSRF tokens for mutations

#### Database
- [ ] Enable MongoDB authentication
- [ ] Configure IP whitelist
- [ ] Set up database backups (automated daily)
- [ ] Enable encryption at rest
- [ ] Configure connection pooling
- [ ] Set up monitoring and alerts

### 🌍 Environment Configuration

#### Backend (.env.production)
```bash
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gryork?retryWrites=true&w=majority

# Security
JWT_SECRET=<STRONG_RANDOM_64_CHAR_STRING>
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<sendgrid_api_key>
EMAIL_FROM=noreply@gryork.com

# Frontend URLs (Vercel)
PUBLIC_SITE_URL=https://gryork-public.vercel.app
SUBCONTRACTOR_PORTAL_URL=https://app-gryork.vercel.app
GRYLINK_PORTAL_URL=https://link-gryork.vercel.app
PARTNER_PORTAL_URL=https://partner-gryork.vercel.app
OFFICIAL_PORTAL_URL=https://official-gryork.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://grylink-backend.vercel.app/api
```

### 📦 Build & Optimization

#### Backend
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update all dependencies to latest stable versions
- [ ] Remove unused dependencies
- [ ] Configure PM2 or similar process manager
- [ ] Set up logging (Winston, Bunyan)
- [ ] Configure log rotation
- [ ] Add health check endpoints
- [ ] Optimize database queries (add indexes)

#### Frontend
- [ ] Run production build: `npm run build`
- [ ] Analyze bundle size: `npm run build -- --analyze`
- [ ] Optimize images and assets
- [ ] Enable gzip/brotli compression
- [ ] Configure asset caching headers
- [ ] Add service worker for offline support (optional)
- [ ] Test production build locally: `npm run preview`

### 🔍 Testing

#### Backend
- [ ] Run all unit tests: `npm test`
- [ ] Run integration tests
- [ ] Test all API endpoints with production-like data
- [ ] Load test critical endpoints
- [ ] Test email delivery
- [ ] Test file uploads to Cloudinary
- [ ] Test database failover
- [ ] Test backup and restore procedures

#### Frontend
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test responsive design (all breakpoints)
- [ ] Test all user flows end-to-end
- [ ] Test with slow network conditions
- [ ] Test offline behavior
- [ ] Validate accessibility (WCAG 2.1 AA)
- [ ] Check for console errors

### 📊 Monitoring & Analytics

#### Backend
- [ ] Set up application monitoring (DataDog, New Relic)
- [ ] Configure error tracking (Sentry, Rollbar)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure database monitoring
- [ ] Set up log aggregation (ELK, Splunk)
- [ ] Create alerting rules for critical errors
- [ ] Set up performance monitoring (APM)

#### Frontend
- [ ] Configure analytics (Google Analytics, Mixpanel)
- [ ] Set up error tracking (Sentry)
- [ ] Implement user behavior tracking
- [ ] Set up performance monitoring (Web Vitals)
- [ ] Configure rage click detection
- [ ] Add conversion funnel tracking

### 🚀 Deployment

#### Infrastructure
- [ ] Choose hosting provider (AWS, Azure, DigitalOcean, Heroku)
- [ ] Set up production servers
- [ ] Configure load balancer
- [ ] Set up CDN (CloudFlare, CloudFront)
- [ ] Configure DNS records
- [ ] Set up SSL certificates (Let's Encrypt, AWS ACM)
- [ ] Configure auto-scaling (if needed)
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)

#### Database
- [ ] Provision production MongoDB cluster (MongoDB Atlas recommended)
- [ ] Configure backup schedule
- [ ] Test backup restoration
- [ ] Set up read replicas (if needed)
- [ ] Configure connection pooling
- [ ] Optimize indexes

#### Backend Deployment
- [ ] Deploy to production server
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure automatic restarts
- [ ] Set up log rotation
- [ ] Test health check endpoint
- [ ] Verify all environment variables

#### Frontend Deployment
- [ ] Build production bundles
- [ ] Deploy to CDN/hosting (Vercel, Netlify, S3+CloudFront)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure caching headers
- [ ] Set up automatic deployments
- [ ] Test all routes work with pushState routing

### 📝 Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document environment variables
- [ ] Create API documentation (Swagger/Postman)
- [ ] Document backup/restore procedures
- [ ] Create user guides for each role
- [ ] Document monitoring and alerting

### 👥 Team Preparation

- [ ] Train support team on system usage
- [ ] Create escalation procedures
- [ ] Document on-call procedures
- [ ] Set up team communication channels
- [ ] Prepare incident response plan
- [ ] Create knowledge base

### 🎯 Go-Live Checklist

#### Day Before
- [ ] Notify all stakeholders of deployment time
- [ ] Create backup of current production (if updating)
- [ ] Prepare rollback plan
- [ ] Test deployment in staging environment
- [ ] Verify all credentials and access

#### Deployment Day
- [ ] Schedule maintenance window (if needed)
- [ ] Deploy backend first
- [ ] Run database migrations
- [ ] Verify backend health
- [ ] Deploy frontend
- [ ] Verify frontend connectivity
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check logs for errors

#### Post-Deployment (First 24 Hours)
- [ ] Monitor error rates continuously
- [ ] Check all monitoring dashboards
- [ ] Review server logs
- [ ] Test key user journeys
- [ ] Monitor database performance
- [ ] Check email delivery
- [ ] Verify file uploads work
- [ ] Monitor user feedback
- [ ] Be ready for hotfixes

### 🔄 Post-Deployment

#### Week 1
- [ ] Daily monitoring of all metrics
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Address any bugs quickly
- [ ] Update documentation with learnings

#### Ongoing
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly load testing
- [ ] Regular backup testing
- [ ] Performance reviews
- [ ] User feedback analysis

---

## 🚨 Emergency Procedures

### Rollback Plan
```bash
# Backend rollback
cd backend
git checkout <previous-version-tag>
npm install
pm2 restart gryork-api

# Frontend rollback
# Revert to previous deployment in your hosting platform
# Or re-deploy from previous commit
```

### Quick Fixes
```bash
# Restart backend
pm2 restart gryork-api

# View logs
pm2 logs gryork-api

# Check process status
pm2 status

# Clear CDN cache
# Use your CDN provider's dashboard

# Database connection issues
# Check MongoDB Atlas status
# Verify IP whitelist
# Check connection string
```

---

## 📞 Emergency Contacts

**On-Call Engineer**: [Phone/Email]  
**DevOps Lead**: [Phone/Email]  
**Product Manager**: [Phone/Email]  
**CEO/Stakeholder**: [Phone/Email]

**Service Providers**:
- MongoDB Support: support@mongodb.com
- Cloudinary Support: support@cloudinary.com
- Hosting Provider: [Support contact]

---

## 🎉 Success Criteria

Deployment is considered successful when:
- [ ] All health checks pass
- [ ] Error rate < 0.1%
- [ ] API response time < 200ms (95th percentile)
- [ ] Page load time < 2 seconds
- [ ] No critical bugs reported in first 24 hours
- [ ] All user flows work as expected
- [ ] Monitoring dashboards show green
- [ ] Load test passes (if applicable)

---

## 📊 Key Metrics to Monitor

### Backend
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Memory usage
- CPU usage
- Disk usage
- Request rate
- Active connections

### Frontend  
- Page load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- JavaScript errors
- API call success rate
- User session duration

### Business
- User registrations
- Login success rate
- Document uploads
- Bill submissions
- Bid placements
- Case completions
- User satisfaction

---

## 🔐 Security Hardening

### Additional Steps
- [ ] Configure Web Application Firewall (WAF)
- [ ] Set up DDoS protection
- [ ] Enable database audit logging
- [ ] Configure intrusion detection
- [ ] Set up vulnerability scanning
- [ ] Implement IP reputation checking
- [ ] Configure bot protection
- [ ] Set up security headers (HSTS, CSP, etc.)
- [ ] Enable API request signing
- [ ] Implement session management

---

## 💡 Pro Tips

1. **Deploy during low-traffic hours** (e.g., Sunday night)
2. **Have rollback plan ready** before deployment
3. **Monitor actively for first 24 hours** after deployment
4. **Communicate proactively** with stakeholders
5. **Document everything** you do during deployment
6. **Test in staging** environment first
7. **Use feature flags** for risky changes
8. **Implement gradual rollout** if possible
9. **Keep team on standby** for first few hours
10. **Celebrate success** but stay vigilant

---

**Status**: Ready for Production ✅  
**Last Updated**: February 12, 2026

Good luck with your deployment! 🚀
