---
createTime: 2026-11-19 16:10
笔记ID: 20261119161006
multiFile:
multiMedia:
description: 从摄像头、ROI 和颜色分割到平面测量、手眼坐标和目标姿态
笔记类型: AI整理
阐述日期:
tags:
  - 具身智能
  - 机械臂
  - OpenCV
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## 06 OpenCV视觉与手眼坐标

```meta-bind-embed
[[笔记抬头模块]]
```

[[具身智能机械臂|项目入口]] · [[具身智能机械臂课程分集索引|分集索引]] · 上一篇 [[05 学生端标定与PID同步控制]]

先让程序稳定找到目标像素，再把它换算到机械臂能使用的坐标。本章的离线练习会输出目标数量、全图中心和工作平面位置。视频定位见 [P45–49 图像与相机](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=45)、[P50–52 颜色识别与计数](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=50)、[P53–55 机位、测量与标定](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=53)、[P56–63 形状、跟踪、姿态与识别边界](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=56)。

### 1. 从静态图到摄像头和 ROI

OpenCV 读取彩色图像时默认通道顺序为 BGR。NumPy 数组先按行后按列访问，所以像素 $(u,v)$ 对应 `frame[v, u]`。图像原点在左上，$u$ 向右、$v$ 向下。ROI 是感兴趣区域，在 NumPy 中用 `frame[y:y+h, x:x+w]` 裁切。

1. 进入配套 `课程ppt/`，在课程虚拟环境安装 `opencv-python`、`numpy`。用 `01_opencv_demo.py`、`02_opencv_create_img.py` 和同目录 PNG 核对读图、像素和通道。
2. 依次运行 `03_opencv_camera.py`、`04_opencv_camera_roi.py`。确认能读到帧后拖动框选区域，后者按 `r` 重选、按 `q` 退出。实际摄像头索引按本机确认，配套脚本里既有 `0`，也有 `1` 和 `2`。只装 headless 构建时，可用下节离线试验，交互式的 `imshow` 需要有 GUI 的构建和显示环境。
3. 先固定相机和光照，再区分现象。整个画面同步位移，检查机位刚性和线缆牵引。亮度周期变化时核查灯光频闪与曝光。出现卡顿时记录实际帧间隔、分辨率、USB 带宽与处理耗时。
4. `04_opencv_camera_roi.py` 先把画面缩小一半。若后续标定的是原始分辨率，先把 ROI 内的检测结果加上 ROI 偏移，还原到缩放后的整图，再用实际宽高比例换成原图像素。

### 2. 离线跑一遍颜色分割和几何映射

把下面完整示例保存为 `vision_geometry_lab.py`，用带 OpenCV 和 NumPy 的 Python 运行。前半段模拟台面上有两个蓝色目标，其中一个在 ROI 外。后半段用四组对应点建立从像素到毫米的单应变换，再回代一个由模型合成的检验点。

```python
import cv2 as cv
import numpy as np

frame = np.full((300, 460, 3), 230, dtype=np.uint8)
cv.circle(frame, (180, 150), 28, (255, 0, 0), -1)
cv.circle(frame, (375, 120), 30, (255, 0, 0), -1)
cv.circle(frame, (260, 180), 19, (30, 100, 220), -1)

x0, y0, width, height = 70, 50, 240, 200
roi = frame[y0:y0 + height, x0:x0 + width]
hsv = cv.cvtColor(roi, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, (100, 50, 50), (130, 255, 255))
mask = cv.morphologyEx(mask, cv.MORPH_OPEN, np.ones((3, 3), np.uint8))
contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
valid = [contour for contour in contours if cv.contourArea(contour) >= 100]
assert len(valid) == 1, f"有效目标数 {len(valid)}"
moments = cv.moments(valid[0])
assert moments["m00"] > 0
cx = x0 + round(moments["m10"] / moments["m00"])
cy = y0 + round(moments["m01"] / moments["m00"])
assert (cx, cy) == (180, 150)
print(f"目标数={len(valid)}, 全图中心=({cx}, {cy})")

src = np.float32([[120, 70], [315, 78], [377, 244], [62, 225]])
dst = np.float32([[0, 0], [200, 0], [200, 120], [0, 120]])  # mm
pixel_to_table = cv.getPerspectiveTransform(src, dst)
table_point = np.float32([[[60, 40]]])
pixel = cv.perspectiveTransform(table_point, np.linalg.inv(pixel_to_table))
measured = cv.perspectiveTransform(pixel, pixel_to_table)[0, 0]
np.testing.assert_allclose(measured, [60, 40], atol=1e-4)
print(f"平面坐标=({measured[0]:.1f}, {measured[1]:.1f}) mm")
```

