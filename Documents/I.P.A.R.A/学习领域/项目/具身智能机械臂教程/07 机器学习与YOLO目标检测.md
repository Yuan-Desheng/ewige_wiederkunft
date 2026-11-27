---
createTime: 2026-11-19 14:00
笔记ID: 20261119140007
multiFile:
multiMedia:
description: 根据课程 P64–83 的分集和配套代码，复现数字分类、PCB 目标检测、卷积核与自动标注。
笔记类型: AI整理
阐述日期:
tags:
  - 具身智能
  - 机器学习
  - YOLO
aliases:
cssclasses: ai-note
卡片盒笔记主题:
---

## 07 机器学习与YOLO目标检测

```meta-bind-embed
[[笔记抬头模块]]
```

返回上级项目 [[具身智能机械臂]]。本章按 B 站官方分集编排，操作与示例取自配套代码、数据和课件。

### 逐集要点与实操

分秒链接按 B 站进度条预览核对，可定位课内画面。练习依据取自 `代码/` 下的 ZIP 和 `课程ppt/`。P74 开头的字幕抽查另见检测实验。

标有「字幕」的是 B 站播放器中文字幕的抽查点。画面定位与配套资料共同用于核对各集练习。

课堂截图取自对应分集的 B 站播放器进度条预览。每张图下方标出了观察位置，点击图注中的时间即可回看。

#### P64 机器学习概念入门

**本集重点** 模型通过样本学习预测规律，样本由输入特征及任务要求的标签组成。

**实操与验收** 分别用面积估价和数字分类写两份样本说明，每份列出输入、标签、输出与可测误差。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P064-03m50s.jpg|480]]

**图中看点** 右侧大脑示意下面的学习流程。对照左边计算机流程，写清训练数据从哪里进入模型。 [截图 03:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=64&t=230)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=64) · 课程文档用计算机和大脑示意图区分传统编程和机器学习 [03:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=64&t=230)。配套 `opencv和yolo.zip → ziliao/机器学习概述.md` 的“基于模型的学习” · [字幕 03:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=64&t=232)

#### P65 端到端学习

**本集重点** 数字示例由人工设定裁剪和二值化，CNN 可以通过训练直接从图像学习部分特征。

**实操与验收** 为同一张数字图画两条流程，分别标出手工预处理、学习的参数和最终输出，比较两条路线对背景变化的依赖。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P065-07m30s.jpg|480]]

**图中看点** 图中蓝色输入经过中间环节到右侧输出的路径。把每个环节换成自己任务里的图像、特征或动作。 [截图 07:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=65&t=450)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=65) · 画面用输入、训练和推理流程图示意基于模型的学习 [07:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=65&t=450)。配套 `opencv.pptx` 第 31–34 页，`opencv和yolo.zip → code/03_process_img.py` · [字幕 07:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=65&t=452)

#### P66 推理与机器学习三要素

**本集重点** 配套资料列出数据、算法、算力。推理使用已经训练的模型计算新输入的结果。

**实操与验收** 拿一张课程测试图，将图和标签归到数据，模型结构归到算法，CPU/GPU 归到算力。记下推理时是否发生权重更新。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P066-07m50s.jpg|480]]

**图中看点** 中央模型图标以及两侧输入、输出箭头。复查时把训练用的样本与预测时提供的输入分开记录。 [截图 07:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=66&t=470)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=66) · 课程文档显示数据、算法和算力三要素图 [07:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=66&t=470)。配套 `opencv和yolo.zip → ziliao/机器学习概述.md` 的“机器学习发展三要素” · [字幕 07:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=66&t=472)

#### P67 机器学习流程

**本集重点** 训练学习参数，验证调设置，留出的测试数据用于最后评估。

**实操与验收** 把训练脚本的读 CSV、分层拆分、`fit`、`predict`、报告和保存按执行顺序编号，并记录每一步使用哪一组数据。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P067-14m35s.jpg|480]]

