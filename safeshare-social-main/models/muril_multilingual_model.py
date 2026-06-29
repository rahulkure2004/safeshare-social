#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: MuRIL Multilingual Classifier
Description: Evaluates Romanized Hinglish and regional Indian language text posts using
             the Multilingual Representation for Indian Languages (MuRIL) model.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import sys
import time
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
import numpy as np
from typing import Dict, Any

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def set_deterministic_seed(seed: int = 42):
    torch.manual_seed(seed)
    np.random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

class MuRILClassifier(nn.Module):
    """
    MuRIL (google/muril-base-cased) classification architecture.
    Fine-tuned to detect offensive intent in code-mixed languages.
    """
    def __init__(self, model_name: str = 'google/muril-base-cased', num_labels: int = 2, dropout_rate: float = 0.3):
        super(MuRILClassifier, self).__init__()
        self.muril = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout_rate)
        self.classifier = nn.Linear(self.muril.config.hidden_size, num_labels)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.muril(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        x = self.dropout(pooled_output)
        return self.classifier(x)

    def extract_embeddings(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """Utility function returning raw contextualized embeddings before classification."""
        with torch.no_grad():
            outputs = self.muril(input_ids=input_ids, attention_mask=attention_mask)
            return outputs.pooler_output

class MuRILResearchPipeline:
    """Wrapper pipeline to configure MuRIL tokenization and model inference."""
    def __init__(self, model_name: str = 'google/muril-base-cased'):
        set_deterministic_seed(42)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[MuRIL Engine] Loading model on device: {self.device}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = MuRILClassifier(model_name=model_name).to(self.device)

    def evaluate_text(self, text: str) -> Dict[str, Any]:
        """Tokenizes multilingual input and outputs cyberbullying status with latency profiling."""
        start_time = time.time()
        self.model.eval()
        
        inputs = self.tokenizer(
            text,
            max_length=64,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = inputs['input_ids'].to(self.device)
        attention_mask = inputs['attention_mask'].to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_ids, attention_mask)
            probs = torch.softmax(outputs, dim=1)
            prediction = torch.argmax(probs, dim=1).item()
            confidence = probs[0][prediction].item()

        latency_ms = (time.time() - start_time) * 1000
        labels = {0: "Clean / Neutral", 1: "Multilingual Cyberbullying"}
        
        return {
            "text": text,
            "prediction": labels[prediction],
            "confidence": round(confidence, 4),
            "latency_ms": round(latency_ms, 2)
        }

    def get_clustering_vector(self, text: str) -> np.ndarray:
        """Extracts the 768-dimensional feature vector for a specific phrase."""
        self.model.eval()
        inputs = self.tokenizer(text, return_tensors='pt', truncation=True, max_length=64)
        
        vec = self.model.extract_embeddings(
            inputs['input_ids'].to(self.device),
            inputs['attention_mask'].to(self.device)
        )
        return vec.cpu().numpy().flatten()

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running MuRIL Multilingual Cyberbullying Model")
    print("="*60)

    pipeline = MuRILResearchPipeline()
    
    multilingual_samples = [
        "Aap pagal ho kya? Dimaag kharab hai aapka 😡", 
        "Dhanyawad aapke is pyare sahyog ke liye",     
        "Tumhare jaise kutte ko yahan se nikal dena chahiye",
        "This is an amazing educational tutorial!"
    ]

    print("\n[Processing Multilingual/Hinglish Samples]:")
    for idx, sample in enumerate(multilingual_samples, 1):
        result = pipeline.evaluate_text(sample)
        print("\n" + "-"*50)
        print(f"Sample {idx}   : {result['text']}")
        print(f"Prediction : {result['prediction']}")
        print(f"Confidence : {result['confidence']:.4f}")
        print(f"Latency    : {result['latency_ms']} ms")
        
    print("\n[Extracting Internal Representations for Clustering]:")
    sample_phrase = "Bahut acha din hai"
    vector = pipeline.get_clustering_vector(sample_phrase)
    print(f"Phrase: '{sample_phrase}'")
    print(f"Vector Shape: {vector.shape}")
    print(f"Preview: {np.round(vector[:5], 4)}")

    print("\n" + "="*60)
    print("Module Execution Complete.")