实际输出为 `目标数=1, 全图中心=(180, 150)` 和 `平面坐标=(60.0, 40.0) mm`。前者对应 ROI 中心 $(110,100)$ 加偏移 $(70,50)$。后者验证坐标与矩阵索引的计算，实物精度还要用独立测量点验证。

![[Extras/机器人/具身智能机械臂视频教程/06-ROI和HSV掩膜.png|900]]

*图 1。离线示例生成的全图、ROI 和二值掩膜。ROI 外的蓝色块没有进入轮廓统计。*

开始调真实画面时，先看掩膜有没有覆盖目标，再设形态学操作和面积阈值。8 位图像的 OpenCV HSV 中，$H$ 通常为 0–179，$S,V$ 为 0–255。蓝色可以先用课程示例的 `(100,50,50)–(130,255,255)`。红色跨过色相两端，应分别做低段和高段遮罩再合并。白色瓶盖通常先看低饱和、高亮，再配合面积和圆度过滤。颜色区域互相黏连时，单靠 `RETR_EXTERNAL` 会把它们计成一个，需要先检查摆放间距、照明和形态学核大小。 [OpenCV 颜色空间文档](https://docs.opencv.org/4.x/df/d9d/tutorial_py_colorspaces.html)

### 3. 估计真实尺寸并回到机械臂坐标

- **固定相机（眼在手外）。** 相机视角稳定，适合观察桌面全局。俯直并且参照物和目标同一平面时，可以先用 `毫米/像素 = 已知长度 / 该边投影像素长度` 估测。相机斜拍时，标出平面四角并建立像素和已知毫米坐标的对应。需要精度时，先校正畸变，用超过四个测量点拟合，再用未参与拟合的点报告毫米误差。
- **相机装在末端（眼在手上）。** 记录每次标定图像对应的末端姿态，求相机到末端的固定变换。设 $T_{a\leftarrow b}$ 把 $b$ 系的坐标变到 $a$ 系，则 $p_{base}=T_{base\leftarrow gripper}T_{gripper\leftarrow camera}p_{camera}$。检查数据是否同步、变换是否用了正确方向。相机像素要先借助深度或已知平面成为三维点。
- **台面和基座的关系。** 离线例子得到的是台面上的 $(X,Y)$。只有台面基准已与机械臂基座对齐，才能直接使用这些坐标。一般还需测定台面在基座下的位置、朝向和工作高度，再交给 [[04 机械臂运动学正解与逆解|逆解模块]]。台面高度变化时重做相应的几何计算。 [OpenCV 相机与手眼标定文档](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html)

![[Extras/机器人/具身智能机械臂视频教程/06-像素到台面单应变换.png|850]]

*图 2。离线示例的四个对应角点和合成检验点。平面只约束台面上的点，抓取高度需要单独测定。*

### 4. 逐集要点与实操

分秒链接按 B 站进度条预览核对，可定位课内画面。表内也列出练习所依据的配套资料。`opencv.pptx` 位于 `课程ppt/`。除另有路径的文件，表内 `.py` 和 `abc.jpg` 位于 `代码/计算机图形学.zip` 的 `code/opencv/`。

标有「字幕」的是 B 站播放器中文字幕的抽查点。画面定位与配套资料共同用于核对各集练习。

课堂截图取自对应分集的 B 站播放器进度条预览。每张图下方标出了观察位置，点击图注中的时间即可回看。

#### P45 计算机视觉介绍

**本集重点** 分类回答整张图是什么，检测给位置，分割给像素范围。

**实操与验收** 用同一张桌面图分别写一个类别、一个框和一个掩膜，各自记录数据形状。抓取至少需要目标位置。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P045-07m35s.jpg|480]]

**图中看点** 课件的「核心任务」列表。把分类、检测、分割三类输出分别对应到标签、框和像素范围。 [截图 07:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=45&t=455)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=45) · 课件列出分类、检测、分割和行为识别 [07:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=45&t=455)。配套 `opencv.pptx` 第 2 页 · [字幕 07:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=45&t=457)

#### P46 计算机存储图像

**本集重点** 彩图是高×宽×通道数组，OpenCV 读取顺序为 BGR。

**实操与验收** 生成绿底红线图，重新读入，检查 `shape==(320,480,3)`，中心行取样应为 `(0,0,255)`。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P046-13m30s.jpg|480]]

