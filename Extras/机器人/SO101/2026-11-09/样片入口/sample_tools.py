"""SO101 sample planning and launch. Import/check/plan never opens hardware."""
import argparse
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path('/data/so101/datasets/a_dual_tray_sample_20261109')
REPO_ID = 'jizhishida/a_dual_tray_sample_20261109'
LABELS = {'A': 'move_red_to_right_tray', 'B': 'move_blue_to_left_tray'}
TARGETS = {'A': 3, 'B': 2}
BIN = Path('/data/so101/.venv/bin')
PACKAGE = BIN.parent / 'lib/python3.10/site-packages/lerobot'
EXPECTED_HASHES = {
    'scripts/lerobot_record.py': '6c091d447bb0f7074e5e62a310ed8238fe5615f85001085cf7181d63a2cf3022',
    'utils/control_utils.py': 'a7e4760d663dde036513055901c15577020282973fbd985d92262324a37054c2',
}


def load_state(root=ROOT):
    if not root.exists():
        return {'exists': False, 'counts': {'A': 0, 'B': 0}, 'episodes': [], 'frames': 0}
    info_path = root / 'meta/info.json'
    if not info_path.is_file():
        raise ValueError('目录已存在但缺少info.json；保留现场，请反馈，不自动删除。')
    info = json.loads(info_path.read_text())
    if info['fps'] != 30 or info['robot_type'] != 'so_follower':
        raise ValueError('已有数据集fps或机器人类型不符，停止追加。')
    if info['total_episodes'] == 0:
        raise ValueError('已有目录没有完整保存的条目，请先检查，不自动删除重建。')
    import pandas as pd
    tasks = pd.read_parquet(root / 'meta/tasks.parquet')
    task_map = {int(row['task_index']): str(label) for label, row in tasks.iterrows()}
    if not set(task_map.values()).issubset(LABELS.values()):
        raise ValueError('任务标签不是本次两个子任务，拒绝混入旧试录。')
    meta_files = sorted((root / 'meta/episodes').rglob('*.parquet'))
    data_files = sorted((root / 'data').rglob('*.parquet'))
    if not meta_files or not data_files:
        raise ValueError('数据或episode元数据缺失，停止追加。')
    episodes = pd.concat([pd.read_parquet(p) for p in meta_files], ignore_index=True)
    data = pd.concat([pd.read_parquet(p, columns=['episode_index', 'task_index']) for p in data_files], ignore_index=True)
    if len(episodes) != info['total_episodes'] or len(data) != info['total_frames']:
        raise ValueError('条数/帧数与info不一致，请先检查。')
    if set(int(x) for x in episodes['episode_index']) != set(range(len(episodes))):
        raise ValueError('episode索引不连续或重复，停止追加。')
    counts = {'A': 0, 'B': 0}
    rows = []
    for _, row in episodes.iterrows():
        index, length = int(row['episode_index']), int(row['length'])
        labels = list(row['tasks'])
        g = data[data['episode_index'] == index]
        task_indices = set(int(x) for x in g['task_index'])
        if len(labels) != 1 or labels[0] not in LABELS.values() or length <= 0 or len(g) != length or len(task_indices) != 1:
            raise ValueError('条目混合任务、为空或长度不匹配，停止追加。')
        label = labels[0]
        if task_map.get(next(iter(task_indices))) != label:
            raise ValueError('逐帧task_index与episode标签不一致，停止追加。')
        key = next(k for k, value in LABELS.items() if value == label)
        counts[key] += 1
        rows.append({'episode': index, 'task': key, 'label': label, 'frames': length, 'seconds': length / 30})
    return {'exists': True, 'counts': counts, 'episodes': rows, 'frames': len(data)}


def plan(mode, state):
    counts = state['counts']
    if any(counts[key] > TARGETS[key] for key in TARGETS):
        raise ValueError('已保存条数超过本次样片目标，先检查，不自动追加。')
    remaining = TARGETS[mode] - counts[mode]
    if remaining == 0:
        return {'mode': mode, 'label': LABELS[mode], 'additional_episodes': 0,
                'resume': state['exists'], 'root': str(ROOT), 'repo_id': REPO_ID}
    if mode == 'B' and counts['A'] != 3:
        raise ValueError('先完成A的3条样片，再录B。')
    if mode == 'A' and counts['B'] > 0:
        raise ValueError('B已经开始，先核对已有数据，不返回A盲目追加。')
    return {'mode': mode, 'label': LABELS[mode], 'additional_episodes': remaining,
            'resume': state['exists'], 'root': str(ROOT), 'repo_id': REPO_ID}


