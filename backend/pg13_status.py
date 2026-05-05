import subprocess

# Check PostgreSQL 13 status
result = subprocess.run([
    "C:/Program Files/PostgreSQL/13/bin/pg_ctl.exe",
    "-D", "C:/Program Files/PostgreSQL/13/data",
    "status"
], capture_output=True, text=True, timeout=10)

print("PG 13 Return code:", result.returncode)
print("PG 13 STDOUT:", result.stdout)
print("PG 13 STDERR:", result.stderr)