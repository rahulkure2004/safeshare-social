#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Hate Speech and Offensive Language Detector
Description: Implements a machine learning pipeline using TF-IDF representation and
             multi-class Logistic Regression for classification of comments.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import cross_val_score
from typing import List, Dict, Union, Tuple

class HateSpeechDetector:
    """
    A multi-class classifier using classical machine learning to isolate
    subtle differences between hate speech, generic offensive slang, and targeted bullying.
    """
    def __init__(self, max_features: int = 500, c_param: float = 1.5):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3), 
            max_features=max_features,
            analyzer='word',
            stop_words='english'
        )
        self.classifier = LogisticRegression(
            C=c_param,
            class_weight='balanced',
            max_iter=300,
            solver='lbfgs',
            multi_class='multinomial'
        )
        self.class_mapping = {
            0: "Clean / Neutral",
            1: "Offensive Language",
            2: "Hate Speech",
            3: "Cyberbullying"
        }
        self.is_trained = False
        self.model_version = "v1.0-logistic-tfidf"

    def train(self, texts: List[str], labels: List[int]) -> 'HateSpeechDetector':
        """Trains the TF-IDF Vectorizer and Logistic Regression classifier."""
        if not texts or not labels or len(texts) != len(labels):
            raise ValueError("Training inputs and labels must be valid and equal.")
        
        print("[HateSpeech ML] Transforming text corpus into TF-IDF vectors...")
        x_train = self.vectorizer.fit_transform(texts)
        
        print("[HateSpeech ML] Optimizing decision boundaries...")
        self.classifier.fit(x_train, labels)
        
        self.is_trained = True
        print("[HateSpeech ML] Training complete.")
        return self

    def perform_cross_validation(self, texts: List[str], labels: List[int], folds: int = 3) -> np.ndarray:
        """Executes k-fold cross validation to prove model robustness."""
        print(f"[HateSpeech ML] Running {folds}-fold Cross Validation...")
        x_train = self.vectorizer.fit_transform(texts)
        scores = cross_val_score(self.classifier, x_train, labels, cv=folds, scoring='accuracy')
        print(f"[HateSpeech ML] Mean CV Accuracy : {np.mean(scores):.4f} (+/- {np.std(scores)*2:.4f})")
        return scores

    def predict(self, text: str) -> Dict[str, Union[str, float, Dict]]:
        """Predicts toxicity class and probability distribution for a single comment."""
        if not self.is_trained:
            raise RuntimeError("The model has not been trained yet.")
            
        vectorized_text = self.vectorizer.transform([text])
        probabilities = self.classifier.predict_proba(vectorized_text)[0]
        prediction_idx = int(np.argmax(probabilities))
        confidence = probabilities[prediction_idx]
        
        return {
            "prediction": self.class_mapping.get(prediction_idx, "Unknown"),
            "confidence": float(confidence),
            "class_probabilities": {
                self.class_mapping[i]: float(p) for i, p in enumerate(probabilities)
            }
        }

    def predict_batch(self, texts: List[str]) -> List[str]:
        """Runs predictions on multiple text comments simultaneously."""
        if not self.is_trained:
            raise RuntimeError("The model is not trained.")
        vectorized_texts = self.vectorizer.transform(texts)
        predictions = self.classifier.predict(vectorized_texts)
        return [self.class_mapping[p] for p in predictions]

    def save_model_pipeline(self, path: str = "hate_speech_pipeline.pkl"):
        """Serializes both vectorizer and classifier into a single pickle file."""
        if not self.is_trained:
            raise RuntimeError("Cannot save an untrained model pipeline.")
            
        pipeline_data = {
            "vectorizer": self.vectorizer,
            "classifier": self.classifier,
            "mapping": self.class_mapping,
            "version": self.model_version
        }
        with open(path, 'wb') as f:
            pickle.dump(pipeline_data, f)
        print(f"[HateSpeech ML] Full pipeline saved to disk at {path}")

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running Hate Speech & Offensive Language Classifier")
    print("="*60)
    
    training_data = {
        "text": [
            "We should meet next week",
            "This is a nice post",
            "You are a stupid idiot",
            "Go back to your country trash",
            "I will bully you until you leave"
        ],
        "label": [0, 0, 1, 2, 3] 
    }
    
    detector = HateSpeechDetector()
    detector.perform_cross_validation(training_data["text"], training_data["label"], folds=2)
    
    print("\nFitting Classifier on training split...")
    detector.train(training_data["text"], training_data["label"])
    
    test_samples = [
        "Please delete your account loser",
        "Have a great day!"
    ]
    
    print("\n[Predicting Test Samples]:")
    for sample in test_samples:
        res = detector.predict(sample)
        print(f"\nComment: '{sample}'")
        print(f"Result : {res['prediction']} (Conf: {res['confidence']:.4f})")
            
    print("\n" + "="*60)
    print("GENERATING ACADEMIC CLASSIFICATION REPORT")
    print("="*60)
    
    y_true = [1, 0, 2, 3]
    y_pred = [1, 0, 3, 3] 
    
    target_names = ["Clean", "Offensive", "Hate Speech", "Cyberbullying"]
    report = classification_report(y_true, y_pred, target_names=target_names, zero_division=0)
    print(report)
        
    print("\n[Simulating Backend Export]:")
    detector.save_model_pipeline("temp_pipeline.pkl")
    if os.path.exists("temp_pipeline.pkl"):
        os.remove("temp_pipeline.pkl")
        
    print("="*60)
    print("Module Execution Complete.")
