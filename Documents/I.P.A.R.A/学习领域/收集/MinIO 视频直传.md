---
createTime: 2026-06-15 17:00
笔记ID: 20260615170000
multiFile:
multiMedia:
description: 浏览器直传视频到 MinIO 的完整方案，含前端 AWS SigV4 手写签名、Nginx 反代配置、MinIO 部署与公开读 policy，附 6 条踩坑记录。
笔记类型: 收集笔记
阐述日期:
tags:
  - MinIO
  - 文件上传
  - AWSSigV4
  - Nginx
  - Vue3
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/前端开发.canvas|前端开发]]"
---

## MinIO 视频直传

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 用于复现到其他项目。所有配置已在生产环境验证可用（域名已脱敏）。
> 源项目：`global-sentiment-admin`（Vue 3 + Vben Admin v5 + Ant Design Vue）

---

## 一、原理

**目标**：让前端浏览器直接 PUT 视频到 MinIO，绕过 Spring Boot 后端 multipart 大小限制（默认 10MB，500MB 视频会被拒）。

**流程**：

```text
浏览器                      Nginx (443/HTTPS)          MinIO (9000/HTTP)
  |  1. 生成 objectKey          |                          |
  |     videos/2026-06/         |                          |
  |       ts-rand.mp4           |                          |
  |  2. AWS SigV4 签名（前端算）|                          |
  |  3. PUT /minio-s3/media/... |                          |
  |  --------------------------> |  剥 /minio-s3 前缀       |
  |                             |  ----------------------> |
  |                             |              4. 校验签名 |
  |                             |              5. 写入对象 |
  |  <------- 200 ------------  | <----------------------- |
  |  6. 返回公开 URL             |                          |
  |     /minio-media/videos/... |                          |
  |  7. <video> 播放时 GET       |                          |
  |  --------------------------> |  剥 /minio-media 前缀    |
  |                             |  ----------------------> |
  |  <------- 视频流 ----------  | <----------------------- |
```

**关键设计**：
- 前端手写 AWS SigV4，不依赖 SDK（`aws4fetch` 等也可，但手写更可控）
- payload 用 `UNSIGNED-PAYLOAD`，跳过整体 SHA256（大文件性能）
- 签名 path 必须和 Nginx 转发后的实际 path 一致（见踩坑 #1）

---

## 二、前端代码

### 2.1 核心工具：`apps/web-antd/src/utils/minio-upload.ts`

**自包含，直接复制到新项目即可用**。完整代码（258 行）：

