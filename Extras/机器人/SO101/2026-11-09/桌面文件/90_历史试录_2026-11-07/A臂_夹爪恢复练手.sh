#!/usr/bin/env bash
# Manual physical-local-desktop practice only. No dataset recording.
set -eo pipefail
if [[ -n "${SSH_CONNECTION:-}" || -z "${DISPLAY:-}" ]]; then
  echo '请在Jetson物理本机桌面终端运行。'
  exit 1
fi
source /data/so101/env.sh
if [[ -z "${F:-}" || -z "${L:-}" ]]; then
  echo 'so101主从臂端口环境缺失，请停止并反馈。'; exit 1
fi
if fuser /dev/video0 "$F" "$L" >/dev/null 2>&1; then
  echo '设备被占用，请正常退出独立相机预览或旧遥操作程序。'; exit 1
fi
log_dir=/data/so101/outputs/gripper-recovery-check-2026-11-07
log_path="$log_dir/practice-$(date +%Y%m%d-%H%M%S).log"
echo '先进行只读状态检查；检查通过后进入无录制时限的练手。'
/data/so101/.venv/bin/python "$log_dir/gripper_read_only_probe.py" 2>&1 | tee "$log_path"
echo '进入练手。先小范围跟随和空载夹爪开合，正常后再练完整抓放。'
echo "完整日志：$log_path"
lerobot-teleoperate --robot.type=so101_follower --robot.port="$F" --robot.id=a_follower \
  --robot.cameras="{ top: {type: opencv, index_or_path: /dev/video0, width: 640, height: 480, fps: 30} }" \
  --teleop.type=so101_leader --teleop.port="$L" --teleop.id=a_leader \
  --display_data=true 2>&1 | tee -a "$log_path"
