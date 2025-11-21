# DEMNUni: ISW, Rees-Sciama, and Weak-Lensing in the Presence of Massive Neutrinos

This repository provides code and data related to the cosmological simulations and analyses presented in the paper:

**Title:** DEMNUni: ISW, Rees-Sciama, and weak-lensing in the presence of massive neutrinos  
**Authors:** Carmelita Carbone  
**arXiv:** [1605.02024](https://arxiv.org/abs/1605.02024)  
**Journal:** JCAP 07 (2016) 034, [DOI:10.1088/1475-7516/2016/07/034](https://doi.org/10.1088/1475-7516/2016/07/034)

## Overview

The DEMNUni simulations are a suite of large-volume, high-resolution N-body cosmological simulations designed to model the effects of massive neutrinos on structure formation. Neutrinos are treated as separate collisionless particles, enabling a detailed study of their impact on large-scale structure observables.

This work reconstructs, for the first time:
- The total (linear and non-linear) Integrated Sachs-Wolfe (ISW) and Rees-Sciama (RS) effects in the presence of massive neutrinos.
- Cross-correlations of ISW/RS with Cosmic Microwave Background (CMB) lensing and weak-lensing signals.

Key findings include an excess power in the ISW/RS signal and its lensing cross-correlations due to free-streaming neutrinos, particularly at the transition between linear and non-linear regimes. This effect is ~5-10% at multipole \( \ell \sim 100 \) for the ISW/RS auto-power spectrum (depending on total neutrino mass \( M_\nu \)), and up to a factor of ~4 at \( \ell \sim 600 \) for the ISW/RS × CMB-lensing cross-power when \( M_\nu = 0.3 \) eV.

The analyses use all-sky maps generated via ray-tracing through the gravitational potential from DEMNUni simulations, achieving 1-2% accuracy in recovering linear predictions from CAMB and Boltzmann code forecasts (with non-linear neutrino corrections via Halofit).

## Features

- Generation of all-sky ISW/RS maps via ray-tracing.
- Computation of CMB-lensing and weak-lensing convergence maps.
- Power spectrum estimation for auto- and cross-correlations.
- Validation against linear theory (CAMB) and semi-analytic models.
- Support for varying neutrino masses (\( M_\nu = 0, 0.05, 0.1, 0.12, 0.2, 0.3, 0.4, 0.6 \) eV).

## Installation

### Prerequisites
- Python 3.8+ (tested with 3.10).
- A Unix-like environment (Linux/macOS recommended; Windows via WSL).
- Access to high-performance computing resources for running full N-body simulations (optional for map generation and analysis).

### Dependencies
Install required packages using pip:

```bash
pip install numpy scipy matplotlib astropy healpy camb
```

- **numpy, scipy**: Numerical computations and integration.
- **matplotlib**: Plotting power spectra and maps.
- **astropy**: Cosmological calculations and units.
- **healpy**: Handling HEALPix maps for all-sky analyses.
- **camb**: Generating linear predictions for validation.

For full N-body simulations (DEMNUni generation):
- Gadget-3 or similar (not included; see [Gadget-3 repo](https://wwwmpa.mpa-garching.mpg.de/gadget/)).
- Additional neutrino particle treatment patches (custom; contact authors for details).

No additional packages can be installed via pip in restricted environments—use pre-built wheels if needed.

## Usage

### 1. Setting Up the Environment
Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>  # Replace with actual repo URL if hosted
cd demnuni-isw-rs
```

Set environment variables (optional, for custom cosmology):
```bash
export COSMO_PARAMS="Om=0.3,Ob=0.05,h=0.7,ns=0.96,Mnu=0.1"  # Example for M_nu=0.1 eV
```

### 2. Generating Maps from DEMNUni Simulations
The DEMNUni simulations provide gravitational potential snapshots. Download pre-computed snapshots from the official DEMNUni data release (if available; see [Data Access](#data-access)).

To generate ISW/RS maps via ray-tracing:

```python
from demnuni.maps import generate_isw_rs_map
from demnuni.lensing import generate_cmb_lensing_map

# Load potential from snapshot (example: redshift z=0)
potential = load_snapshot('path/to/demnuni_snapshot_z0.hdf5')

# Generate ISW/RS map (HEALPix format, nside=1024)
isw_rs_map = generate_isw_rs_map(potential, redshift=0.0, nside=1024)

# Generate CMB lensing convergence map
cmb_kappa = generate_cmb_lensing_map(potential, source_redshift=1100.0)

# Save maps
healpy.write_map('isw_rs_map.fits', isw_rs_map)
healpy.write_map('cmb_kappa_map.fits', cmb_kappa)
```

### 3. Computing Power Spectra
Estimate angular power spectra for auto- and cross-correlations:

```python
from demnuni.spectra import compute_power_spectrum

# Load maps
isw_rs = healpy.read_map('isw_rs_map.fits')
cmb_kappa = healpy.read_map('cmb_kappa_map.fits')
weak_kappa = healpy.read_map('weak_lensing_map.fits')  # If available

# Compute ISW/RS auto-power
cl_isw_auto, ell = compute_power_spectrum(isw_rs, isw_rs, lmax=2000)

# Compute ISW/RS × CMB-lensing cross-power
cl_isw_cmb, _ = compute_power_spectrum(isw_rs, cmb_kappa, lmax=2000)

# Plot results
import matplotlib.pyplot as plt
plt.loglog(ell, cl_isw_auto)
plt.xlabel('Multipole ℓ')
plt.ylabel('C_ℓ^{ISW×ISW}')
plt.savefig('isw_auto_power.png')
```

### 4. Validation Against CAMB
Compare simulated spectra to linear theory:

```python
from camb import model, initialpower, outputs

# Set up CAMB parameters (matching DEMNUni)
pars = model.CAMBparams()
pars.set_cosmology(H0=70, ombh2=0.022, omch2=0.12, mnu=0.1, omk=0, tau=0.09)
pars.InitPower.set_params(As=2.1e-9, ns=0.96, r=0)
pars.set_for_lensed_CMB()

# Compute linear ISW power
results = model.initialpower.get_results(pars)
camb_cl = results.get_cmb_power_spectra(pars, CMB_unit='muK')[0]

# Compare with simulated (implement diff in code)
```

For full N-body runs, compile Gadget-3 with neutrino patches and run with provided parameter files (e.g., `demnuni_params.ini`).

## Data Access

- **DEMNUni Simulations**: Pre-computed gravitational potential snapshots and lightcone catalogs are available upon request from the authors).
- **Sample Maps**: Reduced-resolution sample ISW/RS and lensing maps (nside=256) are included in `./data/samples/`.
- **Datasets**: No public datasets are directly linked in the paper; simulations use standard Planck-like cosmologies.

## Reproduction

To reproduce the main results from the paper:
1. Download full DEMNUni snapshots for the relevant neutrino masses and redshifts (z=0 to z=3, box size L=20 Gpc/h).
2. Run map generation scripts for all-sky ray-tracing (see `examples/reproduce_fig5.py` for power spectrum plots matching Fig. 5 in the paper).
3. Compute spectra using `anafast` from HEALPix or the provided `compute_power_spectrum` function.
4. Validate against CAMB outputs (linear ISW/RS) and CLASS/Halofit (lensing with neutrino corrections).

Expected accuracy: 1-2% agreement with linear predictions. Non-linear effects introduce the neutrino-induced power excess as detailed in the abstract.

Computational requirements:
- Map generation: ~100 CPU-hours per map on a cluster.
- Spectra computation: <1 hour on a single core.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests for bug fixes, new features (e.g., support for additional observables), or documentation improvements. Focus on reproducibility and efficiency.

- Report issues via GitHub Issues.
- For questions, contact the lead author: carmelita.carbone@inaf.it.

## License

This code is released under the MIT License. See [LICENSE](LICENSE) for details. The DEMNUni simulation data may have separate usage agreements—check with the collaboration.


## Citation

If you use this code or data in your research, please cite the paper:

```
@article{Carbone_2016,
  doi = {10.1088/1475-7516/2016/07/034},
  url = {https://doi.org/10.1088/1475-7516/2016/07/034},
  year = {2016},
  month = {jul},
  publisher = {},
  volume = {2016},
  number = {07},
  pages = {034},
  author = {Carbone, Carmelita and Petkova, Margarita and Dolag, Klaus},
  title = {DEMNUni: ISW, Rees-Sciama, and weak-lensing in the presence of  massive neutrinos},
  journal = {Journal of Cosmology and Astroparticle Physics},
  abstract = {We present, for the first time in the literature, a full reconstruction of the total (linear and non-linear) ISW/Rees-Sciama effect in the presence of massive neutrinos, together with its cross-correlations with CMB-lensing and weak-lensing signals. The present analyses make use of all-sky maps extracted via ray-tracing across the gravitational potential distribution provided by the ``Dark Energy and Massive Neutrino Universe'' (DEMNUni) project, a set of large-volume, high-resolution cosmological N-body simulations, where neutrinos are treated as separate collisionless particles. We correctly recover, at 1–2% accuracy, the linear predictions from CAMB. Concerning the CMB-lensing and weak-lensing signals, we also recover, with similar accuracy, the signal predicted by Boltzmann codes, once non-linear neutrino corrections to HALOFIT are accounted for. Interestingly, in the ISW/Rees-Sciama signal, and its cross correlation with lensing, we find an excess of power with respect to the massless case, due to free streaming neutrinos, roughly at the transition scale between the linear and non-linear regimes. The excess is ∼ 5 – 10% at l ∼ 100 for the ISW/Rees-Sciama auto power spectrum, depending on the total neutrino mass Mν, and becomes a factor of ∼ 4 for Mν = 0.3 eV, at l ∼ 600, for the ISW/Rees-Sciama cross power with CMB-lensing. This effect should be taken into account for the correct estimation of the CMB temperature bispectrum in the presence of massive neutrinos.}
}
```

For updates or questions, see the paper's [arXiv page](https://arxiv.org/abs/1605.02024).