**图中看点** 上方流程各阶段的横向箭头和下方训练示意。沿数据、特征、训练和评估顺序检查自己的文件。 [截图 14:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=67&t=875)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=67) · 课程文档显示建模流程与训练、推理示意 [14:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=67&t=875)。配套 `opencv和yolo.zip → code/train_mnist_20x20_sklearn.py`，`ziliao/机器学习概述.md` · [字幕 14:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=67&t=877) 特征工程

#### P68 误差函数和 sklearn

**本集重点** 均方误差取各残差平方的平均值，较大的误差权重也更大。

**实操与验收** 按下文运行同进程示例，检查 sklearn 可导入、回归斜率约 4.97，更换两组预测值手算 MSE 再用 `mean_squared_error` 核对。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P068-11m35s.jpg|480]]

**图中看点** 左侧散点与拟合直线，右侧参数滑块和 MSE。改变一项参数后同时观察直线和误差。 [截图 11:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=68&t=695)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=68) · 页面展示 scikit-learn 安装命令 [06:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=68&t=370) · 浏览器互动页显示线性拟合与 MSE [11:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=68&t=695)。配套 `计算机图形学.zip → code/ML/01_线性回归.py`、`02_损失函数.py` · [字幕 11:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=68&t=697) 带符号误差抵消的例子

#### P69 梯度下降与神经元

**本集重点** 线性加权后可以接激活函数以表示概率或构建非线性模型，优化器通过梯度调整权重。

**实操与验收** 用单样本 `x=1,y=2`、模型 `wx`、平方损失手算，从 `w=0` 按学习率 0.1 更新到 0.4，确认损失从 4 变为 2.56。再查看数字脚本使用的 Adam。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P069-13m30s.jpg|480]]

**图中看点** 右侧网络节点网格以及左侧的控制区。沿输入、隐藏层、输出的顺序读一次训练更新。 [截图 13:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=69&t=810)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=69) · 交互页显示抛物线和梯度下降迭代轨迹 [04:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=69&t=270) · 切到可交互的多层神经网络结构图 [13:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=69&t=810)。配套 `计算机图形学.zip → code/ML/03_逻辑回归分类.py`，`opencv和yolo.zip → code/train_mnist_20x20_sklearn.py` · [字幕 13:32](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=69&t=812)

#### P70 图像收集与特征工程

**本集重点** 图片要裁出同一种目标并保持特征格式一致，课程输入是 20×20 灰度图展开的 400 列。

**实操与验收** 从同一张图片裁出单个数字，保存处理前后图，显式用 `--input roi_clean.jpg` 转为像素文本，核对 20 行、每行 20 个值。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P070-09m05s.jpg|480]]

**图中看点** 中央手写笔画和下方的处理文件。检查取样后是否只剩目标笔画，灰度尺寸和当前标签是否一致。 [截图 09:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=70&t=545)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=70) · 画板上画一个手写数字，并在旁边打开文本编辑器 [09:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=70&t=545)。配套 `opencv和yolo.zip → code/02_set_number_roi.py`、`03_process_img.py`、`04_convert_gray_number.py` · [字幕 09:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=70&t=547)

#### P71 模型训练

**本集重点** 先把像素缩放到 `[0,1]`，在训练集上拟合标准化和 MLP，测试集只做评估。

**实操与验收** 运行脚本，检查总样本 1000、测试 200，并生成 `mnist_20x20_mlp.joblib`。记录本机的准确率和库版本。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P071-14m55s.jpg|480]]

**图中看点** 终端顶部的分类统计表与下部的训练输出。记录测试结果，再确认模型文件保存位置。 [截图 14:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=71&t=895)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=71) · 终端显示数字分类结果的矩阵和多行输出 [14:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=71&t=895)。配套 `opencv和yolo.zip → code/train_mnist_20x20_sklearn.py` · [字幕 14:57](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=71&t=897) 用答题正确率比喻训练结果

