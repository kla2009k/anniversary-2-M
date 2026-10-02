"""Fetch verified CC0 Freesound field recordings and cut short in-game Foley clips.

Requires requests, numpy, scipy and imageio_ffmpeg.  The credited source URLs are
recorded in README.md.  The clips remain real recordings, not synthesized audio.
"""
from pathlib import Path
import re
import subprocess
import requests
import numpy as np
from scipy.ndimage import uniform_filter1d
from imageio_ffmpeg import get_ffmpeg_exe

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'foley'
OUT.mkdir(exist_ok=True)
FFMPEG = get_ffmpeg_exe()
SR = 44100
SOURCES = {
    'tape': (405586, 2.3),
    'box': (235807, 2.5),
    'paper': (353125, 1.1),
    'wrapper': (536288, 1.7),
    'leaf': (377634, 1.8),
    'lid': (641210, 1.5),
    'jewelry': (655872, 1.6),
    'bag': (716928, 1.5),
}

for name, (sound_id, seconds) in SOURCES.items():
    page = requests.get(f'https://freesound.org/s/{sound_id}/', timeout=30)
    page.raise_for_status()
    if 'Creative Commons 0' not in page.text:
        raise RuntimeError(f'Sound {sound_id} is not confirmed CC0')
    found = re.search(r'https://cdn\.freesound\.org/previews/[^\" ]+-hq\.mp3', page.text)
    if not found:
        raise RuntimeError(f'No high-quality preview for sound {sound_id}')
    audio = requests.get(found.group(), timeout=60)
    audio.raise_for_status()
    decoded = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', 'pipe:0', '-ac', '2', '-ar', str(SR), '-f', 'f32le', 'pipe:1'],
                             input=audio.content, capture_output=True, check=True).stdout
    frames = np.frombuffer(decoded, dtype='<f4').reshape(-1, 2)
    length = min(len(frames), int(seconds * SR))
    # Find an active region without picking a single click at the expense of texture.
    mono = np.mean(frames ** 2, axis=1)
    energy = uniform_filter1d(mono[::441], size=max(1, int(length / 441)), mode='constant')
    center = int(np.argmax(energy)) * 441
    start = max(0, min(len(frames) - length, center - length // 2))
    clip = frames[start:start + length].copy()
    fade = min(int(.035 * SR), length // 4)
    clip[:fade] *= np.linspace(0, 1, fade)[:, None]
    clip[-fade:] *= np.linspace(1, 0, fade)[:, None]
    peak = np.max(np.abs(clip)) or 1
    clip *= min(3, .78 / peak)
    out = OUT / f'{name}.mp3'
    subprocess.run([FFMPEG, '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', 'pipe:0',
                    '-codec:a', 'libmp3lame', '-qscale:a', '3', str(out)], input=clip.astype('<f4').tobytes(), check=True)
    print(f'{name}: Freesound {sound_id}, {length / SR:.2f}s, {out.stat().st_size} bytes')
