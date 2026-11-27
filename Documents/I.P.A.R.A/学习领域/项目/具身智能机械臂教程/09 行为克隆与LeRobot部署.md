---
createTime: 2026-11-19 14:00
笔记ID: 20261119140009
multiFile:
multiMedia:
description: 用配套 GenkiBot 分支理解和复现主从臂示教、双相机数据、ACT 训练与实机评估。
笔记类型: AI整理
阐述日期:
tags:
  - 具身智能
  - LeRobot
  - 行为克隆
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## 09 行为克隆与LeRobot部署

```meta-bind-embed
[[笔记抬头模块]]
```

从 [[具身智能机械臂]] 进入。先查看配套数据，理解一次示教包含哪些观测与动作，再按课程分支复现采集、回看、训练与评估。另见本库的 [[SO-ARM101 LeRobot 部署与调试记录]] 和 [[SO101双色双盘采集项目]]，用于对照 SO-ARM101 的独立现场实践。

![[Extras/机器人/具身智能机械臂视频教程/09-示教与策略部署链路.png]]

*图 1。把主臂操作与从臂的状态和相机画面同步记录，训练后让 ACT 策略根据新的观测输出动作。按课程数据字段和训练配置绘制。*

### 一、示教数据教会策略什么

行为克隆把每帧观测与专家动作配成训练样本。在这套例子中，观测包含两路 RGB 图像及六项关节状态，目标是同一时刻的六项动作。ACT（Action Chunking with Transformers）根据一次观测预测未来一段连续动作。运行时按配置执行动作片段，并用后续观测继续推理。示教未覆盖的物体位置和抓取偏差容易让策略偏离训练分布，采集时应覆盖实际会出现的初始位置与场景。 [LeRobot ACT 文档](https://huggingface.co/docs/lerobot/act)

强化学习通过奖励衡量动作带来的长期回报。课程幻灯片用冰冻湖示意「观察状态、选动作、获得奖励、进入新状态」的循环。本文的真机训练流程使用示教监督学习，课程 ACT 配置的 `online_steps` 为 0。对照 `课程ppt/具身智能-强化学习.pptx` 与 `课程ppt/具身智能-模仿学习.pptx`。视频 [P104 强化学习效果](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104) · [P105 端到端网络](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=105)。

### 二、区分课程分支和 SO-ARM101 环境

| 核对项 | 黑马课程配套包 | 本库 SO-ARM101 实践 |
| --- | --- | --- |
| 仓库 | `代码/大模型mcp和行为克隆.zip` 内 `code/robotarm/genkiarm/`，包元数据 `lerobot 0.1.0` | [[SO-ARM101 LeRobot 部署与调试记录]] 包含 Jetson 上观察到的 `0.4.4` 配置 |
| 操作接口 | `lerobot/scripts/control_robot.py` + `so100.yaml` + Hydra 训练配置 | `lerobot-calibrate`、`lerobot-teleoperate` 等命令 |
| 主从驱动 | 课程主臂 `GBotMotorsBus` / `genki_M1`，从臂 Feetech / `sts3215` | 通过设备类型 `so101_leader` 与 `so101_follower` 选择对应驱动 |
| 数据口径 | 打包示例数据元数据写为 `v1.6`，按角色名称和关节顺序读取 | 明确软件版本、数据集版本、硬件校准口径后再决定如何迁移 |

更换软件分支时，重新核对命令参数、关节顺序、原点和单位。旧校准和新校准的表示不同，旧轨迹需要转换验证后才上机。 [LeRobot SO-101 指南](https://huggingface.co/docs/lerobot/so101) · [校准与数据兼容说明](https://huggingface.co/docs/lerobot/backwardcomp)。

课程分支从解压后的 `code/robotarm/genkiarm/` 根目录执行，根目录应同时包含 `pyproject.toml`、`lerobot/` 和 `data/`。先完成下节的纯数据检查。需要运行分支脚本时，另建 Python 3.10 环境，并安装与系统、显卡分别兼容的 PyTorch 和 FFmpeg。课程 `requirements.txt` 列有仿真和 GUI 依赖，按实验范围选择。

```bash
conda create -n arm-course-legacy python=3.10
conda activate arm-course-legacy
python -m pip install -e ".[feetech]" pyserial
python -m pip show lerobot
python lerobot/scripts/control_robot.py --help
ffmpeg -version
```

Linux 下串口常见 `/dev/ttyUSB*`、`/dev/ttyACM*`，可用 `/dev/serial/by-id/` 识别稳定的设备路径并核对权限。Windows 使用设备管理器中的 COM 端口。课程 YAML 的 `com15` 与 `com12` 是课件环境示例，本机逐个插拔确认后分别更新。对照课程包中的 `README.md` 与 `操作文档.md`。视频 [P106 环境搭建](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=106)。

### 三、无机械臂检查原始示教包

归档自带 `data/pick/so100_test/`，里面包含 5 个 episode、两路相机的 10 段视频，以及数据特征说明。左右分别是原始样本中同一 episode 的 `laptop` 与 `phone` 两路画面。两个源视频均为 640×480、30 FPS、AV1，episode 0 的每路有 177 帧。

![[Extras/机器人/具身智能机械臂视频教程/09-课程示教双路画面.jpg]]

*图 2。来自配套包的 `observation.images.laptop_episode_000000.mp4` 和 `observation.images.phone_episode_000000.mp4`，提取两路各约 3 秒处的一帧。左图贴近物块，右图显示从臂与放置区域。*

把以下代码保存为 `inspect_course_dataset.py`，传入本地 ZIP 的实际路径。脚本读取归档文件名和 JSON 元数据，核对每个相机的 episode 集合。

```python
import json
import re
import sys
from zipfile import ZipFile


prefix = "code/robotarm/genkiarm/data/pick/so100_test/"


def inspect(archive_path: str) -> None:
    with ZipFile(archive_path) as archive:
        info = json.loads(archive.read(prefix + "meta_data/info.json"))
        recorded = json.loads(archive.read(prefix + "episodes/data_recording_info.json"))
        schema = json.loads(archive.read(prefix + "train/dataset_info.json"))["features"]

        episode_count = recorded["last_episode_index"] + 1
        expected = set(range(episode_count))
        for camera in ("laptop", "phone"):
            base = prefix + f"videos/observation.images.{camera}_episode_"
            pattern = re.compile(re.escape(base) + r"(\d+)\.mp4")
            found = {
                int(match[1])
                for item in archive.namelist()
                if (match := pattern.fullmatch(item))
            }
            if found != expected:
                raise ValueError(f"{camera} 视频编号不齐，预期 {sorted(expected)}，找到 {sorted(found)}")
            print(f"{camera}: {len(found)} 段视频")

        print(f"格式={info['codebase_version']} FPS={info['fps']} episode={episode_count}")
        print(f"关节状态维数={schema['observation.state']['length']} 动作维数={schema['action']['length']}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("用法：python inspect_course_dataset.py <课程 ZIP 路径>")
    inspect(sys.argv[1])
```

```bash
python inspect_course_dataset.py "/本地资料目录/代码/大模型mcp和行为克隆.zip"
```

实测输出如下。接下来可在离线播放器中打开解压后的两段 MP4，对着同一时刻检查遮挡、运动模糊和目标是否一直在画面里。

```text
laptop: 5 段视频
phone: 5 段视频
格式=v1.6 FPS=30 episode=5
关节状态维数=6 动作维数=6
```

### 四、实机准备、采集和回看

1. **对照配置。** 本地新建 `so100-local.yaml`，以课程 `lerobot/configs/robot/so100.yaml` 为参考，填入自己的设备路径、舵机型号/ID。按设备手册确认标定方向、零点和有效范围。课程分支的标定缓存位于 `.cache/calibration/so100/`，样例缓存对应课程设备。首次接通电机时用适合本机的限位，清空运动范围并准备停止。
2. **确认两路相机。** 课程 `lerobot/scripts/list_camera.py` 扫描 OpenCV 索引并将成功的画面写到 `camera_id_images/`。核对各视角用途后，把对应索引填入 YAML。原课件的两路配置名是 `laptop` 和 `phone`，两路均为 640×480、30 FPS。保留与 ACT 输入一致的名称、分辨率与帧率。
3. **练习遥操作，再录制。** 校准完成后先运行无相机遥操作，逐关节小幅移动检查方向。之后录少量同一任务的 episode，例如从桌面抓起方块并放进盒子。如果动作卡住或碰到遮挡，补录覆盖这些初始条件的成功示范。请先读清终端提示，课程分支连接时发现校准文件缺失会进入标定。

以下命令针对配套分支。把前一段创建的 `so100-local.yaml` 放到 `lerobot/configs/robot/`。数据使用新 ID `pick/so100_pilot`，避免覆盖归档示例。`--push-to-hub 0` 让采集只写本机。

```bash
python lerobot/scripts/control_robot.py teleoperate --robot-path lerobot/configs/robot/so100-local.yaml --robot-overrides "~cameras" --display-cameras 0
python lerobot/scripts/control_robot.py record --robot-path lerobot/configs/robot/so100-local.yaml --fps 30 --root data --repo-id pick/so100_pilot --episode-time-s 20 --reset-time-s 8 --num-episodes 3 --push-to-hub 0
python lerobot/scripts/visualize_dataset.py --repo-id pick/so100_pilot --root data --local-files-only 1 --episode-index 0
```

**回看**先核对两路画面是否对齐、是否完整记录移动与夹爪开合，再检查每个 episode 的起止是否正确。课程 `replay` 会向实体从臂发送已录制动作，只有在同一装置的校准、动作格式和工作区确认后才执行。使用下列命令回放刚录制的第一个 episode。

```bash
python lerobot/scripts/control_robot.py replay --robot-path lerobot/configs/robot/so100-local.yaml --fps 30 --root data --repo-id pick/so100_pilot --episode 0 --robot-overrides "~cameras"
```

对照 [P107 标定](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=107)、[P108 相机](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=108)、[P109 数据采集展示](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109)、[P110 训练效果](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110)、[P111 录制和查看](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111)、[P112 动作回放](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112)、[P113 采集注意事项](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=113)。

P110 开头可对看 `observation.images.laptop` 和 `observation.images.phone` 两个观察窗口，以及终端的采集与从臂计时。回看自己的评估记录时，分别检查两个画面与时间序列。 [P110 约 00:20 双路观察窗口](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110&t=20)

### 五、本地或云端训练与部署

课程的 `act_so100_real.yaml` 定义两路相机输入和连续动作预测，默认 80,000 个离线训练步。先用示例数据确认加载、显存和检查点保存，从 20 步的流程测试起步，再为自己的示教做完整训练。

Linux/Bash 使用 `export DATA_DIR="$PWD/data"`。Windows PowerShell 用 `$env:DATA_DIR = (Resolve-Path .\data).Path`，CMD 用 `set "DATA_DIR=%CD%\data"`。先用下面的第一条命令确认所选 PyTorch 能访问 CUDA，第二条命令仅在具备 CUDA 和对应依赖的环境运行。

```bash
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
python lerobot/scripts/train.py dataset_repo_id=pick/so100_test policy=act_so100_real env=so100_real hydra.run.dir=outputs/train/act_smoke hydra.job.name=act_smoke device=cuda wandb.enable=false training.offline_steps=20
```

流程跑通时应能看到数据集加载、训练日志以及 `outputs/train/act_smoke/checkpoints/last/pretrained_model`。正式训练用 `pick/so100_pilot` 或正式数据的 ID，更换输出目录并根据样本量设置训练步数。另留一组未用于训练的起始位置，记录抓取、移动和释放分别成功多少次。低损失与任务成功率分别记录。

云端沿用同一版本的代码和依赖，把完整数据目录传到云端训练机，并确认 `DATA_DIR` 指向父目录。训练完成后取回完整 `pretrained_model` 目录和训练配置。实机评估时，课程用 `control_robot.py record -p` 加载策略，评估 ID 以 `eval_` 起头。保留相机映射与本机标定，固定臂座、清空工作区并准备人工停止。下面按完整训练目录 `act_so100_pilot` 举例，使用你准备评估的检查点路径。

```bash
python lerobot/scripts/control_robot.py record --robot-path lerobot/configs/robot/so100-local.yaml --fps 30 --root data --repo-id pick/eval_so100_pilot --warmup-time-s 5 --episode-time-s 15 --reset-time-s 8 --num-episodes 2 --push-to-hub 0 -p outputs/train/act_so100_pilot/checkpoints/last/pretrained_model
```

对照 [P114 本机训练](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=114) · [P115 云端训练](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115)。

| 现象 | 优先核对 |
| --- | --- |
| 只出现一路画面 | OpenCV 索引、USB 带宽、各相机独立运行时的分辨率和帧率，以及 `laptop` / `phone` 的映射 |
| 数据集路径找不到 | `DATA_DIR` 的绝对路径、其下是否有 `pick/so100_test/` 完整目录、课程分支的 `v1.6` 数据格式 |
| CUDA 不可用或训练中途超显存 | 驱动与 PyTorch 版本是否匹配，先降低 `training.batch_size` 检查小批次训练 |
| 回放方向或位移异常 | 立即停止并核对标定、关节顺序、动作单位和软件分支 |
| 演示位置有效，换起点后失败 | 对比两路相机的视场、目标位置覆盖、夹爪抓取时机，并补录新位置的有效动作 |

**本次验证**运行了前面的无硬件检查脚本，并用 FFprobe 核对示例 episode 0 的视频格式、帧率和帧数。串口、实机回放、GPU 训练及部署待设备环境实测。

### 逐集要点与实操

本表按 B 站分集编排。动手步骤根据课件、源码和作者资料整理。「进度条预览」来自 B 站播放器的带时间画面，点击可定位。

标有「字幕」的是 B 站播放器中文字幕的抽查点。画面定位与配套资料共同用于核对各集练习。

课堂截图取自对应分集的 B 站播放器进度条预览。每张图下方标出了观察位置，点击图注中的时间即可回看。

#### P104 强化学习最终效果展示

**本集重点** 强化学习用交互产生的奖励更新策略。

**实操与验收** 先看本集展示的 Mobile ALOHA 论文图和开柜门画面。再以课件和 Day 09 冰冻湖示例标出状态、动作、奖励和新状态。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P104-15m00s.jpg|480]]