#### P72 解析模型并推理

**本集重点** 保存的是含标准化与分类器的流水线，单图文本和批量 CSV 必须沿用同一像素预处理。

**实操与验收** 重载自产模型用 `--index 0 --proba` 看首张 CSV 样本的 Top-3，再对 `gray_20x20.txt` 输出单图预测。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P072-26m10s.jpg|480]]

**图中看点** 左侧粉笔写下的「5」和后方终端。用同一个 20×20 输入核对预测类别，再比较概率输出。 [截图 26:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=72&t=1570)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=72) · 窗口打开黑底手写数字 3 的图像 [13:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=72&t=835) · 窗口展示手写数字 5，旁边可见终端推理输出 [26:10](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=72&t=1570)。配套 `opencv和yolo.zip → code/predict_mnist_20x20.py`、`prodicet.py` · [字幕 26:12](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=72&t=1572)

#### P73 混淆矩阵与交叉熵

**本集重点** 交叉熵惩罚对真实类别给出过低概率，混淆矩阵展开误判流向。

**实操与验收** 执行损失和不均衡脚本，核对 0.0101 与 4.6052。再读数字测试矩阵，算出某一类召回，并和整体准确率对照。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P073-17m50s.jpg|480]]

**图中看点** 课件下方混淆矩阵的预测列和实际行。核对 TP、FP 分别在哪，再计算精确率。 [截图 17:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=73&t=1070)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=73) · 课件展示精确率公式和真值、预测的混淆矩阵 [17:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=73&t=1070)。配套 `计算机图形学.zip → code/ML/04_交叉熵.py`、`05_样本不均衡.py`、`06_混淆矩阵.py` · [字幕 17:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=73&t=1072)

#### P74 YOLO 快速入门

**本集重点** 整图分类给类别，目标检测还给每个对象的框和置信度。

**实操与验收** 先对同一张 PCB 图进行课程权重推理，查看终端检测数与保存图，再改 `conf` 做阈值对照。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P074-11m25s.jpg|480]]

**图中看点** 终端的 Ultralytics 安装命令。用同一 Python 环境安装和运行，再按下文换一张图，查看预测输出。 [截图 11:25](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=74&t=685)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=74) · 浏览器打开 Ultralytics 官网 [09:00](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=74&t=540)。配套 `opencv和yolo.zip → 笔记/yolo实操笔记.txt` · [字幕 00:31](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=74&t=31) 讨论数字识别效果偏差

#### P75 数据标注

**本集重点** 标注类别名与边界框要成对保存，检测框应覆盖对象可见部分并遵循一致口径。

**实操与验收** 对照下文照片用矩形框标 `erji`、`esp32`，把 `xmin`、`ymin`、`xmax`、`ymax` 与图尺寸逐项对照原 JSON。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P075-47m30s.jpg|480]]

**图中看点** 木纹桌面上两块 PCB 各自的标注框。检查耳机板和 ESP32 是否分开标注，框沿是否贴合可见边缘。 [截图 47:30](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=75&t=2850)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=75) · 标注工具里对桌面上的两块 PCB 画矩形框 [47:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=75&t=2840)。配套 `opencv和yolo.zip → pcb_data/images/train/1.jpg`、`code/yolo/json/1.json` · [字幕 47:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=75&t=2842) ESP32 标注对象

#### P76 标注格式转换

**本集重点** 课程 JSON 保存角点像素，YOLO 标签保存类号、归一化中心和宽高。

**实操与验收** 运行转换，确认产生 10 份标签与 `classes.txt`，手算第一个框的中心 `(680,565)`，再按 `1920×1080` 归一化对照。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P076-01m05s.jpg|480]]

**图中看点** 前景文本窗口里的标注结构与后面的样本图。定位类别、图像尺寸和矩形坐标，再对照转换后的标签。 [截图 01:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=76&t=65)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=76) · 同屏打开 PCB 样图及 JSON 标注文本 [01:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=76&t=65)。配套 `opencv和yolo.zip → code/yolo/convert.py`、`code/yolo/json/1.txt` · [字幕 01:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=76&t=67)