```typescript
/**
 * MinIO 浏览器直传工具
 *
 * 签名：手写最小化 AWS Signature V4（UNSIGNED-PAYLOAD）。
 * 安全：凭证会被编译进前端产物，仅适用于可信内网。
 */
/** 进度回调签名（结构兼容 axios onUploadProgress，但不直接依赖 axios 类型） */
export type UploadProgressHandler = (event: {
  bytes: number;
  loaded: number;
  total?: number;
}) => void;

interface MinioConfig {
  accessKey: string;
  bucket: string;
  endpoint: string; // S3 API 入口，例如 https://host/minio-s3
  publicUrl: string; // 公开访问入口，例如 https://host/minio-media
  region: string;
  secretKey: string;
  videoPrefix: string;
}

function getConfig(): MinioConfig {
  const env = import.meta.env;
  return {
    endpoint: (env.VITE_MINIO_ENDPOINT as string) || '',
    publicUrl: (env.VITE_MINIO_PUBLIC_URL as string) || '',
    bucket: (env.VITE_MINIO_BUCKET as string) || 'media',
    accessKey: (env.VITE_MINIO_ACCESS_KEY as string) || '',
    secretKey: (env.VITE_MINIO_SECRET_KEY as string) || '',
    region: (env.VITE_MINIO_REGION as string) || 'us-east-1',
    videoPrefix: (env.VITE_MINIO_VIDEO_PREFIX as string) || 'videos',
  };
}

const encoder = new TextEncoder();

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return bufToHex(hash);
}

async function hmac(key: BufferSource, data: BufferSource): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, data);
}

// SigV4 派生密钥：AWS4<secret> → date → region → service → "aws4_request"
async function deriveSigningKey(
  secretKey: string,
  date: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmac(encoder.encode(`AWS4${secretKey}`), encoder.encode(date));
  const kRegion = await hmac(kDate, encoder.encode(region));
  const kService = await hmac(kRegion, encoder.encode(service));
  return hmac(kService, encoder.encode('aws4_request'));
}

interface SignParams {
  accessKey: string;
  canonicalPath?: string; // ★ Nginx 剥前缀时必须手动指定（见踩坑 #1）
  headers: Record<string, string>;
  method: string;
  region: string;
  secretKey: string;
  service: string;
  url: URL;
}

async function signV4({
  accessKey, canonicalPath, headers, method, region, secretKey, service, url,
}: SignParams): Promise<Record<string, string>> {
  const datetime = new Date().toISOString().replaceAll(/[:-]|\.\d{3}/g, '');
  const date = datetime.slice(0, 8);

  const mergedHeaders: Record<string, string> = {
    host: url.host,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    'x-amz-date': datetime,
    ...headers,
  };

  const lowerKeys = Object.keys(mergedHeaders).map((k) => k.toLowerCase()).sort();
  const canonicalHeaders = lowerKeys
    .map((k) => `${k}:${(mergedHeaders[k] ?? '').trim()}\n`)
    .join('');
  const signedHeaders = lowerKeys.join(';');

  const canonicalQuery = url.search ? url.search.slice(1) : '';
  const signingPath = canonicalPath ?? url.pathname; // ★ 用剥前缀后的 path

  const canonicalRequest = [
    method, signingPath, canonicalQuery,
    canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD',
  ].join('\n');

  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', datetime, credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = await deriveSigningKey(secretKey, date, region, service);
  const signature = bufToHex(await hmac(signingKey, encoder.encode(stringToSign)));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { ...mergedHeaders, authorization };
}

function generateObjectKey(file: File, videoPrefix: string): string {
  const dotIdx = file.name.lastIndexOf('.');
  const ext = dotIdx > 0 ? file.name.slice(dotIdx).toLowerCase() : '';
  const ym = new Date().toISOString().slice(0, 7);
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${videoPrefix}/${ym}/${ts}-${rand}${ext}`;
}

function joinUrl(base: string, objectKey: string): URL {
  const trimmed = base.replace(/\/+$/, '');
  const parts = objectKey.split('/').map((p) => encodeURIComponent(p));
  return new URL(`${trimmed}/${parts.join('/')}`);
}

export interface MinioUploadResult {
  url: string;
}

/**
 * 上传视频到 MinIO，返回公开访问 URL。
 * 适配 FileUpload 组件的 api 签名。
 */
export async function uploadVideoToMinio(
  file: File,
  onUploadProgress?: UploadProgressHandler,
): Promise<MinioUploadResult> {
  const cfg = getConfig();
  if (!cfg.endpoint || !cfg.accessKey || !cfg.secretKey) {
    throw new Error(
      'MinIO 配置缺失，请在 .env 中设置 VITE_MINIO_ENDPOINT / VITE_MINIO_ACCESS_KEY / VITE_MINIO_SECRET_KEY',
    );
  }

  const objectKey = generateObjectKey(file, cfg.videoPrefix);
  const uploadUrl = joinUrl(`${cfg.endpoint}/${cfg.bucket}`, objectKey);

  // ★★★ 关键：签名 path 要剥掉 endpoint 的 path 前缀（Nginx 反代会剥掉）
  const endpointPath = new URL(cfg.endpoint).pathname.replace(/\/+$/, '');
  const canonicalPath =
    endpointPath && uploadUrl.pathname.startsWith(endpointPath)
      ? uploadUrl.pathname.slice(endpointPath.length) || '/'
      : uploadUrl.pathname;

  const contentType = file.type || 'video/mp4';
  const signedHeaders = await signV4({
    accessKey: cfg.accessKey,
    canonicalPath,
    headers: { 'content-type': contentType },
    method: 'PUT',
    region: cfg.region,
    secretKey: cfg.secretKey,
    service: 's3',
    url: uploadUrl,
  });

  return new Promise<MinioUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl.toString());
    Object.entries(signedHeaders).forEach(([k, v]) => {
      const lk = k.toLowerCase();
      // 浏览器禁止手动设置 host 和 content-length
      if (lk === 'host' || lk === 'content-length') return;
      xhr.setRequestHeader(k, v);
    });

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onUploadProgress?.({
          bytes: e.loaded,
          loaded: e.loaded,
          total: e.total,
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = joinUrl(cfg.publicUrl, objectKey);
        resolve({ url: publicUrl.toString() });
      } else {
        reject(new Error(`上传失败 (HTTP ${xhr.status}): ${xhr.responseText || xhr.statusText}`));
      }
    });
    xhr.addEventListener('error', () =>
      reject(new Error('网络错误：无法连接到 MinIO 服务器')),
    );
    xhr.send(file);
  });
}
```

### 2.2 表单接入（`views/system/postinfo/data.ts`）

在表单 schema 里加一个字段，用框架的 `FileUpload` 组件，`api` 指向上面的 `uploadVideoToMinio`：

```typescript
import { uploadVideoToMinio } from '#/utils/minio-upload';

