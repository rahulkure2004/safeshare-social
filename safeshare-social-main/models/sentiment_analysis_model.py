#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Sentiment Polarity and Emotion Classifier
Description: Evaluates underlying emotional tone and polarity of social comments,
             utilizing Multinomial Naive Bayes classifiers to extract sentiment categories.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import sys
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from typing import Dict, List, Any, Tuple

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class SentimentEmotionAnalyzer:
    """
    A dual NLP analyzer executing sentiment polarity checks and 
    categorical emotion classification to detect cyberbullying contexts.
    """
    def __init__(self, max_vocab: int = 500):
        self.sentiment_vectorizer = TfidfVectorizer(
            max_features=max_vocab, stop_words='english', ngram_range=(1, 2)
        )
        self.sentiment_clf = MultinomialNB(alpha=1.0)
        self.sentiment_labels = {0: "Negative", 1: "Neutral", 2: "Positive"}
        
        self.emotion_vectorizer = TfidfVectorizer(
            max_features=max_vocab, stop_words='english', ngram_range=(1, 2)
        )
        self.emotion_clf = MultinomialNB(alpha=1.0)
        self.emotion_labels = {0: "Neutral", 1: "Joy", 2: "Anger", 3: "Sadness", 4: "Fear"}
        self.is_fitted = False

    def train_analyzers(self, s_texts: List[str], s_labels: List[int], e_texts: List[str], e_labels: List[int]) -> 'SentimentEmotionAnalyzer':
        """Trains both classifiers using academic test training splits."""
        print("[Sentiment Engine] Fitting Polarity Classification Pipeline...")
        s_vec = self.sentiment_vectorizer.fit_transform(s_texts)
        self.sentiment_clf.fit(s_vec, s_labels)
        
        print("[Sentiment Engine] Fitting Emotional State Pipeline...")
        e_vec = self.emotion_vectorizer.fit_transform(e_texts)
        self.emotion_clf.fit(e_vec, e_labels)
        
        self.is_fitted = True
        return self

    def analyze_sentiment(self, text: str) -> Tuple[str, float]:
        """Classifies text sentiment polarity."""
        if not self.is_fitted:
            raise RuntimeError("Models must be trained before performing sentiment analysis.")
        vec = self.sentiment_vectorizer.transform([text])
        probs = self.sentiment_clf.predict_proba(vec)[0]
        pred_idx = int(np.argmax(probs))
        return self.sentiment_labels[pred_idx], float(probs[pred_idx])

    def analyze_emotion(self, text: str) -> Tuple[str, float]:
        """Classifies text emotion."""
        if not self.is_fitted:
            raise RuntimeError("Models must be trained before performing emotion analysis.")
        vec = self.emotion_vectorizer.transform([text])
        probs = self.emotion_clf.predict_proba(vec)[0]
        pred_idx = int(np.argmax(probs))
        return self.emotion_labels[pred_idx], float(probs[pred_idx])

    def full_assessment(self, text: str) -> Dict[str, Any]:
        """Integrates sentiment and emotional outputs to formulate an offensive score warning."""
        sentiment, s_conf = self.analyze_sentiment(text)
        emotion, e_conf = self.analyze_emotion(text)
        
        threat_level = "Low"
        alert_flag = False
        
        if sentiment == "Negative":
            if emotion in ["Anger", "Fear"]:
                threat_level = "High"
                alert_flag = True
            elif emotion == "Sadness":
                threat_level = "Medium"
                alert_flag = True
        elif sentiment == "Neutral" and emotion == "Anger":
            threat_level = "Medium"
            alert_flag = True
            
        return {
            "text": text,
            "sentiment_polarity": sentiment,
            "sentiment_confidence": round(s_conf, 4),
            "dominant_emotion": emotion,
            "emotion_confidence": round(e_conf, 4),
            "calculated_threat_level": threat_level,
            "trigger_alert": alert_flag
        }

    def batch_assessment(self, texts: List[str]) -> pd.DataFrame:
        """Processes a list of strings and returns a structured DataFrame."""
        return pd.DataFrame([self.full_assessment(text) for text in texts])

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running Sentiment & Emotion Analysis Module")
    print("="*60)

    s_texts = [
        "this is horrible and completely disgusting", 
        "i hate this so much it makes me sick",
        "normal day at school, quiet", 
        "outstanding work and excellent result", 
        "this is brilliant i love it completely"
    ]
    s_labels = [0, 0, 1, 2, 2] 

    e_texts = [
        "let us proceed with the scheduled program", 
        "this is wonderful news, thrilled",
        "i hate you, you make me so furious right now", 
        "i am so alone and crying in my room", 
        "i am scared, this is terrifying"
    ]
    e_labels = [0, 1, 2, 3, 4] 

    analyzer = SentimentEmotionAnalyzer()
    print("Loading Mock Datasets and configuring TF-IDF Hyperparameters...")
    analyzer.train_analyzers(s_texts, s_labels, e_texts, e_labels)

    evaluation_sentences = [
        "This project is absolutely brilliant, congratulations on finishing!",
        "You should shut your mouth, you are making me angry!",
        "Nobody cares about your opinions, stop crying."
    ]

    print("\n[Executing Individual Tone/Emotion Profiling]:")
    for sentence in evaluation_sentences:
        report = analyzer.full_assessment(sentence)
        print("\n" + "-"*50)
        print(f"Comment Text : '{report['text']}'")
        print(f"Polarity     : {report['sentiment_polarity']} (Conf: {report['sentiment_confidence']:.4f})")
        print(f"Emotion      : {report['dominant_emotion']} (Conf: {report['emotion_confidence']:.4f})")
        
        threat_color = "🔴" if report['calculated_threat_level'] == "High" else ("🟡" if report['calculated_threat_level'] == "Medium" else "🟢")
        print(f"Threat Level : {threat_color} {report['calculated_threat_level']}")

    print("\n[Executing Batch Processing into DataFrame]:")
    df_results = analyzer.batch_assessment(evaluation_sentences)
    print(df_results[['sentiment_polarity', 'dominant_emotion', 'calculated_threat_level']])

    print("\n" + "="*60)
    print("Module Execution Complete.")