#### P77 训练与结果展示

**本集重点** 数据 YAML 按目录区分训练和验证，曲线与权重用于评估训练结果和部署推理。

**实操与验收** 先数出 8 张训练图和 2 张验证图，再读归档最后一轮指标。运行检测时用定制 `best.pt`，对比独立照片及置信度。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P077-19m50s.jpg|480]]

**图中看点** 左侧相机窗口中套在耳机板上的蓝色预测框，以及下方终端的逐帧输出。用训练好的权重测试图像时，核对类别和漏检。 [截图 19:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=77&t=1190)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=77) · 在终端输入 YOLO 检测训练命令 [09:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=77&t=575)。配套 `opencv和yolo.zip → my_custom_data.yaml`、`runs/detect/train2/results.csv` · [字幕 09:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=77&t=577)

#### P78 卷积神经网络

**本集重点** 卷积核按位置提取局部特征，ReLU 引入非线性，池化可降低分辨率。

**实操与验收** 用尺寸公式算 5×5 图经过 3×3 核、步长 1、补 1 像素的输出，再手算一个 2×2 最大池化窗口。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P078-01m35s.jpg|480]]

**图中看点** 课件中央侧脸示意和标题下的特征提取说明。用可见轮廓理解局部特征，随后比较边缘核的输出。 [截图 01:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=78&t=95)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=78) · CNN 课件用同一人脸图中的不同局部引入特征 [01:35](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=78&t=95)。配套 `课程ppt/卷积神经网络CNN.pdf` 第 3、6、8–12 页 · [字幕 01:37](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=78&t=97) 提取侧面特征

#### P79 卷积核与特征提取器

**本集重点** 手工边缘核对明显亮度变化响应较强，CNN 的核参数通过训练学习。

**实操与验收** 执行卷积脚本，对照 `img.jpg` 和 `img_conv_out.jpg` 中的平坦区域与轮廓。检查 `ddepth=-1` 如何处理负值。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P079-01m50s.jpg|480]]

**图中看点** 中央从输入网格到卷积核再到输出网格。选红框位置，手算对应元素乘积之和。 [截图 01:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=79&t=110)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=79) · 课件并列展示输入网格、卷积核与输出网格 [01:50](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=79&t=110)。配套 `课程ppt/卷积神经网络CNN.pdf` 第 7–8 页，`asr和tts.zip → code/01_img_conv.py` · [字幕 01:52](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=79&t=112) 对应位置逐元素相乘

#### P80 CNN 应用

**本集重点** 分类模型输出整图类别，检测网络需要兼顾语义和目标位置。预训练权重可作为新任务的起点。

**实操与验收** 用 `YOLOv8n` 的通用权重和 PCB 定制权重为对照，先读任务类别配置，再观察同一图的输出类别空间。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P080-06m20s.jpg|480]]

**图中看点** 课件中的局部小矩阵和右侧特征示意。跟着一次窗口移动，观察输出特征图怎样累积。 [截图 06:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=80&t=380)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=80) · 课件展示带填充的图像网格、输出尺寸公式与 ReLU [06:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=80&t=380)。配套 `课程ppt/卷积神经网络CNN.pdf` 第 14–18 页，`opencv和yolo.zip → my_custom_data.yaml` · [字幕 06:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=80&t=382)

#### P81 图像合成与标注原理

**本集重点** 图与框必须共享同一套旋转、缩放和平移，否则像素位置与标签会错位。

**实操与验收** 标出透明 PNG 的 alpha 区域，手算平移后的框中心。将随机种子固定，观察前景旋转后是否还在画面内。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P081-08m20s.jpg|480]]

