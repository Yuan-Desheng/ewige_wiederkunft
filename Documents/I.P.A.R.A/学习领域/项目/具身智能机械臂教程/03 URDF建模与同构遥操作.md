---
createTime: 2026-11-19 14:00
笔记ID: 20261119140003
multiFile:
multiMedia:
description: 组装六关节 URDF，验证教师端角度读数、WebSocket 与前端同构映射。
笔记类型: AI整理
阐述日期:
tags:
  - 具身智能
  - 机械臂
  - URDF
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## 03 URDF建模与同构遥操作

```meta-bind-embed
[[笔记抬头模块]]
```

[[具身智能机械臂|返回课程项目]] · 课程 P16–P30。先在浏览器里跑通数字机械臂，再核对教师端的六轴位置读数和传输格式。

### P16–P20 从基座开始搭建 URDF

URDF 用 `link` 表示刚体，用 `joint` 表示刚体间的连接。关节的 `parent` 和 `child` 确定树的方向，`origin` 把关节零位坐标系放到父连杆中，`axis` 在关节坐标系里定义运动方向，`limit` 定义范围。平移用米，旋转与关节角用弧度。仿真关注接触和动力学时，还需要合理的 `collision` 与 `inertial` 数据。

![[Extras/机器人/具身智能机械臂视频教程/03-urdf-关节树.png|860]]

*图 1。按 `其他资料/urdf实战.docx` 和 `代码/code-websockt通讯完成版本.zip` 内的 `code/public/URDF/genkiarm.urdf` 绘制。*

1. 将 `代码/urdf_learn.7z` 解压到独立工作目录，进入两层 `playground/playground` 中含 `package.json` 的内层。课程步骤以 Node.js 22 为例。
2. 在该目录安装锁定的依赖，然后启动 Vite。打开终端打印的 URL，通常是 `http://localhost:5173/`。若端口占用，使用终端显示的新端口。

   ```bash
   node -v
   npm -v
   npm ci
   npm run dev -- --host 127.0.0.1
   ```

3. 备份 `public/URDF/genkiarm.urdf`，保持原来的 `meshes` 路径。参照 `其他资料/urdf实战.docx` 先保留 `Base`，刷新确认基座可见。然后添加 `yao` 和 `Rotation`，示例的安装位置是 `(-0.013, 0, 0.0265)` m，安装姿态为 `(0, -1.57, 0)` rad。这里的旋转轴是安装后的关节局部 X 轴。
4. 按关节树逐级增加肩、肘、腕和夹爪，修改一次就保存并刷新一次。试着只调一个角度，确认其后代跟随，父连杆保持原位。若几何形状消失，先查浏览器 Network 中的 STL 404。若绕轴错误，查 `origin` 和 `axis`，以及角度单位。检查零位模型有无穿模，并核对每个关节的上下限。

### P21–P27 教师端结构、SDK 与读数

同构遥操作把教师端第 $i$ 个关节的角度对应到运动结构相同的臂或模型。教师端编码器采集人手摆出的角度。学生端或浏览器模型复现经过校准的关节角。先用 `其他资料/3D结构归档.zip` 的 STL 查看部件，再对照实物确认哪个位置对应哪个 ID。核对每轴的机械零位、正方向和有效行程。

