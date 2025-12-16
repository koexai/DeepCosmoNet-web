# 3D YOLO-like Detector for Cosmic Voids

[![arXiv](https://img.shields.io/badge/arXiv-2XXX.XXXXX-b31b1b.svg)](https://arxiv.org/abs/XXXX.XXXXX)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)

A multi-scale deep learning approach to detecting cosmic voids in large-scale cosmological simulations using a 3D adaptation of the YOLO object detection architecture.

## Overview

This project introduces a novel deep learning framework for the efficient detection of cosmic voids—the largest underdense regions in the cosmic web, occupying ~80% of the universe's volume. By adapting YOLO-like object detection to 3D volumetric data, we achieve significant computational speedup while maintaining good detection accuracy compared to traditional geometric void-finding methods.

### Key Features

- **3D YOLO Architecture**: First application of YOLO-inspired detection to cosmic void identification
- **Multi-Scale Detection**: Feature Pyramid Network (FPN) with 5 detection heads for voids ranging from 10-100 h⁻¹ Mpc
- **Super-Separable 3D Convolutions**: Reduces computational complexity from O(C² · 3³) to O(C · 3³ + C²)
- **Physics-Informed Training**: Focal loss optimization for extreme class imbalance
- **Real-Time Analysis**: Orders of magnitude faster than traditional geometric methods

## Architecture

The detector consists of a hierarchical pipeline processing voxelized 3D density fields:

```
Input: 128³ Voxel Grid (Multi-channel smoothed density)
    ↓
Encoder (Backbone)
    ↓
Feature Pyramid Network (FPN)
    ├── Detection Head @ 2³ h⁻¹Mpc
    ├── Detection Head @ 2⁴ h⁻¹Mpc
    ├── Detection Head @ 2⁵ h⁻¹Mpc
    ├── Detection Head @ 2⁶ h⁻¹Mpc
    └── Detection Head @ 2⁷ h⁻¹Mpc
    ↓
Output: [Pvoid, Δx, Δy, Δz, ΔR] for each voxel
    ↓
Post-Processing (DBSCAN-based WBF)
    ↓
Final Void Catalogue
```

### Network Components

1. **Multi-Channel Input**: Gaussian-smoothed density fields at σ ∈ {2, 4, 8, 16} h⁻¹Mpc
2. **Super-Separable Blocks**: Lightweight 3D convolutions with spatial and channel-wise decomposition
3. **Feature Pyramid Network**: Hierarchical feature extraction across multiple scales
4. **Multi-Scale Detection Heads**: 5 heads operating at different resolutions (2³ to 2⁷ h⁻¹Mpc)
5. **Weighted Bounding-Box Fusion**: DBSCAN clustering for overlapping detections

## Performance Metrics

### Detection Performance by Scale

| Void Radius (h⁻¹Mpc) | Precision | Recall | F1-Score | IoU | Center Error | Radius Error |
|----------------------|-----------|--------|----------|-----|--------------|--------------|
| > 32                 | 9%        | 62%    | 16%      | 35% | 17%          | 5%           |
| 16 - 32              | **73%**   | **63%**| **68%**  | **55%** | 15%      | 9%           |
| 8 - 16               | 66%       | 43%    | 52%      | 47% | 25%          | 11%          |

### Overall Metrics

- **Average F1-Score**: 68% (intermediate scales)
- **Average IoU**: 57%
- **Void Size Function**: Excellent agreement with ground truth (Pylians)
- **Computational Speedup**: Orders of magnitude faster than traditional methods

## Installation

### Requirements

- Python 3.8+
- PyTorch 2.0+ (with CUDA support)
- NumPy
- SciPy
- scikit-learn
- h5py
- Pylians (for ground truth generation)

### Setup

```bash
# Clone the repository
git clone https://github.com/koexai/cosmic-voids-detector.git
cd cosmic-voids-detector

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Data

### Input Format

The detector processes voxelized 3D density fields derived from N-body simulations:

**Input Data:**
- 128³ voxel grids at 1 h⁻¹Mpc resolution
- Particle positions from cosmological snapshots
- Multi-channel Gaussian-smoothed density fields

**Ground Truth Format (sample_voids.csv):**
```csv
x,y,z,radius
96679.6875,92773.4375,42968.75,29000.0
36132.8125,45898.4375,68359.375,28000.0
...
```

Where:
- `x, y, z`: Void center coordinates (in h⁻¹kpc)
- `radius`: Void effective radius (in h⁻¹kpc)

### Training Data

- **Simulation**: DEMNUni N-body simulations
- **Volume**: 1 (h⁻¹Gpc)³ split into 8×8×8 = 512 cubes
- **Cube Size**: 125 h⁻¹Mpc per side
- **Redshift**: z = 0
- **Resolution**: 1 h⁻¹Mpc voxels
- **Void Finder**: Pylians (ground truth generation)

### Cosmological Parameters

- Ωₘ = 0.32 (matter density)
- Ωb = 0.05 (baryon fraction)
- h = 0.67 (Hubble parameter)
- ns = 0.96 (spectral index)
- σ₈ = 0.83 (matter fluctuation amplitude)

## Usage

### Basic Inference

```python
import torch
from voids_detector import VoidsDetector3D, load_simulation

# Load simulation snapshot
density_field = load_simulation("path/to/snapshot.hdf5")

# Initialize detector
detector = VoidsDetector3D(
    model_path="models/voids_detector.pth",
    device="cuda"
)

# Detect voids
voids_catalogue = detector.predict(density_field)

# Save results
voids_catalogue.to_csv("detected_voids.csv")
```

### Preprocessing Pipeline

```python
from voids_detector.preprocessing import preprocess_density_field

# Create multi-channel input
density_field = load_particles("snapshot.hdf5")
input_tensor = preprocess_density_field(
    density_field,
    sigmas=[2, 4, 8, 16],  # Gaussian smoothing scales
    grid_size=128
)
```

### Advanced Configuration

```python
# Configure detection parameters
detector = VoidsDetector3D(
    model_path="models/voids_detector.pth",
    channel_multiplier=2,
    num_heads=5,
    confidence_threshold=0.5,
    iou_threshold=0.25,
    device="cuda"
)

# Run with custom post-processing
voids = detector.predict(
    input_tensor,
    use_wbf=True,
    dbscan_eps=1.0,  # In voxel units
    min_samples=1
)
```

## Training Your Own Model

### 1. Prepare Training Data

```python
from voids_detector.data import VoidsDataset
from torch.utils.data import DataLoader

# Create dataset
dataset = VoidsDataset(
    simulation_path="path/to/demnuni/",
    voids_catalogue="path/to/pylians_voids.csv",
    cube_size=125,  # h⁻¹Mpc
    grid_resolution=128
)

# Create data loader
train_loader = DataLoader(
    dataset,
    batch_size=1,
    shuffle=True,
    num_workers=4
)
```

### 2. Configure Model

```python
from voids_detector.model import VoidsDetector3D

model = VoidsDetector3D(
    input_channels=4,  # Multi-scale smoothed fields
    channel_multiplier=2,
    num_heads=5,
    use_super_separable=True
)
```

### 3. Define Loss Function

```python
from voids_detector.loss import VoidsDetectionLoss

criterion = VoidsDetectionLoss(
    lambda_prob=1.0,
    lambda_xyz=0.05,
    lambda_radius=0.05,
    focal_alpha=8,
    focal_gamma=4
)
```

### 4. Train Model

```python
import torch.optim as optim

optimizer = optim.AdamW(
    model.parameters(),
    lr=1e-4,
    weight_decay=1e-2
)

scheduler = optim.lr_scheduler.CosineAnnealingLR(
    optimizer,
    T_max=300,
    eta_min=1e-6
)

# Training loop
for epoch in range(300):
    for batch in train_loader:
        density, targets = batch
        
        # Forward pass
        predictions = model(density)
        
        # Calculate loss
        loss = criterion(predictions, targets)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
    
    scheduler.step()
```

## Evaluation and Metrics

### Compute Detection Metrics

```python
from voids_detector.evaluation import evaluate_catalogue

metrics = evaluate_catalogue(
    predicted="detected_voids.csv",
    ground_truth="pylians_voids.csv",
    iou_threshold=0.25
)

print(f"Precision: {metrics['precision']:.2%}")
print(f"Recall: {metrics['recall']:.2%}")
print(f"F1-Score: {metrics['f1']:.2%}")
print(f"Mean IoU: {metrics['mean_iou']:.2%}")
```

### Visualize Results

```python
from voids_detector.visualization import plot_void_detections, plot_vsf

# 2D projection of void detections
plot_void_detections(
    density_field,
    predicted_voids,
    ground_truth_voids,
    slice_thickness=2,  # h⁻¹Mpc
    output_path="void_comparison.png"
)

# Void Size Function
plot_vsf(
    predicted_voids,
    ground_truth_voids,
    output_path="vsf_comparison.png"
)
```

## Key Innovations

### 1. Super-Separable 3D Convolutions

Reduces parameter count by decomposing 3D convolutions:

```
Standard 3D Conv: 27C² parameters
Super-Separable: C² + 9C parameters
Reduction: ~25× for typical channel sizes
```

Implementation decomposes operations into:
- Spatial separable convolutions: (3×1×1), (1×3×1), (1×1×3)
- Channel-wise fully connected convolution per voxel

### 2. Physics-Informed Loss Function

```python
L_total = λ_P · L_P + λ_xyz · L_xyz + λ_R · L_R

# Focal Loss for class imbalance
L_P = -α(1 - P)^γ log(P)

# Coordinate regression (MSE)
L_xyz = MSE(Δx, Δy, Δz)

# Radius regression (log-scaled)
L_R = MSE(log₂(R))
```

### 3. Multi-Scale Detection Strategy

- 5 detection heads at resolutions: 2³, 2⁴, 2⁵, 2⁶, 2⁷ h⁻¹Mpc
- Feature Pyramid Network for hierarchical features
- Scale-specific loss weighting inversely proportional to void abundance

### 4. Data Augmentation

Exploits cosmological isotropy:
- Random axis permutation (6 permutations)
- Random axis flipping (8 combinations)
- Total augmentation factor: 48×

## Computational Requirements

### Minimum Requirements
- **CPU**: 8 cores
- **RAM**: 32 GB
- **GPU**: 8 GB VRAM (NVIDIA with CUDA support)
- **Storage**: 100 GB for data and models

### Recommended Setup
- **CPU**: 16+ cores
- **RAM**: 64 GB
- **GPU**: 16 GB VRAM (e.g., NVIDIA V100, A100)
- **Storage**: 500 GB SSD

### Performance

| Task | Hardware | Time |
|------|----------|------|
| Single cube inference (125³ h⁻¹Mpc) | 1 GPU | ~1 second |
| Full volume (512 cubes) | 1 GPU | ~10 minutes |
| Training (300 epochs) | 1 GPU | ~48 hours |

## Scientific Applications

- **Cosmological Parameter Inference**: Extract constraints on dark energy, neutrino masses
- **Large-Scale Structure Analysis**: Study cosmic web topology and evolution
- **Survey Planning**: Real-time void cataloging for next-generation surveys
- **Comparative Cosmology**: Rapidly analyze multiple simulation suites
- **Modified Gravity Tests**: Void statistics as sensitive probes

## Citation

If you use this detector in your research, please cite:

```bibtex
@article{puglisi2025voids,
  title={3D YOLO-like Detector for Cosmic Voids: A Multi-Scale Deep Learning 
         Approach to Large-Scale Underdense Structures},
  author={Puglisi, Giuseppe and Del Zoppo, Vincenzo and Spampinato, Fabio and 
          Mezzina, Alessio and Cataldo, Marco and Verza, Giovanni and 
          Calabrese, Matteo and Christille, Jean Marc and Naso, Luca and 
          Carbone, Carmelita},
  journal={Astronomy \& Computing},
  year={2025},
  note={Submitted}
}
```

## Authors

**Koexai S.r.l. Team:**
- Giuseppe Puglisi
- Vincenzo Del Zoppo
- Fabio Spampinato
- Alessio Mezzina
- Marco Cataldo
- Luca Naso

**External Collaborators:**
- Giovanni Verza (Flatiron Institute, CCA)
- Matteo Calabrese (OAVdA, INAF-IASF Milano)
- Jean Marc Christille (OAVdA)
- Carmelita Carbone (INAF-IASF Milano)

## Acknowledgments

This work is supported by:
- Fondazione ICSC, Spoke-3 Astrophysics and Cosmos Observations
- Italian Research Center on High-Performance Computing, Big Data and Quantum Computing (Project CN_00000013)
- CINECA computational resources through ISCRA initiative (Leonardo supercomputer)
- Fondazione CRT "Research and Education" grant (2024/25)
- Fondazione Clément Fillietroz-ONLUS (OAVdA)
- DEMNUni simulation project

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues and Contributions

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

For bug reports and feature requests, use [GitHub Issues](https://github.com/koexai/cosmic-voids-detector/issues).

## Contact

- **Email**: info@koexai.com
- **Website**: [www.koexai.com](https://www.koexai.com)
- **LinkedIn**:[https://www.linkedin.com/company/koexai/]

## Future Directions

### Near-Term Improvements
- Extend to multiple redshifts for temporal evolution studies
- Incorporate galaxy/halo information for observational void detection
- Optimize for edge devices and real-time processing
- Multi-GPU training and inference

### Long-Term Goals
- Generalization to different simulation codes and cosmologies
- Uncertainty quantification for robust parameter inference
- Integration with observational survey pipelines (DESI, Euclid, LSST)
- Hierarchical void structure detection (voids-in-voids)
- Cross-correlation with other large-scale structure probes

## Additional Resources

### Related Papers
- Traditional void finders: ZOBOV, VIDE, Pylians
- Deep learning in cosmology surveys
- YOLO architecture and variants
- Feature Pyramid Networks

### Datasets
- DEMNUni simulations: [Link to data]
- Pylians void catalogues
- Example training/validation splits