# Check existing users and databases
import subprocess

result = subprocess.run([
    "C:/Program Files/PostgreSQL/18/bin/psql",
    "-h", "127.0.0.1",
    "-p", "5433",
    "-U", "postgres",
    "-c", "\\du"
], capture_output=True, text=True)

print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)