**图中看点** 中央合成样本的棋盘格纹理和蓝色线盘。检查前景有没有白边、旋转后是否仍在画布内。 [截图 08:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=81&t=500)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=81) · 透明棋盘背景上显示已抠出的焊锡丝线轴 [02:45](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=81&t=165) · 画布上可见线轴已放在纹理背景上 [08:20](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=81&t=500)。配套 `asr和tts.zip → code/02_gen_background.py`、`03_gen_train_img.py` · [字幕 08:22](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=81&t=502)

#### P82 合成带标注图

**本集重点** 用旋转后的 alpha 有效像素提取外接矩形，同名保存合成图和标签。

**实操与验收** 按下文命令生成 6 对素材，验证每张图为 640×640、每条标签为 5 列且类别为 0。将归一化框画回其中一张图。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P082-19m05s.jpg|480]]

**图中看点** 条纹背景中蓝色线盘周围的矩形。用该框核对自动标签中心、宽高及前景是否漏框。 [截图 19:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=82&t=1145)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=82) · 条纹合成图里线轴带红色外接框 [19:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=82&t=1145)。配套 `asr和tts.zip → code/03_gen_train_img.py`、`code/hxs.png` · [字幕 19:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=82&t=1147) 核对自动标注框中心

#### P83 合成数据训练结果

**本集重点** 合成验证指标反映的是合成域，实拍数据可能有不同光照、纹理和遮挡。

**实操与验收** 读第 4 轮 `mAP50–95=0.99097`，再用未参与生成的真实照片记录漏检和误检。手工确认标签，再做可比的实拍评估。

![[Extras/机器人/具身智能机械臂视频教程/逐集截图/P083-20m05s.jpg|480]]

**图中看点** 左上检测窗口中的两个蓝色框和终端输出。数实际线盘与检测框，分别记录漏检与误报。 [截图 20:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=83&t=1205)

**课堂定位与配套资料** [本集视频](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=83) · 终端显示训练进度与验证指标 [14:55](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=83&t=895) · 桌面实拍图里两卷焊锡丝各有蓝色检测框 [20:05](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=83&t=1205)。配套 `asr和tts.zip → code/YOLO/my_custom_data.yaml`、`code/YOLO/runs/detect/train2/results.csv` · [字幕 20:07](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=83&t=1207) 讨论检测误报

### 准备练习目录

源资料在本机 `/home/yuan/code/elysian_realm/具身智能机械臂视频资料`。以下命令用 Linux Bash 和 Python 3。每个压缩包分别解压到 `ml`、`pcb` 和 `synth`，避免同名 `code/` 相互覆盖。

```bash
course='/home/yuan/code/elysian_realm/具身智能机械臂视频资料'
lab="$HOME/arm-video-labs/07"
mkdir -p "$lab"
python3 -m venv "$lab/.venv"
source "$lab/.venv/bin/activate"
python -m pip install numpy matplotlib seaborn scikit-learn joblib opencv-python ultralytics

unzip "$course/代码/计算机图形学.zip" 'code/ML/*.py' -d "$lab/ml"
unzip "$course/代码/opencv和yolo.zip" 'code/*.py' 'code/*.csv' \
  'code/gray_20x20.txt' 'code/yolo/json/*.json' 'pcb_data/images/*' \
  'pcb_data/labels/train/*.txt' 'pcb_data/labels/val/*.txt' \
  'my_custom_data.yaml' 'yolov8n.pt' 'runs/detect/train2/weights/best.pt' \
  -d "$lab/pcb"
unzip "$course/代码/asr和tts.zip" 'code/0[1-3]_*.py' 'code/hxs.png' \
  'code/img.jpg' -d "$lab/synth"
```

### P64–69｜从数据到模型

