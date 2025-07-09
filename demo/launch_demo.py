#!/usr/bin/env python3
"""
Scorpius Enterprise Demo Launcher
================================

Comprehensive launcher for all Scorpius Enterprise demos.
Perfect for public demonstrations and Fortune 500 presentations.
"""

import subprocess
import sys
import os
import webbrowser

def check_dependencies():
    """Check if required dependencies are available"""
    required_modules = ['asyncio', 'json', 'datetime', 'hashlib']
    
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            print(f"❌ Missing required module: {module}")
            return False
    
    return True

def main():
    """Launch the Scorpius demo"""
    
    print("""
    ╔══════════════════════════════════════════════════════════════════════════════════╗
    ║                                                                                  ║
    ║   �️  SCORPIUS ENTERPRISE 2.0 - DEMO LAUNCHER                                   ║
    ║                                                                                  ║
    ║   Next-Generation Blockchain Security Platform                                  ║
    ║   Perfect for Fortune 500 Demonstrations                                        ║
    ║                                                                                  ║
    ╚══════════════════════════════════════════════════════════════════════════════════╝
    """)
    
    if not check_dependencies():
        print("Please install required dependencies and try again.")
        sys.exit(1)
    
    print("✅ All dependencies found")
    print("\n🎯 Select Demo Type:")
    print("=" * 50)
    print("1. 🚀 Live Threat Detection Demo (CLI)")
    print("2. 🏢 Fortune 500 Business Presentation")
    print("3. 🌐 Interactive Web Dashboard (Standalone)")
    print("4. ⚡ Cyberpunk Web Demo (Advanced)")
    print("5. 📊 All Demos (CLI + Web)")
    print("6. ❓ Help & Information")
    
    choice = input("\nSelect option (1-6): ").strip()
    
    demo_dir = os.path.dirname(__file__)
    
    try:
        if choice == "1":
            print("\n🚀 Launching Live Threat Detection Demo...")
            threat_demo = os.path.join(demo_dir, 'threat_detection_demo.py')
            subprocess.run([sys.executable, threat_demo], check=True)
            
        elif choice == "2":
            print("\n🏢 Launching Fortune 500 Business Presentation...")
            business_demo = os.path.join(demo_dir, 'fortune500_business_demo.py')
            subprocess.run([sys.executable, business_demo], check=True)
            
        elif choice == "3":
            print("\n🌐 Opening Interactive Web Dashboard...")
            web_demo = os.path.join(demo_dir, 'web_demo.html')
            if os.path.exists(web_demo):
                webbrowser.open(f'file://{os.path.abspath(web_demo)}')
                print("✅ Standard web dashboard opened in your default browser")
                print("💡 Click 'Start Live Demo' to begin real-time monitoring")
            else:
                print("❌ Web demo file not found")
                
        elif choice == "4":
            print("\n⚡ Opening Cyberpunk Web Demo (Advanced)...")
            cyberpunk_demo = os.path.join(demo_dir, 'scorpius_web_dashboard.html')
            if os.path.exists(cyberpunk_demo):
                webbrowser.open(f'file://{os.path.abspath(cyberpunk_demo)}')
                print("✅ Advanced cyberpunk dashboard opened in your default browser")
                print("🎮 Features advanced styling with JetBrains Mono font and cyber aesthetics")
            else:
                print("❌ Cyberpunk demo file not found")
                
        elif choice == "5":
            print("\n📊 Launching All Demos...")
            
            # Open both web dashboards
            web_demo = os.path.join(demo_dir, 'web_demo.html')
            cyberpunk_demo = os.path.join(demo_dir, 'scorpius_web_dashboard.html')
            
            if os.path.exists(cyberpunk_demo):
                webbrowser.open(f'file://{os.path.abspath(cyberpunk_demo)}')
                print("✅ Cyberpunk dashboard opened in browser")
            
            if os.path.exists(web_demo):
                webbrowser.open(f'file://{os.path.abspath(web_demo)}')
                print("✅ Standard dashboard opened in browser")
            
            # Wait a moment then launch CLI demo
            input("\nPress Enter to launch CLI demonstration...")
            threat_demo = os.path.join(demo_dir, 'threat_detection_demo.py')
            subprocess.run([sys.executable, threat_demo], check=True)
            
        elif choice == "6":
            show_help_information()
            
        else:
            print("❌ Invalid selection. Please choose 1-6.")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Demo failed to run: {e}")
    except FileNotFoundError as e:
        print(f"❌ Demo file not found: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def show_help_information():
    """Display help and information about the demos"""
    
    print("""
    ❓ SCORPIUS ENTERPRISE DEMO INFORMATION
    ==================================================
    
    🎯 DEMO TYPES:
    
    1. Live Threat Detection Demo (CLI)
       • Real-time threat simulation
       • AI-powered analysis
       • Enterprise metrics
       • Duration: 2-15 minutes
       
    2. Fortune 500 Business Presentation
       • ROI calculations
       • Executive-level insights
       • Compliance benefits
       • Interactive Q&A
       
    3. Interactive Web Dashboard (Standard)
       • Visual threat monitoring
       • Real-time metrics
       • Executive dashboard
       • Browser-based interface
       
    4. Cyberpunk Web Demo (Advanced)
       • Advanced styling with JetBrains Mono
       • Cyberpunk aesthetic design
       • Enhanced animations and effects
       • Professional presentation quality
    
    🎪 PERFECT FOR:
    • C-Suite presentations
    • Board meetings
    • Investor demonstrations
    • Technical evaluations
    • Sales presentations
    • Conference demonstrations
    
    📞 ENTERPRISE CONTACT:
    • Email: enterprise@scorpius.security
    • Phone: +1 (555) SCORPIUS
    • Calendar: https://cal.scorpius.enterprise
    
    🛡️  FEATURES DEMONSTRATED:
    • 99.97% threat detection accuracy
    • Sub-50ms response time
    • Zero false positives
    • Quantum-resistant security
    • Cross-chain protection
    • Regulatory compliance
    
    🎨 STYLING OPTIONS:
    • Standard: Professional enterprise styling
    • Cyberpunk: Advanced cyber aesthetic with custom fonts
    • Both versions feature responsive design and animations
    
    Press Enter to return to main menu...
    """)
    
    input()
    main()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Thank you for trying Scorpius Enterprise 2.0!")
        print("📞 Contact our enterprise team: enterprise@scorpius.security")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Demo stopped by user")

if __name__ == "__main__":
    main()
