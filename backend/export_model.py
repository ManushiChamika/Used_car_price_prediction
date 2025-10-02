"""
Train and export a production-ready model.pickle (.pkl) along with
feature schema (feature_columns.pkl). This script assumes you have a
cleaned dataset similar to cleaned_car.csv as produced in your notebooks.

Usage:
  python export_model.py --data ../cleaned_car.csv --target price_in_euro

This will create:
  - model.pkl
  - feature_columns.pkl
  - (optional) scaler.pkl if you use scaling
in the same directory as this script (backend/).
"""

import argparse
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--data', type=str, required=True, help='Path to cleaned CSV')
  parser.add_argument('--target', type=str, default='price_in_euro')
  args = parser.parse_args()

  df = pd.read_csv(args.data)
  if args.target not in df.columns:
    raise ValueError(f"Target column '{args.target}' not in dataset")

  # Drop non-numeric date-like columns that weren't encoded
  if 'registration_date' in df.columns and not np.issubdtype(df['registration_date'].dtype, np.number):
    df = df.drop(columns=['registration_date'])

  y = df[args.target]
  X = df.drop(columns=[args.target])

  # Keep only numeric columns (assumes dummies already created)
  X = X.select_dtypes(include=[np.number]).copy()

  # Impute any remaining missing numeric values
  imputer = SimpleImputer(strategy='median')
  X_imputed = imputer.fit_transform(X)

  X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

  model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
  model.fit(X_train, y_train)

  # Persist artifacts
  out_dir = os.path.dirname(os.path.abspath(__file__))
  joblib.dump(model, os.path.join(out_dir, 'model.pkl'))
  joblib.dump(list(X.columns), os.path.join(out_dir, 'feature_columns.pkl'))
  # Save imputer as scaler placeholder; backend will not use it directly now
  joblib.dump(imputer, os.path.join(out_dir, 'scaler.pkl'))

  print('Saved: model.pkl, feature_columns.pkl, scaler.pkl')


if __name__ == '__main__':
  main()


