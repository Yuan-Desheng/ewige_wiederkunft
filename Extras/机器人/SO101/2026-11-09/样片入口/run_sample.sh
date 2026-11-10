#!/usr/bin/env bash
set -eo pipefail
mode="${1:-check}"
if [[ "$mode" != check && ( -n "${SSH_CONNECTION:-}" || -z "${DISPLAY:-}" ) ]]; then
  echo '请在Jetson物理本机桌面运行，不从SSH启动机械臂。'
  exit 1
fi
source /data/so101/env.sh
export F=/dev/serial/by-id/usb-1a86_USB_Single_Serial_5B79081406-if00
export L=/dev/serial/by-id/usb-1a86_USB_Single_Serial_5B79083596-if00
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$mode" == check ]]; then
  exec /data/so101/.venv/bin/python "$script_dir/sample_tools.py" check
fi
log_dir=/data/so101/outputs/dual-tray-sample-2026-11-09
mkdir -p "$log_dir"
log_path="$log_dir/${mode}-$(date +%Y%m%d-%H%M%S).log"
echo "完整输出：$log_path"
set +e
/data/so101/.venv/bin/python "$script_dir/sample_tools.py" "$mode" 2>&1 | tee "$log_path"
program_status=${PIPESTATUS[0]}
set -e
echo "程序退出码：$program_status；是否完成及是否合格须检查数据与日志。"
/data/so101/.venv/bin/python "$script_dir/sample_tools.py" check 2>&1 | tee -a "$log_path"
exit "$program_status"
