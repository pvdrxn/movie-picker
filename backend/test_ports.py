import socket

def test_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    try:
        result = sock.connect_ex(('127.0.0.1', port))
        if result == 0:
            print(f"Port {port}: OPEN")
            # Try to receive some data
            sock.setblocking(False)
            try:
                data = sock.recv(100)
                print(f"  Data: {data}")
            except:
                print(f"  No data received")
        else:
            print(f"Port {port}: Connection error {result}")
    except socket.timeout:
        print(f"Port {port}: Timeout")
    except Exception as e:
        print(f"Port {port}: {e}")
    finally:
        sock.close()

test_port(5432)
test_port(5433)
test_port(5434)