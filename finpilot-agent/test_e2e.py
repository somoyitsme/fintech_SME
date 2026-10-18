#!/usr/bin/env python3
"""
Quick end-to-end test to verify FinPilot agent works.
Run this after: python seed.py && python main.py
"""
import requests
import sys
import json

BASE_URL = "http://localhost:8100"

def test_health():
    """Test if server is running."""
    try:
        res = requests.get(f"{BASE_URL}/health", timeout=5)
        if res.status_code == 200:
            print("✅ Server is healthy")
            return True
        else:
            print(f"❌ Server returned {res.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not reachable: {e}")
        return False

def test_api_key(api_key):
    """Test if API key works."""
    try:
        res = requests.get(
            f"{BASE_URL}/api/v1/admin/tenants/me",
            headers={"X-API-Key": api_key},
            timeout=5
        )
        if res.status_code == 200:
            data = res.json()
            print(f"✅ API key valid for tenant: {data['name']}")
            return True
        else:
            print(f"❌ API key rejected: {res.status_code} - {res.text[:100]}")
            return False
    except Exception as e:
        print(f"❌ API key test failed: {e}")
        return False

def test_chat(api_key):
    """Test chat endpoint with real query."""
    try:
        res = requests.post(
            f"{BASE_URL}/api/v1/chat",
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json"
            },
            json={"message": "How is my cash flow?"},
            timeout=15
        )
        if res.status_code == 200:
            data = res.json()
            print("✅ Chat API works")
            print(f"   Pillar: {data.get('pillar')}")
            print(f"   Tools used: {data.get('tools_used')}")
            print(f"   Response length: {len(data.get('response', ''))} chars")
            print("\n--- Response Preview ---")
            print(data.get('response', '')[:500])
            print("---\n")
            return True
        else:
            print(f"❌ Chat failed: {res.status_code} - {res.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        return False

def test_streaming(api_key):
    """Test SSE streaming endpoint."""
    try:
        print("Testing SSE streaming (watch for status events)...")
        res = requests.post(
            f"{BASE_URL}/api/v1/chat/stream",
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json"
            },
            json={"message": "Calculate my runway"},
            stream=True,
            timeout=15
        )
        if res.status_code == 200:
            events = []
            for line in res.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        event = json.loads(line[6:])
                        events.append(event)
                        if event['type'] == 'status':
                            print(f"   📡 {event['message']}")

            if events:
                print(f"✅ Streaming works ({len(events)} events)")
                return True
            else:
                print("⚠️  Streaming returned no events")
                return True  # Not critical
        else:
            print(f"❌ Streaming failed: {res.status_code}")
            return False
    except Exception as e:
        print(f"❌ Streaming test failed: {e}")
        return False  # Not critical

def main():
    """Run all tests."""
    print("=" * 60)
    print("FinPilot Agent - End-to-End Test")
    print("=" * 60)
    print()

    # Get API key from user
    print("Enter your API key from seed.py output:")
    print("Example: fp_live_f407b24b5fcf1fc17c717429793a9ca4")
    api_key = input("\nAPI Key: ").strip()

    if not api_key:
        print("❌ No API key provided")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Running tests...")
    print("=" * 60 + "\n")

    results = []

    # Test 1: Health
    results.append(("Health Check", test_health()))
    print()

    # Test 2: API Key
    results.append(("API Key Validation", test_api_key(api_key)))
    print()

    # Test 3: Chat
    results.append(("Chat API", test_chat(api_key)))
    print()

    # Test 4: Streaming (optional)
    print("Optional: Testing SSE streaming...")
    test_streaming(api_key)
    print()

    # Summary
    print("=" * 60)
    print("Test Results Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {name}")

    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Your agent is working correctly.")
        print("\nNext steps:")
        print("1. Open demo: http://localhost:8100/sdk/demo-host.html")
        print("2. Open admin: http://localhost:8100/sdk/admin.html")
        print("3. Embed in your site (see IMPLEMENTATION_GUIDE.md)")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check output above for details.")
        print("\nTroubleshooting:")
        print("- Make sure server is running: python main.py")
        print("- Verify API key is correct (re-run seed.py if needed)")
        print("- Check .env for ANTHROPIC_API_KEY (optional)")
        sys.exit(1)

if __name__ == "__main__":
    main()
