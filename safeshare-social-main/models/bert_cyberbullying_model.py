#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: BERT Cyberbullying Deep Learning Classifier
Description: Academic implementation of a state-of-the-art transformer architecture 
             (BERT-base) fine-tuned for binary classification of online cyberbullying.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import sys
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertModel
import numpy as np
from typing import Dict, List, Tuple

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def set_random_seed(seed: int = 42):
    """Ensures absolute reproducibility across academic experiments."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

class CyberbullyingDataset(Dataset):
    """PyTorch Dataset class to represent and structure social media comments."""
    def __init__(self, texts: List[str], labels: List[int], tokenizer: BertTokenizer, max_len: int = 64):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, index: int) -> Dict[str, torch.Tensor]:
        text = str(self.texts[index])
        label = self.labels[index]
        
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        return {
            'text': text,
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }

class BERTCyberbullyingClassifier(nn.Module):
    """Integrates Pretrained BERT Model with a classification head."""
    def __init__(self, model_name: str = 'bert-base-uncased', dropout_val: float = 0.3, freeze_bert: bool = False):
        super(BERTCyberbullyingClassifier, self).__init__()
        self.bert = BertModel.from_pretrained(model_name)
        
        if freeze_bert:
            for param in self.bert.parameters():
                param.requires_grad = False
                
        self.dropout = nn.Dropout(dropout_val)
        self.out_layer = nn.Linear(self.bert.config.hidden_size, 2)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        output = self.dropout(pooled_output)
        return self.out_layer(output)

class BERTResearchPipeline:
    """Academic wrapper managing device checks and model predictions."""
    def __init__(self, model_name: str = 'bert-base-uncased', freeze_bert: bool = False):
        set_random_seed(42)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[BERT Engine] Initializing execution on device: {self.device}")
        
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.model = BERTCyberbullyingClassifier(model_name=model_name, freeze_bert=freeze_bert).to(self.device)

    def get_parameter_count(self) -> Dict[str, int]:
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        return {"Total Parameters": total_params, "Trainable Parameters": trainable_params}

    def predict_toxicity(self, text: str) -> Tuple[str, float]:
        """Runs inference on a text post to classify cyberbullying probability."""
        self.model.eval()
        inputs = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=64,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        input_ids = inputs['input_ids'].to(self.device)
        attention_mask = inputs['attention_mask'].to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_ids, attention_mask)
            probabilities = torch.softmax(outputs, dim=1)
            pred_class = torch.argmax(probabilities, dim=1).item()
            conf_score = probabilities[0][pred_class].item()
            
        return ("Clean" if pred_class == 0 else "Cyberbullying"), conf_score

    def save_model(self, path: str = "bert_cyberbullying_weights.pth"):
        try:
            torch.save(self.model.state_dict(), path)
            print(f"[BERT Engine] Model exported to {path}")
        except Exception as e:
            print(f"[BERT Engine] Failed to save model: {e}")

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running BERT Classifier Deep Learning Model")
    print("="*60)
    
    pipeline = BERTResearchPipeline(freeze_bert=True)
    
    print("\n[Model Architecture Analytics]:")
    for key, val in pipeline.get_parameter_count().items():
        print(f" - {key}: {val:,}")
    
    texts = ["You are garbage", "Congratulations!", "Stupid ugly fake account", "Let's meet tomorrow"]
    labels = [1, 0, 1, 0]
    
    dataset = CyberbullyingDataset(texts, labels, pipeline.tokenizer, max_len=32)
    loader = DataLoader(dataset, batch_size=2, shuffle=True)
    sample_batch = next(iter(loader))
    
    print("\n[Sample Tensors (Batch Size: 2)]:")
    print("Input IDs shape     :", sample_batch['input_ids'].shape)
    print("Attention Mask shape:", sample_batch['attention_mask'].shape)
    
    print("\n[Running Model Inference]:")
    for comment in texts[:2]:
        verdict, confidence = pipeline.predict_toxicity(comment)
        print(f"\nComment: '{comment}'")
        print(f"Verdict: {verdict} (Confidence: {confidence:.4f})")
    
    print("="*60)
    print("Module Execution Complete.")
