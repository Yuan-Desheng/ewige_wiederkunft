---
createTime: 2026-09-18 19:56
笔记ID: 20260918195621
multiFile:
multiMedia:
description: 在绿联云 NAS(UGOS Pro)上用 Docker 跑 SeaweedFS(S3 兼容对象存储),给应用做图片/文件存储,局域网 + Tailscale 双路径可达。含 MinIO 撤出 Docker Hub、SeaweedFS 4.x raft bug、bridge 网络 gRPC 互连等一串踩坑。
笔记类型: 收集笔记
阐述日期:
tags:
  - NAS
  - Docker
  - SeaweedFS
  - S3
  - 对象存储
  - 图片存储
  - Tailscale
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/Docker.canvas|Docker]]"
---

## NAS 图片对象存储 SeaweedFS 部署

> 在绿联云 NAS `jzsd-nas`(UGOS Pro,局域网 `192.168.66.170`,Tailscale `100.92.228.2`)
> 上用 Docker 跑 **SeaweedFS**(S3 兼容对象存储),给应用存图片/文件;后端用 S3 SDK 写、
> 前台用 HTTP URL 读。局域网直连、出门走 Tailscale。
> ⚠️ 凭据已脱敏(NAS 密码、S3 secretKey 均为占位)。

## 一、为什么是 SeaweedFS 而不是 MinIO

- 本来想用 MinIO(最知名的 S3 对象存储),但 **MinIO 官方镜像已撤出 Docker Hub**——
  社区版镜像现在只发在 `quay.io`,而 quay 的国内代理要么 `denied`(daocloud 限流)、
  要么直连超时。命令行根本拉不到。
- **SeaweedFS 同样是 S3 兼容对象存储**,镜像在 Docker Hub(能走国内代理拉),更轻量。
  对应用侧完全透明——后端走 S3 SDK,MinIO / SeaweedFS 无差别。

## 二、前置条件

1. NAS 装了 Docker(绿联 UGOS Pro 应用中心可装;有 `docker` 共享即已装)。
2. NAS Docker 配了国内镜像加速器(`/etc/docker/daemon.json` 的 `registry-mirrors`,
   这里用 `https://docker.1ms.run`)。
3. **免密运维**(强烈建议,免得每步输密码):
   - 把工作机公钥装到 NAS:`ssh-copy-id -i ~/.ssh/id_ed25519.pub nas-admin@192.168.66.170`
   - 把账号加入 docker 组(免 sudo):`sudo usermod -aG docker nas-admin`(需重连生效)
   - 之后 `ssh -i ~/.ssh/id_ed25519 nas-admin@192.168.66.170 'docker ps'` 免密免 sudo。

## 三、部署步骤

### 1. 拉镜像(走国内代理,用具体 tag)

```bash
# ⚠️ 不要用 latest:SeaweedFS 4.4x(latest)单容器 raft 有 bug(见踩坑#2),用 3.80
docker pull docker.1ms.run/chrislusf/seaweedfs:3.80
docker tag docker.1ms.run/chrislusf/seaweedfs:3.80 seaweedfs:3.80  # 可选,短名
```

### 2. 准备数据卷 + S3 认证配置

数据卷用 Docker 命名卷(数据落 `/volume1/@docker/volumes`,那块大盘;别手动在
`/volume1/@docker` 建目录——那是 Docker root,只有 root 能写):

```bash
docker volume create tksea-s3-data
docker volume create tksea-s3-config
```

S3 认证配置 `s3.json`(accessKey / secretKey)。用临时 alpine 容器写进 config 卷,
secretKey 现生成、base64 传输、不落明文:

```bash
SK=$(openssl rand -hex 20)   # 生成 secretKey,不 echo
JSON='{"identities":[{"name":"tksea","credentials":[{"accessKey":"tksea","secretKey":"'"$SK"'"}],"actions":["Admin","Read","Write","List","Tagging"]}]}'
printf '%s' "$JSON" | base64 | ssh -i ~/.ssh/id_ed25519 nas-admin@192.168.66.170 \
  "docker run --rm -i -v tksea-s3-config:/c docker.1ms.run/library/alpine sh -c 'base64 -d > /c/s3.json && chmod 600 /c/s3.json'"
```

> s3.json 结构:
> ```json
> {"identities":[{"name":"tksea","credentials":[{"accessKey":"tksea","secretKey":"【已脱敏】"}],"actions":["Admin","Read","Write","List","Tagging"]}]}
> ```

### 3. 起容器(关键:`--network host`)

```bash
docker run -d --name tksea-s3 --restart unless-stopped --network host \
  -v tksea-s3-data:/data -v tksea-s3-config:/etc/seaweedfs \
  seaweedfs:3.80 \
  server -dir=/data -s3 -s3.config=/etc/seaweedfs/s3.json
```