1. 根据舵机型号确认接口、电源和协议，再验证一个已知 ID 的只读位置返回。课程包里同时有教学 HostProtocol 与 Feetech SDK 示例，前者的读取脚本默认 230400 bps，Feetech 目录里的 `ping.py` 是另一协议路径。端口、波特率和协议均应以实物配置为准。
2. 用 `代码/code-websockt通讯完成版本.zip` 里的 `02_read_all_teacher_angles.py` 单独验证教师端。脚本例子使用 Windows `COM6` 和 ID 1–6，按实际串口替换，Linux 上常见 `/dev/ttyUSB0` 或 `/dev/ttyACM0`。需要 `pyserial`。图形版本 `03_gui_read_angles.py` 对应同目录的 `requirements.txt`。
3. 依次缓慢摆动每个教师关节。记录 ID、零位读数、正向和可用范围。示例以 2048 为零位、4096 为每圈计数，将输出转换成度，实机应按实际标定核对。单轴正常后再验证六轴，确认每次摆动只显著改变对应通道。全无返回时依次查串口、供电和协议。个别轴异常时查 ID 冲突、接线与有效行程。
4. P25–P26 做一个可验证的小改动，先用固定六轴输入画出预期，再改一处脚本或界面。用单轴输入对照 UI 的实际转轴、单位和范围，把测试结果保留下来。

### P28–P30 从六个数字更新浏览器模型

![[Extras/机器人/具身智能机械臂视频教程/03-遥操作数据流.png|860]]

*图 2。按 `code-websockt通讯完成版本.zip` 中的采集脚本、示例服务与前端 `index.js` 绘制。*

1. 解压 `代码/code-websockt通讯完成版本.zip`，进入含 `package.json` 的 `code/`，重复上面的 Vite 启动步骤。浏览器模型只需要本机网络与模型文件，练习时保持「连接实物」关闭。
2. 用另一个终端，在同目录启动配套测试服务。Python 依赖可以放在隔离环境中。

   ```bash
   python3 -m venv .venv-ws
   .venv-ws/bin/python -m pip install websockets
   .venv-ws/bin/python websocket_server_example.py
   ```

   Windows PowerShell 可将 `.venv-ws/bin/python` 换为 `.\.venv-ws\Scripts\python.exe`。浏览器页面默认连接 `ws://localhost:8080`。刷新后观察连接状态和六轴运动。课程 P29 分集标题提到随机角，所提供的 `websocket_server_example.py` 实际运行的是每约 100 ms 一帧的正弦样例。
3. 通过浏览器开发者工具的 Network → WS 查看实际消息。前端按数组位置将弧度映射到 `Rotation`、`Rotation2` … `Rotation6` 并按 URDF 限位裁剪。README 中的 `joint1` 和度数自动识别与 `index.js` 实现有出入。为了逐轴验收，可在示例服务的工作副本中把 `send_test_angles()` 里的赋值改成 `angles = [0.35, 0, 0, 0, 0, 0]`，预期收到下列消息的 `angles` 字段。再分别让每个位置成为唯一的非零项。第六轴用正值，以符合模型 `Rotation6` 的非负范围。

   ```json
   {"angles":[0.35,0,0,0,0,0]}
   ```

4. 后续接入教师端时，将采集脚本的度数先按各轴的零位和符号转换为弧度，再通过发送端给浏览器提供完整六项数组。采集脚本会为读取失败返回 `None`。桥接时应保留失败状态并跳过缺项帧，以免把解析默认值 0 当成实测。原包可独立验证读数与正弦测试，接入时需要把读数送入发送逻辑。
5. 验收同构映射时让教师端每次只动一轴，核对浏览器相应关节的方向、幅度和限位。所有关节静止时，检查 Vite 地址、WS 握手和控制台报错。关节跳到限位时，先查度和弧度、索引与零位。只有特定动作反向时，查该轴符号或 URDF 轴方向。

复核记录。本地临时副本的两个 Vite 项目均构建成功。浏览器联测载入了六个关节，连接 WebSocket 后收到正弦样例，关节角随消息更新。教师端串口和真机动作待实物验证。

### 逐集要点与实操

