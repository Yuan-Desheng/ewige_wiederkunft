---
createTime: 2026-08-03 21:25
笔记ID: 20260803212500
multiFile:
multiMedia:
description: Ultralytics (YOLO) 安装与使用笔记
笔记类型: 收集笔记
阐述日期:
tags:
  - ultralytics
  - YOLO
  - 深度学习
  - 目标检测
aliases:
  - Ultralytics
cssclasses:
卡片盒笔记主题:
---

## Ultralytics 安装与使用笔记
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="80" max="100" style="width: 100%;"></progress>

### 环境信息

- 系统: Ubuntu 24.04.4 LTS (x86_64)
- Python: 3.13.13 (miniconda `/home/yuan/miniconda3/bin/python3`)
- pip: 26.0.1
- CUDA: 13.0 (系统已装)
- 安装日期: 2026-08-03

### 已安装版本

| 包 | 版本 |
|---|---|
| ultralytics | 8.4.115 |
| torch | 2.13.0 |
| torchvision | 0.28.0 |
| opencv-python | 5.0.0.93 |
| numpy | 2.4.4 |
| matplotlib | 3.11.1 |
| polars | 1.43.2 |

### 安装方式（手动下载 wheel + 离线安装）

由于网络限速，PyTorch 及 CUDA 依赖包（共约 2.6 GB）无法直接 pip 在线安装，采用手动下载 wheel 文件后离线安装。

#### 1. 下载 wheel 文件

torch 和 torchvision 手动下载到 `~/下载/`：
- torch-2.13.0-cp313-cp313-manylinux_2_28_x86_64.whl (502 MB)
- torchvision-0.28.0-cp313-cp313-manylinux_2_28_x86_64.whl (7 MB)

CUDA 相关 12 个 wheel 下载到 `~/下载/wheels/`：

```
nvidia-cublas-13.1.1.3          404 MB
nvidia-cudnn-cu13-9.20.0.48     350 MB
nvidia-cufft-12.0.0.61          205 MB
nvidia-nccl-cu13-2.29.7         197 MB
nvidia-cusolver-12.0.4.66       192 MB
nvidia-cusparselt-cu13-0.8.1    163 MB
nvidia-cusparse-12.6.3.3        140 MB
nvidia-cuda-nvrtc-13.0.88        87 MB
nvidia-nvshmem-cu13-3.4.5        58 MB
nvidia-curand-10.4.0.35          57 MB
nvidia-nvjitlink-13.3.33         39 MB
triton-3.7.1                    189 MB
```

下载工具：aria2c（多线程 + Clash 代理 `--all-proxy=http://127.0.0.1:7890`），损坏文件用 wget 单线程补传。

#### 2. 验证 wheel 完整性

```bash
cd ~/下载/wheels && for f in *.whl; do python3 -c "import zipfile; zipfile.ZipFile('$f').testzip()" 2>&1 && echo "OK  $f" || echo "BAD $f"; done
```

#### 3. 安装

```bash
# 先装 torch + torchvision + CUDA 依赖（本地 wheel）
pip install ~/下载/torch-2.13.0-cp313-cp313-manylinux_2_28_x86_64.whl \
            ~/下载/torchvision-0.28.0-cp313-cp313-manylinux_2_28_x86_64.whl \
            ~/下载/wheels/*.whl

# 再装 ultralytics（小包从 pip 缓存或 PyPI 自动拉取）
pip install -U ultralytics
```

#### 4. 验证

```bash
yolo version
# 输出: 8.4.115
```

### 使用方法

#### CLI 命令

```bash
# 语法
yolo TASK MODE ARGS

# TASK: detect, segment, semantic, depth, classify, pose, obb
# MODE: train, val, predict, export, track, benchmark
# ARGS: key=value 形式，如 imgsz=640 conf=0.25

# 预测（首次运行自动下载模型权重）
yolo predict model=yolo11n.pt source='https://ultralytics.com/images/bus.jpg'

# 训练
yolo train data=coco8.yaml model=yolo11n.pt epochs=10 lr0=0.01

# 验证
yolo val model=yolo11n.pt data=coco8.yaml batch=1 imgsz=640

# 导出为 ONNX
yolo export model=yolo11n.pt format=onnx imgsz=640

# 查看设置
yolo settings

# 查看帮助
yolo help
```

注意事项:
- 参数必须用 `key=value` 形式，用 `=` 分隔，空格隔开
- 不要用 `--` 前缀，不要用逗号

#### Python API

```python
from ultralytics import YOLO

# 加载预训练模型（推荐）
model = YOLO("yolo11n.pt")

# 从零构建模型
model = YOLO("yolo11n.yaml")

# 训练
results = model.train(data="coco8.yaml", epochs=3)

# 验证
results = model.val()

# 预测
results = model("https://ultralytics.com/images/bus.jpg")

# 导出
success = model.export(format="onnx")
```

### 常用模型

| 模型 | 任务 | 大小 |
|---|---|---|
| yolo11n.pt | 检测 (nano) | 最小最快 |
| yolo11s.pt | 检测 (small) | |
| yolo11m.pt | 检测 (medium) | |
| yolo11l.pt | 检测 (large) | |
| yolo11x.pt | 检测 (extra large) | 最大最准 |
| yolo11n-seg.pt | 分割 | |
| yolo11n-cls.pt | 分类 | |
| yolo11n-pose.pt | 姿态 | |
| yolo11n-obb.pt | 旋转目标检测 | |

### 设置

设置文件位置: `~/.config/Ultralytics/settings.json`

```bash
# 查看设置
yolo settings

# 修改设置
yolo settings runs_dir='/path/to/runs'

# 重置为默认
yolo settings reset
```

### 官方文档

- 快速开始: https://docs.ultralytics.com/zh/quickstart
- CLI 指南: https://docs.ultralytics.com/zh/usage/cli
- Python 指南: https://docs.ultralytics.com/zh/usage/python
- 配置指南: https://docs.ultralytics.com/zh/usage/cfg
- GitHub: https://github.com/ultralytics/ultralytics
