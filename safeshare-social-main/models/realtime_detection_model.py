#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Real-time Message Stream Monitor
Description: Simulates a high-frequency real-time text monitoring pipeline for web 
             applications, streaming comments and executing rapid keyword/length heuristics.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import sys
import time
import json
import random
from datetime import datetime
from typing import Dict, List, Generator, Any

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class RealTimeMonitor:
    """
    Simulates a microservice interface listening to live API streams.
    Flags toxic social media posts in real-time based on high-performance heuristics.
    """
    def __init__(self, warning_threshold: float = 0.50, critical_threshold: float = 0.75):
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold
        
        self.high_risk_keywords = {
            "loser", "idiot", "garbage", "trash", "stupid", "hate", 
            "ugly", "dumb", "moron", "useless", "kill", "die", "shut"
        }
        
        self.flagged_count = 0
        self.total_processed = 0
        self.session_logs: List[Dict[str, Any]] = []

    def get_system_health(self) -> Dict[str, Any]:
        """Returns the current operational health of the monitoring microservice."""
        return {
            "status": "ONLINE",
            "warning_limit": self.warning_threshold,
            "critical_limit": self.critical_threshold,
            "processed_since_boot": self.total_processed
        }

    def mock_toxicity_scorer(self, text: str) -> float:
        """Calculates a fast score (0.0 to 1.0) using uppercase ratio and high-risk token count."""
        words = text.lower().split()
        if not words:
            return 0.0
            
        match_count = sum(1 for word in words if word in self.high_risk_keywords)
        keyword_factor = min(match_count * 0.35, 0.70)
        
        caps_letters = sum(1 for c in text if c.isupper())
        total_letters = sum(1 for c in text if c.isalpha())
        caps_factor = (caps_letters / total_letters) * 0.25 if total_letters > 0 else 0.0
        
        random_factor = random.uniform(0.01, 0.05)
        return round(min(keyword_factor + caps_factor + random_factor, 1.0), 4)

    def comment_stream_generator(self, num_comments: int = 5) -> Generator[Dict[str, Any], None, None]:
        """Generator function simulating continuous messages coming from web client connections."""
        usernames = ["@alpha_coder", "@hater_99", "@sunny_day", "@troll_king", "@moderator"]
        mock_messages = [
            "Good morning! Loving this sunshine.",
            "You are a stupid loser and nobody likes you here!!!",
            "This project explanation is quite clear.",
            "SHUT UP YOU TRASH TALKER! GET OUT!",
            "What a wonderful piece of code!"
        ]
        
        for i in range(min(num_comments, len(mock_messages))):
            lag = random.uniform(0.2, 0.8)
            time.sleep(lag) 
            
            yield {
                "message_id": 1000 + i,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "user": usernames[i],
                "message": mock_messages[i],
                "network_lag_ms": round(lag * 1000, 2)
            }

    def execute_live_monitor(self, stream_size: int = 5) -> List[Dict[str, Any]]:
        """Iterates over the generator stream, runs fast evaluations, and records warning flags."""
        self.flagged_count = 0
        self.total_processed = 0
        self.session_logs = []
        
        print("\n[STREAMING STARTED] Listening to API WebSocket gateway...")
        for packet in self.comment_stream_generator(stream_size):
            self.total_processed += 1
            
            score = self.mock_toxicity_scorer(packet["message"])
            status = "CLEAN"
            
            if score >= self.critical_threshold:
                status = "CRITICAL / FLAG"
                self.flagged_count += 1
            elif score >= self.warning_threshold:
                status = "WARNING"
                self.flagged_count += 1
                
            log_entry = {**packet, "toxicity_score": score, "classification_status": status}
            self.session_logs.append(log_entry)
            
            print(f"[{packet['timestamp']}] 📡 Msg ID: {packet['message_id']} | User: {packet['user']}")
            print(f"  ├─ Msg : \"{packet['message']}\"")
            print(f"  └─ Eval: Score: {score:.4f} | Status: [{status}] | Lag: {packet['network_lag_ms']}ms\n")
            
        return self.session_logs

    def generate_moderation_report(self) -> Dict[str, Any]:
        """Summarizes stream diagnostics for administrative dashboards."""
        total = self.total_processed
        if total == 0:
            return {"status": "No data processed"}
            
        avg_tox = sum(x["toxicity_score"] for x in self.session_logs) / total
        max_tox = max(x["toxicity_score"] for x in self.session_logs)
        
        return {
            "total_messages_processed": total,
            "total_violations_flagged": self.flagged_count,
            "average_stream_toxicity": round(avg_tox, 4),
            "peak_stream_toxicity": max_tox
        }

    def export_logs_to_json(self, filepath: str = "realtime_logs.json"):
        """Exports the session tracking logs to JSON for audit storage."""
        if not self.session_logs:
            return
        try:
            with open(filepath, 'w') as f:
                json.dump(self.session_logs, f, indent=4)
        except Exception as e:
            print(f"[Storage Error] Could not export logs: {e}")

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running Real-time Social Stream Monitor")
    print("="*60)
    
    monitor = RealTimeMonitor()
    
    print("\n[Connecting to message broker...]")
    logs = monitor.execute_live_monitor(stream_size=5)
    
    report = monitor.generate_moderation_report()
    print("="*60)
    print("                 STREAM DIAGNOSTICS & MODERATION REPORT")
    print("="*60)
    for key, val in report.items():
        print(f"{key.replace('_', ' ').title():<30}: {val}")
        
    print("\n[Executing Audit Logging]:")
    export_path = "temp_stream_audit.json"
    monitor.export_logs_to_json(export_path)
    
    if os.path.exists(export_path):
        os.remove(export_path)
        
    print("="*60)
    print("Module Execution Complete.")
