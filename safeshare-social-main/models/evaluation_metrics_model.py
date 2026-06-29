#!/usr/bin/env python3
"""
Cyberbullying Detection Project - Research Module
Module: Model Evaluation Metrics & Reporting
Description: Compiles critical scientific evaluation metrics (Accuracy, Precision, 
             Recall, F1-Score, ROC-AUC) and generates formatted ASCII Confusion Matrices.
Author: Academic Research Group
Date: 2024
Version: 2.1
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Dict, List, Tuple, Any, Optional

# Set console output encoding to UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class ModelEvaluator:
    """Computes and formats classification metrics to assess cyberbullying models."""
    def __init__(self):
        self.metrics_history: Dict[str, Dict[str, float]] = {}

    def calculate_performance(self, y_true: List[int], y_pred: List[int], y_prob: Optional[List[float]] = None, run_name: str = "Model_Run") -> Dict[str, float]:
        """Calculates Accuracy, Precision, Recall, F1-Score, and conditionally ROC-AUC."""
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='binary', zero_division=0)
        recall = recall_score(y_true, y_pred, average='binary', zero_division=0)
        f1 = f1_score(y_true, y_pred, average='binary', zero_division=0)

        results = {
            "Accuracy": round(float(accuracy), 4),
            "Precision": round(float(precision), 4),
            "Recall": round(float(recall), 4),
            "F1-Score": round(float(f1), 4)
        }
        
        if y_prob is not None:
            try:
                auc = roc_auc_score(y_true, y_prob)
                results["ROC-AUC"] = round(float(auc), 4)
            except ValueError:
                results["ROC-AUC"] = 0.0
        
        self.metrics_history[run_name] = results
        return results

    def get_confusion_matrix(self, y_true: List[int], y_pred: List[int]) -> np.ndarray:
        """Computes confusion matrix coordinates."""
        return confusion_matrix(y_true, y_pred)

    def print_confusion_matrix_ascii(self, cm: np.ndarray, labels: List[str] = ["Clean", "Bullying"]):
        """Draws a clean terminal representation of the binary Confusion Matrix."""
        if cm.shape != (2, 2):
            print("ASCII printing currently optimized for 2x2 binary matrices.")
            print(cm)
            return
            
        tn, fp, fn, tp = cm.ravel()
        print("\n[Confusion Matrix Representation]")
        print(f"                 Predicted Class")
        print(f"                 {labels[0]:<9} {labels[1]}")
        print(f"Actual   {labels[0]:<7} TN: {tn:<5} FP: {fp:<5}")
        print(f"Class    {labels[1]:<7} FN: {fn:<5} TP: {tp:<5}")
        print("-" * 45)

    def compile_latex_table(self, run_name: str) -> str:
        """Generates LaTeX code for a structured table representing academic metrics."""
        if run_name not in self.metrics_history:
            raise KeyError(f"Run {run_name} metrics are not calculated yet.")
            
        metrics = self.metrics_history[run_name]
        
        latex_str = (
            "\\begin{table}[h]\n"
            "\\centering\n"
            "\\begin{tabular}{|l|c|}\n"
            "\\hline\n"
            f"\\textbf{{Metric}} & \\textbf{{Value ({run_name})}} \\\\\n"
            "\\hline\n"
            f"Accuracy & {metrics.get('Accuracy', 0):.4f} \\\\\n"
            f"Precision & {metrics.get('Precision', 0):.4f} \\\\\n"
            f"Recall & {metrics.get('Recall', 0):.4f} \\\\\n"
            f"F1-Score & {metrics.get('F1-Score', 0):.4f} \\\\\n"
        )
        if "ROC-AUC" in metrics:
            latex_str += f"ROC-AUC & {metrics['ROC-AUC']:.4f} \\\\\n"
            
        latex_str += (
            "\\hline\n"
            "\\end{tabular}\n"
            "\\caption{Performance Evaluation Matrix for Cyberbullying Detection}\n"
            "\\end{table}"
        )
        return latex_str

    def export_report_markdown(self, run_name: str, filepath: str = "evaluation_report.md"):
        """Exports the metrics to a readable Markdown report."""
        if run_name not in self.metrics_history:
            return
            
        metrics = self.metrics_history[run_name]
        md_content = f"# Model Evaluation Report: {run_name}\n\n## Core Metrics\n"
        for k, v in metrics.items():
            md_content += f"- **{k}**: {v}\n"
            
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(md_content)
        except Exception as e:
            print(f"Failed to write markdown: {e}")

    def export_history_json(self, filepath: str = "metrics_history.json"):
        """Dumps all recorded evaluation runs to JSON."""
        try:
            with open(filepath, 'w') as f:
                json.dump(self.metrics_history, f, indent=4)
        except Exception as e:
            print(f"Failed to write json: {e}")

# Standalone execution loop
if __name__ == "__main__":
    print("="*60)
    print("DEMO: Running Model Evaluation Metrics Pipeline")
    print("="*60)

    y_test_ground_truth =     [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0]
    y_test_bert_predictions = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0] 
    y_test_bert_probs =       [0.9, 0.1, 0.8, 0.2, 0.6, 0.4, 0.85, 0.1, 0.95, 0.2, 0.3, 0.1]

    evaluator = ModelEvaluator()
    metrics_summary = evaluator.calculate_performance(
        y_test_ground_truth, y_test_bert_predictions, y_prob=y_test_bert_probs, run_name="BERT_Base_Evaluation"
    )

    print("[Performance Metrics Scores]:")
    for metric, score in metrics_summary.items():
        print(f" - {metric:<12}: {score:.4f} ({(score*100):.2f}%)")

    cm = evaluator.get_confusion_matrix(y_test_ground_truth, y_test_bert_predictions)
    evaluator.print_confusion_matrix_ascii(cm)

    print("\n" + "="*60)
    print("[Generated LaTeX Code for Thesis Project Report]:\n")
    print(evaluator.compile_latex_table("BERT_Base_Evaluation"))
    
    evaluator.export_report_markdown("BERT_Base_Evaluation", "temp_report.md")
    evaluator.export_history_json("temp_history.json")
    
    if os.path.exists("temp_report.md"): os.remove("temp_report.md")
    if os.path.exists("temp_history.json"): os.remove("temp_history.json")

    print("\nModule Execution Complete.")
