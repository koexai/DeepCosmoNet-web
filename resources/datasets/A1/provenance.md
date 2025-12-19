# Provenance and Methods

## Data Acquisition

### Primary Source: DEMNUni Simulation Suite
This dataset is derived from the **DEMNUni (Dark Energy and Massive Neutrino Universe)** project, a suite of large-volume, high-resolution cosmological N-body simulations designed to study the effects of massive neutrinos and dynamical dark energy on large-scale structure formation.

**Original simulation specifications:**
- **Reference publication**: Carbone, C., Petkova, M., & Dolag, K. (2016). DEMNUni: ISW, Rees-Sciama, and weak-lensing in the presence of massive neutrinos. *Journal of Cosmology and Astroparticle Physics*, 2016(07), 034. https://doi.org/10.1088/1475-7516/2016/07/034
- **Simulation code**: GADGET-3 with massive neutrino implementation (Viel et al. 2010)
- **Box size**: 2 Gpc/h (comoving)
- **Volume**: 8 Gpc³ (comoving)
- **Particle numbers**: 2 × 2048³ particles (separate components for cold dark matter and neutrinos)
- **Dark matter particle mass**: ~8 × 10¹⁰ M☉/h
- **Gravitational softening**: 20 h⁻¹ kpc (Plummer-equivalent)
- **Neutrino treatment**: Separate collisionless particles (not linear perturbations)
- **Principal Investigator**: Carmelita Carbone (INAF - Osservatorio Astronomico di Brera)
- **Co-investigators**: Klaus Dolag (Universitäts-Sternwarte München), Margarita Petkova

### DEMNUni Collaboration
The DEMNUni project involves a large international collaboration:
- **Simulation development**: M. Viel (neutrino code), C. Carbone (PI), K. Dolag
- **CMB lensing and ISW/Rees-Sciama**: C. Carbone, M. Petkova
- **Galaxy clustering**: D. Bianchi, E. Castorina, M. Zennaro, J. Bel, E. Sefusatti
- **Halo occupation distribution**: C. Giocoli, F. Marulli
- **Weak lensing and cross-correlations**: C. Carbone, C. Giocoli, M. Roncarelli
- **Cosmic voids**: A. J. Hawken, B. Granett, A. Iovino

### Scientific Context
The DEMNUni simulations provide the first full reconstruction of the ISW/Rees-Sciama effect in the presence of massive neutrinos, enabling studies of:
- **Integrated Sachs-Wolfe (ISW) and Rees-Sciama effects**: Total (linear + non-linear) CMB temperature anisotropies induced by time-varying gravitational potentials
- **CMB weak lensing**: Gravitational deflection of CMB photons by large-scale structure
- **Weak gravitational lensing**: Cosmic shear at various source redshifts (z = 1, 2, 5, 8)
- **Cross-correlations**: ISW × CMB-lensing, ISW × weak-lensing, providing constraints on neutrino masses
- **Non-linear structure formation**: Power spectra, halo mass functions, and clustering in massive neutrino cosmologies

Key finding: The simulations reveal a 5-10% excess in ISW/Rees-Sciama power at ℓ ~ 100 due to neutrino free-streaming at the transition scale between linear and non-linear regimes. This excess increases to a factor of ~4 at ℓ ~ 600 for ISW × CMB-lensing cross-correlation when Mν = 0.3 eV.