// 在 useFormSchema() 的 schema 数组里：
{
  fieldName: 'postVideoUrl',
  label: '帖子视频',
  component: 'FileUpload',
  componentProps: {
    maxNumber: 1,
    maxSize: 500,                                          // MB
    accept: ['mp4', 'mov', 'avi', 'webm', 'm4v', 'mkv'],
    helpText: '视频直传 MinIO，最大 500MB',
    showDescription: true,
    api: uploadVideoToMinio as any,                        // 走前端直传
  },
},
```

表格列配置（同文件 `useGridColumns()`）：

```typescript
{
  field: 'postVideoUrl',
  title: '帖子视频',
  minWidth: 120,
  slots: { default: 'postVideoUrl' },
},
```

### 2.3 表格显示（`views/system/postinfo/index.vue`）

`<Grid>` 里加 slot，渲染「查看视频」链接：

```vue
<template #postVideoUrl="{ row }">
  <a
    v-if="row.postVideoUrl"
    :href="row.postVideoUrl"
    target="_blank"
    rel="noopener noreferrer"
  >
    查看视频
  </a>
  <span v-else class="text-gray-400">—</span>
</template>
```

### 2.4 API 类型（`api/system/postinfo/index.ts`）

```typescript
export namespace SystemPostInfoApi {
  export interface PostInfo {
    // ...其他字段
    postVideoUrl?: string; // 帖子视频
  }
}
```

### 2.5 环境变量（`.env.production` / `.env.development`）

```bash
# MinIO 浏览器直传配置
# S3 API 入口，需在 Nginx 反代到 127.0.0.1:9000（剥前缀）
VITE_MINIO_ENDPOINT=https://<your-domain>/minio-s3
# 公开访问入口（Nginx 反代，匿名 GET）
VITE_MINIO_PUBLIC_URL=https://<your-domain>/minio-media
# bucket 名
VITE_MINIO_BUCKET=media
# 访问凭证（编译进前端 JS，仅限可信内网）【已脱敏】
VITE_MINIO_ACCESS_KEY=<your-access-key>
VITE_MINIO_SECRET_KEY=<your-secret-key>
# 视频存储路径前缀
VITE_MINIO_VIDEO_PREFIX=videos
# MinIO region
VITE_MINIO_REGION=us-east-1
```

---

## 三、服务器配置

### 3.1 MinIO 服务

**安装**（Ubuntu/Debian）：

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
mv minio /usr/local/bin/
```

**配置** `/etc/default/minio`：

```bash
MINIO_ROOT_USER=<your-root-user>
MINIO_ROOT_PASSWORD=<your-root-password>
MINIO_VOLUMES="/data/minio"
MINIO_OPTS="--address :9000 --console-address :9001"
```

**systemd 服务** `/etc/systemd/system/minio.service`：

```ini
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
User=minio-user
EnvironmentFile=/etc/default/minio
ExecStart=/usr/local/bin/minio server $MINIO_OPTS $MINIO_VOLUMES
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
useradd -r minio-user -s /sbin/nologin
chown -R minio-user:minio-user /data/minio
systemctl enable --now minio
```

### 3.2 bucket 创建 + 公开读 policy