1. **定义输入与答案。** 线性回归的输入是面积，标签是价格。数字分类输入是单个数字的图像，标签为 0–9。PCB 检测要为同一张图预测多个类别及其位置，所以每个对象都需要一条框标注。
2. **训练。** 模型给出预测，损失函数度量它和标签的差异。梯度下降按梯度的反方向更新参数，学习率控制每步大小。训练脚本的 `LinearRegression` 直接做最小二乘拟合，可用来理解回归和损失的关系。数字分类脚本则用 Adam 更新多层感知机的参数。
3. **评估和推理。** 在留出的样本上检查误差、漏报和误报，再用已保存的模型对新数据推理。OpenCV 手工设定颜色阈值和数字裁剪属于显式规则。端到端程度更高的路线可以让模型从图像中学习特征，同时保留必要的尺寸调整和归一化。

在 `$lab/ml/code/ML` 运行入门示例。`02_损失函数.py` 读取前一实验留下的 `X`、`y`、`model`，可在同一解释器执行。例子指定了 `SimHei`，缺少该字体时数值输出仍可使用，图表中文字可能显示异常。

```bash
cd "$lab/ml/code/ML"
MPLBACKEND=Agg python - <<'PY'
import runpy
state = runpy.run_path('01_线性回归.py')
runpy.run_path('02_损失函数.py', init_globals=state)
PY
python '04_交叉熵.py'
python '05_样本不均衡.py'
```

线性回归参考输出是斜率 **4.97**、偏置 **32.68**、120 平方米预测约 **628.90**、训练 MSE **2481.10**。交叉熵示例中，真实类预测概率从 0.99 降到 0.01，损失从 **0.0101** 增到 **4.6052**。样本不均衡时，永远猜多数类也可取得 99% 准确率，定位问题要看混淆矩阵和少数类召回。

### P70–73｜训练一个 20×20 数字分类器

`code/mnist_20x20_images.csv` 每行 400 个灰度值，对应一张 20×20 图。`mnist_20x20_labels.csv` 在同一行保存类别。压缩包共含 1000 个样本。`train_mnist_20x20_sklearn.py` 将像素除以 255，按类别比例切出 20% 测试集，以 `StandardScaler` 和 `MLPClassifier` 组成训练流水线，并保存整条流水线。模型实际有三个隐藏层，尺寸为 `(64, 128, 64)`。

```bash
cd "$lab/pcb/code"
python train_mnist_20x20_sklearn.py
python predict_mnist_20x20.py --labels-csv mnist_20x20_labels.csv --batch 5 --proba
python prodicet.py --txt gray_20x20.txt
```

