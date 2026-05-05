import subprocess

# Get service info
result = subprocess.run([
    "powershell", "-Command",
    "Get-Service postgresql-x64-18 | Select-Object Name, Status, StartType"
], capture_output=True, text=True, timeout=10)

print("Service status:")
print(result.stdout)
print(result.stderr)