**图中看点** 编辑区里逐行排列的二进制数值。把它们对应到颜色通道和像素，再核对通道顺序。 [截图 13:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=46&t=810)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=46) · 编辑器里用多行数字表现像素图 [13:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=46&t=810)。配套 `opencv.pptx` 第 3、5、7 页，`02_opencv_create_img.py` · [字幕 13:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=46&t=812) 计算机编码颜色

#### P47 摄像头画面抖动

**本集重点** 画面位移、亮度闪烁和帧率不稳需要分别诊断。

**实操与验收** 固定相机，在空桌面录一段。观察同一角点的位置和静止区域的平均亮度，记录连续帧的时间间隔。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P047-08m40s.jpg|480]]

**图中看点** 左侧资源监视窗口和右侧带色块的相机预览。排查时同时观察帧画面是否移动、变暗或跳帧。 [截图 08:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=47&t=520)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=47) · 桌面相机预览与系统性能监视窗口并排 [08:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=47&t=520)。配套 `opencv.pptx` 第 8 页，`03_opencv_camera.py` · [字幕 08:41](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=47&t=521)

#### P48 OpenCV 入门

**本集重点** 先核对 Python 环境、读写接口和窗口能力。

**实操与验收** 运行 `python -c 'import cv2; print(cv2.__version__)'`，再从配套 PNG 所在目录运行例程。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P048-13m15s.jpg|480]]

**图中看点** 编辑器内构造图像的数组和颜色赋值。调试时先确认三个通道和写入行列的顺序。 [截图 13:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=48&t=795)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=48) · 编辑器里用 NumPy 数组创建图像 [13:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=48&t=795)。配套 `opencv.pptx` 第 4–7 页，`01_opencv_demo.py` · [字幕 13:17](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=48&t=797) RGB 全零的例子

#### P49 ROI 选取

**本集重点** 裁剪后坐标以 ROI 左上角为原点。课件例程先缩小帧。

**实操与验收** 分别标记裁剪图和显示整图的同一点，加回 ROI 偏移，再按显示尺寸到原图的实际比例还原。按 `r` 重选验证。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P049-15m00s.jpg|480]]

**图中看点** 前景窗口里红色矩形圈出的 ROI，以及后方的相机画面。记录选区左上角和宽高，便于把检测坐标还原到全图。 [截图 15:00](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=49&t=900)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=49) · 终端旁显示摄像头读出的机械臂画面 [03:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=49&t=230)。配套 `opencv.pptx` 第 9、11 页，`04_opencv_camera_roi.py` · [字幕 03:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=49&t=232)

#### P50 颜色识别

**本集重点** 先转 HSV，再按区间取二值掩膜并找轮廓。

**实操与验收** 同框放蓝色和非蓝色目标，运行示例，逐帧比较原图、掩膜和轮廓中心。无摄像头时用上文离线脚本。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P050-23m38s.jpg|480]]

**图中看点** 左上角原始彩色检测结果和各黑底白色掩膜。每改一组阈值，都要确认只保留该颜色对应的目标。 [截图 23:38](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=50&t=1418)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=50) · 同一画面显示多色目标检测结果与各色二值掩膜 [23:38](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=50&t=1418)。配套 `opencv.pptx` 第 10 页，`05_opencv_camera_hsv_blue.py` · [字幕 23:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=50&t=1420)

#### P51 识别参数调整

**本集重点** 六个 HSV 滑块分别控制下限和上限，掩膜给出当前判定结果。

**实操与验收** 固定机位，仅调整一对滑块，记下刚开始漏检或引入背景的位置。按 `p` 打印范围，`r` 恢复初值。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P051-13m35s.jpg|480]]

**图中看点** 右上角的 HSV 滑块与下方二值掩膜。调整一个范围后观察目标形状是否完整、背景是否出现白块。 [截图 13:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=51&t=815)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=51) · 原图蓝色块、二值掩膜与 HSV 滑块同时可见 [13:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=51&t=815)。配套 `09_opencv_hsv_detector.py` · [字幕 13:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=51&t=817) 把可调参数放到界面

#### P52 白色瓶盖计数

**本集重点** 数量来自通过面积与圆度筛选的连通轮廓，粘连会影响计数。

**实操与验收** 先摆开瓶盖，调 HSV、面积与圆度，再让两只相接。按 `s` 保存 ROI、掩膜和标框图，按实际数量对照。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P052-20m55s.jpg|480]]