回看点依据 B 站进度条预览中可辨识的实物、代码或界面画面。实操根据 URDF 文档、SDK 与 WebSocket 源码整理。 [官方物料清单](https://github.com/itheima1/embodied_robot/blob/main/%E7%89%A9%E6%96%99%E6%B8%85%E5%8D%95.md) · [课程方讲义](https://github.com/itheima1/embodied_robot/blob/main/note.md)

标有「字幕」的是 B 站播放器中文字幕的抽查点。画面定位与配套资料共同用于核对各集练习。

课堂截图取自对应分集的 B 站播放器进度条预览。每张图下方标出了观察位置，点击图注中的时间即可回看。

#### P16 URDF 入门

**本集重点** URDF 用 link 描述刚体、joint 描述父子关系与运动约束。

**实操与验收** 对照 `具身智能实战02.pptx` 第 40–61 页，在样例 `genkiarm.urdf` 找出 7 个 link 和 6 个 joint，画出从 Base 到夹爪的链。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P016-00m55s.jpg|480]]

**图中看点** URDF 图下方的三个分支。建模时逐一定位外观、物理属性与关节定义。 [截图 00:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=16&t=55)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=16) · [00:55 URDF 外观、物理属性与关节](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=16&t=55) · [05:30 建模文件获取方式](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=16&t=330) · [字幕 05:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=16&t=332) 生成 STL 模型的思路

#### P17 URDF 环境搭建

**本集重点** 路径、依赖与 Vite 服务需要分别确认。

**实操与验收** 在 `urdf_learn.7z` 内的 `playground/playground` 跑 `npm ci` 和 `npm run dev -- --host 127.0.0.1`，在 Network 检查 URDF 和 STL 的响应。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P017-01m00s.jpg|480]]

**图中看点** 右侧已载入的数字臂及左侧的关节控制区。启动课程项目后，看到模型且滑块能改变姿态，才算环境搭建通过。 [截图 01:00](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17&t=60)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17) · [01:00 浏览器机械臂预览](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17&t=60) · [09:55 Node.js 环境说明](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17&t=595) · [13:45 终端验证](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17&t=825) · [字幕 09:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=17&t=597)

#### P18 构建机械臂的基座模型

**本集重点** 基座是树根，STL 定义其可见几何。

**实操与验收** 复制模型文件到工作副本，按照 `urdf实战.docx` 留下 `Base` 的 visual。刷新并确认可见且没有 STL 404。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P018-15m45s.jpg|480]]

**图中看点** 中央 STL 基座的安装孔与凸起。替换网格后，先核对朝向、尺度和它在基座坐标系中的位置。 [截图 15:45](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=18&t=945)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=18) · [04:40 Link 与 Joint 示意](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=18&t=280) · [15:45 基座 STL 预览](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=18&t=945) · [字幕 15:47](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=18&t=947)

#### P19 构建机械臂的第一个大臂

**本集重点** origin 决定关节安装位姿，axis 定义在关节局部坐标中。

**实操与验收** 恢复 `yao` 与 `Rotation`，观察默认姿态，再让关节在零位两侧小幅转动，检查父连杆和运动方向。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P019-11m05s.jpg|480]]

**图中看点** 中央新增的大臂构件与底部基座的连接处。切换左侧的单轴控制，观察是否绕预期连接点转动。 [截图 11:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=19&t=665)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=19) · [06:30 Roll、Pitch、Yaw 的关系](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=19&t=390) · [11:05 基座与新增部件的预览](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=19&t=665) · [字幕 11:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=19&t=667)

#### P20 构建机械臂的其他关节

**本集重点** 关节逐级构成运动链，改变上游关节会带动其后代。

**实操与验收** 逐个加肩、肘、腕和夹爪。每次改一个关节，检查父子方向、后代是否跟随、是否能在限位内运动。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P020-15m05s.jpg|480]]

**图中看点** 页面中间标出的 `origin`、`xyz` 与 `rpy`。构件错位时先核对该关节的相对安装位姿。 [截图 15:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=20&t=905)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=20) · [05:15 新增关节后的浏览器模型](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=20&t=315) · [15:05 位姿错误排查](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=20&t=905) · [字幕 15:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=20&t=907) 检查关节相对安装位置

#### P21 遥操作