**图中看点** 左侧 Mobile ALOHA 画面中的夹爪、柜门和把手。观察接近、抓住、拉开三个动作阶段。 [截图 15:00](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104&t=900)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104) · [进度条预览 10:00 Mobile ALOHA 论文图](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104&t=600) · [进度条预览 15:00 机械臂开柜门演示](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104&t=900) · [字幕 15:02](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=104&t=902)

#### P105 端到端神经网络概念介绍

**本集重点** 端到端行为克隆直接学习观测到动作的映射。

**实操与验收** 查看配套 `dataset_info.json` 与 `act_so100_real.yaml`，用一例标出两路图像、6 维状态和 6 维动作。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P105-05m50s.jpg|480]]

**图中看点** 论文图中的道路画面和上方模型输出示例。用这个画面对照端到端的观测输入，再换成机械臂动作标签。 [截图 05:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=105&t=350)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=105) · [进度条预览 05:50 端到端驾驶论文中的道路画面](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=105&t=350) · [字幕 05:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=105&t=352) 端到端驾驶的道路画面

#### P106 lerobot项目和环境搭建

**本集重点** 课程采用 GenkiBot 的 LeRobot 派生分支，需要按分支建立环境。

**实操与验收** 在 `genkiarm/` 建独立 Python 3.10 环境，检查包版本及 `control_robot.py --help`，确认这里使用旧版子命令。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P106-10m00s.jpg|480]]

