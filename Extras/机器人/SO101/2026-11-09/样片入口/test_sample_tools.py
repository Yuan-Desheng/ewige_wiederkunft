"""Hardware-free tests for sample counts, labels, resume and CLI construction."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import pandas as pd
import sample_tools as m


def state(a=0, b=0, exists=True):
    return {'exists': exists, 'counts': {'A': a, 'B': b}, 'episodes': [], 'frames': 0}


class Samples(unittest.TestCase):
    def fixture(self, root, labels):
        (root/'meta/episodes/chunk-000').mkdir(parents=True)
        (root/'data/chunk-000').mkdir(parents=True)
        mapping={label:i for i,label in enumerate(dict.fromkeys(labels))}
        tasks=pd.DataFrame({'task_index':list(mapping.values())}, index=list(mapping.keys()))
        tasks.to_parquet(root/'meta/tasks.parquet')
        pd.DataFrame({'episode_index':list(range(len(labels))), 'tasks':[[label] for label in labels], 'length':[2]*len(labels)}).to_parquet(root/'meta/episodes/chunk-000/file-000.parquet')
        pd.DataFrame({'episode_index':[i for i in range(len(labels)) for _ in range(2)], 'task_index':[mapping[label] for label in labels for _ in range(2)]}).to_parquet(root/'data/chunk-000/file-000.parquet')
        (root/'meta/info.json').write_text(json.dumps({'total_episodes':len(labels),'total_frames':2*len(labels),'fps':30,'robot_type':'so_follower'}))
    def test_new_a_records_three_without_resume(self):
        p=m.plan('A',state(exists=False));self.assertEqual(p['additional_episodes'],3);self.assertFalse(p['resume'])
    def test_b_rejected_before_a(self):
        with self.assertRaises(ValueError):m.plan('B',state(2))
    def test_resume_a_only_adds_missing_episode(self):
        p=m.plan('A',state(2));self.assertEqual(p['additional_episodes'],1);self.assertTrue(p['resume'])
    def test_resume_b_only_adds_missing_episode(self):
        p=m.plan('B',state(3,1));self.assertEqual(p['additional_episodes'],1);self.assertTrue(p['resume'])
    def test_full_targets_do_not_launch_hardware(self):
        for mode in ['A','B']:
            with patch.object(m,'load_state',return_value=state(3,2)),patch.object(m,'preflight') as pre,patch.object(m.os,'execv') as ex,patch('sys.argv',['sample_tools.py',mode]),contextlib.redirect_stdout(io.StringIO()):
                m.main();pre.assert_not_called();ex.assert_not_called()
    def test_overcount_rejected(self):
        with self.assertRaises(ValueError):m.plan('B',state(3,3))
    def test_cli_preserves_limits_unlimited_labels_and_resume(self):
        env={'F':'/test/follower','L':'/test/leader'}
        p=m.plan('B',state(3,1));args=m.command_for('B',p,env)
        for value in ['--robot.max_relative_target=10','--dataset.episode_time_s=inf','--dataset.num_episodes=1','--resume=true','--dataset.single_task=move_blue_to_left_tray','--dataset.fps=30','--dataset.push_to_hub=false']:
            self.assertIn(value,args)
        self.assertNotIn('--dataset.root=/data/so101/datasets/a_test',args)
    def test_reachability_command_never_records(self):
        args=m.command_for('reach',env={'F':'/test/follower','L':'/test/leader'})
        self.assertTrue(args[0].endswith('lerobot-teleoperate'))
        self.assertFalse(any(x.startswith('--dataset.') for x in args))
        self.assertIn('--robot.max_relative_target=10',args)
    def test_real_parquet_mapping_counts_both_tasks(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root,[m.LABELS['A']]*3+[m.LABELS['B']]*2)
            actual=m.load_state(root);self.assertEqual(actual['counts'],{'A':3,'B':2});self.assertEqual(actual['frames'],10)
    def test_unknown_task_label_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root,['Pick up the cube and place it in the box'])
            with self.assertRaises(ValueError):m.load_state(root)
    def test_inconsistent_frame_count_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root,[m.LABELS['A']])
            p=root/'meta/info.json';d=json.loads(p.read_text());d['total_frames']=3;p.write_text(json.dumps(d))
            with self.assertRaises(ValueError):m.load_state(root)
    def test_frame_label_mismatch_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root,[m.LABELS['A'],m.LABELS['B']])
            p=root/'data/chunk-000/file-000.parquet';df=pd.read_parquet(p);df.loc[0,'task_index']=1;df.to_parquet(p)
            with self.assertRaises(ValueError):m.load_state(root)


if __name__=='__main__':
    unittest.main(verbosity=2)
