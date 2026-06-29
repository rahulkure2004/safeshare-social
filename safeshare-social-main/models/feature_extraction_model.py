#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Feature Extraction Advanced Model
Description: Converts cleaned text inputs into mathematical vectors using TF-IDF 
             representation and word embeddings. Prepares tensors for deep learning.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import json
import numpy as np
import pandas as pd
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Tuple, Union, Optional

class FeatureExtractor:
    """
    A comprehensive class for managing text feature extraction workflows, supporting
    classical sparse representations (TF-IDF with N-grams) and dense word embeddings.
    """
    def __init__(self, max_features: int = 500, ngram_range: Tuple[int, int] = (1, 2)):
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=self.max_features, 
            ngram_range=self.ngram_range,
            stop_words=None, 
            lowercase=True
        )
        self.vocabulary_: Dict[str, int] = {}
        self.is_fitted = False
        self.vectorizer_name = "Academic_TFIDF_Vectorizer"

    def get_config(self) -> Dict[str, Union[int, Tuple[int, int], bool, str]]:
        """Returns the initialization configuration of the extractor."""
        return {
            "max_features": self.max_features,
            "ngram_range": self.ngram_range,
            "is_fitted": self.is_fitted,
            "vocab_size": len(self.vocabulary_)
        }

    def fit_tfidf(self, corpus: List[str]) -> 'FeatureExtractor':
        """Fits the TF-IDF vectorizer on the academic training corpus."""
        if not corpus or len(corpus) == 0:
            raise ValueError("Corpus cannot be empty for fitting.")
            
        print(f"[{self.vectorizer_name}] Fitting TF-IDF on corpus of size {len(corpus)}...")
        self.tfidf_vectorizer.fit(corpus)
        self.vocabulary_ = self.tfidf_vectorizer.vocabulary_
        self.is_fitted = True
        return self

    def transform_tfidf(self, corpus: List[str]) -> np.ndarray:
        """Transforms text corpus into a sparse matrix and returns dense NumPy array."""
        if not self.is_fitted:
            raise RuntimeError("TF-IDF Vectorizer must be fitted before transforming.")
        sparse_matrix = self.tfidf_vectorizer.transform(corpus)
        return sparse_matrix.toarray()

    def fit_transform_tfidf(self, corpus: List[str]) -> np.ndarray:
        """Combines fit and transform operations efficiently."""
        self.fit_tfidf(corpus)
        return self.transform_tfidf(corpus)

    def generate_mock_word_embeddings(self, vocab: List[str], dim: int = 50) -> Dict[str, np.ndarray]:
        """Generates simulated pre-trained word embedding vectors for demonstration."""
        np.random.seed(42)
        embeddings_db = {}
        for word in vocab:
            vec = np.random.randn(dim)
            embeddings_db[word] = vec / np.linalg.norm(vec)
        return embeddings_db

    def text_to_average_embedding(self, text: str, embeddings_db: Dict[str, np.ndarray], dim: int = 50) -> np.ndarray:
        """Averages word embeddings for a text comment to generate a document vector."""
        tokens = text.lower().split()
        valid_vectors = [embeddings_db[token] for token in tokens if token in embeddings_db]
        
        if not valid_vectors:
            return np.zeros(dim)
        return np.mean(valid_vectors, axis=0)

    def convert_to_pytorch_tensor(self, feature_matrix: np.ndarray) -> torch.Tensor:
        """Converts extracted feature matrices into PyTorch float tensors."""
        try:
            tensor = torch.tensor(feature_matrix, dtype=torch.float32)
            return tensor
        except Exception as e:
            raise ValueError(f"Failed to convert matrix to Tensor. Error: {e}")

    def export_vocabulary(self, filepath: str = "tfidf_vocab.json"):
        """Exports the fitted vocabulary to a JSON file."""
        if not self.is_fitted:
            raise RuntimeError("Cannot export vocabulary. Vectorizer not fitted.")
        try:
            with open(filepath, 'w') as f:
                json.dump(self.vocabulary_, f, indent=4)
            print(f"[{self.vectorizer_name}] Vocabulary exported to {filepath}")
        except Exception as e:
            print(f"[{self.vectorizer_name}] Failed to export vocabulary: {e}")

# Standalone execution flow
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running Advanced Feature Extraction Module")
    print("="*60)
    
    academic_corpus = [
        "ugly loser go back to your country",
        "hello beautiful day ahead, love the weather",
        "please help yourself stupid idiot, nobody cares",
        "welcome back to the channel, please subscribe",
        "loser idiot dumb head, stop posting"
    ]
    
    extractor = FeatureExtractor(max_features=25, ngram_range=(1, 2))
    
    print("\n[Configuration]:")
    print(extractor.get_config())
    
    tfidf_features = extractor.fit_transform_tfidf(academic_corpus)
    
    print("\n[TF-IDF Feature Matrix Shape]:", tfidf_features.shape)
    print("Sample feature vector for document 0:")
    print(np.round(tfidf_features[0], 4))

    unique_words = list(extractor.vocabulary_.keys())
    mock_embeddings = extractor.generate_mock_word_embeddings(unique_words, dim=10)
    
    sample_text = "loser idiot welcome"
    mean_vec = extractor.text_to_average_embedding(sample_text, mock_embeddings, dim=10)
    print(f"\n[Dense Word Embedding Demo for text: '{sample_text}']:")
    print(np.round(mean_vec, 4))

    print("\n[PyTorch Integration Test]:")
    py_tensor = extractor.convert_to_pytorch_tensor(tfidf_features)
    print("Tensor Shape:", py_tensor.shape)
    
    print("="*60)
    print("Module Execution Complete.")
