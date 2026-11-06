#!/usr/bin/env python3
"""
System Time Check Utility
Helps diagnose clock skew issues with JWT authentication
"""

from datetime import datetime
import time
import sys

def check_system_time():
    """Check system time and compare with expected values."""
    
    print("=" * 60)
    print("SYSTEM TIME CHECK")
    print("=" * 60)
    print()
    
    # Get current times
    local_time = datetime.now()
    utc_time = datetime.utcnow()
    timestamp = time.time()
    
    print(f"Local Time:        {local_time.isoformat()}")
    print(f"UTC Time:          {utc_time.isoformat()}")
    print(f"Unix Timestamp:    {int(timestamp)}")
    print()
    
    # Calculate timezone offset
    tz_offset = (local_time - utc_time).total_seconds() / 3600
    print(f"Timezone Offset:   UTC{'+' if tz_offset >= 0 else ''}{tz_offset:.1f}")
    print()
    
    # Check for potential issues
    print("=" * 60)
    print("POTENTIAL ISSUES")
    print("=" * 60)
    print()
    
    issues_found = False
    
    # Check 1: Year should be current
    if local_time.year < 2024 or local_time.year > 2026:
        print("WARNING: System year seems incorrect!")
        print(f"   Current year: {local_time.year}")
        print(f"   Expected: 2024-2026")
        issues_found = True
    
    # Check 2: Time should be reasonably close to expected
    # (This is a basic check - in production you'd compare with NTP)
    if abs(tz_offset) > 14:  # Max timezone offset is ±12 (with DST ±14)
        print("WARNING: Timezone offset seems unusual!")
        print(f"   Offset: {tz_offset:.1f} hours")
        issues_found = True
    
    if not issues_found:
        print("[OK] No obvious time issues detected")
    
    print()
    print("=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    print()
    
    print("If you're experiencing clock skew errors:")
    print()
    print("1. Windows:")
    print("   - Open PowerShell as Administrator")
    print("   - Run: w32tm /resync")
    print("   - Run: w32tm /query /status")
    print()
    print("2. Linux:")
    print("   - Run: sudo ntpdate pool.ntp.org")
    print("   - Or: sudo systemctl restart systemd-timesyncd")
    print()
    print("3. Mac:")
    print("   - Run: sudo sntp -sS time.apple.com")
    print("   - Or: System Preferences > Date & Time > Set date and time automatically")
    print()
    print("4. Docker/VM:")
    print("   - Restart container/VM to sync with host clock")
    print("   - Check host machine clock first")
    print()
    
    # JWT-specific guidance
    print("=" * 60)
    print("JWT AUTHENTICATION")
    print("=" * 60)
    print()
    print("Current fix applied: 60-second leeway in token validation")
    print("This tolerates up to 60 seconds of clock drift.")
    print()
    print("If you still see 'token not yet valid' errors:")
    print("- Check backend/middleware/auth_middleware.py")
    print("- Look for 'leeway=60' parameter")
    print("- You can increase to 120 if needed (but fix clock sync!)")
    print()
    
    print("=" * 60)
    print()
    
    # Compare with a known time source (optional - requires internet)
    try:
        import requests
        print("Checking against internet time...")
        # Note: This is a simple check. In production, use NTP protocol
        response = requests.get('http://worldtimeapi.org/api/timezone/Etc/UTC', timeout=5)
        if response.ok:
            data = response.json()
            internet_time = datetime.fromisoformat(data['datetime'].replace('Z', '+00:00'))
            local_utc = datetime.now(datetime.timezone.utc).replace(tzinfo=None)
            diff = abs((internet_time - local_utc).total_seconds())
            
            print(f"   Internet UTC:  {internet_time.isoformat()}")
            print(f"   Your UTC:      {local_utc.isoformat()}")
            print(f"   Difference:    {diff:.2f} seconds")
            print()
            
            if diff > 60:
                print("   [!] WARNING: Your clock is off by more than 60 seconds!")
                print("   This WILL cause JWT authentication issues.")
                print("   Please sync your system clock immediately.")
            elif diff > 10:
                print("   [!] WARNING: Your clock is off by more than 10 seconds.")
                print("   This may cause occasional authentication issues.")
                print("   Consider syncing your system clock.")
            else:
                print("   [OK] Your clock is well synchronized!")
            print()
    except Exception as e:
        print(f"   [INFO] Could not check internet time: {e}")
        print()
    
    print("=" * 60)
    
    return 0 if not issues_found else 1


if __name__ == "__main__":
    sys.exit(check_system_time())