**本集重点** 同构遥操作按关节对应传递，教师端的动作要经过零位、方向和单位转换。

**实操与验收** 画出“教师端编码器 → 关节映射 → 浏览器模型”链。为一个轴标出 ID、零位、正方向和上下限。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P021-09m35s.jpg|480]]

**图中看点** 主端、通信链路、从端之间的双向箭头。画出自己系统里的位置指令和状态回传路径。 [截图 09:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=21&t=575)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=21) · [09:35 主端、通信链路与从端](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=21&t=575) · [15:55 位置指令与力反馈](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=21&t=955) · [字幕 15:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=21&t=957) 从端力反馈

#### P22 教师端结构的搭建

**本集重点** 结构件、编码器和转轴要能逐轴对应，零位需要可重复定位。

**实操与验收** 结合官方物料清单与本地 `3D结构归档.zip` 查看部件。先在图上标出六轴，再核对实物转轴和连杆的位置及可动范围。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P022-18m30s.jpg|480]]

**图中看点** 右边的手持装配件和左边的「多圈」示意。安装前确认轴、齿轮与位置反馈件的关系。 [截图 18:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=22&t=1110)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=22) · [12:35 转轴齿轮 3D 零件](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=22&t=755) · [18:30 实物装配与多圈位置示意](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=22&t=1110) · [字幕 18:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=22&t=1112)

#### P23 搭建自己的编码器舵机

**本集重点** 教师端每轴采集转轴位置，使用配套的串行总线回传数据。

**实操与验收** 先在 `软件/UART模拟器.html` 输入 `A`，选择 8 数据位、无奇偶校验、1 停止位，检查起始位 0、低位先发的数据位 `10000010` 和停止位 1。再根据官方装配资料核对实物接口和编码器位置。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P023-02m45s.jpg|480]]

**图中看点** 上方串口参数和下方逻辑波形。由左到右核对起始位、低位先发的数据位与停止位。 [截图 02:45](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=23&t=165)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=23) · [02:45 UART 通讯模拟器](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=23&t=165) · [14:00 设备管理器和接线实物窗口](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=23&t=840) · [字幕 14:02](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=23&t=842) 通过新增 COM 端口识别设备

#### P24 验证官方 SDK

**本集重点** 串口接通、设备 ID 和寄存器读取是三个可单独检查的步骤。

**实操与验收** 按本机端口和实物协议选 HostProtocol 或 Feetech。先用一个已知 ID 核对读回状态及位置，再查无应答、错误帧或无位置字段。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P024-11m30s.jpg|480]]

**图中看点** 前景的上位机控件及其后方的命令行。在同一个端口和 ID 下比较界面读数与 SDK 输出。 [截图 11:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=24&t=690)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=24) · [11:30 上位机 GUI 与终端](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=24&t=690) · [14:10 Python SDK 源码](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=24&t=850) · [字幕 14:12](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=24&t=852)

#### P25 聊聊 vibe coding

**本集重点** 把需求、输入输出和可验收的变化写清，便于检查生成的实现。

**实操与验收** 写一个小需求。浏览器接收六项弧度数组后只改指定关节，缺项时拒绝该帧。列出一条有效输入与一条缺项输入。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P025-21m25s.jpg|480]]

**图中看点** 左侧列出的 AI 编程局限。给舵机读数小程序先写可测的输入、输出和异常，再让代码进入下一步。 [截图 21:25](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=25&t=1285)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=25) · [04:15 计算机的抽象层次](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=25&t=255) · [21:25 AI 编程的当前局限](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=25&t=1285) · [字幕 21:27](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=25&t=1287)

#### P26 vibe coding 初体验

**本集重点** 课堂用编辑器生成并修改一个英语单词小游戏，实际在窗口里测试。

**实操与验收** 回看游戏演示，找出可单独验证的输入、反馈和计时。在机械臂代码副本做一处同样可观察的改动，再检查合法帧、缺项帧和未动轴。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P026-24m10s.jpg|480]]

