---
createTime: 2026-11-02 19:55
笔记ID: 20261102195553
multiFile:
multiMedia:
description: 根据 Jetson 现场配置、进程与系统日志整理 A 臂的环境、主从连接和已确认问题。
笔记类型: AI整理
阐述日期:
tags:
  - 机器人
  - LeRobot
  - Jetson
  - SO-ARM101
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## SO-ARM101 LeRobot 部署与调试记录
```meta-bind-embed
[[笔记抬头模块]]
```

> 2026-11-09 更新入口：本文保留11月2日至3日的部署快照；后续试录、双色双盘任务及桌面归档见 [[SO101双色双盘采集项目]] 与 [[SO101桌面归档与相机运维]]。旧文中的“尚未验证”按当时状态理解。

### 官方资料与视频

- [Seeed Studio：SO-ARM100 / SO-ARM101 与 LeRobot 完整教程](https://wiki.seeedstudio.com/cn/lerobot_so100m_new/)：环境、组装、校准、遥操作、相机、采集和训练。
- [组装视频（教程内嵌，B 站）](https://www.bilibili.com/video/BV1k6UUBFEw4/)；[校准视频（教程内嵌，B 站）](https://www.bilibili.com/video/BV1w6UUBcEGR/)。
- [Seeed Studio 验证版 LeRobot 仓库](https://github.com/Seeed-Projects/lerobot)；[舵机调试工具教程](https://wiki.seeedstudio.com/cn/lerobot_steering_gear_debugging_tool/)。教程随版本更新，操作前核对当前页面和硬件型号。

### 从零复现：先确认路线

本手册覆盖连接和遥操作，不包含已经验证可用的数据采集或训练。现有机器为 Jetson Orin、JetPack R36.4.3、Python 3.10.12；下列官方安装路线使用 Python 3.12，**没有在另一台机器上完整实测**。Jetson 的 Torch wheel 必须匹配 JetPack、CUDA、架构和 Python；x86 不能使用 Jetson wheel。原机没有保留完整安装日志或锁文件，不能保证逐包精确还原。

#### 1. 准备硬件

1. 根据购买套件核对舵机、减速比、电源电压和接线，按组装视频或教程完成安装。教程说明 SO101 标准版使用 5 V；Pro 版主臂为 5 V、从臂为 12 V。仍须以自己套件标识为准。
2. 完成舵机 ID 与波特率设置（新舵机按官方教程逐个设置），固定机械臂。插拔电源、USB 或舵机线前先断电。
3. 连接主臂和从臂的数据线并供电。进行校准或遥操作前清空周围至少 1 米，人员离开运动范围，准备随时停止并断电。

#### 2. 安装环境：Seeed 教程路线

以下根据教程整理；在另一台机器从零执行前，先按教程选择与架构匹配的 Miniforge 安装包，并完成安装、重启终端。Jetson 先核对 JetPack 版本和官方页面的兼容说明。

```bash
conda create -y -n lerobot python=3.12
conda activate lerobot
git clone https://github.com/Seeed-Projects/lerobot.git ~/lerobot
conda install -y -c conda-forge ffmpeg
cd ~/lerobot
pip install -e ".[feetech]"
```

GPU 训练或推理需另外按设备与 JetPack/CUDA 安装兼容的 PyTorch 和 torchvision。教程提醒安装 LeRobot 依赖可能改变 Torch；安装完成后检查版本和 CUDA，不要假定 `True` 已经得到验证：

```bash
python -c 'import sys, torch; print(sys.version); print(torch.__version__, torch.version.cuda, torch.cuda.is_available())'
lerobot-teleoperate --help
```

如果复刻本机的 Jetson 组合而非使用上面的官方路线，需要 Python 3.10、LeRobot 0.4.4、`feetech-servo-sdk==1.0.0`、Jetson AI Lab 的 JP6/CUDA 12.6 对应 `torch==2.10.0` 和 `torchvision==0.25.0`，以及 `nvidia-cudss-cu12==0.8.0.10`、`nvidia-cusparselt-cu12==0.8.1`。原机两个 Torch wheel 来源分别为 [torch](https://pypi.jetson-ai-lab.io/jp6/cu126/+f/37d/7e156cfb4a646/torch-2.10.0-cp310-cp310-linux_aarch64.whl) 和 [torchvision](https://pypi.jetson-ai-lab.io/jp6/cu126/+f/1b6/357c5532db61e/torchvision-0.25.0-cp310-cp310-linux_aarch64.whl)。这些是已观察到的版本和来源，不是经过新机验证的安装顺序；先确认目标板卡和 wheel 兼容，避免后续依赖安装替换 Jetson 版 Torch。

原机通过环境脚本设置 CUDA 动态库搜索路径；在另一台使用相同包布局的 Python 3.10 环境中，可按实际虚拟环境路径调整：

```bash
export VENV_PATH=/data/so101/.venv
export LD_LIBRARY_PATH="$VENV_PATH/lib/python3.10/site-packages/nvidia/cu12/lib:$VENV_PATH/lib/python3.10/site-packages/nvidia/cusparselt/lib:${LD_LIBRARY_PATH:-}"
source "$VENV_PATH/bin/activate"
python -c 'import torch; print(torch.__version__, torch.version.cuda, torch.cuda.is_available())'
```

#### 3. 辨认串口并检查权限

```bash
ls -l /dev/serial/by-id/
id -nG
ls -l /dev/ttyACM*
```

通过逐个连接设备并对照变化确认主、从臂，将下列占位符替换成新机器实际路径，**不要照搬原机设备序列号**：

```bash
export L=/dev/serial/by-id/替换为主臂设备
export F=/dev/serial/by-id/替换为从臂设备
```

如果串口权限不足，检查设备所属组和当前用户组；必要时按本机系统管理规则加入对应组，并重新登录使组成员关系生效。教程的串口权限与 FAQ 可供排查。`ttyACM0/1` 可能重新分配，以实际识别结果为准。

#### 4. 分别校准主从臂

确认设备路径和供电正确，工作空间安全，按程序提示完成。原机命令文件提醒校准从臂时在按回车前托住从臂；具体动作和交互以教程视频与程序提示为准。

```bash
lerobot-calibrate --robot.type=so101_follower --robot.port="$F" --robot.id=a_follower
lerobot-calibrate --teleop.type=so101_leader --teleop.port="$L" --teleop.id=a_leader
```

按提示设置中位并覆盖关节活动范围。校准文件由机器人类型、ID 和缓存位置共同决定；后续遥操作使用同样的 ID。新硬件应重新校准，不能仅复制原机校准文件就假定准确。

#### 5. 启动遥操作并验证

确认从臂可以安全运动后，在同一终端执行：

```bash
lerobot-teleoperate \
  --robot.type=so101_follower --robot.port="$F" --robot.id=a_follower \
  --teleop.type=so101_leader --teleop.port="$L" --teleop.id=a_leader
```

先进行小幅、缓慢的动作验证；出现抖动、方向异常、异响或断连时停止并排查，`Ctrl+C` 结束程序。原机看到进程运行，但没有现场确认机械跟随结果；上面的新机流程尚未实测。

若要保存下一次运行的输出，可在上述命令末尾加上 `2>&1 | tee ~/so101-teleoperate.log`；终端中 `Ctrl+C` 停止运行。日志可能包含设备信息，分享前先检查并脱敏。

### 背景与记录范围

- 目标：在 Jetson 上运行 SO-ARM101 主从机械臂，参考 [Seeed Studio 入门教程](https://wiki.seeedstudio.com/cn/lerobot_so100m_new/)。
- 本记录于 2026-11-02 晚通过 SSH 只读检查整理，来源包括远端 `/data/so101/env.sh`、`constraints.txt`、`A臂命令.txt`、`~/.bashrc`、校准文件路径、进程信息和 `/var/log/kern.log`。
- 未找到本次安装或遥操作的完整日志；运行进程的输出连到交互终端 `/dev/pts/0`，历史输出不可从这些文件还原。以下记录区分现场观察和推断，不能视为完整的历史操作或报错清单。

### 当前环境与已观察到的进展

| 项目 | 现场记录 |
| --- | --- |
| 主机 | `jzsd-desktop`，Ubuntu 22.04.5 LTS，`aarch64`，NVIDIA Orin |
| 工作目录 | `/data/so101` |
| 虚拟环境 | `/data/so101/.venv`，CPython 3.10.12，使用 uv 创建的环境 |
| 主要包 | LeRobot 0.4.4、PyTorch 2.10.0、torchvision 0.25.0 |
| GPU 检查 | 加载 `env.sh` 后，PyTorch 报告 CUDA 12.6，`torch.cuda.is_available()` 为 `True` |
| 校准文件 | 从臂 `calibration/robots/so_follower/a_follower.json`；主臂 `calibration/teleoperators/so_leader/a_leader.json`，均位于 `/data/so101/cache/hf/lerobot/` 下 |
| 运行状态 | 11 月 2 日约 19:30 启动的 `lerobot-teleoperate` 进程仍在运行，参数使用 `a_follower` 和 `a_leader`。进程存在不等于已验证跟随效果。 |
| 摄像头 | 用户于 2026-11-03 确认已连通；此前已检测并成功读取 `/dev/video0`。数据集采集尚未确认。 |

`/data/so101/python/` 另有 CPython 3.12.16 文件，但当前 `.venv` 的配置明确为 Python 3.10.12。当前 Seeed 教程列出 Python 3.12；版本不同并不自动说明当前环境有问题，后续安装依赖或复现时应以实际环境为准。

### 可追溯的配置和操作

1. `/data/so101/env.sh` 将 uv、pip、Hugging Face 和 Torch 缓存指向 `/data/so101/cache/`，并设置包索引及 Hugging Face 镜像；文件注释记载这样做是因为系统盘满。现场检查时根分区使用率约 94%，`/data` 可用约 206 GB。上述数值是检查时快照。
2. `constraints.txt` 固定 `torch==2.10.0` 和 `torchvision==0.25.0`。`env.sh` 配置了 Jetson CUDA 相关动态库路径并激活虚拟环境。
3. `~/.bashrc` 定义了 `so101` 函数：加载环境并设置主臂 `$L` 和从臂 `$F` 的稳定串口路径。文件注释日期为 2026-11-02。
4. 项目内 `A臂命令.txt` 保存了从臂校准、主臂校准、主从遥操作命令；校准文件已经存在，但文件存在不能证明每个关节的校准质量。
5. 正在运行的遥操作命令使用以下固定设备路径：

| 角色 | 设备路径 | 检查时映射 |
| --- | --- | --- |
| 主臂 `$L` | `/dev/serial/by-id/usb-1a86_USB_Single_Serial_5B79083596-if00` | `/dev/ttyACM0` |
| 从臂 `$F` | `/dev/serial/by-id/usb-1a86_USB_Single_Serial_5B79081406-if00` | `/dev/ttyACM1` |

### 已确认问题与处理线索

#### 直接运行虚拟环境 Python 时找不到 CUDA 动态库

- 现场复现：直接执行 `/data/so101/.venv/bin/python` 并导入 `torch`，出现 `ImportError: libcudss.so.0: cannot open shared object file`。
- 加载项目环境后再次检查，导入成功，CUDA 可用：

```bash
source /data/so101/env.sh
python -c 'import torch; print(torch.__version__, torch.version.cuda, torch.cuda.is_available())'
```

- `env.sh` 把虚拟环境内的 cuDSS、cuSPARSELt 库目录加入 `LD_LIBRARY_PATH`；新终端中先运行 `so101` 或 `source /data/so101/env.sh`。这次确认的是当前机器上加载环境可解决该导入错误，不能据此推断过去曾出现同样报错。

#### 串口编号可能变化

- `/var/log/kern.log` 记录了 11 月 2 日重新枚举时 `ttyACM0`、`ttyACM1` 对应的 USB 连接位置变化；现场映射只代表检查时状态。
- 使用 `/dev/serial/by-id/` 路径区分主从臂，避免固定依赖 `ttyACM0/1`；插拔后可用 `ls -l /dev/serial/by-id/` 核对。

#### 磁盘空间紧张

- 环境脚本注释明确写有“系统盘满”，因此将缓存迁到 `/data`；检查时根分区仍只剩约 1.7 GB。安装或下载前可运行 `df -h / /data` 检查。

### 摄像头接入与使用（2026-11-03 更新）

用户确认摄像头已连通。此前检测到一台 `USB HD Camera`，`/dev/video0` 和 `/dev/video1` 是同一设备的两个节点；OpenCV 已从 `/dev/video0` 读到 640 × 480 图像。用户提供的检测结果显示 `/dev/video0` 默认格式为 YUYV、640 × 480、30 FPS。用户确认相机连通，但未提供带遥操作显示窗口或数据集录制的具体结果，不能据此断定这些环节已验证。

在 Jetson 图形桌面终端检测相机并保存测试图片：

```bash
so101
cd /data/so101
lerobot-find-cameras opencv --output-dir /data/so101/outputs/captured_images
xdg-open /data/so101/outputs/captured_images
```

检查画面是否清晰、方向是否正确，夹爪、目标物体与操作区域是否入镜。摄像头编号可能因重启或插拔变化；以检测结果为准。本机桌面保存了 `SO101摄像头添加与使用指南.txt`。

如需结合遥操作持续预览，先在旧遥操作终端按 Ctrl+C 停止，再确认机械臂固定、周围至少 1 米清空，人员远离运动范围。以下命令会驱动从臂；预览不自动保存视频。带显示窗口的完整组合尚未确认验证：

```bash
so101
python /data/so101/.venv/bin/lerobot-teleoperate \
  --robot.type=so101_follower --robot.port="$F" --robot.id=a_follower \
  --robot.cameras='{ front: {type: opencv, index_or_path: 0, width: 640, height: 480, fps: 30} }' \
  --teleop.type=so101_leader --teleop.port="$L" --teleop.id=a_leader \
  --display_data=true
```

若实际相机编号变化，替换 `index_or_path`；按 Ctrl+C 停止。[Seeed 官方摄像头教程](https://wiki.seeedstudio.com/cn/lerobot_so100m_new/)涵盖多相机和数据采集配置。

### 常用命令与安全提示

新开交互终端后输入 `so101`。若使用非交互 shell，`.bashrc` 中的函数不一定可用，可先 `source /data/so101/env.sh`，再按上表设置 `$L` 和 `$F`。

```bash
# 检查当前设备映射
ls -l /dev/serial/by-id/

# 检查校准文件是否存在
ls /data/so101/cache/hf/lerobot/calibration/robots/so_follower/
ls /data/so101/cache/hf/lerobot/calibration/teleoperators/so_leader/
```

原命令文件中另保存了 `lerobot-calibrate` 和 `lerobot-teleoperate` 的完整命令。它们会涉及机械臂动作：运行前固定机械臂、清空工作空间并确保人员远离运动范围；异常时立即停止并断电。不要仅因已有校准文件或运行进程就假定机械臂状态安全。

### 待补充

- 安装过程中的实际错误、解决命令和最终验证结果：需补充原始终端记录或操作人回忆。
- 主从跟随的实际效果、各关节校准结果、带遥操作显示窗口的相机预览及数据采集结果尚未确认验证；用户已确认摄像头连通。
- 若需要以后排查，可在安全的下一次运行时将终端输出保存到 `/data/so101/` 下的日志文件，并注意日志可能包含敏感信息。