**图中看点** 左边 GenkiArm 安装说明和右边终端。创建环境前核对解释器、当前目录与课程分支。 [截图 10:00](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=106&t=600)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=106) · [进度条预览 10:00 GenkiArm 安装说明与终端](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=106&t=600) · [字幕 10:02](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=106&t=602) 排查终端找不到 Conda

#### P107 教师端和学生端的标定

**本集重点** 主从臂的零位、方向和行程是同步与训练的基础。

**实操与验收** 核对 `so100-local.yaml` 的主从端口、驱动及关节 ID。按各设备手册标定，逐关节小幅测试方向一致。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P107-01m55s.jpg|480]]

**图中看点** 左边标定工具的主从臂设置和下方按钮，右边的实物窗口。逐轴核对零位、方向与 ID 后再试动作。 [截图 01:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=107&t=115)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=107) · [进度条预览 01:55 GenkiArm 标定工具与相机](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=107&t=115) · [字幕 01:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=107&t=117)

#### P108 准备行为克隆的摄像头

**本集重点** 相机索引、观察名称与训练输入配置需要一致。

**实操与验收** 运行 `list_camera.py` 查到两路实际索引，对照 `laptop`、`phone` 分别确认视野、640×480 与帧率。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P108-01m55s.jpg|480]]