**图中看点** 中间的参数面板和右侧带绿色结果的瓶盖窗口。对照实际瓶盖数，检查面积和圆度过滤有没有误删。 [截图 20:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=52&t=1255)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=52) · 多个窗口显示瓶盖掩膜、圆形检测标记和参数滑块 [20:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=52&t=1255)。配套 `10_opencv_hsv_white.py`、`10_opencv_hsv_white_advanced.py` · [字幕 20:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=52&t=1257) 瓶盖计数参数调节

#### P53 眼在手上与眼在手外

**本集重点** 末端相机随姿态移动，固定相机的世界视角通常稳定。

**实操与验收** 画出两种机位的相机、末端和基座坐标链，标出哪个变换固定。用同一桌面点比较两种机位移动时的投影变化。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P053-04m25s.jpg|480]]

**图中看点** 右侧镜头窗口中手指指向的末端组件。沿机械臂追到相机安装处，判断视角是否随关节一起动。 [截图 04:25](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=53&t=265)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=53) · 画面展示实物相机的支架和安装位置 [04:25](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=53&t=265)。配套 `opencv.pptx` 第 12–14 页，上文手眼坐标图 · [字幕 04:27](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=53&t=267) 眼在手上的安装方式

#### P54 测量物体宽高

**本集重点** 同平面比例尺需要先知道参照物实长。例程默认参照方块边长 3 cm。

**实操与验收** 把参照物和另一块已知长宽的物体放同平面，将校准值换成真实边长。记录像素数、实测厘米和误差，再把物体移到边缘比较。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P054-12m20s.jpg|480]]

**图中看点** 左侧结果图中的两个方块和右上角掩膜。先确认已知尺寸参照块完整入镜，再看测量输出。 [截图 12:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=54&t=740)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=54) · 俯视画面中两块物体带标注，旁边是二值掩膜和终端 [12:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=54&t=740)。配套 `opencv.pptx` 第 15 页，`11_opencv_measure.py` · [字幕 12:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=54&t=742)

#### P55 手眼标定与坐标差

**本集重点** 抓取点要在机械臂能解释的坐标系中表示。加减偏移前必须统一坐标轴和单位。

**实操与验收** 离线运行 TCP 坐标脚本查看示例关节输出，再用上文四角例程得到台面坐标。任选未参与拟合的已知点，分别记录台面坐标差与基座变换的方向。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P055-02m10s.jpg|480]]

**图中看点** 右边俯视画面中长块和方块的相对摆放。用两点的位置差检查平面坐标的轴向和单位。 [截图 02:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=55&t=130)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=55) · 课件旁的俯视画面同时放了长方块与方块 [02:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=55&t=130)。配套 `opencv.pptx` 第 12–15 页，`code/robot/calculate_tcp_positions.py` · [字幕 02:12](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=55&t=132) 相机和机械臂的相对位置

#### P56 形状识别与优化

**本集重点** 图像差分找前景，轮廓逼近和形状特征供后续判断。

**实操与验收** 清空桌面，按 `c` 采集背景，再加圆形与矩形。比较帧差和背景减除模式，单独调整面积下限以压掉小斑点。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P056-15m10s.jpg|480]]

**图中看点** 左边的形状识别结果、中间黑底掩膜和右边调参栏。阈值调节后核对轮廓是否连通。 [截图 15:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=56&t=910)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=56) · 画面同时显示形状识别结果、二值掩膜与参数面板 [15:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=56&t=910)。配套 `opencv.pptx` 第 16–17 页，`12_opencv_shape_detector.py` · [字幕 15:12](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=56&t=912)

#### P57 目标追踪

**本集重点** 追踪例程取最大匹配轮廓，保存最近至多 100 个中心。

**实操与验收** 移动单个紫色物体记录轨迹，再加入更大的同色物体观察是否跳点。按 `c` 清除历史后重试。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P057-01m40s.jpg|480]]

**图中看点** 相机窗口里的紫色目标和正在移动它的手。试着让目标沿桌面走一圈，观察中心点能否连续跟随。 [截图 01:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=57&t=100)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=57) · 相机预览中用手移动一个紫色块 [01:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=57&t=100)。配套 `opencv.pptx` 第 18 页，`13_opencv_track.py` · [字幕 01:42](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=57&t=102)

#### P58 俯视变换

**本集重点** 标题称仿射，配套实现用四点单应变换做透视校正，处理近大远小。

**实操与验收** 从脚本所在目录运行，选平面四角后按 `t`，检查输出是否铺成矩形，再用已知长宽比例核对拉伸程度。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P058-11m10s.jpg|480]]

