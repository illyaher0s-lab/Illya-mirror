# Mirror 项目部署文档

## 服务器信息

- **服务器**: 腾讯云香港轻量应用服务器
- **IP**: 43.128.11.119
- **系统**: Ubuntu 24.04 LTS
- **访问地址**: http://43.128.11.119

## 技术栈

### 前端
- Vite 6.0
- React 19
- React Router v6
- Tailwind CSS v4
- Kenya Hara 东方极简设计风格

### 后端
- FastAPI
- PostgreSQL
- Python 3.12 虚拟环境
- Uvicorn ASGI 服务器

### 部署
- Nginx 反向代理
- systemd 服务管理

## 目录结构

```
/home/ubuntu/mirror/
├── frontend/               # 前端项目
│   ├── src/               # 源代码
│   ├── dist/              # 生产构建输出
│   └── package.json
├── backend/               # 后端项目
│   ├── app/              # FastAPI 应用
│   ├── venv/             # Python 虚拟环境
│   └── requirements.txt
├── nginx.conf            # Nginx 配置文件
└── mirror-backend.service # systemd 服务配置
```

## 服务配置

### 1. Nginx 配置

**配置文件**: `/etc/nginx/sites-available/mirror`

```nginx
server {
    listen 80;
    server_name 43.128.11.119;

    # 前端静态文件
    location / {
        root /home/ubuntu/mirror/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置**:
```bash
sudo ln -s /etc/nginx/sites-available/mirror /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. systemd 服务配置

**配置文件**: `/etc/systemd/system/mirror-backend.service`

```ini
[Unit]
Description=Mirror Backend API Service
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mirror/backend
Environment="PATH=/home/ubuntu/mirror/backend/venv/bin"
ExecStart=/home/ubuntu/mirror/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**服务管理命令**:
```bash
# 重载配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start mirror-backend

# 停止服务
sudo systemctl stop mirror-backend

# 重启服务
sudo systemctl restart mirror-backend

# 查看状态
sudo systemctl status mirror-backend

# 查看日志
sudo journalctl -u mirror-backend -f

# 开机自启
sudo systemctl enable mirror-backend
```

## 部署流程

### 首次部署

1. **安装依赖**
```bash
# 安装 Node.js 和 npm（如果未安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
```

2. **配置数据库**
```bash
sudo -u postgres psql
CREATE DATABASE mirror;
CREATE USER mirror_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mirror TO mirror_user;
\q
```

3. **后端设置**
```bash
cd /home/ubuntu/mirror/backend

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head
```

4. **前端构建**
```bash
cd /home/ubuntu/mirror/frontend

# 安装依赖
npm install

# 生产构建
npm run build
```

5. **配置服务**
```bash
# 复制 Nginx 配置
sudo cp /home/ubuntu/mirror/nginx.conf /etc/nginx/sites-available/mirror
sudo ln -s /etc/nginx/sites-available/mirror /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 复制 systemd 服务配置
sudo cp /home/ubuntu/mirror/mirror-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start mirror-backend
sudo systemctl enable mirror-backend
```

6. **配置防火墙**
```bash
# 服务器防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 腾讯云安全组
# 在腾讯云控制台 > 轻量应用服务器 > 防火墙 > 添加规则
# 协议: TCP, 端口: 80, 策略: 允许
```

### 更新部署

**前端更新**:
```bash
cd /home/ubuntu/mirror/frontend
git pull
npm install
npm run build
# Nginx 会自动服务新的 dist/ 文件
```

**后端更新**:
```bash
cd /home/ubuntu/mirror/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head  # 如果有数据库变更
sudo systemctl restart mirror-backend
```

## 监控和维护

### 查看服务状态
```bash
# 后端服务状态
sudo systemctl status mirror-backend

# Nginx 状态
sudo systemctl status nginx

# 数据库状态
sudo systemctl status postgresql
```

### 查看日志
```bash
# 后端日志（实时）
sudo journalctl -u mirror-backend -f

# 后端日志（最近 100 行）
sudo journalctl -u mirror-backend -n 100

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 常见问题排查

**1. 后端服务无法启动**
```bash
# 检查端口占用
sudo lsof -i :8000

# 如果有旧进程，杀掉它
sudo kill <PID>

# 重启服务
sudo systemctl restart mirror-backend
```

**2. 前端无法访问**
```bash
# 检查 Nginx 配置
sudo nginx -t

# 检查 dist 目录是否存在
ls -la /home/ubuntu/mirror/frontend/dist/

# 重新构建前端
cd /home/ubuntu/mirror/frontend
npm run build
```

**3. API 请求失败**
```bash
# 测试后端是否运行
curl http://localhost:8000/api/distillations

# 测试 Nginx 代理
curl http://43.128.11.119/api/distillations

# 检查后端日志
sudo journalctl -u mirror-backend -n 50
```

**4. 数据库连接失败**
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试数据库连接
sudo -u postgres psql -d mirror -c "SELECT 1;"

# 检查后端环境变量
cat /home/ubuntu/mirror/backend/.env
```

## 性能优化

### Nginx 缓存配置
```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# 在 location /api/ 块中添加
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

### 后端性能
```bash
# 使用多个 worker 进程
ExecStart=/home/ubuntu/mirror/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 安全建议

1. **配置 HTTPS**（推荐使用 Let's Encrypt）
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. **限制 API 访问速率**（在 Nginx 中配置）
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... 其他配置
}
```

3. **定期备份数据库**
```bash
# 创建备份脚本
sudo -u postgres pg_dump mirror > /backup/mirror_$(date +%Y%m%d).sql

# 添加到 crontab
0 2 * * * /path/to/backup-script.sh
```

## 项目信息

- **开发者**: Illya
- **项目名称**: Mirror（镜像）
- **功能**: 多阶段 LLM 蒸馏系统
- **部署日期**: 2026-05-12
- **版本**: v1.0.0

## 联系方式

如有问题，请联系项目维护者。
