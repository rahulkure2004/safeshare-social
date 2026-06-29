#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: User Behavior Analysis and Offender Escalation
Description: Analyzes user comment history to compute rolling toxicity indexes,
             flagging repeated violators and executing escalation protocols.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class UserProfile:
    """Data structure representing a user profile's social history and moderation standing."""
    def __init__(self, username: str):
        self.username = username
        self.post_history: List[Dict[str, Any]] = []
        self.warning_count = 0
        self.status = "Active / Unrestricted"
        self.cumulative_toxicity = 0.0
        self.toxicity_variance = 0.0
        self.account_created = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def to_dict(self) -> Dict[str, Any]:
        """Serializes the profile for database export."""
        return {
            "username": self.username,
            "status": self.status,
            "warning_count": self.warning_count,
            "metrics": {
                "rolling_toxicity": self.cumulative_toxicity,
                "toxicity_variance": self.toxicity_variance
            },
            "history": self.post_history
        }

class UserBehaviorAnalyzer:
    """System module calculating toxicity indexes and issuing account restrictions."""
    def __init__(self, max_warnings: int = 3, rolling_window: int = 5, violation_threshold: float = 0.70):
        self.user_database: Dict[str, UserProfile] = {}
        self.max_warnings = max_warnings
        self.rolling_window = rolling_window 
        self.violation_threshold = violation_threshold

    def get_or_create_user(self, username: str) -> UserProfile:
        if username not in self.user_database:
            self.user_database[username] = UserProfile(username)
        return self.user_database[username]

    def register_user_action(self, username: str, comment: str, toxicity_score: float) -> Dict[str, Any]:
        """Appends comment to history, updates toxicity metrics, and calculates restrictions."""
        user = self.get_or_create_user(username)
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user.post_history.append({"timestamp": timestamp, "comment": comment, "score": toxicity_score})
        
        is_violation = toxicity_score >= self.violation_threshold
        if is_violation:
            user.warning_count += 1
            
        recent_posts = user.post_history[-self.rolling_window:]
        recent_scores = [post["score"] for post in recent_posts]
        
        user.cumulative_toxicity = float(np.mean(recent_scores))
        user.toxicity_variance = float(np.var(recent_scores)) if len(recent_scores) > 1 else 0.0
        
        old_status = user.status
        self._update_restriction_status(user)
        
        return {
            "username": username,
            "action_time": timestamp,
            "recent_score": toxicity_score,
            "rolling_avg_toxicity": round(user.cumulative_toxicity, 4),
            "warnings_issued": user.warning_count,
            "status_update": user.status,
            "status_escalated": old_status != user.status
        }

    def _update_restriction_status(self, user: UserProfile):
        """Escalates account restriction tiers based on flags and warning history."""
        if user.warning_count == 0:
            user.status = "Active / Unrestricted"
        elif user.warning_count == 1:
            user.status = "Formal Warning Issued"
        elif user.warning_count == 2:
            user.status = "Muted / Read-Only (24h)"
        elif user.warning_count == 3:
            user.status = "Temporary Suspension (7d)"
        else:
            user.status = "Permanent Account Ban"

    def apply_time_decay(self, username: str):
        """Simulates a 'good behavior' decay where warnings expire."""
        user = self.get_or_create_user(username)
        if user.warning_count > 0:
            user.warning_count = max(0, user.warning_count - 1)
            self._update_restriction_status(user)

    def fetch_offender_registry(self) -> List[Dict[str, Any]]:
        """Compiles a list of all users currently holding warning flags or bans."""
        registry = []
        for username, user in self.user_database.items():
            if user.warning_count > 0:
                registry.append({
                    "username": username,
                    "warnings": user.warning_count,
                    "rolling_avg": round(user.cumulative_toxicity, 4),
                    "moderation_tier": user.status
                })
        return registry

    def export_database_json(self, filepath: str = "user_behavior_db.json"):
        """Dumps all memory profiles to JSON for audit logs."""
        try:
            dump_data = {uname: profile.to_dict() for uname, profile in self.user_database.items()}
            with open(filepath, 'w') as f:
                json.dump(dump_data, f, indent=4)
        except Exception as e:
            print(f"[Storage] Failed to export database: {e}")

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running User Behavior & Escalation Analysis Module")
    print("="*60)
    
    analyzer = UserBehaviorAnalyzer(violation_threshold=0.75)
    
    moderation_stream = [
        ("@user_alice", "Hello! Great to be here.", 0.12),
        ("@user_bob", "Shut up, you are a stupid clown.", 0.88), 
        ("@user_charlie", "Can someone help me with this code?", 0.05),
        ("@user_bob", "Ugly loser, get off my feed.", 0.92),        
        ("@user_bob", "I hate you, you are absolute trash.", 0.95),  
        ("@user_bob", "Go to hell immediately! I will destroy you.", 0.98), 
        ("@user_dave", "This is an offensive post.", 0.76)         
    ]
    
    print("[Processing Simulated Moderation Stream]:")
    for user, msg, score in moderation_stream:
        log = analyzer.register_user_action(user, msg, score)
        print(f"\nUser: {log['username']:<15} | Score: {log['recent_score']}")
        print(f"  └─> Status: {log['status_update']}")
        if log['status_escalated']:
            print("  ⚠️  MODERATION STATUS ESCALATED! ⚠️")

    print("\n" + "="*60)
    print("                 ADMIN COMPLIANCE DASHBOARD")
    print("="*60)
    registry = analyzer.fetch_offender_registry()
    for row in registry:
        print(f"User: {row['username']:<14} | Flags: {row['warnings']} | Standing: {row['moderation_tier']}")
        
    export_path = "temp_behavior_db.json"
    analyzer.export_database_json(export_path)
    if os.path.exists(export_path):
        os.remove(export_path)
        
    print("\nModule Execution Complete.")