**图中看点** 左侧盒面上绿色四边形的四角。选择实际平面的对应点，并核对四点的顺序。 [截图 11:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=58&t=670)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=58) · 倾斜盒面上出现绿色四边形选区，旁边是变换程序终端 [11:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=58&t=670)。配套 `opencv.pptx` 第 19 页，`14_opencv_Homography.py` 与 `abc.jpg` · [字幕 11:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=58&t=667) 第三个对应点

#### P59 旋转角与中心案例

**本集重点** 轮廓质心和外接旋转矩形中心各有定义。角度取决于选用的边。

**实操与验收** 用长方形照片标出质心、框中心和长边方向，旋转 45° 后再标记一次。接近正方形时观察长边判断是否稳定。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P059-00m50s.jpg|480]]

**图中看点** 右边画面中斜放的长方块。确定抓取时以哪条边为方向，先标出中心和要测的角。 [截图 00:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=59&t=50)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=59) · 俯视画面中用倾斜的蓝色长方块作为姿态例子 [00:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=59&t=50)。配套 `opencv.pptx` 第 20 页，`15_opencv_center_rotation.py` · [字幕 00:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=59&t=52)

#### P60 实现中心与旋转角

**本集重点** 由 `moments` 求质心，用 `minAreaRect`、`boxPoints` 提取旋转框。

**实操与验收** 用蓝色长方形让脚本画框。记录中心、长宽和原始角度，然后用两条长边的向量核对抓取方向。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P060-05m40s.jpg|480]]

**图中看点** 左上角检测窗口的方块及其标注，再看旁边的终端输出。转动物块验证中心和角度是否一起更新。 [截图 05:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=60&t=340)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=60) · 检测画面中蓝色块旁叠加姿态标记和文字 [05:40](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=60&t=340)。配套 `15_opencv_center_rotation.py` · [字幕 05:42](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=60&t=342)

#### P61 二维码识别

**本集重点** 识别输出包含码内容与位置，`pyzbar` 还依赖 ZBar。

**实操与验收** 用自己生成的普通文本码做对照，检查距离和反光变化后的解码内容是否仍正确。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P061-05m35s.jpg|480]]

**图中看点** 左边相机窗口中手机屏幕里的二维码和后方终端输出。比较画面检测与解码结果是否同时出现。 [截图 05:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=61&t=335)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=61) · 手机屏幕显示二维码，桌面打开 `QR History` 窗口 [05:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=61&t=335)。配套 `opencv.pptx` 第 21 页，`16_opencv_qrcode.py` · [字幕 05:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=61&t=337) 二维码解码成功

#### P62 人脸检测

**本集重点** Haar 级联示例输出人脸矩形和计数，可以检查模型 XML 是否成功加载。

**实操与验收** 用有权使用的测试图或本人镜头观察正面、侧面和远近变化，检查窗口的 `Faces detected` 与框位置。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P062-04m50s.jpg|480]]

**图中看点** 终端左上方相机窗口内的绿色人脸框与顶部计数。改变头部位置，检查计数与检测框是否一致。 [截图 04:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=62&t=290)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=62) · 课件显示 Haar 级联人脸检测原理页 [01:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=62&t=90)。配套 `opencv.pptx` 第 22 页，`17_opencv_face_detection.py` · [字幕 01:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=62&t=92) 人脸与眼部检测

#### P63 传统视觉方法的局限

**本集重点** 固定规则会受光照、视角、遮挡和背景相似颜色影响。

**实操与验收** 保留同一组 HSV 阈值，分别改一个因素。保存误检和漏检原图及掩膜，作为下一章的样本来源。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P063-02m15s.jpg|480]]

**图中看点** 上排相似外观图案和下排不同光照的瓶子。复测时一次只改变纹理或照度，并保留失败帧。 [截图 02:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=63&t=135)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=63) · 课件用画作和棋子示例比较视角、照明变化 [02:15](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=63&t=135)。配套 `opencv.pptx` 第 23–30 页，`05_opencv_camera_hsv_blue.py` · [字幕 02:17](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=63&t=137)

**验收。** 在固定机位下保存原图、掩膜和检测结果，记录 ROI 与分辨率。用至少一个独立点度量像素到台面坐标的误差。课件对应 `opencv.pptx` 第 2–30 页。此处实跑了合成图与单应映射，真实摄像头和手眼标定需用现场设备验收。

下一篇 [[07 机器学习与YOLO目标检测]]
