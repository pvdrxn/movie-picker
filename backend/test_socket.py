import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)
try:
    sock.connect(('127.0.0.1', 5433))
    data = sock.recv(1024)
    print(f"Received: {data}")
    print(f"Hex: {data.hex()}")
    print(f"Decoded Latin-1: {data.decode('latin-1')}")
except Exception as e:
    print(f"Error: {e}")
finally:
    sock.close()