#!C:\video-project\venv\Scripts\python.exe

import json
import sys
import os
import shutil
import argparse
sys.path.append(os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "lib"
))
from tgs.utils.linediff import difflines
from tgs.objects import Animation
from tgs.parsers.tgs import parse_tgs


parser = argparse.ArgumentParser(
    description="Shows a side-by-side diff of the human-readable rendition of two tgs / lottie files",
)
parser.add_argument(
    "file1",
    help="Left file"
)
parser.add_argument(
    "file2",
    help="Right file"
)

if __name__ == "__main__":
    ns = parser.parse_args()
    width = shutil.get_terminal_size((-1, -1)).columns
    if width < 10:
        width = None
    else:
        width = int((width - 3) / 2)
    a1 = parse_tgs(ns.file1)
    a2 = parse_tgs(ns.file2)
    difflines(a1, a2, width, width)