### Computational Resources
- **Facility**: CINECA (Consorzio Interuniversitario per il Calcolo Automatico dell'Italia Nord-Orientale)
- **Supercomputer**: FERMI (IBM BlueGene/Q system)
- **CPU time**: 5-8 × 10⁶ CPU-hours for the full simulation suite
- **Simulation runs**: 2013-2015
- **Publication date**: 2016

### Data Collection Period
- **Original simulation outputs**: 2013-2015
- **All-sky map generation**: 2015-2016

## Processing Pipeline

### 1. Simulation Output Extraction
Raw data extracted from DEMNUni GADGET-3 snapshot files:

**Snapshot format**: Standard GADGET-3 HDF5 format with separate particle types:
- Type 1: Cold dark matter (CDM) particles
- Type 2: Massive neutrino particles

**Redshift coverage**: Multiple snapshots from z ~ 10 to z = 0, with denser sampling at low redshift for ray-tracing

**Quantities extracted per snapshot**:
- Particle positions (comoving coordinates)
- Particle velocities (peculiar velocities)
- Particle IDs for tracking
- Gravitational potential field (on adaptive mesh or computed via PM grid)
- Halo catalogs from SUBFIND algorithm

**Extraction tools**:
- Custom Python/C++ readers for GADGET-3 HDF5 format
- h5py library for Python-based data access
- Parallel I/O using MPI for handling 2 × 2048³ particles per snapshot

### 2. Ray-Tracing and All-Sky Map Generation
Following Carbone et al. (2016) methodology for generating full-sky observables:

**Lightcone construction**:
- Observer placed at box center with periodic boundary conditions
- Simulation volume replicated to tile the full backward lightcone
- Coherent translations and rotations applied to replicated volumes (not independent random transformations)
- Spherical shells of fixed comoving thickness constructed

**Ray-tracing through gravitational potential**:
- Multiple planes of gravitational potential Φ extracted along line of sight
- Born approximation applied for CMB lensing convergence κ
- ISW/Rees-Sciama temperature fluctuations computed from ∂Φ/∂t along photon geodesics
- Weak lensing convergence for sources at z = 1, 2, 5, 8

**Map pixelization**:
- HEALPix tessellation for all-sky maps
- Resolution: Nside = 2048 or 4096 (depending on application)
- Angular resolution: ~1.7 to 3.4 arcminutes

### 3. Gravitational Potential and Lensing Field Computation
**Poisson equation solution**:
- Particle-mesh (PM) assignment of particles to 3D grid
- FFT-based Poisson solver: ∇²Φ = 4πGρ
- Grid resolution matches PM grid from simulation (~1 Mpc/h)

**Lensing convergence**:
- κ(n̂) = ∫ Φ(χ, n̂) W(χ) dχ
- Weight function W(χ) depends on source redshift distribution
- Integrated along line of sight through multiple potential planes

**ISW and Rees-Sciama**:
- Linear ISW: δT/T = 2∫ (∂Φ/∂η) dη (late-time acceleration)
- Non-linear Rees-Sciama: from time-varying potentials in collapsing structures
- Combined signal extracted from differences between adjacent snapshots

### 4. Cosmological Parameter Specification
All DEMNUni simulations adopt cosmological parameters consistent with **Planck 2013** constraints:

**Background cosmology** (fixed across all runs):
- Ωm = 0.32 (total matter density)
- ΩΛ = 0.68 (dark energy density, for ΛCDM runs)
- Ωb = 0.05 (baryon density)
- h = 0.67 (Hubble parameter in units of 100 km/s/Mpc)
- σ₈ = 0.83 (amplitude of matter fluctuations at 8 h⁻¹ Mpc)
- ns = 0.96 (primordial scalar spectral index)

**Varied parameters** (defining different simulation runs):
- **Neutrino mass**: Mν = 0.0, 0.17, 0.3, 0.53 eV (degenerate hierarchy, 3 equal-mass species)
- **Dark energy equation of state**: w(a) = w₀ + wa(1-a) (CPL parametrization)
  - Reference: w₀ = -1, wa = 0 (ΛCDM)
  - Dynamical models: (w₀, wa) = (-0.9, +0.3), (-1.1, -0.3), (-1.1, +0.3)

**Neutrino fraction**:
- fν = Ων/Ωm depends on Mν
- For Mν = 0.3 eV: fν ≈ 0.015 at z = 0

**Initial conditions**:
- Generated with 2nd-order Lagrangian perturbation theory (2LPT)
- Gaussian random field with CAMB power spectrum at z_initial ~ 99
- Separate realizations for CDM and neutrino velocity fields

### 5. Power Spectrum and Statistical Measurements
**Matter power spectrum**:
- Computed from particle distribution using FFT-based estimator
- CDM-only, neutrino-only, and total matter power spectra
- k-range: 10⁻³ to 10 h/Mpc (limited by box size and resolution)
- Validated against CAMB linear theory (1-2% accuracy in linear regime)
- Non-linear regime checked against HALOFIT with neutrino corrections

**Angular power spectra**:
- CMB lensing convergence: C_ℓ^κκ
- ISW/Rees-Sciama: C_ℓ^TT (secondary anisotropies)
- Weak lensing convergence: C_ℓ^γγ
- Cross-correlations: C_ℓ^Tκ, C_ℓ^Tγ, C_ℓ^κγ
- Multipole range: ℓ = 2 to 5000

**Binning**:
- Power spectra binned logarithmically or linearly depending on application
- Error estimation via sample variance within simulation volume

### 6. Data Format Conversion and Standardization
Simulation outputs and derived maps converted to analysis-ready formats:

**Storage formats**:
- HDF5 for large 3D density fields and particle snapshots
- FITS for HEALPix all-sky maps (standard in CMB/lensing community)
- NumPy arrays (.npy) for power spectra and 1D statistics
- CSV/Parquet for tabular data (halo catalogs, summary statistics)

**Unit conventions**:
- Lengths: Mpc/h (comoving) or Mpc (physical)
- Masses: M☉/h
- Velocities: km/s (peculiar)
- Potentials: (km/s)² or dimensionless Φ/c²
- Power spectra: (Mpc/h)³ for P(k), dimensionless for C_ℓ

**Metadata embedding**:
- Cosmological parameters stored in file headers
- Redshift, box size, particle numbers recorded
- Processing pipeline version and date stamped

### 7. Quality Control and Validation
**Consistency checks**:
- Mass conservation: Total particle mass matches Ωm ρ_crit L³
- Energy conservation: Kinetic + potential energy tracked across snapshots
- Force accuracy: Tree opening angle and PM resolution validated

**Comparison with analytical predictions**:
- **Linear regime**: Matter power spectrum agrees with CAMB at 1-2% for k < 0.1 h/Mpc
- **Non-linear regime**: Agreement with HALOFIT + neutrino corrections at ~2-5% for k < 1 h/Mpc
- **Lensing signals**: CMB-lensing and weak-lensing power spectra match Boltzmann codes (CAMB/CLASS) with non-linear corrections

**Neutrino-specific validation**:
- Free-streaming scale λ_fs ~ 13 (1 eV / Mν) Mpc/h correctly captured
- Neutrino velocity dispersion matches analytical expectations
- Suppression of small-scale power by factor of (1 - 8fν) verified

**Cross-validation with published results**:
- ISW/Rees-Sciama excess power (~5-10% at ℓ ~ 100) reproduced
- Factor of ~4 enhancement in ISW × CMB-lensing at ℓ ~ 600 for Mν = 0.3 eV confirmed
- Halo mass functions consistent with literature (Tinker et al. fits with neutrino corrections)

## Software and Tools

### Simulation Code: GADGET-3 with Massive Neutrinos
- **Base code**: GADGET-3 (GAlaxies with Dark matter and Gas intEracT)
- **Tree-PM hybrid**: TreePM algorithm for gravity calculation
  - Short-range: Tree-based force with opening angle criterion
  - Long-range: Particle-Mesh (PM) on uniform grid
- **Neutrino implementation**: Modified GADGET-3 from Viel et al. (2010)
  - Neutrinos treated as separate particle species (Type 2)
  - Tree force calculation skipped for neutrinos at early times due to high velocity dispersion
  - Separate momentum conservation for CDM and neutrino components
- **Time integration**: Leapfrog with individual adaptive timesteps
- **Initial conditions**: 2LPT (2nd-order Lagrangian Perturbation Theory) with N-GenIC

### Ray-Tracing and Map-Making
- **Lightcone construction**: Custom C++/Python pipeline
- **Gravitational potential**: FFT-based Poisson solver on PM grid
- **HEALPix**: Hierarchical Equal Area isoLatitude Pixelation library for all-sky maps
- **Interpolation**: Trilinear or higher-order schemes for particle-to-grid assignment

### Linear Theory and Validation Tools
- **CAMB** (Code for Anisotropies in the Microwave Background): Linear power spectra, transfer functions, CMB spectra
- **CLASS** (Cosmic Linear Anisotropy Solving System): Alternative Boltzmann code for cross-checking
- **HALOFIT**: Fitting formula for non-linear matter power spectrum (Smith et al. 2003, Takahashi et al. 2012)
- **Neutrino corrections**: Bird et al. (2012) corrections to HALOFIT for massive neutrinos

### Analysis Software Stack
**Primary languages**: Python 3.8+, C++17

**Core Python libraries**:
- **numpy** (≥1.20): Array operations, FFTs, linear algebra
- **scipy** (≥1.6): Statistical analysis, interpolation, special functions
- **astropy** (≥4.3): Cosmological calculations (distances, ages), FITS I/O, units
- **h5py** (≥3.0): Reading GADGET-3 HDF5 snapshots
- **healpy** (≥1.15): HEALPix map manipulation and visualization
- **matplotlib** (≥3.4): Visualization of maps, power spectra, distributions
- **pandas** (≥1.3): Tabular data for halo catalogs and summary statistics

**Specialized tools**:
- **SUBFIND**: Substructure finder for halo identification (part of GADGET-3 package)
- **ROCKSTAR**: Alternative halo finder for cross-validation
- **Pylians**: Python cosmology libraries (Quijote collaboration)
- **NaMaster**: Pseudo-Cℓ estimator for angular power spectra with masks

**FFT libraries**:
- **FFTW3** (Fastest Fourier Transform in the West): For potential solving and power spectrum estimation
- **pyFFTW**: Python wrapper for FFTW3
- **numpy.fft**: For quick prototyping and smaller transforms

### High-Performance Computing Environment
**HPC facility**: CINECA (Bologna, Italy)
- **Supercomputer**: FERMI - IBM BlueGene/Q
- **Compute nodes**: 10,240 compute nodes
- **Total cores**: 163,840 PowerA2 cores (16 cores per node)
- **Memory**: 1 GB per core (16 GB per node)
- **Interconnect**: 5D torus network
- **Peak performance**: 2 PFLOPS

**Simulation resource usage**:
- **CPU-hours**: 5-8 × 10⁶ core-hours for full suite
- **Walltime per run**: ~50,000 core-hours per cosmology
- **Storage**: ~100 TB for particle snapshots, ~10 TB for derived maps

**Parallelization**:
- **MPI** (Message Passing Interface): Domain decomposition for particles
- **OpenMP**: Thread-level parallelism within nodes (where applicable)
- **Load balancing**: GADGET-3 Peano-Hilbert space-filling curve for optimal decomposition

## Validation and Quality Assurance

### Validation Against Published Results

1. **Linear regime validation**
   - Recovered linear predictions from CAMB at 1-2% accuracy
   - Verified agreement with Carbone et al. (2016) Figure 2 (matter power spectrum)
   - Neutrino suppression factor consistent with analytical expectations

2. **Non-linear regime validation**
   - Checked against HALOFIT with neutrino corrections
   - Validated lensing signal predictions (CMB-lensing, weak-lensing)
   - Confirmed ISW/Rees-Sciama excess power at l~100 (~5-10% depending on Mν)

3. **Cross-correlation signals**
   - ISW × CMB-lensing cross-power verified
   - Factor of ~4 enhancement at l~600 for Mν=0.3eV reproduced
   - Weak-lensing cross-correlations consistent with expectations

### Statistical Validation
- **Sample variance**: [How handled - ensemble of realizations, periodic box replication]
- **Noise characterization**: [If applicable - shot noise, measurement uncertainties]
- **Systematic error budget**: [Documented sources of systematic uncertainty]

## Known Issues and Limitations

### 1. Simulation Resolution Limits
**Spatial resolution**:
- Minimum resolved scale: ~100 kpc/h (determined by force softening of 20 h⁻¹ kpc)
- Grid resolution: 2048³ cells for PM component (~ 1 Mpc/h per cell)
- Particle mass resolution: 8 × 10¹⁰ M☉/h for CDM
- Neutrino particle mass: varies with Mν (lower mass per particle than CDM)

**Implications**:
- Small-scale structure within halos (< 100 kpc/h) not reliably resolved
- Galaxy formation physics not included (dark matter only simulation)
- Minimum halo mass: ~10¹² M☉/h (100+ particles per halo for robust statistics)

### 2. Finite Volume Effects
**Box size constraints**:
- Cubic box: 2 Gpc/h per side
- Volume: 8 Gpc³
- Missing long-wavelength modes: k < k_min = 2π/L_box ≈ 0.003 h/Mpc
- Affects very large-scale (> 1 Gpc) structure and integrated quantities

**Periodic boundary conditions**:
- Artificial periodicity on scales approaching box size
- May affect ISW integral and large-angle CMB correlations
- Mitigated by lightcone replication with coherent transformations

### 3. Astrophysical Limitations
**Baryonic physics absent**:
- No gas dynamics, star formation, supernova feedback, AGN feedback
- Valid for large-scale structure (> 10 Mpc) where dark matter dominates
- Relevant for weak lensing and CMB lensing on large scales
- Not applicable to galaxy-scale or cluster-core physics

**Relativistic effects**:
- Non-relativistic treatment of neutrinos (valid post-decoupling, z < 10⁶)
- Newtonian gravity (valid for sub-horizon scales and v << c)
- No general relativistic corrections to lensing or ISW

### 4. Neutrino Modeling Approximations
**Degenerate hierarchy assumption**:
- All three neutrino species have equal mass: m₁ = m₂ = m₃ = Mν/3
- Real Universe: normal or inverted hierarchy with Δm² splittings
- Impact: minimal for total Mν, affects individual species clustering

**Collisionless approximation**:
- Neutrinos treated as collisionless dark matter
- Valid for cosmological scales (> kpc)
- Ignores neutrino-neutrino interactions (negligible)

**No neutrino clustering below free-streaming scale**:
- Free-streaming suppresses neutrino clustering on λ < λ_fs
- Correctly captured by high-velocity neutrino particle distribution
- CDM clustering drives overall structure formation

### 5. Lightcone and Ray-Tracing Approximations
**Born approximation**:
- First-order weak lensing (κ << 1)
- Valid for CMB lensing and cosmic shear at most scales
- Breaks down for strong lensing regions (not relevant for all-sky statistics)

**Time interpolation**:
- Snapshots at discrete times, ∂Φ/∂t computed from differences
- May miss rapid transient evolution (less than snapshot cadence)
- Sufficient for ISW/Rees-Sciama given slow cosmic evolution at z < 2

**Projection effects**:
- Light-ray assumes straight-line propagation between potential planes
- Small-angle approximation for deflections (valid for weak lensing)
- Full geodesic integration not performed (sub-percent corrections)

### 6. Statistical Limitations
**Sample variance**:
- Single realization per cosmology (not ensemble)
- Cosmic variance dominates large-scale (low-ℓ) power spectrum uncertainties
- k < 0.01 h/Mpc: sample variance > 10%

**Halo mass function**:
- Rare massive halos (M > 10¹⁵ M☉) have Poisson-limited statistics
- Box size limits: maximum ~10 halos above 10¹⁵ M☉
- Cluster abundance studies require larger volumes or ensembles

### 7. Computational Trade-offs
**Force resolution vs particle load**:
- PM grid resolution (1 Mpc/h) is coarser than softening (20 kpc/h)
- Tree force provides higher resolution but expensive for 2 × 2048³ particles
- Hybrid Tree-PM balances accuracy and speed

**Time-stepping**:
- Adaptive individual timesteps for computational efficiency
- Force accuracy: relative error < 0.01 (GADGET-3 default tolerance)
- Energy conservation: ΔE/E ~ 10⁻⁴ over full simulation

## Reproducibility

### Simulation Reproducibility
The original DEMNUni simulations are fully documented in multiple publications:

**Primary references**:
1. Carbone et al. (2016): ISW/Rees-Sciama and lensing (JCAP 07, 034)
2. Castorina et al. (2015): Large-scale structure clustering ([arXiv:1505.07148](https://arxiv.org/abs/1505.07148))
3. Parimbelli, Carbone et al. (2022): Non-linear power spectrum comparison ([arXiv:2207.13677](https://arxiv.org/abs/2207.13677))

**Documented parameters**:
- Complete cosmological parameter specification
- Initial conditions generation method (2LPT, CAMB power spectrum)
- GADGET-3 runtime parameters (timestep criteria, force accuracy, softening)
- Random seed for initial conditions (deterministic within ensemble)

**Code availability**:
- GADGET-3 base code: available upon request from K. Dolag / V. Springel
- Neutrino modification: Viel et al. (2010), MNRAS, 404, 1774
- Post-processing codes: available from DEMNUni collaboration


**Computational environment**:
- **Operating system**: Ubuntu 22.04 LTS (on Leonardo Booster)
- **Python version**: 3.10.12
- **Key package versions**:
  - numpy 1.24.3
  - scipy 1.10.1  
  - astropy 5.3.1
  - h5py 3.9.0
  - healpy 1.16.2
  - matplotlib 3.7.2

**Processing workflow**:
1. Download DEMNUni snapshot files from CINECA archive
2. Run lightcone extraction script: `extract_lightcone.py`
3. Generate all-sky maps: `raytrace_maps.py`
4. Compute power spectra: `compute_powspec.py`
5. Quality validation: `validate_outputs.py`
6. Package for release: `create_dataset.py`

### Computational Environment at Koexai
**Primary HPC facility**: Leonardo Booster (CINECA, Bologna)
- **Architecture**: EuroHPC pre-exascale system
- **Compute nodes**: GPU-accelerated Nvidia Ampere A100
- **Access**: Koexai allocation through PNRR DeepCosmoNet project
- **Alternative**: PLEIADI cluster (University of Catania) for development

**Data storage**:
- **Working storage**: CINECA SCRATCH filesystem (~100 TB capacity)
- **Archival**: CINECA WORK filesystem with tape backup
- **Local**: Koexai servers (limited capacity, ~10 TB for final products)

## Related Publications and Data Sources

### Primary Reference (This Work)
**Please cite the original DEMNUni ISW/lensing paper when using this dataset:**

```bibtex
@article{Carbone_2016,
  author = {Carbone, Carmelita and Petkova, Margarita and Dolag, Klaus},
  title = {DEMNUni: ISW, Rees-Sciama, and weak-lensing in the presence of massive neutrinos},
  journal = {Journal of Cosmology and Astroparticle Physics},
  volume = {2016},
  number = {07},
  pages = {034},
  year = {2016},
  month = {jul},
  doi = {10.1088/1475-7516/2016/07/034},
  url = {https://doi.org/10.1088/1475-7516/2016/07/034}
}
```

### Additional DEMNUni Publications

**Large-scale structure clustering:**
```bibtex
@article{Castorina_2015,
  author = {Castorina, Emanuele and Carbone, Carmelita and Bel, Julien and Sefusatti, Emiliano and Dolag, Klaus},
  title = {DEMNUni: The clustering of large-scale structures in the presence of massive neutrinos},
  journal = {Journal of Cosmology and Astroparticle Physics},
  volume = {2015},
  number = {07},
  pages = {043},
  year = {2015},
  eprint = {1505.07148},
  archivePrefix = {arXiv},
  primaryClass = {astro-ph.CO}
}
```

**Non-linear power spectrum prescriptions:**
```bibtex
@article{Parimbelli_2022,
  author = {Parimbelli, G. and Carbone, C. and Bel, J. and Bose, B. and Calabrese, M. and Carella, E. and Zennaro, M.},
  title = {DEMNUni: comparing nonlinear power spectra prescriptions in the presence of massive neutrinos and dynamical dark energy},
  journal = {Journal of Cosmology and Astroparticle Physics},
  volume = {2022},
  number = {11},
  pages = {041},
  year = {2022},
  eprint = {2207.13677},
  archivePrefix = {arXiv},
  primaryClass = {astro-ph.CO}
}
```

**Sunyaev-Zel'dovich effects (recent):**
```bibtex
@article{Luchina_2025,
  author = {Luchina, Davide and Carbone, Carmelita and Roncarelli, Mauro and Giocoli, Carlo and Bel, Julien},
  title = {DEMNUni: the Sunyaev-Zel'dovich effect in the presence of massive neutrinos and dynamical dark energy},
  journal = {arXiv preprint},
  year = {2025},
  eprint = {2503.16355},
  archivePrefix = {arXiv},
  primaryClass = {astro-ph.CO}
}
```

### Methodological References

**GADGET-3 with massive neutrinos:**
```bibtex
@article{Viel_2010,
  author = {Viel, Matteo and Haehnelt, Martin G. and Springel, Volker},
  title = {The effect of neutrinos on the matter distribution as probed by the intergalactic medium},
  journal = {Journal of Cosmology and Astroparticle Physics},
  volume = {2010},
  number = {06},
  pages = {015},
  year = {2010},
  doi = {10.1088/1475-7516/2010/06/015}
}
```

**HALOFIT neutrino corrections:**
```bibtex
@article{Bird_2012,
  author = {Bird, Simeon and Viel, Matteo and Haehnelt, Martin G.},
  title = {Massive neutrinos and the non-linear matter power spectrum},
  journal = {Monthly Notices of the Royal Astronomical Society},
  volume = {420},
  pages = {2551-2561},
  year = {2012},
  doi = {10.1111/j.1365-2966.2011.20222.x}
}
```

### Related Simulation Suites

**Complementary neutrino simulations:**
- **MassiveNuS**: Separate neutrino simulations by Liu et al. (2018)
- **BAHAMAS**: Hydrodynamical simulations with neutrinos (McCarthy et al.)
- **Quijote**: Large simulation suite for cosmological inference (Villaescusa-Navarro et al. 2020)

**Euclid mission preparation:**
- **Euclid Flagship**: ESA mission simulations (Potter et al. 2017)
- **MICE**: Dark energy survey simulations (Fosalba et al. 2015)
- **CosmoSim**: Public database of cosmological simulations

### Review Articles on Massive Neutrinos
- Lesgourgues & Pastor (2006): *Massive neutrinos and cosmology* (Physics Reports)
- Lesgourgues & Pastor (2012): *Neutrino cosmology* (Advances in High Energy Physics)
- Lattanzi & Gerbino (2018): *Status of neutrino properties* (Frontiers in Physics)

## Project Context: DeepCosmoNet at Koexai

This dataset was processed and released as part of the **DeepCosmoNet** project at Koexai S.r.l., which develops deep learning methods for cosmological structure detection and analysis.

**DeepCosmoNet objectives**:
- **3D neural networks** for cosmic void and structure detection in simulation volumes
- **Machine learning classification** of large-scale structure morphologies
- **AI-powered parameter inference** from cosmological observables (power spectra, lensing maps)
- **Generative models** for augmenting limited observational datasets
- **Transfer learning** from high-fidelity simulations to real survey data

**Relation to DEMNUni**:
- DEMNUni provides high-quality training data with ground-truth cosmology
- Massive neutrino effects serve as test case for ML sensitivity to subtle cosmological signals
- All-sky maps enable deep learning on realistic observational geometries (masks, noise, systematics)
- ISW × lensing cross-correlations provide multi-messenger training examples


## Contact and Data Access

### For Questions About DEMNUni Simulations
**Original DEMNUni Collaboration:**
- **Carmelita Carbone** (Principal Investigator)
  - INAF - Osservatorio Astronomico di Brera
  - Milan, Italy
  - Email: [available in publications]

- **Klaus Dolag**
  - Universitäts-Sternwarte München
  - Munich, Germany

**DEMNUni website and data access**: 
- Publications: See "Related Publications" section below
- Data availability: Contact DEMNUni collaboration for original simulation outputs

### For Questions About This Derived Dataset
**Koexai S.r.l.**  
Via Josemaria Escrivá 6  
95125 Catania, Sicily, Italy  

**Technical contact**:
- Email: info@koexai.com
- Website: https://www.koexai.com

**Dataset-specific questions**:
- Processing pipeline and derived products
- Data format and usage instructions
- Integration with DeepCosmoNet analysis tools
- Collaboration opportunities
