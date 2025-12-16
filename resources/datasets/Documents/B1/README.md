# HALOS: Hierarchical Aggregation Learning for Overdensity Search

[![arXiv](https://img.shields.io/badge/arXiv-2XXX.XXXXX-b31b1b.svg)](https://arxiv.org/abs/XXXX.XXXXX)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)

A novel deep learning pipeline for efficient subhalo identification in cosmological simulations using hierarchical aggregation and density-based clustering.

## Overview

HALOS is a multi-stage deep learning framework that dramatically accelerates the identification of gravitationally bound substructures (subhalos) in cosmological N-body simulations. By combining multi-layer perceptrons (MLPs) with physically-informed clustering, HALOS achieves performance comparable to traditional methods like SUBFIND while reducing computational time by approximately **10×**.

### Key Features

- **Multi-stage Pipeline**: Decouples particle classification from instance segmentation
- **High Accuracy**: 95% semantic classification accuracy, >90% Adjusted Rand Index
- **Computational Efficiency**: ~10× faster than traditional FoF+SUBFIND approach
- **Physically-Informed Clustering**: Uses predicted centroids to enhance density peaks
- **GPU Acceleration**: Leverages parallel processing for rapid inference

## Architecture

The HALOS pipeline consists of four main stages:

```
Input Particles
    ↓
1. Preprocessing (KD-Tree + Feature Engineering)
    ↓
2. Binary Segmentation (MLP Classifier)
    ↓
3. Centroid Regression (MLP Regressor)
    ↓
4. Final Clustering (HDBSCAN)
    ↓
Output: Subhalo Catalog
```

### Pipeline Components

1. **Feature Engineering**: Constructs physically-motivated features using KD-tree for efficient neighbor searches
2. **Semantic Segmentation**: MLP classifier distinguishes bound particles from unbound background
3. **Centroid Regression**: MLP regressor predicts 3D coordinates of parent subhalo centroids
4. **Density-Based Clustering**: HDBSCAN performs instance segmentation on transformed particle coordinates

## Performance Metrics

| Metric | Value |
|--------|-------|
| Semantic Classification Accuracy | 95% |
| Adjusted Rand Index (ARI) | >90% |
| Completeness | 98.5% |
| Centroid Offset (Median) | <30 h⁻¹ kpc |
| Speedup vs FoF+SUBFIND | ~10× |
| CPU Time (10²⁴³ particles) | 27 CPU-hours |
| GPU Time (10²⁴³ particles) | 0.3 GPU-hours |

## Installation

### Requirements

- Python 3.8+
- PyTorch 2.0+
- NumPy
- SciPy
- scikit-learn
- HDBSCAN
- h5py (for data I/O)

### Setup

```bash
# Clone the repository
git clone https://github.com/koexai/halos.git
cd halos

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Data

### Input Format

HALOS processes particle snapshots from cosmological N-body simulations. The input data should include:

- Particle positions (x, y, z)
- Particle velocities (vx, vy, vz)
- Particle IDs

### Example Dataset

The repository includes a sample catalog (`catalog_sample.csv`) demonstrating the expected data structure:

```csv
ParticleID,x,y,z,vx,vy,vz,SubhaloID
0,123.45,67.89,234.56,150.2,-200.3,75.1,42
1,123.50,67.90,234.58,148.5,-198.7,76.3,42
...
```

### Training Data

The models are trained on catalogues generated from the DEMNUni (Dark Energy and Massive Neutrino Universe) cosmological simulations using SUBFIND as ground truth.

- **Simulation**: DEMNUni N-body
- **Particles**: 10²⁴³ particles
- **Volume**: 1 (h⁻¹ Gpc)³
- **Redshift**: z = 0
- **Ground Truth**: SUBFIND algorithm

## Usage

### Basic Usage

```python
import halos

# Load particle data
particles = halos.load_particles("path/to/snapshot.hdf5")

# Initialize HALOS pipeline
pipeline = halos.HALOSPipeline(
    n_partitions=64,
    classifier_path="models/classifier.pth",
    regressor_path="models/regressor.pth"
)

# Run subhalo identification
catalog = pipeline.run(particles)

# Save results
catalog.save("output/subhalo_catalog.hdf5")
```

### Advanced Configuration

```python
# Custom feature engineering
features = halos.FeatureEngineering(
    n_neighbors=32,
    include_density=True,
    include_velocity_dispersion=True,
    include_covariance=True
)

# Configure HDBSCAN clustering
clustering_params = {
    'min_cluster_size': 20,
    'min_samples': 10,
    'metric': 'euclidean'
}

pipeline = halos.HALOSPipeline(
    features=features,
    clustering_params=clustering_params
)
```

## Training Your Own Models

### 1. Prepare Training Data

```python
# Generate features from SUBFIND catalog
from halos.preprocessing import prepare_training_data

X_train, y_train = prepare_training_data(
    particle_snapshot="path/to/snapshot.hdf5",
    subfind_catalog="path/to/subfind_catalog.hdf5"
)
```

### 2. Train Classifier

```python
from halos.models import MLPClassifier

classifier = MLPClassifier(
    input_dim=feature_dim,
    hidden_dims=[256, 128, 64],
    dropout=0.2
)

classifier.train(X_train, y_train, epochs=100)
classifier.save("models/classifier.pth")
```

### 3. Train Regressor

```python
from halos.models import MLPRegressor

regressor = MLPRegressor(
    input_dim=feature_dim,
    output_dim=3,  # (x, y, z) centroid offset
    hidden_dims=[256, 128, 64]
)

regressor.train(X_train, centroids_train, epochs=100)
regressor.save("models/regressor.pth")
```

## Validation and Metrics

### Compute Performance Metrics

```python
from halos.evaluation import evaluate_catalog

metrics = evaluate_catalog(
    predicted_catalog=halos_catalog,
    ground_truth_catalog=subfind_catalog,
    min_mass=1.24e12  # h⁻¹ M☉
)

print(f"ARI: {metrics['ari']:.3f}")
print(f"Completeness: {metrics['completeness']:.3f}")
print(f"Median Centroid Offset: {metrics['centroid_offset_median']:.2f} kpc")
```

### Visualize Results

```python
from halos.visualization import plot_comparison

# Compare particle distributions
plot_comparison(
    halos_catalog,
    subfind_catalog,
    region=[200, 212, 34, 46]  # x_min, x_max, y_min, y_max
)

# Plot subhalo mass function
plot_mass_function(halos_catalog, subfind_catalog)
```

## Computational Requirements

### Minimum Requirements
- CPU: 16 cores
- RAM: 64 GB
- GPU: 8 GB VRAM (NVIDIA GPU with CUDA support)

### Recommended Setup (for 10²⁴³ particle simulation)
- CPU: 16+ cores
- RAM: 256 GB
- GPU: 2× GPUs with 16 GB VRAM each
- Storage: 500 GB for data and outputs

### Performance Benchmarks

| Simulation Size | Wall-Clock Time | CPU-Hours | GPU-Hours |
|----------------|-----------------|-----------|-----------|
| 10²⁴³ particles | ~2 hours | 27 | 0.3 |
| FoF+SUBFIND (comparison) | ~20 hours | 258 | 0 |

## Scientific Applications

HALOS is designed for:

- Large-scale cosmological survey analysis
- On-the-fly subhalo cataloging during simulation runtime
- Parameter inference from cosmic structure
- Galaxy formation and evolution studies
- Dark matter halo population statistics

## Citation

If you use HALOS in your research, please cite:

```bibtex
@article{spampinato2025halos,
  title={HALOS: Hierarchical Aggregation Learning for Overdensity Search},
  author={Spampinato, Fabio and Del Zoppo, Vincenzo and Puglisi, Giuseppe and 
          Mezzina, Alessio and Cataldo, Marco and Christille, Jean Marc and 
          Calabrese, Matteo and Naso, Luca and Carbone, Carmelita},
  journal={Astronomy \& Computing},
  year={2025},
  note={Submitted}
}
```

## Authors

**Koexai S.r.l. Team:**
- Fabio Spampinato
- Vincenzo Del Zoppo
- Giuseppe Puglisi
- Alessio Mezzina
- Marco Cataldo
- Luca Naso

**External Collaborators:**
- Jean Marc Christille (OAVdA)
- Matteo Calabrese (OAVdA, INAF-IASF Milano)
- Carmelita Carbone (INAF-IASF Milano)

## Acknowledgments

This work is supported by:
- Fondazione ICSC, Spoke3 Astrophysics and Cosmos Observations
- Italian Research Center on High-Performance Computing, Big Data and Quantum Computing (Project CN_00000013)
- CINECA computational resources through the ISCRA initiative
- Fondazione CRT "Research and Education" grant
- DEMNUni simulation project

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues and Contributions

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For bug reports and feature requests, please use the [GitHub Issues](https://github.com/koexai/halos/issues) page.

## Contact

For questions and support:
- **Email**: info@koexai.com
- **Website**: [www.koexai.com](https://www.koexai.com)
- **LinkedIn**:[https://www.linkedin.com/company/koexai/]