import requests
import json

# Test achievements endpoint
def test_achievements():
    base_url = "http://localhost:8000"
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJka2RrdWx1bEBnbWFpbC5jb20iLCJleHAiOjE3NTE4NDcyMDIsInR5cGUiOiJhY2Nlc3MifQ.rhlqxY8KNi4VCspXbd6RBELG-h6nsGFoMIKD4CYu9HQ"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test achievements list
    print("Testing /api/v1/achievements/")
    try:
        response = requests.get(f"{base_url}/api/v1/achievements/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test unlocked achievements
    print("Testing /api/v1/achievements/unlocked")
    try:
        response = requests.get(f"{base_url}/api/v1/achievements/unlocked", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test user level
    print("Testing /api/v1/achievements/user/level")
    try:
        response = requests.get(f"{base_url}/api/v1/achievements/user/level", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_achievements() 