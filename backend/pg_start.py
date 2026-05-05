import subprocess

# Start PostgreSQL 18
result = subprocess.run([
    "C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe",
    "-D", "C:/Program Files/PostgreSQL/18/data",
    "-l", "C:/Program Files/PostgreSQL/18/data/log.txt",
    "start",
    "-W"
], capture_output=True, text=True, timeout=30)

print("Return code:", result.returncode)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)