Traditional cosmic void-finding algorithms require extensive computational resources, severely limiting their applicability to large-
scale cosmological surveys. We present a novel deep learning approach using a 3D adaptation of the YOLO-like object detection
architecture that reduces this computational burden by orders of magnitude while maintaining a good detection accuracy. Our
method processes voxelised particle density fields at 1 h−1Mpc resolution using a Feature Pyramid Network architecture to detect
voids at different size ranges simultaneously. We have evaluated our method on comoving snapshots of cosmological N-body
simulations, achieving 73% precision and 63% recall, with an average spherical Intersection over Union of 55% for voids ranging
from 10 h−1Mpc to 100 h−1Mpc in diameter. Our approach constitutes a trade-off different from others in the literature, able to
maintain a sufficient accuracy compared to traditional geometric void-finding methods, with a high gain in computational efficiency.
This work represents one of the first applications of modern object detection architectures to 3D cosmological voids structure
identification, enabling real-time void analysis for large-scale cosmic surveys and comprehensive cosmological parameter studies.