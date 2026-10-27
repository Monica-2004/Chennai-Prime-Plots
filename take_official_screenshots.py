import subprocess
import os
import time

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
artifact_dir = r"C:\Users\chand\.gemini\antigravity\brain\db202e10-d3f5-4fc2-a5a2-2e795e33db3b"
os.makedirs(artifact_dir, exist_ok=True)

# 1. Desktop hero shot (1440x950)
hero_shot = os.path.join(artifact_dir, "desktop_hero_official.png")
cmd1 = [
    chrome,
    "--headless=new",
    "--hide-scrollbars",
    "--window-size=1440,950",
    f"--screenshot={hero_shot}",
    "http://127.0.0.1:8080/index.html"
]
p1 = subprocess.run(cmd1, capture_output=True, text=True)

# 2. Desktop properties shot with deed badges (1440x1100 scrolled down)
# We can use CDP or simple page load
# 3. Mobile hero shot (375x812)
mobile_shot = os.path.join(artifact_dir, "mobile_hero_official.png")
cmd2 = [
    chrome,
    "--headless=new",
    "--hide-scrollbars",
    "--window-size=375,812",
    f"--screenshot={mobile_shot}",
    "http://127.0.0.1:8080/index.html"
]
p2 = subprocess.run(cmd2, capture_output=True, text=True)

print("Hero shot:", os.path.exists(hero_shot), os.path.getsize(hero_shot) if os.path.exists(hero_shot) else 0)
print("Mobile shot:", os.path.exists(mobile_shot), os.path.getsize(mobile_shot) if os.path.exists(mobile_shot) else 0)