- 第一个命令生成 `mnist_20x20_mlp.joblib`。本次用 scikit-learn **1.9.1** 在 CPU 上运行，对留出的 200 张测试图得到 **0.8600** 准确率。混淆矩阵行是真实类别，列是预测类别，对角线为正确数。数字 `5` 在真实为 `5` 的 18 张图中认对 12 张。
- 第二个命令验证模型能够重新加载，输出所给 CSV 的前 5 个预测、真值和每张图的 Top-3 概率。这 5 张取自原始 CSV，独立测试指标以训练脚本的测试子集为准。第三个命令验证同目录的 20×20 文本可推理，本次预测为 `2`。训练和推理用同一套 scikit-learn 版本，并优先加载自己刚训练的模型。[scikit-learn 模型持久化](https://scikit-learn.org/stable/model_persistence.html)
- 将这条链路迁移到自己的照片时，`02_set_number_roi.py` 选框裁出单个数字，`03_process_img.py` 二值化并清理笔画，`04_convert_gray_number.py --input roi_clean.jpg` 生成 `gray_20x20.png` 与 `gray_20x20.txt`。核对前景颜色和笔画宽度，必要时用 `03_process_img.py --invert` 让深色笔画变白。第四个脚本的默认输入实际是 `roi_processed.jpg`，所以显式传参。`06_number_detection.py` 把拍照、选区、清理和预测串起来，选区需图形界面。

### P74–77｜用 YOLO 检测耳机板和 ESP32

P74 开头先回看上一节的数字分类脚本及识别误差。数字分类输出单张图的类别，接下来的目标检测还要输出每个物体的位置。 [P74 00:29 分类回顾](https://www.bilibili.com/video/BV1nz6KBHEc9/?p=74&t=29)

**标注。** 课程数据 `pcb_data/` 含 8 张训练图、2 张验证图，另有一张可独立试推理的测试图。`code/yolo/json/` 保存相应的原始框标注。每行 YOLO 标签按 `class_id cx cy w h` 排列，`cx` 和 `w` 除以原图宽，`cy` 和 `h` 除以原图高。类别 `0` 为 `erji`，类别 `1` 为 `esp32`。[Ultralytics 检测数据集格式](https://docs.ultralytics.com/datasets/detect/)

![[Extras/机器人/具身智能机械臂视频教程/07-pcb-annotation.png|880]]

图中照片来自 `opencv和yolo.zip → pcb_data/images/train/1.jpg`，框由 `code/yolo/json/1.json` 的转换结果反算绘制。

```bash
cd "$lab/pcb"
python code/yolo/convert.py --input-dir code/yolo/json \
  --output-dir converted-labels --classes erji=0,esp32=1
```

输出 `converted-labels/1.txt` 至 `10.txt` 和 `classes.txt`。本次 10 个转换结果的逐行内容与压缩包原有标签一致。`classes.txt` 是检查用的映射表。放进数据集的只有与图像同名的标签。混入误拼的标签名会让转换脚本新增类别 ID，训练前核对类别清单和框位置。该脚本读取的是课程 JSON 的 `size` 与 `outputs.object` 结构，其他标注工具的 JSON 需要先对照结构。

**训练与推理。** 已整理好的训练集结构为 `pcb_data/images/{train,val}`、`pcb_data/labels/{train,val}`。先用绝对路径复制一份 YAML，保持原始 YAML 可用于对照。命令中的 `device=cpu` 可根据本机 Torch 已识别的设备调整。

```bash
cd "$lab/pcb"
sed "s|^path:.*|path: $PWD/pcb_data|" my_custom_data.yaml > pcb-local.yaml
yolo detect train data=pcb-local.yaml model=yolov8n.pt epochs=100 imgsz=640 \
  device=cpu project="$PWD/course-runs" name=pcb-train

# 也可先用压缩包里已有的最佳权重检查一张图
yolo detect predict model=runs/detect/train2/weights/best.pt \
  source=pcb_data/images/test/WIN_20251018_16_14_18_Pro.jpg \
  imgsz=640 conf=0.4 device=cpu project="$PWD/course-runs" name=pcb-predict
```

课件以 `yolov8n.pt` 为初始化权重，自定义两类预测用 PCB 训练结果的 `best.pt`。常看的输出有 `weights/best.pt`、`results.csv`、`results.png`、`confusion_matrix.png` 和带框预测图，终端会给出实际保存目录。原压缩包的 PCB 日志在 `runs/detect/train2/results.csv`，最后一轮 `mAP50 = 0.995`、`mAP50–95 = 0.9203`。`mAP50–95` 在多个 IoU 阈值上取平均，比只取 0.50 更能揭示框的位置偏差。[Ultralytics 目标检测](https://docs.ultralytics.com/tasks/detect/)

验证集只有 2 张。单图实测用压缩包中的 `best.pt`、Ultralytics 8.4.115 和 CPU，`conf=0.4` 时测试图未返回检测结果。用同一命令把 `source=` 改成 `pcb_data/images/train/1.jpg` 可做已知样本检查，本次返回 1 个 `erji` 框。将阈值降到 `conf=0.1` 后，测试图也返回 1 个 `erji` 框。该测试图没有配套标签，预测框需要人工核对。验证泛化需要补充带真值的新图，包含不同背景、角度和光照。

### P78–80｜卷积核如何提取特征

配套课件是 `课程ppt/卷积神经网络CNN.pdf`。卷积核按步长扫过局部区域，将每个位置的像素和权重逐项相乘后相加，形成特征图。手工核可以突出边缘；CNN 的权重通过训练学习。同一卷积核在各位置重复使用。单方向、无空洞时输出长度为 `floor((输入长度 + 2 × 填充 − 核尺寸) / 步长) + 1`。例如 `5×5` 输入、`3×3` 核、步长 1、四周各补 1 像素，输出仍是 `5×5`。增大步长或接 `2×2`、步长 2 的最大池化可以降低空间分辨率。ReLU 将负响应置零，为网络引入非线性。

在 `$lab/synth/code` 用图形界面运行 `python 01_img_conv.py`。它读取邻近的 `img.jpg` 并输出 `img_conv_out.jpg`，原图与滤波图在两个窗口显示。本次核对保存结果和原图同为 `448×448` 像素。核中心是 `−4`，上下左右是 `1`，均匀区域的响应接近 0，明显的强度突变会有较大响应。该脚本使用 `filter2D` 的 `ddepth=-1`，8 位输入会将负响应截到 0。想观察两侧的带符号响应，可把输出深度改成 `cv2.CV_32F` 后另做显示归一化。该核中心对称，因此此处相关与卷积结果相同。[OpenCV filter2D](https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html)

### P81–83｜用透明前景自动生成训练标签

`02_gen_background.py` 生成条纹、噪点、纹理、织物背景。`03_gen_train_img.py` 把 `hxs.png`（焊锡丝线轴）旋转、缩放并随机贴到 640×640 背景，以旋转后 `alpha > 10` 的有效区域取紧致外接框。它将框偏移到整图坐标后，再写出归一化 YOLO 标签。分别查看背景目录、合成图目录和标签目录，可从三者的同名文件核对来路。

```bash
cd "$lab/synth/code"
python 02_gen_background.py --style all --size 640 --count 6 \
  --outdir backgrounds --seed 42
python 03_gen_train_img.py --texture_dir backgrounds --overlay hxs.png \
  --outdir train_imgs --label_outdir train_labels --class_id 0 --seed 42
```

![[Extras/机器人/具身智能机械臂视频教程/07-synthetic-label.png|880]]

图用课程前景素材和本次生成的一张织物背景制作，右侧框由对应生成标签反算。本次检查了 6 对 `640×640` 图和同名标签，每对都有一个类别 `0` 的有效框。背景文件名含时间戳，固定随机种子控制随机采样。重复跑时可指定新输出目录，避免把往次背景混进本次数据。

正式训练时把图片和标签同名配对放进 `images/{train,val}`、`labels/{train,val}`。完整合成示例在 `asr和tts.zip → code/YOLO/hxs_data/`，其中训练 880 对、验证 200 对，`code/YOLO/my_custom_data.yaml` 对应单类 `0: hxs`。若要复现课程的完整训练，继续解压这三个条目并指定数据根目录。

```bash
unzip "$course/代码/asr和tts.zip" 'code/YOLO/hxs_data/images/*' \
  'code/YOLO/hxs_data/labels/train/*.txt' 'code/YOLO/hxs_data/labels/val/*.txt' \
  'code/YOLO/my_custom_data.yaml' 'code/YOLO/yolov8n.pt' -d "$lab/synth"
cd "$lab/synth/code/YOLO"
sed "s|^path:.*|path: $PWD/hxs_data|" my_custom_data.yaml > hxs-local.yaml
yolo detect train data=hxs-local.yaml model=yolov8n.pt epochs=100 imgsz=640 \
  device=cpu project="$PWD/course-runs" name=hxs-train
```

归档的 `code/YOLO/runs/detect/train2/results.csv` 记录了 4 轮，第 4 轮的合成验证数据 `mAP50–95 = 0.99097`。换到真实场景时，再用带真值的独立实拍图检查背景变化、遮挡和多物体同框。YOLO 训练数值取自配套日志，本次复现了 PCB 单图推理。
