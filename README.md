# LAMP Scaffold

**Structure**
- public/        → Apache web root (copy to /var/www/html)
- app/           → PHP includes and API
- config/        → config/.env.example for DB settings
- logs/          → app logs (gitkept)
- .htaccess      → optional Apache rewrites

**Deploy**
1. Push to GitHub
2. SSH into droplet
3. Clone into /var/www/html
