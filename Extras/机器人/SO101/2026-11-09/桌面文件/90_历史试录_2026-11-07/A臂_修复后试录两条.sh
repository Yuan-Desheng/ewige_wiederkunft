#!/usr/bin/env bash
# Run manually at the Jetson's physical local desktop. This file does not auto-start.
set -eo pipefail
if [[ -n "${SSH_CONNECTION:-}" || -z "${DISPLAY:-}" ]]; then
  echo '请在 Jetson 本机桌面的终端运行，不从 SSH 启动录制。'
  exit 1
fi
source /data/so101/env.sh
if [[ -z "${F:-}" || -z "${L:-}" ]]; then
  echo 'so101 环境中的主从臂端口缺失，请停止并反馈。'
  exit 1
fi
/data/so101/.venv/bin/python - <<'CHECK'
import hashlib,json
from pathlib import Path
root=Path('/data/so101/.venv/lib/python3.10/site-packages/lerobot')
expected={"scripts/lerobot_record.py": "6c091d447bb0f7074e5e62a310ed8238fe5615f85001085cf7181d63a2cf3022", "utils/control_utils.py": "a7e4760d663dde036513055901c15577020282973fbd985d92262324a37054c2"}
for name,sha in expected.items():
    if hashlib.sha256((root/name).read_bytes()).hexdigest()!=sha:
        raise SystemExit('录制补丁文件已变化，请先反馈检查，不启动。')
info=json.loads(Path('/data/so101/datasets/a_test/meta/info.json').read_text())
if info['total_episodes']!=1:
    raise SystemExit('a_test 已有条数发生变化，请先检查，不重复追加。')
print('保留已有第0条，接下来追加两条（编号1和2）。')
CHECK
if fuser /dev/video0 "$F" "$L" >/dev/null 2>&1; then
  echo '相机或串口正在使用，请先正常退出独立预览或旧遥操作程序，再运行本文件。'
  exit 1
fi
log_dir=/data/so101/outputs/record-keyboard-fix-2026-11-07
mkdir -p "$log_dir"
log_path="$log_dir/retry-$(date +%Y%m%d-%H%M%S).log"
echo "完整录制输出保存到：$log_path"
set +e
lerobot-record --robot.type=so101_follower --robot.port="$F" --robot.id=a_follower \
  --robot.cameras="{ top: {type: opencv, index_or_path: /dev/video0, width: 640, height: 480, fps: 30} }" \
  --teleop.type=so101_leader --teleop.port="$L" --teleop.id=a_leader \
  --dataset.repo_id=jizhishida/a_test --dataset.root=/data/so101/datasets/a_test \
  --dataset.single_task="Pick up the cube and place it in the box" \
  --dataset.num_episodes=2 --dataset.episode_time_s=20 --dataset.reset_time_s=10 \
  --dataset.fps=30 --dataset.push_to_hub=false --display_data=true --play_sounds=false \
  --resume=true 2>&1 | tee "$log_path"
record_status=${PIPESTATUS[0]}
set -e
echo "录制程序退出码：$record_status；退出码0不代表条数已录够，仍须检查数据。"
echo "日志：$log_path"
exit "$record_status"
