#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Text Preprocessing and Cleaning Advanced Pipeline
Description: Standardizes and cleans raw text input from social media streams, removing
             noise such as emojis, URLs, HTML tags, and filtering stopwords.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import sys
import re
import string
import pandas as pd
from typing import List, Dict, Any, Optional

# Set console output encoding to UTF-8 to prevent UnicodeEncodeError on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class TextCleaner:
    """
    A professional-grade text cleaning utility for preprocessing social media comments.
    Supports basic normalization, URL/emoji removal, and stopword filtering.
    """
    def __init__(self, remove_stopwords: bool = True, custom_stopwords: Optional[List[str]] = None, normalize_spelling: bool = True):
        self.should_remove_stopwords = remove_stopwords
        self.normalize_spelling = normalize_spelling
        self.processed_count = 0
        
        # Core English and common Hinglish/Romanized Hindi stopwords
        self.stopwords = {
            "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
            "he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their", "theirs", 
            "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
            "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", 
            "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", 
            "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during",
            # Hinglish standard stopwords
            "hai", "hye", "aur", "ko", "ki", "ka", "ke", "se", "pe", "par", "mein", "hi", "bhi", 
            "ya", "toh", "tha", "thi", "the", "ho", "raha", "rahi", "rahe", "kar", "karta", "karke",
            "mera", "meri", "mere", "tu", "tum", "aap", "unka", "unki", "usne", "unhone"
        }
        
        if custom_stopwords:
            self.stopwords.update([word.lower() for word in custom_stopwords])

        # Compiled Regex patterns for performance
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.html_pattern = re.compile(r'<.*?>')
        self.emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
        self.mention_pattern = re.compile(r'@\w+')
        self.hashtag_pattern = re.compile(r'#\w+')

    def get_status(self) -> Dict[str, Any]:
        """Returns the current operational status of the cleaner."""
        return {
            "stopwords_enabled": self.should_remove_stopwords,
            "spelling_normalization": self.normalize_spelling,
            "total_stopwords": len(self.stopwords),
            "documents_processed": self.processed_count
        }

    def remove_urls(self, text: str) -> str:
        """Removes HTTP, HTTPS, and WWW URLs from the text using regular expressions."""
        try:
            return self.url_pattern.sub('', text)
        except TypeError:
            return ""

    def remove_html_tags(self, text: str) -> str:
        """Removes basic HTML formatting tags."""
        return self.html_pattern.sub('', text)

    def remove_emojis(self, text: str) -> str:
        """Removes unicode emojis and icons from text."""
        return self.emoji_pattern.sub('', text)
        
    def remove_mentions_and_hashtags(self, text: str, keep_hashtags: bool = False) -> str:
        """Removes user mentions (@user) and optionally hashtags (#topic)."""
        text = self.mention_pattern.sub('', text)
        if not keep_hashtags:
            text = self.hashtag_pattern.sub('', text)
        return text

    def clean_special_characters(self, text: str) -> str:
        """Removes punctuation and special characters, keeping letters and spaces."""
        text = text.replace('“', '"').replace('”', '"').replace('’', "'")
        text = text.replace('\n', ' ').replace('\t', ' ')
        cleaned = re.sub(r"[^a-zA-Z\s']", "", text)
        return cleaned

    def normalize_repeated_characters(self, text: str) -> str:
        """Normalizes elongated words. Example: 'looooool' -> 'lol'."""
        if not self.normalize_spelling:
            return text
        return re.sub(r'(.)\1{2,}', r'\1', text)

    def tokenize(self, text: str) -> List[str]:
        """Tokenizes cleaned text into lowercase word tokens."""
        return text.lower().split()

    def filter_stopwords(self, tokens: List[str]) -> List[str]:
        """Filters out defined English and Hinglish stopwords."""
        if not self.should_remove_stopwords:
            return tokens
        return [token for token in tokens if token not in self.stopwords]

    def clean_text(self, text: str) -> str:
        """
        Executes the entire sequential cleaning pipeline on a raw text string.
        """
        if not isinstance(text, str):
            return ""
            
        text = self.remove_urls(text)
        text = self.remove_html_tags(text)
        text = self.remove_emojis(text)
        text = self.remove_mentions_and_hashtags(text, keep_hashtags=False)
        text = self.clean_special_characters(text)
        text = self.normalize_repeated_characters(text)
        
        tokens = self.tokenize(text)
        filtered_tokens = self.filter_stopwords(tokens)
        final_text = " ".join(filtered_tokens).strip()
        self.processed_count += 1
        
        return final_text

    def clean_batch(self, texts: List[str]) -> List[str]:
        """Processes a large batch of strings."""
        return [self.clean_text(text) for text in texts]

# Self-contained testing module
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Preprocessing Pipeline Demonstration")
    print("="*60)
    
    cleaner = TextCleaner(remove_stopwords=True, normalize_spelling=True)
    
    print("\n[System Status]:")
    for k, v in cleaner.get_status().items():
        print(f" - {k}: {v}")
    
    sample_comments = [
        "Go to hell! You are a looooser! 😡😡 https://example.com/hate",
        "Hey guys, click here to see my new vlog: www.vlog.com @influencer",
        "Tum bilkul bekar ho... kuch nahi aata tumko! 😂 #trash",
        "You are sooooooo stupid, get off this platform! @User123"
    ]
    
    print("\n[Executing Cleaning Pipeline on Raw Samples]:")
    for i, comment in enumerate(sample_comments, 1):
        print(f"\n[Raw Sample {i}] : {comment}")
        cleaned = cleaner.clean_text(comment)
        print(f"[Cleaned]      : {cleaned}")
        
    print("\n" + "="*60)
    print("Pipeline Execution Complete.")
