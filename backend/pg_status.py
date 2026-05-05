import subprocess

# Use pg_ctl to get status
result = subprocess.run([
    "C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe",
    "-D", "C:/Program Files/PostgreSQL/18/data",
    "status"
], capture_output=True, text=True, timeout=10)

print("Return code:", result.returncode)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)