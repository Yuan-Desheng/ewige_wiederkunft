#!/usr/bin/env bash
# SO101 camera-only preview, prepared 2026-11-07.
set -eu
if [[ -z "${DISPLAY:-}" ]]; then
  printf '%s\n' '请在 Jetson 的图形桌面终端中运行此脚本。'
  exit 1
fi
camera_device='/dev/video0'
stable_camera='/dev/v4l/by-id/usb-Generic_USB_HD_Camera_200910120001-video-index0'
if [[ -e "$stable_camera" ]]; then
  camera_device="$stable_camera"
fi
if [[ ! -e "$camera_device" ]]; then
  printf '%s\n' '未找到摄像头，请检查 USB 连接。'
  read -r -p '按回车关闭。' _ || true
  exit 1
fi
if fuser "$camera_device" >/dev/null 2>&1; then
  printf '%s\n' '摄像头正在被占用。请先关闭已有相机预览，或在原终端停止遥操作/录制，再重新打开。'
  read -r -p '按回车关闭。' _ || true
  exit 1
fi
printf '%s\n' 'SO101 独立相机预览：640×480，30fps。' '本程序仅使用摄像头，不控制机械臂，不录制训练数据。' '关闭画面窗口或在此终端按 Ctrl+C 可停止。'
exec /usr/bin/gst-launch-1.0 -e v4l2src "device=$camera_device" ! 'video/x-raw,format=YUY2,width=640,height=480,framerate=30/1' ! videoconvert ! ximagesink sync=false
