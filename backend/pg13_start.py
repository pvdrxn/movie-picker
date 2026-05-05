import subprocess
import os

# Try to start PostgreSQL 13 on port 5434
os.environ['PATH'] = r'C:\Program Files\PostgreSQL\13\bin;' + os.environ.get('PATH', '')

result = subprocess.run([
    "pg_ctl",
    "-D", "C:/Program Files/PostgreSQL/13/data",
    "start",
    "-l", "NUL"
], capture_output=True, text=True, timeout=30, shell=True)

print("Return code:", result.returncode)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)