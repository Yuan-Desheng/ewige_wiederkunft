---
createTime: 2026-04-17 16:12
笔记ID: 20260417161246
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
---

##  Docker 与 Nginx 部署教程：从安装到前端项目实战
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 一、Docker 基础

### 1.1 什么是 Docker

Docker 是一个开源的**容器化平台**，让你可以把应用及其依赖打包成一个独立的容器，确保"在我机器上能跑，在你机器上也一定能跑"。

**核心概念：**
- **镜像（Image）**：只读模板，相当于"类"
- **容器（Container）**：镜像的运行实例，相当于"对象"
- **仓库（Registry）**：存储和分发镜像的地方，最常用的是 [Docker Hub](https://hub.docker.com/)

### 1.2 安装 Docker（Ubuntu/Debian 为例）

```bash
# 1. 更新 apt 并安装依赖
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 2. 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 3. 添加 Docker 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. 验证安装
sudo docker run hello-world
```

**安装后处理（可选）——免 sudo 运行 Docker：**
```bash
sudo usermod -aG docker $USER
# 重新登录后生效
```

### 1.3 Docker 常用命令

```bash
# 镜像操作
docker images                    # 查看本地镜像
docker pull nginx:alpine          # 拉取镜像
docker rmi <image_id>            # 删除镜像
docker build -t myapp .          # 从 Dockerfile 构建镜像

# 容器操作
docker ps                        # 查看运行中的容器
docker ps -a                     # 查看所有容器（包括已停止的）
docker run -d --name myapp nginx:alpine   # 后台运行容器
docker start <container>         # 启动已停止的容器
docker stop <container>          # 停止容器
docker restart <container>       # 重启容器
docker rm <container>            # 删除容器
docker logs -f <container>       # 查看容器日志

# 进入容器内部
docker exec -it <container> /bin/bash

# 容器网络
docker network ls                # 查看网络
docker network create mynet       # 创建网络
```

---

## 二、Nginx 基础

### 2.1 什么是 Nginx

Nginx 是一个高性能的 **HTTP 服务器**和**反向代理服务器**。它可以：
- 托管静态文件（前端构建产物）
- 作为反向代理（将请求转发到后端服务）
- 负载均衡
- SSL termination

### 2.2 Docker 中使用 Nginx 的两种方式

**方式 A：直接使用官方 Nginx 镜像（推荐用于部署）**
```bash
docker run -d --name my-nginx -p 8080:80 nginx:alpine
```

**方式 B：自定义 Nginx 配置**
```bash
# 挂载本地配置文件
docker run -d --name my-nginx \
  -p 8080:80 \
  -v /path/to/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /path/to/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

---

## 三、实战：部署前端项目到 Docker + Nginx

### 3.1 部署架构概览

```
用户浏览器
    │
    ▼
┌─────────────────┐
│  Nginx 容器 :80  │  ← 端口映射（28200 / 28210）
│  （反向代理）    │
└────────┬────────┘
         │ /api/* 转发
         ▼
┌─────────────────┐
│  pig-gateway    │  ← Docker 网络中的后端服务
│  (9999 端口)    │
└─────────────────┘
```

### 3.2 步骤一：本地打包前端项目

以 Vite + pnpm 项目为例：

```bash
# 进入项目目录
cd /home/yuan/code/smart_vision/vpp/frontend-workspace/04-current/vpp-simulator-frontend

# 安装依赖
pnpm install

# 打包构建
pnpm build
# 输出目录：dist/
```

### 3.3 步骤二：在服务器上创建目录结构

```bash
# SSH 连接到服务器
ssh zhanwei@100.116.130.126
sudo -i

# 创建项目目录
sudo mkdir -p /data/vpp-simulator-frontend/dist
```

**注意**：如果普通用户对 `/data/` 无写权限，先传到用户家目录再移动：
```bash
# 在普通用户下操作
mkdir -p ~/vpp-simulator-frontend
# scp 上传压缩包到这里
sudo mv ~/vpp-simulator-frontend /data/
```

### 3.4 步骤三：编写 Nginx 配置文件

#### 方案 A：vpp-frontend（28200）Nginx 配置

服务器上容器内 Nginx 配置位于 `/etc/nginx/conf.d/default.conf`（容器内路径），实际挂载在宿主机的 `/data/` 目录：

```nginx
server {
    listen 80;
    server_name localhost;

    gzip on;
    gzip_static on;     # 需要http_gzip_static_module 模块
    gzip_min_length 1k;
    gzip_comp_level 4;
    gzip_proxied any;
    gzip_types text/plain text/xml text/css;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    # 前端构建后的dist 内的文件需拷贝到此目录（不包括dist）
    root /data/;

    location ^~/api/ {
        proxy_pass http://pig-gateway:9999/; #注意/后缀
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header from "";
        # 屏蔽所有敏感路径，避免忘记配置关闭，双重保护
        location ~ ^/api/(actuator|swagger-ui|v3/api-docs|swagger-resources|webjars|doc\.html) {
            return 403;
        }
    }
}
```

**特点**：
- 静态文件目录为 `/data/`，直接映射到宿主机目录
- Gzip 仅压缩 text/plain、text/xml、text/css（较旧配置）
- 无 SPA fallback 配置（`try_files`）

#### 方案 B：vpp-simulator（28210）Nginx 配置

```nginx
server {
    listen 80;
    server_name localhost;

    gzip on;
    gzip_static on;
    gzip_min_length 1k;
    gzip_comp_level 4;
    gzip_proxied any;
    gzip_types text/plain text/xml text/css application/javascript application/json;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    root /usr/share/nginx/html;
    index index.html;

    # 前端路由 fallback（SPA 必须）
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ^~/api/ {
        proxy_pass http://pig-gateway:9999/;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;

        location ~ ^/api/(actuator|swagger-ui|v3/api-docs|swagger-resources|webjars|doc\.html) {
            return 403;
        }
    }
}
```

**特点**：
- 静态文件目录为 `/usr/share/nginx/html`（容器内标准路径）
- Gzip 压缩更全面（包含 application/javascript、application/json）
- 有 SPA fallback 配置（`try_files $uri $uri/ /index.html`）

### 3.5 步骤四：启动 Nginx 容器

```bash
# 停止并删除旧容器（如果存在）
docker stop vpp-simulator 2>/dev/null || true
docker rm vpp-simulator 2>/dev/null || true

# 启动新容器
docker run -d \
  --name vpp-simulator \
  --restart unless-stopped \
  --network vpp_network \
  -p 28210:80 \
  -v /data/vpp-simulator-frontend/dist:/usr/share/nginx/html:ro \
  -v /data/vpp-simulator-frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine

# 查看容器状态
docker ps --filter name=vpp-simulator

# 查看日志
docker logs --tail 20 vpp-simulator
```

**关键参数解释：**
| 参数 | 作用 |
|------|------|
| `-d` | 后台运行 |
| `--name vpp-simulator` | 容器名称 |
| `--restart unless-stopped` | 除非手动停止，否则自动重启 |
| `--network vpp_network` | 加入 Docker 网络，才能解析其他容器的域名 |
| `-p 28210:80` | 宿主机 28210 映射到容器 80 |
| `-v ...:ro` | 只读挂载，防止容器修改静态文件 |
| `nginx:alpine` | 使用 Alpine 精简版镜像 |

### 3.6 步骤五：验证部署

```bash
# 本地测试访问
curl -I http://100.116.130.126:28210

# 查看 Nginx 日志
docker logs -f vpp-simulator
```

---

## 四、自动化部署脚本

每次手动执行以上步骤太麻烦，写一个 `deploy.sh` 自动完成：

```bash
#!/bin/bash
set -e

# ---- 配置 ----
SERVER="zhanwei@100.116.130.126"
REMOTE_DIR="/data/vpp-simulator-frontend"
ARCHIVE_NAME="dist.tar.gz"

echo "==> 1/5 打包..."
pnpm build

echo "==> 2/5 压缩..."
tar -czf ${ARCHIVE_NAME} dist/

echo "==> 3/5 上传到服务器..."
sshpass -p "你的密码" scp -o StrictHostKeyChecking=no ${ARCHIVE_NAME} ${SERVER}:/home/zhanwei/

echo "==> 4/5 远程部署..."
sshpass -p "你的密码" ssh -o StrictHostKeyChecking=no ${SERVER} << 'EOF'
sudo mkdir -p ${REMOTE_DIR}
sudo mv /home/zhanwei/dist.tar.gz ${REMOTE_DIR}/
cd ${REMOTE_DIR} && sudo mkdir -p dist && sudo tar -xzf dist.tar.gz -C dist
sudo rm -f dist.tar.gz
echo "远程解压完成"
EOF

echo "==> 5/5 启动容器..."
sshpass -p "你的密码" ssh -o StrictHostKeyChecking=no ${SERVER} << 'EOF'
sudo docker stop vpp-simulator 2>/dev/null || true
sudo docker rm vpp-simulator 2>/dev/null || true
sudo docker run -d \
  --name vpp-simulator \
  --restart unless-stopped \
  --network vpp_network \
  -p 28210:80 \
  -v /data/vpp-simulator-frontend/dist:/usr/share/nginx/html:ro \
  -v /data/vpp-simulator-frontend/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
echo "容器启动完成"
sleep 2
docker ps --filter name=vpp-simulator --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker logs --tail 10 vpp-simulator
EOF

rm -f ${ARCHIVE_NAME}
echo "==> 部署完成！"
```

**使用方法：**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 五、Docker 网络详解

### 5.1 为什么要加 --network

Docker 容器之间通过**网络隔离**。默认情况下，新容器连接到 `bridge` 网络，无法直接通过容器名解析其他容器。

`vpp-frontend` 和 `pig-gateway` 都运行在 `vpp_network` 中，所以它们可以通过容器名互相访问。新容器如果不加入这个网络，就找不到 `pig-gateway`。

### 5.2 查看和创建网络

```bash
# 查看所有网络
docker network ls

# 查看某个网络详情（包含已连接容器）
docker network inspect vpp_network

# 创建自定义网络
docker network create my_network

# 将容器连接到网络
docker network connect my_network my_container
```

---

## 六、常见问题排查

### Q1：容器启动后立即退出
```bash
# 查看容器退出原因
docker logs <container>
docker ps -a --filter "exited(0)"
```

### Q2：Nginx 报 "host not found in upstream"
- 原因：目标容器不在同一网络
- 解决：启动时加 `--network vpp_network`

### Q3：静态文件 403 Forbidden
- 原因：挂载的目录为空或路径错误
- 解决：确认 `dist/` 目录存在且有文件

### Q4：API 请求 502 Bad Gateway
- 原因：后端服务（如 pig-gateway）未启动或端口错误
- 解决：`docker ps` 确认后端容器运行中

### Q5：scp 报 Permission denied
- 原因：目标目录无写权限
- 解决：先传到有权限的目录，再 `sudo mv` 过去

### Q6：部署后页面没更新
- 原因：浏览器缓存
- 解决：Ctrl+Shift+R 强制刷新，或在 Nginx 配置里加缓存控制头

---

## 七、进阶配置

### 7.1 Nginx 常用配置项速查

```nginx
# 监听端口
listen 80;

# 域名
server_name example.com;

# 重定向
return 301 https://$server_name$request_uri;

# 负载均衡
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

# 路径别名
location /static/ {
    alias /data/static/;
}

# 禁止 IP 访问
server {
    listen 80 default_server;
    return 444;
}
```

### 7.2 Docker 资源限制

```bash
# 限制内存和 CPU
docker run -d \
  --name myapp \
  --memory="512m" \
  --cpus="1.0" \
  nginx:alpine
```

### 7.3 日志管理

```bash
# 查看实时日志
docker logs -f <container>

# 限制日志文件大小
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx:alpine
```

---

## 八、简化部署：无需重建容器的方式

### 8.1 为什么不需要重建容器

Nginx 容器对挂载目录是**实时读取**的：
- 替换宿主机上的 dist 文件 → 容器内自动能看到新文件（因为是 `:ro` 只读挂载，但挂载点在宿主机端变了）
- 只需要让 nginx 重新加载一下配置即可

重建容器的问题是：容器 ID 变、日志丢失、需要重新拉镜像（如果本地没有）。

### 8.2 方式一：替换文件 + nginx 重载（推荐）

```bash
# 1. 上传并解压新版本（覆盖）
sshpass -p "gu#gong9" scp dist.tar.gz ${SERVER}:/home/zhanwei/
sshpass -p "gu#gong9" ssh ${SERVER} << 'EOF'
  cd /data/vpp-simulator-frontend
  sudo tar -xzf /home/zhanwei/dist.tar.gz -C dist --overwrite
  sudo rm -f /home/zhanwei/dist.tar.gz
EOF

# 2. 告诉 nginx 重载配置（不重启容器，不丢日志）
sshpass -p "gu#gong9" ssh ${SERVER} \
  "sudo docker exec vpp-simulator nginx -s reload"
```

**原理**：`nginx -s reload` 让 nginx 重新扫描挂载的静态文件，不需要重建容器。

### 8.3 方式二：直接替换文件 + docker restart

如果 nginx 配置没有变化，只是静态文件更新了，可以：

```bash
# 替换 dist 内容后
sshpass -p "gu#gong9" ssh ${SERVER} "sudo docker restart vpp-simulator"
```

**注意**：这种方式会丢失容器重启前的日志，且容器会短暂不可用（几秒）。适合配置文件也没改的情况。

### 8.4 方式三：只重载 nginx 配置（不改文件）

如果只改了 `nginx.conf`（比如调整 Gzip 或代理地址），不需要动任何文件：

```bash
# 在容器内重载 nginx
docker exec vpp-simulator nginx -s reload

# 或者重启容器（但保留容器，只重启 nginx 进程）
docker restart vpp-simulator
```

### 8.5 简化版 deploy.sh（推荐生产使用）

```bash
#!/bin/bash
set -e

SERVER="zhanwei@100.116.130.126"
REMOTE_DIR="/data/vpp-simulator-frontend"

echo "==> 1/3 打包..."
pnpm build

echo "==> 2/3 上传并解压..."
tar -czf dist.tar.gz dist/
sshpass -p "gu#gong9" scp -o StrictHostKeyChecking=no dist.tar.gz ${SERVER}:/home/zhanwei/
sshpass -p "gu#gong9" ssh -o StrictHostKeyChecking=no ${SERVER} << 'EOF'
  sudo mkdir -p ${REMOTE_DIR}
  sudo mv /home/zhanwei/dist.tar.gz ${REMOTE_DIR}/
  cd ${REMOTE_DIR} && sudo tar -xzf dist.tar.gz -C dist --overwrite
  sudo rm -f dist.tar.gz
  echo "解压完成"
EOF
rm -f dist.tar.gz

echo "==> 3/3 重载 Nginx..."
sshpass -p "gu#gong9" ssh -o StrictHostKeyChecking=no ${SERVER} \
  "sudo docker exec vpp-simulator nginx -s reload"

echo "==> 部署完成！"
```

**与旧版对比**：
| | 旧版（删容器重建） | 简化版（推荐） |
|---|---|---|
| 容器 ID | 每次不同 | 保持不变 |
| 日志 | 丢失 | 保留 |
| 部署速度 | 慢（需重建容器） | 快（只重载 nginx） |
| 停机时间 | 几秒 | 无（nginx 热重载） |

### 8.6 何时需要真正重建容器

需要**重建容器**（删了再建）的唯一场景：
- 改了容器启动参数（端口映射、网络、挂载路径）
- 换了镜像版本（如从 `nginx:alpine` 换成 `nginx:latest`）
- nginx.conf 改了但容器内 nginx 不支持热重载

日常部署只用**方式一**就够了。

---

## 九、服务器当前部署状态

| 项目 | 容器名 | 端口 | 静态目录（容器内） | API 代理 |
|------|--------|------|---------------------|----------|
| 已有前端 | vpp-frontend | 28200 | `/data/` | `/api/` → `pig-gateway:9999` |
| 新部署前端 | vpp-simulator | 28210 | `/usr/share/nginx/html` | `/api/` → `pig-gateway:9999` |

**访问地址：**
- vpp-frontend：http://100.116.130.126:28200
- vpp-simulator：http://100.116.130.126:28210