def command_for(mode, record_plan=None, env=None):
    env = os.environ if env is None else env
    base = [
        '--robot.type=so101_follower', '--robot.port=' + env['F'], '--robot.id=a_follower',
        '--robot.max_relative_target=10',
        '--robot.cameras={ top: {type: opencv, index_or_path: /dev/video0, width: 640, height: 480, fps: 30} }',
        '--teleop.type=so101_leader', '--teleop.port=' + env['L'], '--teleop.id=a_leader',
        '--display_data=true',
    ]
    if mode == 'reach':
        return [str(BIN / 'lerobot-teleoperate'), *base]
    result = [str(BIN / 'lerobot-record'), *base,
        '--dataset.repo_id=' + REPO_ID, '--dataset.root=' + str(ROOT),
        '--dataset.single_task=' + record_plan['label'],
        '--dataset.num_episodes=' + str(record_plan['additional_episodes']),
        '--dataset.episode_time_s=inf', '--dataset.reset_time_s=10',
        '--dataset.fps=30', '--dataset.push_to_hub=false', '--play_sounds=false']
    if record_plan['resume']:
        result.append('--resume=true')
    return result


def preflight():
    if os.environ.get('SSH_CONNECTION') or not os.environ.get('DISPLAY'):
        raise ValueError('请在Jetson物理本机桌面运行，SSH中不启动机械臂。')
    ports = [os.environ.get(name, '') for name in ['F', 'L']]
    if not all(ports) or not all(Path(p).exists() for p in ports) or Path(ports[0]).resolve() == Path(ports[1]).resolve():
        raise ValueError('主从臂端口缺失或相同，请检查so101环境。')
    for name, expected in EXPECTED_HASHES.items():
        if hashlib.sha256((PACKAGE / name).read_bytes()).hexdigest() != expected:
            raise ValueError('录制代码已变化，请先复核：' + name)
    if subprocess.run(['fuser', '/dev/video0', *ports], capture_output=True).returncode == 0:
        raise ValueError('相机或串口占用：请先正常关闭独立预览或旧控制程序，再运行。')
    # Existing probe only reads status registers; it does not enable or disable torque.
    subprocess.run([sys.executable, '/data/so101/outputs/gripper-recovery-check-2026-11-07/gripper_read_only_probe.py'], check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['reach', 'A', 'B', 'check'])
    mode = parser.parse_args().mode
    if mode == 'check':
        print(json.dumps(load_state(), ensure_ascii=False, indent=2))
        print('这里只统计已保存条目，不自动判定落盘、回位或无碰撞合格。')
        return
    record_plan = None
    if mode != 'reach':
        state = load_state()
        record_plan = plan(mode, state)
        print('当前已保存：' + json.dumps(state['counts'], ensure_ascii=False), flush=True)
        if record_plan['additional_episodes'] == 0:
            print('本任务样片已录够；不启动机械臂，不重复追加。', flush=True)
            return
    preflight()
    args = command_for(mode, record_plan)
    if mode == 'reach':
        print('进入可达性验证，不录数据。先小幅跟随，再验证红→右、蓝→左；完成后放下方块、松爪、稳住臂，Ctrl+C退出。', flush=True)
    else:
        print('即将录制：' + json.dumps(record_plan, ensure_ascii=False), flush=True)
        print('不限时：落盘、回位、松爪后短按→。失败←重录，Esc提前停止。保存/编码期间保持主臂姿态。', flush=True)
        output = Path('/data/so101/outputs/dual-tray-sample-2026-11-09')
        output.mkdir(parents=True, exist_ok=True)
        (output / ('plan-' + mode + '-' + datetime.now().strftime('%Y%m%d-%H%M%S') + '.json')).write_text(
            json.dumps({'plan': record_plan, 'argv': args}, ensure_ascii=False, indent=2))
    # Replace this process so normal Ctrl+C and LeRobot's own cleanup behave as before.
    os.execv(args[0], args)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print('未启动或已停止：' + str(error), file=sys.stderr)
        sys.exit(1)
