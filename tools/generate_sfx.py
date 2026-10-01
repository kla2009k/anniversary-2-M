"""Deterministic, original close-mic-style stereo Foley synthesis (48 kHz PCM)."""
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
OUT = Path(__file__).resolve().parents[1] / 'public' / 'sfx'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(20261002)

def noise(n, low=100, high=9000):
    src = rng.standard_normal(n)
    lo = max(30, low)
    hi = min(SR * .47, high)
    sos = butter(3, [lo, hi], btype='bandpass', fs=SR, output='sos')
    out = sosfilt(sos, src)
    return out / (np.max(np.abs(out)) + 1e-8)

def env(n, attack=.01, release=.15):
    a = max(1, int(attack * SR)); r = max(1, int(release * SR))
    e = np.ones(n)
    e[:min(a,n)] = np.linspace(0, 1, min(a,n))
    e[-min(r,n):] *= np.linspace(1, 0, min(r,n))
    return e

def mix(duration, layers):
    n = int(duration * SR)
    out = np.zeros((n,2), dtype=np.float64)
    for start, sound, gain, pan in layers:
        i = int(start * SR)
        if i >= n: continue
        sound = sound[:n-i]
        # mild stereo variation preserves a close, intimate center image
        left = np.sqrt((1-pan)/2); right = np.sqrt((1+pan)/2)
        out[i:i+len(sound),0] += sound * gain * left
        out[i:i+len(sound),1] += sound * gain * right
    # gentle saturation keeps rustles natural without digital clicks
    out = np.tanh(out * 1.25)
    peak = np.max(np.abs(out)) or 1
    out = out / peak * .74
    return np.int16(out * 32767)

def rustle(d, low=180, high=12000, pulses=4, attack=.018, release=.2):
    n = int(d*SR); t=np.arange(n)/SR
    modulation = np.zeros(n)
    for _ in range(pulses):
        center = rng.uniform(.05,d*.9)
        width = rng.uniform(.035,.13)
        modulation += np.exp(-.5*((t-center)/width)**2) * rng.uniform(.4,1)
    modulation /= max(modulation.max(),1e-8)
    return noise(n,low,high) * (modulation*.78+.08) * env(n,attack,release)

def tap(freq=180, d=.16, low=80, high=4500):
    n=int(d*SR); t=np.arange(n)/SR
    tonal=np.sin(2*np.pi*freq*t + .6*np.sin(2*np.pi*17*t)) * np.exp(-t*28)
    textured=noise(n,low,high)*np.exp(-t*44)
    return (tonal*.47+textured*.53)*env(n,.001,.03)

def metal(freq=820,d=.65):
    n=int(d*SR);t=np.arange(n)/SR
    v=np.sin(2*np.pi*freq*t)*np.exp(-t*7)
    v+=.28*np.sin(2*np.pi*freq*2.04*t)*np.exp(-t*11)
    v+=.12*np.sin(2*np.pi*freq*3.1*t)*np.exp(-t*16)
    return v*env(n,.002,.1)

sounds={
 'tape':(1.35,[(0,tap(90,.2,90,2200),.38,-.1),(.08,rustle(1.14,450,13500,9,.025,.28),.76,.17),(.32,rustle(.68,1500,14500,11),.45,-.22)]),
 'box':(1.28,[(0,rustle(.82,90,1900,5),.62,-.17),(.13,tap(120,.55,80,1500),.38,.12),(.66,tap(95,.28,60,2200),.4,.05)]),
 'pick':(.42,[(0,tap(250,.23,100,4600),.5,0),(.045,rustle(.22,700,6800,2),.25,.12)]),
 'put':(.46,[(0,tap(175,.28,80,3000),.44,-.06),(.06,rustle(.2,260,3500,2),.24,.09)]),
 'paper':(.88,[(0,rustle(.72,480,11500,5),.64,-.16),(.17,rustle(.54,1000,13500,4),.34,.25)]),
 'bracelet':(1.14,[(0,rustle(.48,300,4200,3),.35,-.12),(.12,metal(900,.62),.42,.12),(.37,metal(1240,.5),.29,-.23),(.59,metal(1020,.45),.19,.25)]),
 'pen':(1.28,[(0,rustle(.33,220,4400,2),.31,-.12),(.16,rustle(.81,900,14000,17,.01,.2),.6,.22),(.83,tap(310,.25,180,6500),.36,-.06)]),
 'book':(1.04,[(0,rustle(.77,600,13500,5),.63,-.2),(.2,rustle(.62,1000,12000,3),.37,.19),(.68,tap(200,.2,120,3400),.2,0)]),
 'dates':(.91,[(0,tap(130,.25,60,2800),.38,-.1),(.12,rustle(.62,180,4600,4),.56,.1),(.53,tap(175,.27,70,4000),.27,.16)]),
 'roti':(1.0,[(0,rustle(.6,1000,14500,7),.45,-.13),(.17,tap(530,.24,400,8000),.45,.18),(.38,rustle(.51,1300,15000,9),.45,-.04)]),
 'khaomao':(1.28,[(0,rustle(1.08,240,10500,11),.69,-.2),(.32,rustle(.7,700,13000,6),.34,.26),(.84,tap(185,.2,80,3300),.19,0)]),
 'redsnack':(1.05,[(0,rustle(.85,1100,15000,15),.67,-.14),(.27,rustle(.52,2000,17500,10),.39,.22),(.71,tap(420,.2,200,7300),.2,-.1)]),
 'berries':(1.11,[(0,rustle(.67,1200,14500,11),.58,-.16),(.32,tap(360,.22,170,6200),.22,.11),(.47,tap(490,.2,300,7400),.22,-.12),(.67,rustle(.35,900,9000,4),.28,.19)]),
 'chime':(1.5,[(0,metal(523,1.1),.35,-.12),(.16,metal(659,1.05),.32,.14),(.34,metal(784,.9),.27,0)]),
}
for name,(duration,layers) in sounds.items():
    path=OUT/f'{name}.wav'
    wavfile.write(path,SR,mix(duration,layers))
    print(name,path.stat().st_size)