- `--network host` 是**必须的**(见踩坑#3):bridge 网络下 SeaweedFS 各组件
  (master/volume/filer/s3)互相连不上 master 的 gRPC(19333)。
- `--restart unless-stopped`:NAS 重启后容器自动拉起。

### 4. 验证(注意:启动慢,等 ~30 秒)

```bash
sleep 30   # master gRPC 要 ~27 秒才 listen,别探太早(见踩坑#4)
# S3 端点:返回 403 AccessDenied 就对了(说明 S3 网关活着 + 认证生效,匿名被拒)
curl -s -o /dev/null -w 'S3:%{http_code}\n' http://192.168.66.170:8333    # 期望 403
curl -s -o /dev/null -w 'Filer:%{http_code}\n' http://192.168.66.170:8888 # 期望 200
# 存储读写闭环(filer HTTP,无需 S3 签名):
printf 'hello' | curl -s -F 'file=@-;filename=t.txt' http://192.168.66.170:8888/probe/t.txt
curl -s http://192.168.66.170:8888/probe/t.txt   # 应回 hello
curl -s -X DELETE http://192.168.66.170:8888/probe/t.txt
```

## 四、端点一览

| 用途 | 局域网 | Tailscale(远程) |
|---|---|---|
| S3 API | `http://192.168.66.170:8333` | `http://100.92.228.2:8333` |
| Filer HTTP | `http://192.168.66.170:8888` | `http://100.92.228.2:8888` |

- accessKey:`tksea`
- secretKey:存 NAS 配置卷 `/etc/seaweedfs/s3.json`(600);要用时:
  `docker run --rm -v tksea-s3-config:/c alpine cat /c/s3.json`

## 五、踩坑记录

### 1. MinIO 镜像撤出 Docker Hub
`docker pull minio/minio:latest` → `manifest unknown / latest not found`。MinIO 社区版
镜像已迁 quay.io;quay 国内代理 daocloud `denied`、直连超时。→ 改用 SeaweedFS。

### 2. SeaweedFS 4.4x(latest)单容器 raft bug
master 日志一边 `is the leader`、一边 masterClient 报 `raft.Server: Not current leader`,
容器崩溃重启循环。`-master.raftHashicorp` 换实现也没用。→ **降到 3.80**(3.x raft 成熟)。

### 3. bridge 网络下 master gRPC(19333)互连失败
- 默认(容器 IP):volume `dial tcp 172.17.0.3:19333: connection refused`,连不上 master。
- 加 `-ip=127.0.0.1`:raft 好了,但 S3/filer 绑到容器 loopback,Docker 端口映射进不来
  (主机 `curl 8333` 返回 000)。
- **解法:`--network host`**——容器直接用主机网络栈,消除 bridge NAT,组件走主机
  localhost 互连,端口直接在主机可达。

### 4. master gRPC 启动慢(~27 秒),别探太早
起容器后前 20 多秒,volume/filer 一直 `connection refused` 刷屏——这是**正常的**,
master 的 gRPC 到第 ~27 秒才 `Start Seaweed Master grpc server at ...:19333`,之后
filer/s3 才陆续连上。等满 30 秒再验证,否则会误判"部署失败"。

### 5. 镜像必须用具体 tag
`docker.1ms.run` 代理拉 SeaweedFS 要用 `3.80` 这种具体 tag,`latest` 常拉不到 /
指向有 bug 的 4.4x。

## 六、运维命令

```bash
ssh -i ~/.ssh/id_ed25519 nas-admin@192.168.66.170   # 免密进 NAS
docker ps --filter name=tksea-s3                     # 状态
docker logs --tail 50 tksea-s3                       # 日志
docker restart tksea-s3                              # 重启(起后等 ~30s 才 ready)
docker inspect -f '{{.RestartCount}}' tksea-s3       # 崩溃重启次数(0=健康)
```

## 七、复现 Checklist

- [ ] NAS Docker 就绪 + daemon.json 配了国内 registry-mirror
- [ ] 工作机公钥装 NAS(`ssh-copy-id`)+ 账号加 docker 组(免密免 sudo)
- [ ] `docker pull docker.1ms.run/chrislusf/seaweedfs:3.80`(**别用 latest**)
- [ ] 建命名卷 `tksea-s3-data` / `tksea-s3-config`,写 `s3.json`(600)
- [ ] `docker run ... --network host ...`(**host 网络是关键**)
- [ ] 等 30 秒;`curl 8333` 返回 403、`curl 8888` 返回 200
- [ ] filer HTTP 上传 + URL 读回 + 删除,闭环通过
- [ ] `--restart unless-stopped` 已设,重启 NAS 后容器自起

## 相关

- 同一台 NAS 的 SMB 挂载:[[NAS SMB 网络磁盘挂载]]
- 主题卡:[[Docker.canvas|Docker]]
- 应用侧集成(TK-SEA 选品上品工作台第 9 条:后端抓图存 S3 + DB 存选品全量信息):
  见项目 `docs/图片存储-SeaweedFS-NAS部署.md`
- 探活:`curl -s -o /dev/null -w '%{http_code}\n' http://192.168.66.170:8333`(403=正常)