**图中看点** 中间相机预览里的物块和盒子。记录能同时看到两者的机位、索引和有效视野。 [截图 01:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=108&t=115)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=108) · [进度条预览 01:55 示例相机的桌面视野](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=108&t=115) · [字幕 01:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=108&t=117) 示例相机索引 2 与 3

#### P109 数据采集展示

**本集重点** 一次示教同步采集动作、关节状态和两路视频。

**实操与验收** 用本章数据检查脚本读示例包。核对每个 episode 在两路相机中都有对应文件。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P109-00m35s.jpg|480]]

**图中看点** 两路预览中同一个方块和工作台，下面是采集输出。检查两路画面是否对应同一次示教。 [截图 00:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109&t=35)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109) · [进度条预览 00:35 两路采集窗口](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109&t=35) · [进度条预览 01:55 盒内可见物块](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109&t=115) · [字幕 04:59](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=109&t=299) 示教中夹取并放入物块

#### P110 最终训练好效果展示

**本集重点** 训练后的评估可对看两路视频和终端计时。

**实操与验收** 打开约 00:20 观察两个相机窗口。用自己的评估记录核对一回合的目标移动、夹爪开合和两路画面。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P110-00m55s.jpg|480]]

**图中看点** 左侧夹爪接近物块的画面、右侧近距离视角。结合两路画面检查接近和对齐是否一致。 [截图 00:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110&t=55)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110) · [约 00:20 双路窗口](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110&t=20) · [进度条预览 00:55 夹爪接近目标区的画面](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110&t=55) · [字幕 00:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=110&t=57) 播放中提到识别积木