```bash
# 安装 mc 客户端
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc && mv mc /usr/local/bin/

# 配置别名（凭证【已脱敏】）
mc alias set local http://127.0.0.1:9000 <your-root-user> <your-root-password>

# 创建 bucket
mc mb local/media

# ★ 设置 videos/ 前缀公开读（匿名 GET）
mc anonymous set download local/media/videos
```

**验证**：

```bash
# 上传一个测试文件
mc cp /tmp/test.mp4 local/media/videos/test.mp4

# 匿名 GET 应返回 200
curl -I http://127.0.0.1:9000/media/videos/test.mp4
```

### 3.3 Nginx 反代

`/minio-s3/` 的 `proxy_pass` **末尾必须带 `/`**（剥前缀，否则签名 path 不匹配）：

```nginx
server {
    listen 443 ssl http2;
    server_name <your-domain>;

    ssl_certificate     /etc/letsencrypt/live/<your-domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;

    # ★ MinIO S3 API：签名 PUT 上传（剥 /minio-s3 前缀）
    location /minio-s3/ {
        proxy_pass http://127.0.0.1:9000/;     # 末尾 / 会剥掉 /minio-s3 前缀
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;       # ★ 必须透传 Host（签名校验用）
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 500m;              # 允许大文件
        proxy_request_buffering off;            # 流式转发，不在 Nginx 落盘
        proxy_read_timeout 300s;
    }

    # ★ MinIO 公开访问：匿名 GET 播放
    location /minio-media/ {
        proxy_pass http://127.0.0.1:9000/media/;
        proxy_set_header Host $http_host;
    }

    # 其他 location（admin-api 等）...
    location /admin-api/ {
        proxy_pass http://127.0.0.1:48080;
        # ...
    }
}
```

```bash
nginx -t && nginx -s reload
```

**反代路径映射**：

| 浏览器请求 | Nginx 转发到 | MinIO 收到的 path |
|-----------|-------------|------------------|
| `PUT /minio-s3/media/videos/x.mp4` | `http://127.0.0.1:9000/` | `/media/videos/x.mp4` |
| `GET /minio-media/videos/x.mp4` | `http://127.0.0.1:9000/media/` | `/media/videos/x.mp4` |

---

## 四、复现 Checklist

**前端**：
- [ ] 复制 `minio-upload.ts` 到新项目的 utils 目录
- [ ] 改 import 路径（如 `#/api/infra/file` 类型的引用，本项目已用自定义 `UploadProgressHandler` 解耦）
- [ ] 表单 schema 加 `FileUpload` 字段，`api: uploadVideoToMinio`
- [ ] 表格加 slot 显示链接
- [ ] API 类型加 `postVideoUrl` 字段
- [ ] `.env` 配置 7 个 `VITE_MINIO_*` 变量

**服务器**：
- [ ] MinIO 服务安装并运行（9000 端口）
- [ ] bucket 创建（`mc mb local/media`）
- [ ] 公开读 policy（`mc anonymous set download local/media/videos`）
- [ ] Nginx 两个 location 反代（注意 `/minio-s3/` 末尾的 `/`）
- [ ] Nginx `proxy_set_header Host $http_host`（签名校验必需）
- [ ] HTTPS 证书配置

**验证**：
- [ ] `curl -I https://host/minio-s3/media/` 返回 403（端点活着）
- [ ] 浏览器上传视频，Network 看 PUT 返回 200
- [ ] 返回的公开 URL 能 `curl -I` 200

---

## 五、踩坑记录（重要，复现时对照）

### #1 签名 path 要剥 Nginx 前缀（最隐蔽的坑）

**现象**：上传返回 `403 SignatureDoesNotMatch`。

**原因**：浏览器 PUT 的 URL 是 `https://host/minio-s3/media/videos/x.mp4`，但 Nginx 的 `proxy_pass http://127.0.0.1:9000/`（末尾 `/`）会把 `/minio-s3` 前缀剥掉，MinIO 实际收到的 path 是 `/media/videos/x.mp4`。如果签名时用完整 path `/minio-s3/media/...`，MinIO 用剥前缀后的 path 重新算签名，对不上。

**解决**：代码里算 `canonicalPath`，把 endpoint 的 path 前缀（`/minio-s3`）剥掉，用剥后的 path 签名。见 `uploadVideoToMinio` 里第 203-207 行。

