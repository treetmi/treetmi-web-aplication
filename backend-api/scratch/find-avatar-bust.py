import re

path = r'f:\Planning Project\streamplay-id\frontend-app\app\dashboard\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'avatarBust' in line:
        print(f"Line {i+1}: {line.strip()}")