**图中看点** 游戏窗口的题目、选项按钮和下方冷却提示。逐项点击验证生成代码的界面行为。 [截图 24:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=26&t=1450)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=26) · [16:25 审查编辑器中的代码变更](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=26&t=985) · [24:10 运行英语单词游戏](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=26&t=1450) · [字幕 24:12](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=26&t=1452) 检查生成游戏中的冷却时间

#### P27 读取教师端 6 个编码器舵机的角度

**本集重点** 对每个 ID 读取当前位置，按示例零位和每圈计数换算。

**实操与验收** 用 `02_read_all_teacher_angles.py` 先只读一个 ID，再读 1–6。依次转动每轴，记录唯一变化的通道与读取失败时的提示。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P027-13m20s.jpg|480]]

**图中看点** 右侧手动转动的教师端与左侧终端角度组。只动一轴，并核对相应读数是否随动。 [截图 13:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=27&t=800)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=27) · [05:50 教师端实物](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=27&t=350) · [13:20 终端角度列表与教师端动作画面](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=27&t=800) · [字幕 13:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=27&t=802)

#### P28 增加前端机械臂角度控制的代码

**本集重点** 前端以数组下标对应 `Rotation`–`Rotation6`，按弧度更新并应用限位。

**实操与验收** 在 `index.js` 定位 `updateRobotJoints`，先发送全零帧，再发送仅一个非零值的测试帧。确认其他关节保持在零位，再用超限例检查裁剪。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P028-21m20s.jpg|480]]

**图中看点** 左侧角度控制区和右边的数字臂。单独修改一个关节值，确认变化发生在对应轴。 [截图 21:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28&t=1280)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28) · [08:45 一键标定工具和实物](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28&t=525) · [21:20 数字臂及控制面板](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28&t=1280) · [25:25 编辑器中的前端改动](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28&t=1525) · [字幕 21:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=28&t=1282)

#### P29 随机更新角度信息发给前端展示

**本集重点** 生成测试角度可以独立验证消息格式、发送和画面更新。

**实操与验收** 启动配套 `websocket_server_example.py` 的正弦样例，在开发者工具依次核对连接、六项角度、时间戳及画面。改随机输入时仍按各轴范围取值。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P029-12m20s.jpg|480]]

**图中看点** 左下角的 WebSocket 状态区和中央数字臂。连上测试发送端后检查状态，并确认姿态会更新。 [截图 12:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29&t=740)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29) · [06:10 终端启动测试程序](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29&t=370) · [12:20 前端 WebSocket 面板](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29&t=740) · [18:10 测试发送的终端输出](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29&t=1090) · [字幕 12:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=29&t=742)

#### P30 同构遥操作案例的完成

**本集重点** 教师端真实读数接入发送端后，六轴对应关系应在浏览器里逐个复核。

**实操与验收** 先确认回环服务，再把有效采样一帧转成六项弧度并送前端。逐个核对方向、零位和限位。读取超时时记录并跳过缺项帧。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P030-07m15s.jpg|480]]

**图中看点** 左边连接状态和关节角列表，右边完整数字臂。用同一帧输入核对连接、各轴零位与夹爪方向。 [截图 07:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30&t=435)

**课堂回看** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30) · [07:15 数字臂与 WebSocket 连接状态](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30&t=435) · [17:40 终端录制相关输出](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30&t=1060) · [25:20 数字臂完成后的姿态预览](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30&t=1520) · [字幕 17:42](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=30&t=1062) 按 Q 停止记录

资料路径相对于课程资料目录。搭建重点见 `课程ppt/具身智能实战02.pptx` 第 40–61 页、`其他资料/urdf实战.docx` 与 `代码/urdf_learn.7z`。遥操作见 `软件/HostProtocol/协议文档.pdf` 和 `代码/code-websockt通讯完成版本.zip`。