#### P111 数据集的录制和查看

**本集重点** 先录一组本地数据，再在数据查看器中按 episode 检查。

**实操与验收** 运行本章 `record`，写入新 ID `pick/so100_pilot`。用 `visualize_dataset.py --episode-index 0` 看首个回合的起止与画面同步。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P111-01m55s.jpg|480]]

**图中看点** 页面中段的数据录制命令和下方逐项说明。核对帧率、单次录制时长、重置时间和回合数。 [截图 01:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111&t=115)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111) · [进度条预览 01:55 录制参数](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111&t=115) · [进度条预览 05:50 双路观察画面](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111&t=350) · [字幕 01:58](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=111&t=118) 设置单次录制的 episode time

#### P112 录制动作的回放

**本集重点** 回放把已录制的动作重新送给实体从臂。

**实操与验收** 先用查看器核对第 0 集，再确认同一设备、标定与工作区，使用本章的 `replay` 命令。若方向异常立即停机。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P112-01m35s.jpg|480]]

**图中看点** 右侧盒内的物块和左侧回放日志。比较轨迹输出与动作起止，确认正在回放指定的 episode。 [截图 01:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112&t=95)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112) · [进度条预览 01:00 回放旁的桌面物块](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112&t=60) · [进度条预览 01:35 回放旁的盒内物块](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112&t=95) · [字幕 01:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=112&t=97) 由已录制的动作驱动回放

#### P113 数据采集注意事项

**本集重点** 样本要覆盖真实任务的物体位置、动作阶段及可见性。

**实操与验收** 把样本按物体初始位置抽查。记录遮挡、夹空与动作截断的出现频率，补采缺少条件下的完整演示。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P113-00m50s.jpg|480]]

**图中看点** 并排的远景和近景相机窗口。重点检查盒子、夹爪与物块可能被哪一路遮挡。 [截图 00:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=113&t=50)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=113) · [进度条预览 00:50 采集时的双路视野](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=113&t=50) · [字幕 00:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=113&t=52) 保持画面清爽

#### P114 本地电脑训练流程

**本集重点** 课程本地训练使用 Hydra 配置和 ACT。

**实操与验收** 确认 `DATA_DIR`、GPU 可用及数据集 ID，用本章 20 步命令检查训练能否产出 `last/pretrained_model`。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P114-05m50s.jpg|480]]

**图中看点** 本机终端中的连续训练行。先记录设备和数据集加载情况，再确认迭代号是否持续更新。 [截图 05:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=114&t=350)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=114) · [进度条预览 05:50 本机训练终端](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=114&t=350) · [字幕 05:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=114&t=352)

#### P115 云服务器训练的流程

**本集重点** 云端训练复用相同的分支、数据格式和策略配置。

**实操与验收** 拷贝完整数据集到已获授权的训练环境，验证路径后训练，取回完整模型目录和训练配置。先用保留初始位置评估。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P115-19m40s.jpg|480]]

**图中看点** 文档中部的训练命令与下方参数说明。逐项核对数据根目录、策略配置、训练步数和输出位置。 [截图 19:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115&t=1180)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115) · [进度条预览 19:40 训练参数](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115&t=1180) · [进度条预览 24:00 云端终端输出](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115&t=1440) · [字幕 24:02](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=115&t=1442) 云端终端提到 nohup

冰冻湖与 Q 表练习可参照作者 GitHub 的 Day 09。GenkiBot 命令和样例数据对照本地《操作文档》和配套仓库。 [黑马课程源码 Day 09](https://github.com/itheima1/embodied_robot/tree/main/code/day09/code)
