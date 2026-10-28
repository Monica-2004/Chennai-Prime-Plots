# -*- coding: utf-8 -*-
import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
artifact_dir = r"C:\Users\chand\.gemini\antigravity\brain\c42f9a33-7d59-42c5-9363-998307e7e802"

out_png = os.path.join(artifact_dir, "test_tall_split.png")
cmd = [
    chrome,
    "--headless=new",
    "--hide-scrollbars",
    "--window-size=1440,2400",
    "--virtual-time-budget=6000",
    f"--screenshot={out_png}",
    "http://127.0.0.1:8080/chennai-plots.html?autovision=1&plot=plot-omr-01&mode=split"
]
subprocess.run(cmd, capture_output=True, text=True)
print("Saved:", os.path.exists(out_png), os.path.getsize(out_png) if os.path.exists(out_png) else 0)
