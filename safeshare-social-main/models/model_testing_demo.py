#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Comprehensive Master Testing Demonstration
Description: Central execution coordinator that instantiates all 9 models in the pipeline
             to showcase the data flow from raw input string all the way through cleaning,
             TF-IDF vectorization, Deep Learning inference, and Behavioral analysis.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import sys
import numpy as np

# Robust encoding to bypass cp1252 Windows terminal crashes on emojis
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Import all academic architecture modules
from text_cleaning_model import TextCleaner
from feature_extraction_model import FeatureExtractor
from bert_cyberbullying_model import BERTResearchPipeline
from muril_multilingual_model import MuRILResearchPipeline
from hate_speech_detection_model import HateSpeechDetector
from sentiment_analysis_model import SentimentEmotionAnalyzer
from realtime_detection_model import RealTimeMonitor
from user_behavior_analysis_model import UserBehaviorAnalyzer
from evaluation_metrics_model import ModelEvaluator

class MasterPipelineDemo:
    """Coordinates and validates the entire 9-step cyberbullying detection architecture."""
    def __init__(self):
        print("="*80)
        print("          INITIALIZING CYBERBULLYING RESEARCH PIPELINE COORDINATOR")
        print("="*80)
        print("[System Check] Loading individual model architectures into RAM...")
        
        self.cleaner = TextCleaner()
        self.extractor = FeatureExtractor()
        
        self.hate_detector = HateSpeechDetector()
        self.setup_mock_training()
        
        self.sentiment_analyzer = SentimentEmotionAnalyzer()
        self.setup_sentiment_training()
        
        self.realtime_monitor = RealTimeMonitor()
        self.behavior_analyzer = UserBehaviorAnalyzer()
        self.evaluator = ModelEvaluator()
        
        try:
            self.bert_engine = BERTResearchPipeline()
            self.muril_engine = MuRILResearchPipeline()
        except Exception as e:
            print(f"[CRITICAL ERROR] Failed to load Deep Learning Transformers: {e}")
            sys.exit(1)
            
        print("[System Check] All models successfully loaded into coordinator memory.\n")

    def setup_mock_training(self):
        """Simulates dataset loading for the Hate Speech detector to function."""
        texts = ["good nice happy", "annoying but okay", "stupid loser garbage", "kill idiot"]
        labels = [0, 1, 2, 3] 
        self.hate_detector.train(texts, labels)
        
    def setup_sentiment_training(self):
        """Simulates dataset loading for the Sentiment & Emotion detector."""
        self.sentiment_analyzer.train_analyzers(
            s_texts=["bad", "okay", "good"], s_labels=[0, 1, 2],
            e_texts=["nothing", "happy", "mad", "crying", "scared"], e_labels=[0, 1, 2, 3, 4]
        )

    def execute_full_demonstration(self):
        """Runs the comprehensive 9-step visualization pipeline."""
        print("="*80)
        print("                 ACADEMIC NLP RESEARCH PIPELINE DASHBOARD")
        print("="*80)

        # STEP 1: Text Preprocessing
        print("\n[STEP 1: Text Preprocessing and Cleaning]")
        raw_msg = "Hey! Follow me @user1 https://link.com! You are a STUPID idiot. 😡"
        print(f" Raw Text    : {raw_msg}")
        cleaned_msg = self.cleaner.clean_text(raw_msg)
        print(f" Cleaned Text: {cleaned_msg}")

        # STEP 2: TF-IDF Feature Extraction
        print("\n[STEP 2: TF-IDF & Embeddings Vectorization]")
        mock_corpus = [cleaned_msg, "hello friend", "this is a test"]
        tfidf_matrix = self.extractor.fit_transform_tfidf(mock_corpus)
        print(f" Transformed Corpus shape: {tfidf_matrix.shape}")
        print(f" Sample Vector: {np.round(tfidf_matrix[0][:5], 4)}...")

        # STEP 3 & 4: Deep Learning Inference
        print("\n[STEP 3 & 4: Deep Learning Transformers Inference]")
        bert_verdict, bert_conf = self.bert_engine.predict_toxicity("You are completely brainless and ugly")
        print(f" BERT Predict (English): {bert_verdict} (Confidence: {bert_conf:.4f})")
        muril_res = self.muril_engine.evaluate_text("Tum bilkul nalayak aur bekar insaan ho")
        print(f" MuRIL Predict (Hinglish): {muril_res['prediction']} (Confidence: {muril_res['confidence']:.4f})")

        # STEP 5: ML Hate Speech Check
        print("\n[STEP 5: Multi-class Hate Speech & Toxicity Check]")
        hate_res = self.hate_detector.predict(cleaned_msg)
        print(f" ML Category: {hate_res['prediction']} (Prob: {hate_res['confidence']:.4f})")

        # STEP 6: Tone & Emotion Profiling
        print("\n[STEP 6: Tone & Emotion Profiling]")
        tone_res = self.sentiment_analyzer.full_assessment(cleaned_msg)
        print(f" Polarity: {tone_res['sentiment_polarity']} | Threat: {tone_res['calculated_threat_level']}")

        # STEP 7: Live Streaming Heuristics
        print("\n[STEP 7: Live Message Stream Simulation]")
        self.realtime_monitor.execute_live_monitor(stream_size=2)

        # STEP 8: Continuous Offender Tracking
        print("[STEP 8: Offender History Escalation Tracker]")
        self.behavior_analyzer.register_user_action("@toxic_user", "I hate you!", 0.90)
        report = self.behavior_analyzer.register_user_action("@toxic_user", "You are an idiot!", 0.85)
        print(f" User: {report['username']} | Warnings: {report['warnings_issued']} | Standing: {report['status_update']}")

        # STEP 9: Scientific Evaluation & Confusion Matrix
        print("\n[STEP 9: Academic Model Performance Reporting]")
        y_true = [0, 1, 0, 1, 1, 0]
        y_pred = [0, 1, 1, 1, 0, 0] 
        metrics = self.evaluator.calculate_performance(y_true, y_pred, run_name="Demo_Final")
        print(f" Accuracy: {metrics['Accuracy']:.4f} | F1-Score: {metrics['F1-Score']:.4f}")
        cm = self.evaluator.get_confusion_matrix(y_true, y_pred)
        self.evaluator.print_confusion_matrix_ascii(cm)
        
        print("================================================================================\n")
        print("PIPELINE TEST SUCCESSFUL: All layers integrated without errors.")

if __name__ == "__main__":
    try:
        demo = MasterPipelineDemo()
        demo.execute_full_demonstration()
    except Exception as e:
        print(f"FATAL ERROR IN PIPELINE DEMONSTRATION: {e}")
