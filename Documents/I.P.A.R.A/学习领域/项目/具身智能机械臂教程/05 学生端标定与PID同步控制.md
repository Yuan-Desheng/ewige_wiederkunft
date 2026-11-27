---
createTime: 2026-11-19 16:10
笔记ID: 20261119161005
multiFile:
multiMedia:
description: 学生端安装与标定、PID 仿真实验和双端遥操作排查
笔记类型: AI整理
阐述日期:
tags:
  - 具身智能
  - 机械臂
  - PID
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## 05 学生端标定与PID同步控制

```meta-bind-embed
[[笔记抬头模块]]
```

[[具身智能机械臂|项目入口]] · [[具身智能机械臂课程分集索引|分集索引]] · 上一篇 [[04 机械臂运动学正解与逆解]]

学生端是实际执行动作的机械臂。先确立每个关节的零位和旋转正方向，再观察同一目标角下的响应和跟踪误差。视频定位见 [P39 安装](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39)、[P40 配置与标定](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40)、[P41–42 抖动与 PID](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41)、[P43–44 同步与优化](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43)。

### 1. 建立学生端关节映射

1. 依据 `其他资料/3D结构归档.zip` 和对应硬件组装图确认舵盘朝向、连杆顺序、线束余量及可用行程。把每个电机 ID 对到一个机械关节，先记录标签。
2. 确认识别到的串口、供电和舵机型号。以课程 `机械臂运动学.zip` 中的脚本为例，`kinematics/04_read_all_student_angle.py` 默认学生端 `COM4`、`1000000 bps`、ID `1–6`。同压缩包的 `tele_operation/06_tele_operation.py` 的教师端示例波特率为 `230400 bps`。设备名、波特率和协议按实际版本核对。
3. 先只读。每次确认一个轴，登记设备返回的零位、角度增长方向、限位和丢读次数。将教师端对应关节旋到几何中位，检查学生端参考姿态。若零位偏、方向反或行程对不上，将映射写清楚再发送目标。
4. 检查试验区域、断电位置和限位。在空载、低速、小角度下验证单轴，再逐步联动。课程 `student/05_write_all_student_angle.py` 启动会使能扭矩，启动前确认机械状态和操作区。不要用广播写入试探设备身份。

### 2. 跑第一遍 PID 仿真

误差 $e(t)=\theta_\mathrm{目标}(t)-\theta_\mathrm{测量}(t)$。比例项随当前误差变化，积分项累加过去的误差，微分项反映误差变化速度。机械臂的固件控制回路和计算机给舵机发送目标的频率是两个时间尺度，排查时分别记录。

1. 从 `课程ppt` 打开 `PID模拟器.html`，保留同目录的 `chart.js`。载入图表后设置增益，点击“重置/开始模拟”。模拟器从 `100 m` 降到目标 `50 m`，步长 `0.1 s`。
2. 依据 `PID实验指导书.docx` 调三轮。先只调 $K_p$，再固定 $K_p=2.5$，逐步引入 $K_i$ 和 $K_d$。每轮重置，记录最低高度、20 秒附近高度、目标两侧的振荡以及是否触底。
3. 用 `PID实验报告.docx` 的指标比较。同样的三个增益在目标不同、采样周期不同或限幅不同的系统上会有不同效果。真机按舵机文档、负载和实测响应独立整定。

![[Extras/机器人/具身智能机械臂视频教程/05-PID仿真响应.png|900]]

*图 1。用课程 `PID模拟器.html` 中的 PID 和无人机模型类计算曲线。图例按 $K_p,K_i,K_d$ 排列，横轴以计算后的实际模拟时刻标注。*

| $(K_p,K_i,K_d)$ | 最低高度 | 约 20 s 时高度 | 观察 |
| --- | ---: | ---: | --- |
| (0.8, 0, 0) | 13.08 m | 37.69 m | 偏差大 |
| (2.5, 0, 0) | 13.61 m | 46.39 m | 比例项须提供抗重力输出，仍有偏差 |
| (8, 0, 0) | 10.07 m | 48.99 m | 初段反复穿过目标 |
| (2.5, 0.5, 0) | 5.71 m | 52.32 m | 引入积分，观察到更深的低谷 |
| (2.5, 1.5, 0) | 0.00 m | 6.75 m | 触底且振荡，末值无法代表稳态 |
| (2.5, 1.5, 4) | 43.66 m | 50.04 m | 本模型的振荡明显减弱 |

### 3. 同步遥操作先核对跟踪，再优化

| 观察到的现象 | 检查方法 |
| --- | --- |
| 两端方向相反或偏差近似常数 | 固定其他轴，测试同一关节在零位两侧的小角度，校对符号、零偏和 ID |
| 静止也弹跳或抖动 | 同时记录下发角与回读角，查看齿隙、松动、传感器噪声和增益 |
| 连续移动时总落后 | 对齐输入、命令、反馈时间戳，统计环路耗时和超时，降低下发负担并做对照 |
| 慢动作跟不动，突然跳一下 | 检查变化阈值、分辨率和速度限制。死区过大时小变化会积累成跳步 |
| 幅度变大后读写异常 | 核查供电、线束拖拽、硬限位及舵机负载 |

课程 `tele_operation/06_tele_operation.py` 用教师端角度变化阈值 `1°` 减少写入，并根据循环耗时在 `5–50 Hz` 范围调整；示例还统一裁剪到 `[-90°,90°]`。复现前按每个关节的机械限位和映射核对这些假设。做一段“静止—缓慢扫角—放回零位”的重复记录，对比丢帧、最大跟踪误差和终点偏差。若优化频率后静止抖动加重，分开检查串口调度和舵机内部控制。