### #2 axios 类型耦合

**现象**：`onUploadProgress?: AxiosProgressEvent` 报类型错误。

**原因**：项目里 `AxiosProgressEvent` 是 `AxiosRequestConfig['onUploadProgress']` 的别名（函数类型），不是事件对象。直接用容易搞混。

**解决**：自定义 `UploadProgressHandler` 类型，结构兼容 axios 但不依赖。调用方用 `api: uploadVideoToMinio as any` 绕开 FileUpload 组件的类型约束。

### #3 pre-commit hook 拦截

项目用 lefthook，提交时跑 eslint。两个规则会拦：
- `@typescript-eslint/no-non-null-assertion`：禁用 `!` 非空断言，改成 `(obj[k] ?? '')`
- `unicorn/prefer-add-event-listener`：禁用 `xhr.onerror = ...`，改成 `xhr.addEventListener('error', ...)`

### #4 vue-tsc 类型检查（不在 pre-commit 里）

pre-commit 只跑 eslint，不跑 `vue-tsc`。提交后 CI 或手动跑 `pnpm check:type` 会发现：
- `hmac(key: ArrayBuffer, data: ArrayBuffer)` 报错，因为 `encoder.encode()` 返回 `Uint8Array<ArrayBuffer>`，不能赋给 `ArrayBuffer`
- **解决**：参数改成 `BufferSource`（`ArrayBuffer | ArrayBufferView` 的联合）

### #5 Mixed Content（HTTPS 页面加载 HTTP 资源）

**现象**：部署到 HTTPS 域名后，后端返回的旧图片 URL（`http://<legacy-host>:<port>/...`）被 Chrome 拦截。

**原因**：历史数据里的资源 URL 是 HTTP + IP，HTTPS 页面禁止加载；Chrome 对 IP 地址不自动升级 HTTPS。

**解决**：新增 `utils/asset-url.ts`，在 axios 响应拦截器里全局把 `http://<legacy-host>:<port>` 替换成 `https://<your-domain>`。深度遍历响应体，未命中时返回原引用避免性能损耗。

```typescript
// asset-url.ts 核心
const LEGACY_HOST = 'http://<legacy-host>:<port>';
const CURRENT_HOST = 'https://<your-domain>';

export function sanitizeAssetUrl(url: string): string {
  if (!url || !url.includes(LEGACY_HOST)) return url;
  return url.split(LEGACY_HOST).join(CURRENT_HOST);
}

// request.ts 里加响应拦截器（在 defaultResponseInterceptor 之前）
client.addResponseInterceptor({
  fulfilled: (response) => {
    if (response?.data) response.data = rewriteAssetUrls(response.data);
    return response;
  },
});
```

### #6 ERR_PROXY_CONNECTION_FAILED（非服务器问题）

**现象**：浏览器所有请求报 `net::ERR_PROXY_CONNECTION_FAILED`。

**原因**：Linux 上 Chrome 读 GNOME 系统代理设置，如果 `gsettings get org.gnome.system.proxy mode` 是 `'manual'` 但代理端口（如 7890）无监听（Clash 没开），所有请求挂掉。

**排查**：`curl --noproxy '*' <url>` 能通 = 服务器正常，问题在浏览器代理。

**解决**：`gsettings set org.gnome.system.proxy mode 'none'`，然后**完全重启 Chrome**（运行中的进程会缓存代理设置）。

---

## 六、文件清单（复现时需要 copy 的文件）

| 文件 | 是否必须 | 说明 |
|------|---------|------|
| `utils/minio-upload.ts` | ✅ 必须 | 核心上传工具，自包含 |
| `utils/asset-url.ts` | 视情况 | 仅当后端返回的 URL 有 Mixed Content 问题时需要 |
| `api/request.ts` | 修改 | 加响应拦截器调用 `rewriteAssetUrls`（配合 #5） |
| 表单 schema (`data.ts`) | 修改 | 加 `FileUpload` 字段 |
| 表格 (`index.vue`) | 修改 | 加 slot 显示链接 |
| API 类型 (`index.ts`) | 修改 | 加字段 |
| `.env.production` | 修改 | 加 7 个 `VITE_MINIO_*` 变量 |