本篇数值核对使用本地课程仿真模型。真实学生端标定和双臂同步需到设备上验收。课件对应 `具身智能-PID.pptx`、`具身智能-控制论.pptx` 和两个 PID 实验文档。另见项目已有的 [[SO-ARM101 LeRobot 部署与调试记录|SO-ARM101 独立实践]]。

### 逐集要点与实操

实操对照 `机械臂运动学.zip` 的 `student/`、`tele_operation/`，以及 `课程ppt/PID实验指导书.docx`。真机部分须根据设备版本执行。回看点来自 B 站进度条预览中可辨识的课件、调参界面和实物画面。

标有「字幕」的是 B 站播放器中文字幕的抽查点。画面定位与配套资料共同用于核对各集练习。

课堂截图取自对应分集的 B 站播放器进度条预览。每张图下方标出了观察位置，点击图注中的时间即可回看。

#### P39 学生端机械臂的安装

**本集重点** 学生端是承载和执行动作的从臂。舵盘位置、装配次序、线束余量和连杆行程会影响可用姿态。

**实操与验收** 离电核对结构件与装配方向，给每个关节编号，检查零位外观、行程干涉与线缆松紧，再登记装配结果。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P039-13m55s.jpg|480]]

**图中看点** 左边虚拟装配姿态与右边的实物安装窗口。对照曲臂方向检查舵盘与连杆安装顺序。 [截图 13:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39&t=835)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39) · [05:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39&t=315) 仿真装配参考姿态 · [13:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39&t=835) 实物构件安装画面 · [23:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39&t=1420) 学生端实物画面 · [字幕 13:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=39&t=837) 用 link 对照实物结构

#### P40 学生端机械臂的配置与标定

**本集重点** 把学生端的端口、ID、零位、方向和角度区间与实际关节对应。

**实操与验收** 依据 `kinematics/04_read_all_student_angle.py` 先读数。逐轴记录零位和两侧小角度，确认回读方向及通过的限位。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P040-09m45s.jpg|480]]

**图中看点** 中间上位机的参数表。选定一轴后查看位置、方向和限位相关字段，与零位回读对照。 [截图 09:45](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40&t=585)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40) · [01:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40&t=80) 虚拟直立基准姿态 · [09:45](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40&t=585) 上位机舵机参数表 · [字幕 09:47](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=40&t=587)

#### P41 为什么机械臂会出现帕金森

**本集重点** 抖动是现象。区分命令本身跳变、闭环过度纠偏、采样噪声以及机械间隙。

**实操与验收** 用 PID 模拟器逐次改变一个增益，记录振荡频率和幅度。上机排查时同时看目标角与回读角，再检查齿隙和紧固。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P041-03m35s.jpg|480]]

**图中看点** 左侧学生端角度控制图与右侧实物窗口。对照命令角和实际动作，先判断抖动发生在哪一轴。 [截图 03:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41&t=215)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41) · [03:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41&t=215) 学生端角度控制图和实物窗口 · [09:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41&t=570) 无人机高度控制比喻 · [16:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41&t=970) 微分项说明 · [字幕 09:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=41&t=572) 计算位置误差

#### P42 机械臂PID的配置

**本集重点** 比例根据当前误差动作，积分处理持续偏差，微分影响响应与对噪声的敏感度。

**实操与验收** 按指导书在仿真逐一比较 P、PI、PID。记录过冲、响应和稳态偏差。再对照舵机说明确认实际参数的寄存器、量纲与限制。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P042-06m15s.jpg|480]]

**图中看点** 左侧参数表与右侧实物。一次调整一个增益后观察同一关节，课程画面中的数值只用于识别字段。 [截图 06:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=375)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42) · [00:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=50) PID 实验指导书 · [06:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=375) 上位机参数与实物窗口 · [07:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=457) 字幕提到上部关节动作 · [10:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=640) 学生端角度控制图 · [字幕 06:17](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=42&t=377) 观察调参后的抖动

#### P43 机械臂同步遥操作的实现

**本集重点** 读教师端关节角，经过零位、方向与范围映射，再给学生端下发对应关节目标。

**实操与验收** 看 `tele_operation/06_tele_operation.py` 的教师读数与学生下发入口，先用六轴静态输入验证映射，再用单轴空载小动作确认反馈。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P043-20m15s.jpg|480]]

**图中看点** 左边实时同步的终端输出，右边的实物工作台。模拟映射先检查角度组，再逐轴核对主从联动。 [截图 20:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43&t=1215)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43) · [11:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43&t=715) 同步代码编辑器 · [15:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43&t=955) 终端运行 · [20:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43&t=1215) 终端与两臂演示窗口 · [字幕 15:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=43&t=957) 排查学生端未动作

#### P44 机械臂同步优化的策略

**本集重点** 变化阈值可以减少写入，自适应频率需受串口往返时间约束。还要观察小动作被吞和延迟。

**实操与验收** 以静止、慢速扫角、回零轨迹对比不同阈值及频率，统计每轮用时、丢读次数、跟踪误差和是否产生跳步。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P044-08m40s.jpg|480]]

**图中看点** 编辑器中的同步代码与右侧实物窗口。改变化阈值或发送节拍后，重复同一路径观察跟踪和抖动。 [截图 08:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=520)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44) · [01:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=115) 无人机 PID 可视化模拟器 · [06:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=410) 同步代码与优化说明 · [07:54](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=474) 字幕提到操作者的动作难以预测 · [08:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=520) 实物演示窗口 · [字幕 06:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=44&t=412) 提到可用卡尔曼滤波预测

下一篇 [[06 OpenCV视觉与手眼坐标]]
