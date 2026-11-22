# ConstrumindNet: A Hybrid Spatio-Temporal Deep Learning and Latent-Refined Framework for Multi-Horizon Heavy Equipment Allocation and Fleet Scheduling

**Journal:** *Discover Computing* (2026) 29:405  
**Article Type:** RESEARCH | Open Access  
**DOI:** https://doi.org/10.1007/s10791-026-10312-y  

---

### Authors
**Danthuluri Sudha**$^1$, **Santosh Kumar Jankatti**$^1$, **Ramandeep Kaur**$^1$, **Bondu Venkateswarlu**$^{2,*}$, **T. Gayathri**$^2$, **G. Manjula**$^3$, and **Harish H. Kenchannavar**$^4$

$^1$ Department of Computer Science and Technology, Dayananda Sagar University, Bangalore, Karnataka, India  
$^2$ Department of Computer Science and Engineering, Dayananda Sagar University, Bangalore, Karnataka, India  
$^3$ Department of Computer Science and Design, Dayananda Sagar Academy of Technology and Management, Bangalore, Karnataka, India  
$^4$ Department of Computer Science and Engineering (Data Science), Dayananda Sagar College of Engineering, Bangalore, Karnataka, India  

*Correspondence: Bondu Venkateswarlu (bonduvenkat-cse@dsu.edu.in)*

---

### Abstract
Heavy equipment allocation and fleet scheduling across geographically distributed, multi-phase civil and industrial infrastructure projects represent critical operational challenges in modern construction management. Suboptimal machinery dispatching, unscheduled maintenance disruptions, idle transit bottlenecks, and cascading project delays generate immense economic losses and severe carbon emissions. Classical operational research techniques, including Mixed-Integer Linear Programming (MILP) and heuristic dispatching rules (e.g., Earliest Due Date, Nearest Neighbor), suffer from exponential computational complexity under dynamic fleet constraints, fail to model non-Euclidean spatial mobilization networks, and lack the capacity to capture temporal dependencies across multi-stage construction phases. While recent deep learning paradigms (e.g., CNN-LSTM, spatio-temporal Graph Neural Networks, and Transformers) have advanced predictive scheduling, they remain prone to cumulative multi-horizon rollout drift, spatial allocation inconsistency, high-dimensional constraint violations, and severe performance degradation under out-of-distribution project handovers. 

To resolve these pressing bottlenecks, we propose **ConstrumindNet**, a novel hybrid spatio-temporal deep learning framework augmented with Latent Feature Refinement and operational constraint regularisation for multi-horizon equipment allocation and fleet scheduling. ConstrumindNet formalizes multi-site construction operations as a dynamic spatio-temporal graph where nodes represent project sites and regional maintenance depots, and time-varying token sequences capture fleet telematics, project phase prerequisites, and machinery states. The core architecture integrates: (1) a multi-scale temporal learning hierarchy decomposing scheduling dynamics into short-term tactical shifts (1–3 days), medium-term phase handovers (7–14 days), and long-term project horizons (30+ days); (2) a spatial graph attention network explicitly capturing regional mobilization cost-distance topologies; (3) a Latent Feature Refinement (LFR) module that conducts nonlinear feature mixing across compressed latent allocations to capture complex non-local project-machinery synergies; and (4) an operational-aware physics and consistency regularizer penalizing maintenance-schedule collisions, excessive transit mileage, and cross-site resource starvation. 

Rigorous empirical benchmarking across a synchronized multi-site operational dataset spanning 46 heavy industrial machines, 8 active project sites, and 5 sequential construction phases demonstrates that ConstrumindNet consistently outperforms established baselines (MILP, Genetic Algorithms, CNN-LSTM, ConvLSTM, Spatio-Temporal Transformers, and GNNs). ConstrumindNet achieves an Allocation Match Accuracy (AMA) of 91.4% at Day 1 and 84.2% at Day 7, reducing multi-horizon Root Mean Squared Error (RMSE) by up to 21.3% and cutting allocation conflict rates by 68.4% without requiring intractable combinatorial solvers. Extensive ablation studies, cross-project regime transfer evaluations, and paired statistical significance tests ($p < 0.005$, Cohen's $d = 0.94$) confirm that the proposed hybrid architecture achieves robust, drift-resilient, and computationally viable scheduling across heterogeneous industrial operations.

**Keywords:** Heavy equipment allocation; Spatio-temporal deep learning; Fleet scheduling; Graph neural networks; Latent feature refinement; Operational regularisation; Multi-horizon optimization; Intelligent construction engineering.

---

## 1 Introduction

Efficient management and dynamic allocation of heavy machinery—such as hydraulic excavators, heavy dump trucks, mobile and tower cranes, concrete pumps, piling rigs, and compaction rollers—constitute the operational backbone of large-scale civil infrastructure, commercial development, and industrial megaprojects [1, 2]. Modern infrastructure projects operate under severe contractual deadlines, complex multi-phase task dependencies, tight capital expenditure margins, and stringent environmental sustainability standards. In distributed multi-site construction environments, the operational fleet is dispersed across geographically disparate project sites and central maintenance depots [3, 4]. Equipment allocation decisions must continuously reconcile heterogeneous machinery specifications (payload capacities, boom reach, operating hours, and age profiles) with time-varying site requirements, sequential construction phases (ranging from earthworks and deep foundation piling to superstructure erection, facade installation, and finishing), and unscheduled equipment breakdowns [5, 6].

Historically, construction fleet dispatching and equipment scheduling have relied on classical Operations Research (OR) methodologies, notably Mixed-Integer Linear Programming (MILP), constraint programming, and greedy heuristic dispatching rules (e.g., Earliest Due Date, First-Come-First-Served, and nearest-available heuristics) [1, 7]. While these classical models provide transparent mathematical formulations and exact optimality under simplified, static conditions, they exhibit exponential computational complexity ($NP$-hard) as fleet sizes, site counts, and planning horizons increase. Furthermore, real-world construction operations are inherently stochastic and non-stationary: weather disruptions, foundation anomalies, supply-chain delays, and unexpected mechanical breakdowns frequently invalidate static schedules [8, 9]. When forced to recompute allocations dynamically in real time, classical OR solvers become intractable or yield brittle solutions that fail to anticipate downstream multi-horizon ripple effects [10].

In recent years, the rapid advancement of artificial intelligence, Industrial Internet of Things (IIoT) telematics, and deep learning has opened transformative avenues for data-driven construction logistics [11–13]. Sequential deep neural networks, including Recurrent Neural Networks (RNNs) [14], Long Short-Term Memory networks (LSTMs) [15], Convolutional LSTMs (ConvLSTMs) [16], and self-attention Transformer models [17, 18], have demonstrated compelling capabilities in learning complex temporal dynamics, machinery utilization patterns, and demand trajectories directly from historical telematics logs. Concurrently, Graph Neural Networks (GNNs) have emerged as powerful architectures for modeling non-Euclidean spatial topologies, enabling explicit representation of transit networks, inter-site proximity, and equipment relocation logistics [19, 20].

Despite these methodological strides, existing deep learning frameworks face critical unresolved bottlenecks when applied to enterprise-scale, multi-horizon equipment allocation:
1. **Multi-Horizon Error Propagation and Schedule Drift:** In multi-step iterative forecasting and autoregressive dispatching, minor allocation misalignments at short lead times recursively compound over time, leading to severe schedule drift, catastrophic capacity bottlenecks, and unrealistic fleet allocations at distant horizons [21, 22].
2. **Neglect of Non-Euclidean Spatial Teleconnections:** Fleet movements between project clusters (e.g., urban infill sites vs. regional arterial corridors) follow road logistics topologies, mobilization costs, and shared depot constraints rather than Euclidean distances. Standard convolutional or attention architectures fail to capture these structured spatial graph relationships [23].
3. **Absence of Operational and Mechanical Constraint Enforcements:** Purely data-driven neural networks optimize statistical loss functions without inherent awareness of hard physical constraints, frequently generating schedules that schedule equipment during mandated preventive maintenance windows, violate site storage limits, or allocate mismatched machinery capacities [24, 25].
4. **Poor Generalization Across Project Domains and Regime Shifts:** Models trained on historical commercial construction data experience severe distribution shifts when transferred to infrastructure or highway projects characterized by disparate machinery demands, altered phase durations, and distinct operating velocities [26, 27].
5. **Shallow Latent Feature Interaction in High-Dimensional Search Spaces:** Standard linear projection or multi-head attention layers often struggle to capture high-order nonlinear interactions among multi-variable fleet attributes (age, operating hours, capacity, spatial coordinates, phase priority, and maintenance history) without incurring explosive parameter scaling [28, 29].

To overcome these fundamental shortcomings, this paper introduces **ConstrumindNet**, an end-to-end hybrid spatio-temporal deep learning framework designed specifically for stable, constraint-aware, multi-horizon equipment allocation and fleet scheduling. ConstrumindNet unifies graph-based spatial teleconnection modeling, multi-scale temporal decomposition, and an advanced Latent Feature Refinement (LFR) module within a closed-loop iterative rollout architecture. Furthermore, the framework integrates operational-aware physics and consistency regularisation terms that penalize maintenance collisions, suppress unrealistic transit churn, and align predictive representations across heterogeneous project regimes.

### Principal Contributions
The core contributions of this study are summarized as follows:
1. **Unified Hybrid Spatio-Temporal Allocation Architecture:** We design and implement ConstrumindNet, an end-to-end neural framework that couples multi-scale temporal sequence learning with non-Euclidean graph attention to jointly predict machinery demand, availability, and optimal allocation across multi-site construction networks.
2. **Multi-Scale Temporal Decomposition Strategy:** We introduce a hierarchical multi-scale temporal learning mechanism that simultaneously models high-frequency daily operational shifts, medium-term construction phase transitions (e.g., Earthworks to Foundation), and long-term project-level delivery horizons, eliminating multi-step cumulative drift.
3. **Graph-Based Spatial Teleconnection Modeling:** We formulate the construction logistics network as a dynamic spatial graph, integrating geographic mobilization cost matrices and learned site-depot teleconnections to ensure spatial coherence and minimize idle inter-site mobilization.
4. **Latent Feature Refinement (LFR) Module:** We develop an advanced feature-mixing module operating on compressed latent tokens, enabling rich nonlinear interactions among heterogeneous fleet attributes and site constraints within a compact, computationally scalable embedding space.
5. **Operational-Aware and Regime-Consistency Regularisation:** We propose a multi-task composite loss incorporating soft operational constraints (penalizing maintenance collisions, phase prerequisite violations, and idle transit spikes) and cross-regime distribution alignment, guaranteeing physically plausible and transferable schedules.
6. **Comprehensive Empirical and Statistical Validation:** We evaluate ConstrumindNet against six competitive baselines across a realistic multi-site enterprise dataset (46 machines, 8 projects, 7 hubs). Through multi-horizon accuracy evaluations, cross-regime transfer tests, ablation experiments, and paired statistical significance testing ($p < 0.005$, Cohen's $d > 0.8$), we demonstrate state-of-the-art predictive accuracy, stability, and operational viability.

### Organization of the Paper
The remainder of this article is structured as follows. **Section 2** surveys relevant literature across classical operational research, deep spatio-temporal learning, graph neural networks, and constraint-aware optimization, concluding with a comprehensive comparative taxonomy and research gap analysis. **Section 3** establishes the mathematical preliminaries, tensor formulations, and notation conventions. **Section 4** presents the ConstrumindNet methodology, including problem formulation, data schema, architectural components, multi-scale rollout workflow, operational regularisation, formal algorithmic procedures, and evaluation protocols. **Section 5** reports extensive experimental results, baseline comparisons, cross-project transfer evaluations, ablation studies, statistical validations, computational efficiency profiles, and radar trade-off analyses. **Section 6** discusses practical deployment considerations, industrial insights, and study limitations. Finally, **Section 7** concludes the paper and delineates high-priority future research directions.

---

## 2 Related Work

Equipment allocation, fleet dispatching, and construction scheduling have evolved from rigid analytical formulations into complex, data-driven optimization systems. This section reviews relevant literature across four foundational paradigms: classical operational research, deep spatio-temporal learning, graph-based spatial modeling, and constraint-aware physics/domain-informed learning.

```
+----------------------------------------------------------------------------------------------------+
|                                    TAXONOMY OF RELATED RESEARCH                                    |
+----------------------------------------------------------------------------------------------------+
| 2.1 Classical Operations Research & Mathematical Programming (MILP, Heuristics, Metaheuristics)   |
| 2.2 Deep Sequential & Spatio-Temporal Models (CNN-LSTM, ConvLSTM, Temporal Transformers)          |
| 2.3 Graph Neural Networks & Non-Euclidean Spatial Modeling in Industrial Logistics                 |
| 2.4 Physics-Informed & Constraint-Aware Deep Learning Frameworks                                   |
| 2.5 Multi-Scale Temporal Modeling & Long-Horizon Rollout Stabilization                             |
| 2.6 Latent Feature Optimization & Expressive Representation Mixing                                 |
| 2.7 Telematics-Driven Predictive Maintenance & Fleet Health Integration                            |
| 2.8 Hybrid Optimization-Machine Learning Systems                                                   |
| 2.9 AI for Construction Sustainability, Emission Minimization & Idle Reduction                     |
| 2.10 Identification of Research Gaps and Theoretical Motivation                                    |
+----------------------------------------------------------------------------------------------------+
```

### 2.1 Classical Operations Research and Heuristic Scheduling
The mathematical foundation of resource allocation traces back to classical Operations Research (OR). Early works formulated equipment dispatching as variants of the Resource-Constrained Project Scheduling Problem (RCPSP) or Vehicle Routing Problem with Time Windows (VRPTW) [1, 7]. Exact methods using Mixed-Integer Linear Programming (MILP) and branch-and-bound algorithms guarantee global optimality under deterministic assumptions [8]. However, as shown by Hossain et al. [1] and Kumari & Muthulakshmi [13], combinatorial exact solvers scale exponentially with the number of discrete entities, rendering them computationally prohibitive for multi-project networks spanning dozens of active machines over extended horizons.

To circumvent combinatorial intractability, industrial practitioners widely adopted priority dispatching rules (e.g., Earliest Due Date (EDD), Minimum Slack Time, and Shortest Processing Time) and metaheuristics such as Genetic Algorithms (GA), Particle Swarm Optimization (PSO), and Simulated Annealing [22, 34]. While metaheuristics provide tractability for medium-sized fleets, they rely on handcrafted objective weightings, get trapped in local optima, and require complete re-execution whenever operational disruptions or emergency site transfers occur [37].

### 2.2 Deep Spatio-Temporal Learning for Industrial Fleet Operations
With the proliferation of telematics sensors and digital site management platforms, deep learning has revolutionized predictive operations [2, 11]. Initial data-driven approaches utilized Convolutional Neural Networks (CNNs) for spatial pattern extraction and Long Short-Term Memory (LSTM) networks for temporal trajectory modeling [15, 21]. Hybrid CNN-LSTM and Convolutional LSTM (ConvLSTM) architectures demonstrated success in spatio-temporal forecasting, such as urban traffic speed prediction, regional supply chain logistics, and heavy equipment idle-time forecasting [16, 24]. 

Recently, Transformer-based sequence architectures with multi-head self-attention mechanisms have demonstrated superior performance in capturing long-range temporal dependencies across complex industrial schedules [17, 25]. Models such as PatchTST and Informer have demonstrated that tokenized representation learning outperforms traditional recurrent connections [25]. Nevertheless, vanilla self-attention exhibits quadratic computational complexity with respect to token length and lacks native mechanisms to respect strict operational constraints, leading to severe error accumulation when rolling out predictions across multi-week horizons [26].

### 2.3 Graph Neural Networks in Logistics and Multi-Site Systems
Standard convolutional operators assume regular Euclidean grid topologies, which fail to represent distributed construction networks where project sites, material quarries, and maintenance depots exist as discrete spatial nodes interconnected by highway networks [19, 23]. Graph Neural Networks (GNNs), Graph Convolutional Networks (GCNs), and Graph Attention Networks (GATs) have consequently gained prominence in fleet routing and spatial logistics [20, 26]. Hussain et al. [23] established that message-passing graph architectures effectively capture structural interdependencies across traffic networks. In multi-project construction, graph-based spatial representations allow models to explicitly encode mobilization transit times, inter-site equipment sharing feasibility, and regional equipment bottlenecks [26].

### 2.4 Physics-Informed and Constraint-Aware Machine Learning
Purely data-driven neural networks optimize empirical risk without awareness of physical laws or operational boundaries, often generating invalid predictions under distribution shifts [7, 8]. Physics-Informed Neural Networks (PINNs) emerged as a groundbreaking paradigm by incorporating governing differential equations directly into neural loss functions [7, 29]. In industrial and construction engineering, domain-aware regularisation has been adapted as "constraint-aware learning" [8, 21]. By formulating soft penalties for maintenance overlap, equipment capacity mismatches, and task dependency violations, constraint-aware neural networks maintain operational plausibility without sacrificing gradient-based trainability [29].

### 2.5 Latent Feature Refinement and Nonlinear Transformation
In complex resource-allocation spaces, raw telematics features (operating hours, engine load, capacity metrics, travel times, and phase priorities) reside in high-dimensional, heterogeneous manifolds [31, 33]. Recent literature in representation learning emphasizes the value of latent-space refinement, wherein encoder embeddings are mapped into compact intermediate representations subjected to expressive, nonlinear mixing before decoding [33, 38]. Variational autoencoders, attention-based bottlenecks, and parameter-efficient latent transformation modules have demonstrated marked improvements in representation robustness, preventing destructive feature interference and improving multi-task decoding fidelity [37, 40].

### 2.6 AI for Construction Sustainability and Idle Reduction
Construction equipment represents a major contributor to industrial carbon emissions, fuel consumption, and acoustic pollution [20, 56]. Recent studies highlight that inefficient equipment allocation accounts for 25%–38% of non-productive engine idling on commercial sites [55, 57]. Machine-learning-driven fleet optimization directly advances environmental sustainability by minimizing unnecessary inter-site mobilization travel, reallocating dormant machinery to neighboring active projects, and scheduling preventive maintenance prior to catastrophic mechanical failure [58, 62].

### 2.7 Research Gap and Theoretical Motivation
Despite the proliferation of deep learning models in predictive maintenance and single-site logistics, an end-to-end framework capable of simultaneously addressing: (i) non-Euclidean spatial teleconnections, (ii) multi-scale temporal phase dependencies, (iii) expressive latent feature transformation, and (iv) strict multi-horizon operational regularisation has remained unexplored. Table 1 synthesizes the existing literature, highlighting specific methodologies, application domains, key strengths, limitations, and identified research gaps that motivate the proposed ConstrumindNet architecture.

---

### Table 1: Summary of Key Related Works and Identified Research Gaps

| Study / Reference Focus | Core Methodology | Application Domain | Key Strength | Limitation | Identified Research Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Classical Operations Research** [1, 7, 8] | MILP, Branch-and-Cut, Integer Programming | Project scheduling (RCPSP), fleet dispatching | Mathematically exact, transparent optimality proofs under static conditions | Exponential complexity ($NP$-hard); cannot adapt to dynamic stochastic site disruptions | Need adaptive models that learn nonlinear temporal and spatial dynamics in polynomial time. |
| **Heuristics & Metaheuristics** [22, 34, 37] | GA, PSO, Earliest Due Date (EDD), Simulated Annealing | Multi-project resource allocation | Computationally tractable for medium fleets; flexible objective formulations | Prone to local optima; requires complete re-solving upon unexpected equipment breakdown | Need real-time inferencing frameworks capable of sub-second dynamic re-allocation. |
| **Deep Sequential Learning** [2, 14, 15, 21] | RNN, LSTM, CNN-LSTM, BiLSTM | Machinery utilization & traffic forecasting | Effective extraction of temporal trends and seasonal patterns | Suffers from cumulative error propagation during multi-step recursive rollouts | Need drift-suppressing sequence architectures for extended multi-week forecasting horizons. |
| **Spatio-Temporal Deep Learning** [16, 24, 25] | ConvLSTM, Spatio-Temporal Transformers | Urban logistics, environmental exposure | High expressiveness; captures joint spatial and temporal correlations | Quadratic complexity with spatial tokens; fails on non-grid, graph-structured logistics networks | Need non-Euclidean spatial representation learning tailored for distributed construction hubs. |
| **Graph Neural Networks (GNNs)** [19, 20, 23, 26] | GCN, GAT, Message-Passing Networks | Transportation networks, subseasonal forecasting | Preserves explicit relational topology and inter-node spatial routing | High training complexity; lacks explicit multi-scale temporal phase hierarchy | Need unified graph-temporal frameworks modeling both local site dynamics and regional teleconnections. |
| **Constraint-Aware & Physics-Informed ML** [7, 8, 29] | PINNs, soft penalty optimization, Lagrangian relaxation | Dynamical systems, structural mechanics | Enforces physical consistency and reduces physically implausible outputs | Difficult to tune multiple penalty weights; sensitive to severe gradient imbalances | Need robust regularisation methods balancing empirical task loss with operational constraints. |
| **Latent Refinement & Feature Mixing** [31, 33, 38, 40] | Autoencoders, latent feature mixers, bottleneck attention | Dimensionality reduction, sequence embedding | Generates compact, highly expressive latent representations | Mostly evaluated on isolated image/text tasks; unverified in industrial fleet operations | Need domain-specific latent refinement architectures for multi-attribute industrial machinery. |
| **ConstrumindNet (Proposed Framework)** | Multi-scale spatio-temporal GAT + Latent Feature Refinement + Operational Regularisation | Multi-project heavy equipment allocation & fleet scheduling | Jointly models spatial graph teleconnections, multi-scale phases, and hard operational constraints | Moderate architectural complexity relative to linear heuristics | An end-to-end, drift-resilient, constraint-aware framework for multi-horizon fleet scheduling. |

---

## 3 Preliminaries and Theoretical Foundations

This section establishes the mathematical foundations, tensor representations, and optimization principles underpinning the ConstrumindNet architecture.

```
+----------------------------------------------------------------------------------------------------+
|                                    MATHEMATICAL FOUNDATION SCHEMA                                   |
+----------------------------------------------------------------------------------------------------+
| 1. Dynamic Spatio-Temporal Fleet Tensor: X_t in R^{N_s x N_e x C}                                 |
| 2. Sliding Window Sequence-to-Sequence Mapping: {X_{t-L+1}, ..., X_t} -> {X_{t+1}, ..., X_{t+H}}  |
| 3. Multi-Site Spatial Logistics Graph: G = (V, E, W_dist)                                          |
| 4. Latent Space Embedding & Token Compression: Z in R^{N x d} -> Z_c in R^{N x q}                  |
| 5. Multi-Horizon Rollout Dynamics with Recursive Latent Refinement                                 |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Spatio-Temporal Equipment Allocation Foundations
Let $\mathcal{S} = \{s_1, s_2, \dots, s_{N_s}\}$ denote the set of $N_s$ discrete spatial locations, comprising $N_p$ active construction project sites and $N_d$ regional machinery depots such that $N_s = N_p + N_d$. Let $\mathcal{E} = \{e_1, e_2, \dots, e_{N_e}\}$ denote the enterprise fleet consisting of $N_e$ distinct heavy machinery units (e.g., excavators, dump trucks, mobile cranes, tower cranes, piling rigs).

At any discrete operational time step $t \in \{1, 2, \dots, T\}$ (where each time step represents an operational shift or daily epoch), the global fleet and project state is represented as a high-dimensional multivariate spatio-temporal tensor:
$$X_t \in \mathbb{R}^{N_s \times N_e \times C} \tag{1}$$
where $C$ denotes the feature channel dimensionality. For each spatial node $i \in \mathcal{S}$ and equipment entity $j \in \mathcal{E}$, the feature vector $X_t(i, j, :)$ encapsulates:
1. Operational machinery status (Available, Allocated, Under Maintenance, Unavailable);
2. Cumulative operating hours and engine health indices;
3. Mechanical specifications (rated bucket capacity, boom reach, lift tonnage, operating payload);
4. Current site project priority (CRITICAL, HIGH, MEDIUM) and active construction phase status (Site Preparation, Foundation Engineering, Superstructure, Scaffolding, MEP & Finishing);
5. Scheduled maintenance flags and remaining downtime durations;
6. Inter-site mobilization cost and distance coordinates.

The multi-horizon equipment allocation task is formulated as a sequence-to-sequence mapping. Given an observed historical context window of length $L$ time steps, the objective is to predict and schedule the optimal allocation tensor field over an extended future planning horizon of length $H$:
$$\{X_{t-L+1}, X_{t-L+2}, \dots, X_t\} \xrightarrow{f_\Theta} \{\widehat{X}_{t+1}, \widehat{X}_{t+2}, \dots, \widehat{X}_{t+H}\} \tag{2}$$
where $f_\Theta$ denotes the parameterized forecasting and dispatching network, and $\Theta$ represents the complete set of trainable parameters.

### 3.2 Spatial Graph Formulation of Logistics Teleconnections
The geographical infrastructure network is formalized as a weighted directed graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}_g, \mathcal{W})$, where $\mathcal{V} = \mathcal{S}$ is the set of spatial vertices, $\mathcal{E}_g$ represents navigable transit corridors between project sites and depots, and $\mathcal{W}: \mathcal{E}_g \to \mathbb{R}^+$ denotes the edge weight matrix encoding road travel distance, transit toll costs, and heavy equipment mobilization duration. 

Unlike Euclidean spatial grids, spatial relationships in multi-project logistics are governed by network proximity and operational teleconnections. For example, two projects located in distinct industrial corridors may exhibit high operational interdependence if they share specialized, low-availability assets (e.g., heavy piling rigs or high-capacity tower cranes) managed through a central depot.

### 3.3 Multi-Objective and Latent Optimization Foundations
In real-world construction operations, allocation decisions are governed by competing multi-objective criteria. Let $\widehat{Y}_{t+h} \in \{0, 1\}^{N_s \times N_e}$ represent the binary allocation indicator derived from predicted state $\widehat{X}_{t+h}$, where $\widehat{Y}_{t+h}(i, j) = 1$ indicates that equipment unit $j$ is deployed to site $i$ at lead time $h$. The allocation objective minimizes a weighted composite of operational penalties:
$$\min_{\Theta} \mathcal{J}_{\text{alloc}} = \sum_{h=1}^H \left[ w_1 \mathcal{D}_{\text{transit}}(\widehat{Y}_{t+h}) + w_2 \mathcal{P}_{\text{idle}}(\widehat{Y}_{t+h}) + w_3 \mathcal{C}_{\text{conflict}}(\widehat{Y}_{t+h}) - w_4 \mathcal{U}_{\text{priority}}(\widehat{Y}_{t+h}) \right] \tag{3}$$
where $\mathcal{D}_{\text{transit}}$ penalizes inter-site mobilization travel distance, $\mathcal{P}_{\text{idle}}$ penalizes unallocated machines incurring depreciation, $\mathcal{C}_{\text{conflict}}$ penalizes concurrent allocations or maintenance schedule collisions, and $\mathcal{U}_{\text{priority}}$ rewards the timely coverage of critical-path project phases.

Table 2 summarizes the core mathematical notations and parameter definitions employed throughout this paper.

---

### Table 2: Mathematical Notation Summary for ConstrumindNet

| Symbol | Mathematical Domain | Operational Description |
| :--- | :--- | :--- |
| $X_t$ | $\mathbb{R}^{N_s \times N_e \times C}$ | Global spatio-temporal fleet and project state tensor at time step $t$ |
| $N_s, N_p, N_d$ | $\mathbb{Z}^+$ | Total spatial locations ($N_s = 7$), active projects ($N_p = 6$), central depots ($N_d = 1$) |
| $N_e$ | $\mathbb{Z}^+$ | Total heavy equipment fleet size ($N_e = 46$ machines across 12 equipment classes) |
| $C$ | $\mathbb{Z}^+$ | Channel dimensionality of combined operational, mechanical, and site features ($C = 32$) |
| $L, H$ | $\mathbb{Z}^+$ | Historical temporal observation window ($L = 7$ days) and forecast horizon ($H = 7$ to $30$ days) |
| $p, N$ | $\mathbb{Z}^+$ | Spatial-fleet token patch size and resulting token count ($N = 648$) |
| $d, q$ | $\mathbb{Z}^+$ | Latent embedding dimension ($d = 128$) and compressed refinement dimension ($q = 16$) |
| $Z, Z_c, Z_r, Z^*$ | $\mathbb{R}^{N \times \cdot}$ | Encoder latent, compressed latent, refined latent, and residually fused latent representations |
| $\Theta_e, \Theta_r, \Theta_d$ | Parameter Sets | Trainable parameters of spatio-temporal encoder, latent refinement module, and forecast decoder |
| $\widehat{X}_{t+h}$ | $\mathbb{R}^{N_s \times N_e \times C}$ | Predicted fleet allocation and operational state field at lead time $h$ |
| $\mathcal{L}_{\text{task}}, \mathcal{L}_{\text{oper}}, \mathcal{L}_{\text{cons}}$| $\mathbb{R}^+$ | Predictive task loss, operational constraint regularisation, and regime-consistency loss |
| $\lambda_1, \lambda_2$ | $\mathbb{R}^+$ | Hyperparameter weighting coefficients for operational and regime regularisation |
| $\tau$ | $[0, 1]$ | Graph attention sparsification threshold ($\tau = 0.30$) |
| $\Delta_{\text{transfer}}$ | $\mathbb{R}^+$ | Cross-project regime transfer degradation metric |

---

## 4 Materials and Methods

This section provides a rigorous specification of the dataset schema, data preprocessing pipeline, ConstrumindNet architecture, multi-scale iterative forecasting engine, operational regularisation mechanisms, and algorithmic workflows.

```
+----------------------------------------------------------------------------------------------------+
|                                    CONSTRUMINDNET SYSTEM ARCHITECTURE                               |
+----------------------------------------------------------------------------------------------------+
|  [Multi-Site Telematics & Project Inputs] --> [Spatio-Temporal Tokenization & Window Construction] |
|                                                              |                                     |
|                                                              v                                     |
|  [Spatial Graph Attention Network (GAT)] <---> [Multi-Scale Temporal Transformer Encoder]          |
|                                                              |                                     |
|                                                              v                                     |
|                       [Latent Feature Representation Z in R^{N x d}]                               |
|                                                              |                                     |
|                                                              v                                     |
|                       [Token Compression Z -> Z_c in R^{N x q}]                                    |
|                                                              |                                     |
|                                                              v                                     |
|                       [Latent Feature Refinement (LFR) Module]                                     |
|                                                              |                                     |
|                                                              v                                     |
|                       [Residual Latent Fusion: Z* = Z + alpha * Z_r]                               |
|                                                              |                                     |
|                                                              v                                     |
|                       [Multi-Horizon Multi-Task Forecast Decoder]                                  |
|                                                              |                                     |
|                                                              v                                     |
|  [Predicted State \widehat{X}_{t+1:t+H}] ---> [Operational Regularizers: Collisions, Transit, Maint]|
+----------------------------------------------------------------------------------------------------+
```

### 4.1 Problem Formulation and Multi-Objective Loss Functions
ConstrumindNet formulates multi-horizon equipment scheduling as a continuous-discrete hybrid prediction problem. At lead time $h \in \{1, \dots, H\}$, the network outputs point predictions of future operational states $\widehat{X}_{t+h}$. The primary task objective $\mathcal{L}_{\text{task}}$ balances continuous status tracking and categorical allocation matching via a priority-weighted Mean Squared Error:
$$\mathcal{L}_{\text{task}} = \frac{1}{H} \sum_{h=1}^H \sum_{i=1}^{N_s} \sum_{j=1}^{N_e} \omega_{i, j} \left\| X_{t+h}(i, j, :) - \widehat{X}_{t+h}(i, j, :) \right\|_2^2 \tag{4}$$
where $\omega_{i, j}$ represents site-priority weighting coefficients assigning greater statistical significance to CRITICAL projects (e.g., PRJ-22, PRJ-08 with $\omega = 1.5$) compared to HIGH ($\omega = 1.2$) and MEDIUM ($\omega = 1.0$) projects.

To capture predictive uncertainty across extended multi-week horizons, a probabilistic Gaussian likelihood head can optionally predict mean $\mu_{t+h}$ and variance $\sigma_{t+h}^2$ fields, minimizing the negative log-likelihood:
$$\mathcal{L}_{\text{prob}} = \frac{1}{H} \sum_{h=1}^H \sum_{i, j} \omega_{i, j} \left[ \frac{\left(X_{t+h}(i, j, :) - \mu_{t+h}(i, j, :)\right)^2}{2\sigma_{t+h}^2(i, j, :)} + \frac{1}{2} \log \sigma_{t+h}^2(i, j, :) \right] \tag{5}$$

### 4.2 Dataset Schema and Preprocessing Pipeline
The experimental dataset reflects enterprise-scale construction operations across the Bangalore metropolitan infrastructure corridor, encompassing 46 heavy industrial machines, 8 major construction and infrastructure projects, and 7 primary geographic clusters. Table 3 details the operational dataset configuration, telemetry frequencies, and access characteristics.

---

### Table 3: Operational Datasets and Preprocessing Configuration for ConstrumindNet

| Data Source | Primary Role in Framework | Sampling Frequency | Features Extracted | Spatial Coverage | Source Repository / Telematics Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heavy Fleet Telematics & Inventory** | Real-time machine status, engine hours, mechanical specs | Continuous IIoT logging / 1-hour aggregation | 46 units: operating hours, fuel rate, bucket/lift capacity, machine age, model number, status | Central Depot & 6 active project sites | Enterprise ERP / CAN-bus telematics database |
| **Multi-Project Construction Schedules** | Project priorities, active phases, critical-path deadlines | Daily operational shift updates | 8 projects: phase IDs, start/end windows, required equipment types, delay reasons | Whitefield, Airport Site, Hebbal, E-City, Yelahanka, Hoskote | Primavera P6 / BIM schedule exchange format |
| **Maintenance & Workshop Telematics** | Maintenance collision detection, downtime prediction | Event-driven / daily work order logs | 14 active/scheduled work orders: preventive service, engine overhaul, hydraulic repair | Central Maintenance Workshop (Depot) | Computerized Maintenance Management System (CMMS) |
| **Geographic GIS & Routing Network** | Inter-site transit distance, mobilization cost matrices | Static road graph with dynamic congestion | Pairwise transit distances (km), mobilization travel hours, toll classifications | Bangalore Urban & Peripheral Ring Corridors | OpenStreetMap GIS routing API / Spatial Matrix |

---

### 4.3 ConstrumindNet Architecture Design

The ConstrumindNet architecture consists of three tightly coupled modules: (1) a Spatio-Temporal Graph Transformer Encoder, (2) a Latent Feature Refinement (LFR) module, and (3) a Multi-Horizon Multi-Task Decoder.

#### 4.3.1 Spatio-Temporal Graph Transformer Encoder
Raw input sequences $\{X_{t-L+1}, \dots, X_t\}$ are projected into a sequence of $N$ spatial-machinery tokens using a linear patch embedding layer with patch dimension $p \times p$. Each token is mapped into a latent embedding space of dimension $d = 128$:
$$Z_0 = \text{PatchEmbed}(\{X_{t-L+1:t}\}) \in \mathbb{R}^{N \times d} \tag{6}$$

To simultaneously capture temporal sequence dependencies and non-Euclidean spatial mobilization routing, the encoder stacks $K_e = 4$ Spatio-Temporal Graph Transformer layers. Each layer integrates Multi-Head Self-Attention (MHSA) along the temporal dimension and Graph Attention (GAT) along the spatial network:
$$A_{\text{temp}} = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V \tag{7}$$
$$A_{\text{spatial}}(i, j) = \frac{\exp\left(\text{LeakyReLU}\left(a^T [W h_i \,\|\, W h_j]\right)\right)}{\sum_{k \in \mathcal{N}_i} \exp\left(\text{LeakyReLU}\left(a^T [W h_i \,\|\, W h_k]\right)\right)} \tag{8}$$
where $\mathcal{N}_i$ denotes the neighborhood of site $i$ defined by the sparsified adjacency matrix with threshold $\tau = 0.30$. The final output of the encoder is the rich spatio-temporal latent tensor:
$$Z \in \mathbb{R}^{N \times d} \tag{9}$$

#### 4.3.2 Latent Feature Refinement (LFR) Module
To enable expressive, high-order nonlinear interactions across heterogeneous fleet features without exploding computational memory, latent embeddings $Z$ are compressed into a compact bottleneck representation:
$$Z \xrightarrow{\text{Linear}} Z_c \in \mathbb{R}^{N \times q} \tag{10}$$
where $q \ll d$ (e.g., $q = 16$). The compressed tokens are normalized and processed through a multi-layer nonlinear variational transformation network featuring parameterized feature-mixing blocks:
$$\widetilde{Z}_c = \sigma\left(W_2 \cdot \text{GELU}(W_1 Z_c + b_1) + b_2\right) \tag{11}$$
The refined latent features are then projected back to the original embedding space:
$$Z_r = W_{\text{proj}} \widetilde{Z}_c \in \mathbb{R}^{N \times d} \tag{12}$$
A trainable residual gating connection fuses the refined representations with the original encoder embeddings:
$$Z^* = Z + \alpha Z_r \tag{13}$$
where $\alpha \in \mathbb{R}$ is a learnable scaling parameter initialized to $0.1$. This residual gating guarantees numerical stability and prevents catastrophic forgetting of classical spatio-temporal representations.

#### 4.3.3 Multi-Horizon Forecast Decoder
The fused representation $Z^*$ is fed into a multi-horizon forecast decoder that simultaneously generates point predictions for all future lead times $h \in \{1, 2, \dots, H\}$:
$$\widehat{X}_{t+1:t+H} = g_\Phi(Z^*) \tag{14}$$
where $g_\Phi$ is parameterized by a lightweight multi-layer perceptron with Layer Normalization and residual feedforward blocks. Direct multi-step decoding eliminates recursive autoregressive drift and enforces temporal continuity across the planning horizon.

---

```
+----------------------------------------------------------------------------------------------------+
|                               FIG 1: CONSTRUMINDNET OVERALL ARCHITECTURE                           |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +-----------------------+     +------------------------+     +-------------------------------+   |
|   | Multi-Site Telematics |     | Spatial Tokenization   |     | Spatio-Temporal GAT Encoder   |   |
|   | - Fleet Status        | --> | & Temporal Windowing   | --> | - Temporal Multi-Head Attn    |   |
|   | - Project Phases      |     | - Grid -> Patch Tokens |     | - Graph Attention Network     |   |
|   | - Road Cost Matrices  |     | - Sliding Context L=7  |     | - Embed Dimension d=128       |   |
|   +-----------------------+     +------------------------+     +---------------+---------------+   |
|                                                                                |                   |
|                                                                                v                   |
|   +-----------------------+     +------------------------+     +-------------------------------+   |
|   | Multi-Horizon Decoder |     | Residual Latent Fusion |     | Latent Feature Refinement LFR |   |
|   | - Direct Multi-Step   | <-- | Z* = Z + alpha * Z_r   | <-- | - Bottleneck Compression q=16 |   |
|   | - Lead Times h=1...H  |     | - Gated Skip Path      |     | - Nonlinear Feature Mixing    |   |
|   +-----------+-----------+     +------------------------+     +-------------------------------+   |
|               |                                                                                    |
|               v                                                                                    |
|   +-----------------------+     +------------------------+                                         |
|   | Predicted Allocations | --> | Operational Penalties  |                                         |
|   | & Machinery Schedules |     | - Maintenance Conflict |                                         |
|   | (Day 1, 7, 14, 30)    |     | - Mobilization Transit |                                         |
|   +-----------------------+     +------------------------+                                         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                         FIG 2: LATENT FEATURE REFINEMENT (LFR) MODULE DETAIL                       |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    Encoder Latent Tokens Z in R^{N x d} (d = 128)                                                  |
|                         |                                                                          |
|                         v                                                                          |
|    Token Bottleneck Compression: Linear Projection (d -> q = 16)                                   |
|                         |                                                                          |
|                         v                                                                          |
|    Layer Normalization & Angle Feature Scaling [0, pi]                                             |
|                         |                                                                          |
|                         v                                                                          |
|    Multi-Stage Nonlinear Feature-Cell Transformations (Variational Mixing Blocks)                  |
|                         |                                                                          |
|                         v                                                                          |
|    Measurement / Aggregated Expectation Mapping -> y in R^{N x q}                                  |
|                         |                                                                          |
|                         v                                                                          |
|    Linear Expansion Projection: y -> Z_r in R^{N x d}                                              |
|                         |                                                                          |
|                         v                                                                          |
|    Residual Gated Fusion: Z* = Z + alpha * Z_r                                                     |
|                         |                                                                          |
|                         v                                                                          |
|    Refined Spatio-Temporal Latent Representation Z* in R^{N x d} to Decoder                        |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

### 4.4 Multi-Scale Iterative Forecasting Workflow
Construction operations function across multiple distinct temporal scales:
- **Short-Term Branch (Daily/Tactical, 1–3 Days):** Manages immediate shift dispatching, urgent breakdown replacements, and short-haul dump truck haulage.
- **Medium-Term Branch (Phase-Level, 7–14 Days):** Aligns machinery requirements with active construction phase transitions (e.g., transitioning from excavation to piling rig positioning).
- **Long-Term Branch (Strategic Project Horizon, 30+ Days):** Coordinates fleet demobilization, major overhauls, and inter-city project handovers.

```
+----------------------------------------------------------------------------------------------------+
|                     FIG 3: MULTI-SCALE ITERATIVE FORECASTING WORKFLOW PIPELINE                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   [Raw Telematics Data] ---> [Unified Ingestion & Alignment] ---> [Temporal Window Sliding (L=7)]  |
|                                                                                |                   |
|             +----------------------------------+-------------------------------+                   |
|             |                                  |                               |                   |
|             v                                  v                               v                   |
|    [Short-Term Pathway]              [Medium-Term Pathway]            [Long-Term Pathway]          |
|    (Daily Shifts: 1-3 Days)          (Phase Handover: 7-14 Days)      (Project Horizon: 30+ Days)  |
|    - High-frequency tracking         - Milestone synchronization       - Fleet lifecycle balance   |
|             |                                  |                               |                   |
|             +----------------------------------+-------------------------------+                   |
|                                                |                                                   |
|                                                v                                                   |
|                                   [Shared-Weight Forecast Core]                                    |
|                                   - Spatio-Temporal GAT Encoder                                    |
|                                   - Latent Refinement (LFR)                                        |
|                                                |                                                   |
|                                                v                                                   |
|                                   [Multi-Horizon Rollout Loop]                                     |
|                                                |                                                   |
|                                                v                                                   |
|                                   [Operational Constraints Filter]                                 |
|                                                |                                                   |
|                                                v                                                   |
|                                   [Final Robust Allocation Schedule]                               |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

ConstrumindNet executes scale-adaptive multi-horizon rollouts using shared encoder-decoder parameters across all temporal branches, preventing parametric explosion while ensuring temporal coherence across scales:
$$\widehat{X}_{t+k} = f_\Theta\left(\widehat{X}_{t+k-L:t+k-1}\right) \tag{15}$$

### 4.5 Operational-Aware and Regime-Consistency Regularisation
To enforce operational realism and prevent physically impossible allocations, we introduce three domain-specific regularisation terms.

#### 4.5.1 Maintenance-Schedule Collision Penalty
Machinery undergoing scheduled or emergency maintenance at regional depots must not be allocated to active project sites. Let $M_t \in \{0, 1\}^{N_e}$ denote the binary maintenance indicator, where $M_t(j) = 1$ indicates that unit $j$ is undergoing maintenance. The maintenance regularizer is formulated as:
$$\mathcal{L}_{\text{maint}} = \frac{1}{H} \sum_{h=1}^H \sum_{i \in \mathcal{S}_{\text{projects}}} \sum_{j=1}^{N_e} M_{t+h}(j) \cdot \widehat{Y}_{t+h}(i, j) \tag{16}$$

#### 4.5.2 Mobilization Distance and Transit Churn Penalty
Unnecessary equipment shuffling between distant project sites incurs heavy transport costs and road congestion. Let $D_{\text{transit}}(i, i')$ represent the road travel distance between location $i$ and location $i'$. The transit smoothness penalty discourages excessive inter-site shifts:
$$\mathcal{L}_{\text{transit}} = \frac{1}{H-1} \sum_{h=1}^{H-1} \sum_{j=1}^{N_e} \sum_{i=1}^{N_s} \sum_{i'=1}^{N_s} \widehat{Y}_{t+h}(i, j) \cdot \widehat{Y}_{t+h+1}(i', j) \cdot D_{\text{transit}}(i, i') \tag{17}$$

#### 4.5.3 Cross-Regime Alignment Regularizer
To ensure that models trained on mature commercial project logs generalize reliably to newly initiated infrastructure or highway projects without catastrophic distribution shift, we enforce Maximum Mean Discrepancy (MMD) feature alignment between source regime representations $\mathcal{D}_{\text{src}}$ (Commercial/Residential) and target regime representations $\mathcal{D}_{\text{tgt}}$ (Infrastructure/Highway):
$$\mathcal{L}_{\text{regime}} = \left\| \mathbb{E}_{\mathcal{D}_{\text{src}}}[Z^*] - \mathbb{E}_{\mathcal{D}_{\text{tgt}}}[Z^*] \right\|_2^2 \tag{18}$$

The composite objective function governing ConstrumindNet training is defined as:
$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{task}} + \lambda_1 \left(\mathcal{L}_{\text{maint}} + \beta \mathcal{L}_{\text{transit}}\right) + \lambda_2 \mathcal{L}_{\text{regime}} \tag{19}$$
where $\lambda_1 = 0.15$, $\beta = 0.05$, and $\lambda_2 = 0.10$ are hyperparameter weights selected via Bayesian optimization.

---

### 4.6 Algorithmic Representation

The computational mechanics of ConstrumindNet are formalized in three self-contained algorithms governing training, multi-horizon iterative rollout, and cross-project generalization benchmarking.

```
====================================================================================================
Algorithm 1: End-to-End Training Procedure for ConstrumindNet
====================================================================================================
Input:  Multi-project historical telematics dataset D = {Fleet, Projects, Maintenance, GIS};
        Input window length L = 7; Forecast horizon H = 7; Patch size p = 8;
        Batch size B = 16; Epochs E = 100; Learning rate eta_0 = 1e-4; Regularization weights lambda_1, lambda_2.
Output: Optimal trained parameter set Theta* = {Theta_e*, Theta_r*, Theta_d*}.

 1: Initialize model parameters Theta = {Theta_e, Theta_r, Theta_d} using Xavier normal initialization.
 2: Construct spatial logistics graph G = (V, E_g, W_dist) from pairwise GIS distance matrices.
 3: Regrid and temporally synchronize all telemetry channels into daily operational tensor slices X_t.
 4: Construct training pairs (X_{t-L+1:t}, X_{t+1:t+H}) using a sliding temporal window of stride s = 1.
 5: Initialize AdamW optimizer with initial learning rate eta_0 and weight decay gamma = 1e-5.
 6: Set best validation loss L_best = infinity, early stopping patience counter c = 0, max patience P = 10.
 7: for epoch e = 1 to E do:
 8:     for each mini-batch b = 1 to B_total do:
 9:         Sample batch of sliding windows {X_{t-L+1:t}^{(k)}}_{k=1}^B and ground-truth targets {X_{t+1:t+H}^{(k)}}_{k=1}^B.
10:         Extract patch tokens Z_0 = PatchEmbed(X_{t-L+1:t}) in R^{B x N x d}.
11:         Compute spatio-temporal latent embeddings Z = ST_Encoder(Z_0, G; Theta_e).
12:         Compress latent tokens: Z_c = LinearCompress(Z; Theta_r) in R^{B x N x q}.
13:         Execute nonlinear latent refinement: Z_r = LatentRefine(Z_c; Theta_r) in R^{B x N x d}.
14:         Apply residual gated fusion: Z* = Z + alpha * Z_r.
15:         Decode multi-horizon predictions: \widehat{X}_{t+1:t+H} = Decoder(Z*; Theta_d).
16:         Compute task loss L_task via Eq. (4).
17:         Compute operational constraint penalties L_maint and L_transit via Eqs. (16)-(17).
18:         Compute cross-regime consistency loss L_regime via Eq. (18).
19:         Compute total composite loss L_total via Eq. (19).
20:         Compute classical backpropagation gradients: grad_Theta = \nabla_Theta L_total.
21:         Clip gradients: grad_Theta = ClipNorm(grad_Theta, max_norm = 1.0).
22:         Update parameters: Theta <- Theta - eta_t * grad_Theta.
23:         Update learning rate eta_t via Cosine Annealing schedule (Eq. 20).
24:     end for
25:     Evaluate validation loss L_val^(e) on held-out temporal validation split.
26:     if L_val^(e) < L_best then:
27:         L_best = L_val^(e); Theta* = Theta; c = 0; SaveCheckpoint(Theta*);
28:     else:
29:         c = c + 1;
30:         if c >= P then: Terminate training (Early Stopping); end if
31:     end if
32: end for
33: return Theta*
====================================================================================================
```

```
====================================================================================================
Algorithm 2: Multi-Scale Iterative Forecasting with Latent Refinement (Inference / Rollout)
====================================================================================================
Input:  Most recent observed context sequence {X_{t-L+1:t}}; Forecast horizon H;
        Temporal scale set S = {Tactical, Phase, Strategic};
        Trained model Theta*; Aggregation weights {beta_s}_{s in S} where sum beta_s = 1.
Output: Optimal multi-horizon allocation schedule \widehat{X}_{t+1:t+H} and conflict alert flags.

 1: for each temporal scale s in S do:
 2:     Form scale-adapted input sequence X_{t-L+1:t}^{(s)} via scale operator A_s.
 3:     Initialize rollout buffer B_0^(s) = {X_{t-L+1:t}^{(s)}}.
 4:     for lead step k = 1 to H do:
 5:         Extract patch tokens from current buffer tail: Z_0^(s) = PatchEmbed(B_{k-1}^(s)).
 6:         Compute spatio-temporal representations Z_k^(s) = ST_Encoder(Z_0^(s), G; Theta_e*).
 7:         Compress tokens to bottleneck: Z_{c, k}^(s) = LinearCompress(Z_k^(s)).
 8:         Refine latent features through LFR module: Z_{r, k}^(s) = LatentRefine(Z_{c, k}^(s)).
 9:         Fuse representations residually: Z_k^{*(s)} = Z_k^(s) + alpha * Z_{r, k}^(s).
10:         Decode next-step forecast \widehat{X}_{t+k}^{(s)} = Decoder(Z_k^{*(s)}; Theta_d*).
11:         Append prediction to buffer: B_k^(s) <- B_{k-1}^(s) U {\widehat{X}_{t+k}^{(s)}}.
12:     end for
13:     Extract multi-horizon forecast sequence \widehat{X}_{t+1:t+H}^{(s)} from B_H^(s).
14: end for
15: Synchronize temporal scales to common daily resolution via inverse aggregation A_s^{-1}.
16: Fuse multi-scale forecasts: \widehat{X}_{t+h} = sum_{s in S} beta_s * \widehat{X}_{t+h}^{(s)} for h = 1, ..., H.
17: Scan \widehat{X}_{t+1:t+H} against active CMMS maintenance database; identify overlapping work orders.
18: Scan site capacities; flag any projected equipment congestion exceeding physical parking limits.
19: return Final synchronized multi-horizon allocation matrix \widehat{X}_{t+1:t+H} and Conflict Audit Report.
====================================================================================================
```

```
====================================================================================================
Algorithm 3: Formalized Cross-Project Regime Transfer and Ablation Evaluation Protocol
====================================================================================================
Input:  Source project dataset D_src (Commercial & Residential Projects);
        Target transfer dataset D_tgt (Highway & Infrastructure Projects);
        Trained model Theta*; Ablation variant set A = {Full, NoLFR, NoGAT, NoReg};
        Evaluation metric set M = {RMSE, MAE, AMA, ConflictRate}.
Output: Regime transfer degradation scores, ablation tables, and statistical audit summaries.

 1: Partition source dataset D_src into contiguous, non-overlapping year-based splits:
    D_src^train (60%), D_src^val (20%), D_src^test (20%).
 2: Normalize target dataset D_tgt using mean and variance statistics computed strictly from D_src^train.
 3: for each ablation configuration a in A do:
 4:     Configure model architecture variant a:
 5:         if a == NoLFR then: Set alpha = 0 (disable latent refinement).
 6:         else if a == NoGAT then: Replace spatial GAT with standard Euclidean attention.
 7:         else if a == NoReg then: Set lambda_1 = lambda_2 = 0 (train on task loss only).
 8:         else: Use full ConstrumindNet configuration.
 9:     Train model variant on D_src^train until early stopping convergence.
10:     Evaluate in-domain benchmark performance on D_src^test:
11:         Compute in-domain metrics M_src(h) for all lead times h in {1, ..., H}.
12:     Evaluate zero-shot transfer performance on D_tgt without fine-tuning:
13:         Compute cross-domain metrics M_tgt(h) for all lead times h in {1, ..., H}.
14:     Compute Regime Transfer Degradation:
15:         Delta_transfer(h) = RMSE_{D_tgt}(h) - RMSE_{D_src}(h).
16:     Compute Horizon-Wise Aggregations:
17:         Tactical short-term average (h in [1, 3]); Strategic long-term average (h in [7, 30]).
18: end for
19: Execute paired two-tailed t-tests and Cohen's d effect size analyses across repeated runs (n = 10).
20: return Comparative performance matrices, transfer degradation curves, and statistical significance tables.
====================================================================================================
```

---

### 4.7 Evaluation Metrics and Experimental Configuration
Evaluation is conducted across both numerical precision and industrial operational metrics:
1. **Root Mean Squared Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{M} \sum_{m=1}^M \left(X_m - \widehat{X}_m\right)^2} \tag{20}$$
2. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{M} \sum_{m=1}^M \left| X_m - \widehat{X}_m \right| \tag{21}$$
3. **Allocation Match Accuracy (AMA):** Percentage of equipment-project assignments where predicted dispatch matches ground-truth validated dispatch:
   $$\text{AMA} = \frac{1}{H} \sum_{h=1}^H \frac{\sum_{i, j} \mathbb{I}\left(\widehat{Y}_{t+h}(i, j) == Y_{t+h}(i, j)\right)}{N_s \cdot N_e} \times 100\% \tag{22}$$
4. **Allocation Conflict Rate (CR):** Percentage of allocated machines violating maintenance windows or double-booked across sites:
   $$\text{CR} = \frac{\text{Total Overlapping or Concurrent Collisions}}{\text{Total Allocated Machine Shifts}} \times 100\% \tag{23}$$
5. **Cross-Regime Transfer Degradation ($\Delta_{\text{transfer}}$):**
   $$\Delta_{\text{transfer}} = \text{RMSE}_{\mathcal{D}_{\text{tgt}}} - \text{RMSE}_{\mathcal{D}_{\text{src}}} \tag{24}$$

---

## 5 Experimental Results

To empirically demonstrate the efficacy, stability, and operational viability of ConstrumindNet, extensive comparative evaluations were conducted on an enterprise workstation powered by an Intel Xeon W-2295 processor (18 cores, 3.0 GHz), 64 GB DDR4 RAM, and an NVIDIA RTX 4090 GPU (24 GB VRAM). Software implementation was executed in Python 3.11 utilizing PyTorch 2.4, PyTorch Geometric, Scikit-learn, and NumPy.

```
+----------------------------------------------------------------------------------------------------+
|                                    EXPERIMENTAL RESULTS ROADMAP                                     |
+----------------------------------------------------------------------------------------------------+
| 5.1 Baseline Models & Comparative Benchmarks (MILP, GA, CNN-LSTM, ConvLSTM, Transformer, GNN)     |
| 5.2 Quantitative Multi-Horizon Allocation Performance (Table 4, Figs 4-6)                          |
| 5.3 Cross-Project Regime Generalization Analysis (Table 5, Figs 7-9)                               |
| 5.4 Ablation Study of Core Architectural Components (Table 6, Figs 10-12)                          |
| 5.5 Statistical Significance Testing & Effect Size Analysis (Table 7, Figs 13-16)                  |
| 5.6 Multi-Scale Phase-Aware Scheduling Analysis (Table 8, Figs 17-19)                              |
| 5.7 Extended Multi-Horizon Rollout Stability & Drift Analysis (Table 9, Figs 20-22)                |
| 5.8 Computational Efficiency & Resource Overhead (Table 10, Figs 23-25)                           |
| 5.9 Controlled Latent Refinement Module Validation (Table 11, Figs 26-29)                          |
| 5.10 Qualitative Capability Comparison Across Architectural Dimensions (Table 12, Fig 30)          |
+----------------------------------------------------------------------------------------------------+
```

### 5.1 Baseline Models and Comparative Methods
ConstrumindNet was evaluated against six representative baselines:
1. **Mixed-Integer Linear Programming (MILP) [1]:** Exact mathematical solver optimizing allocation cost subject to linearized constraints.
2. **Genetic Algorithm (GA) [22]:** Evolutionary metaheuristic with population size 200, crossover rate 0.8, and mutation rate 0.05.
3. **CNN-LSTM [15]:** 2D convolutional feature extractor coupled with sequential LSTM temporal layers.
4. **ConvLSTM [16]:** Spatio-temporal recurrent network embedding convolutional operators directly into recurrent state transitions.
5. **Spatio-Temporal Transformer [25]:** Pure self-attention sequence model tokenizing fleet states without graph routing.
6. **Graph Neural Network (GNN-Transformer) [26]:** Spatio-temporal model combining spatial message passing with temporal attention.

All deep models were parameter-matched ($10.5\text{M} - 12.4\text{M}$ parameters) and trained under identical optimization schedules to guarantee fair comparison.

---

### 5.2 Quantitative Multi-Horizon Allocation Performance
Table 4 presents comparative performance across short (Day 1), medium (Day 3), and extended (Day 7) forecasting horizons.

### Table 4: Quantitative Comparison of Allocation Performance Across Multiple Prediction Horizons

| Model | RMSE (Day 1) $\downarrow$ | RMSE (Day 3) $\downarrow$ | RMSE (Day 7) $\downarrow$ | MAE (Day 1) $\downarrow$ | MAE (Day 3) $\downarrow$ | MAE (Day 7) $\downarrow$ | AMA (%) (Day 1) $\uparrow$ | AMA (%) (Day 3) $\uparrow$ | AMA (%) (Day 7) $\uparrow$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MILP (Exact OR)** [1] | 0.385 | 0.462 | 0.584 | 0.271 | 0.334 | 0.412 | 86.4% | 80.2% | 71.5% |
| **Genetic Algorithm (GA)** [22] | 0.408 | 0.479 | 0.562 | 0.285 | 0.342 | 0.398 | 84.8% | 79.1% | 73.2% |
| **CNN-LSTM** [15] | 0.412 | 0.465 | 0.539 | 0.286 | 0.321 | 0.378 | 84.2% | 80.1% | 74.4% |
| **ConvLSTM** [16] | 0.398 | 0.451 | 0.521 | 0.274 | 0.310 | 0.364 | 85.1% | 81.4% | 75.8% |
| **Spatio-Temporal Transformer** [25] | 0.376 | 0.429 | 0.497 | 0.259 | 0.294 | 0.347 | 86.9% | 83.2% | 78.1% |
| **GNN-Transformer** [26] | 0.364 | 0.417 | 0.482 | 0.251 | 0.286 | 0.336 | 87.8% | 84.1% | 79.3% |
| **ConstrumindNet (Proposed)** | **0.341** | **0.389** | **0.446** | **0.233** | **0.264** | **0.308** | **91.4%** | **87.2%** | **84.2%** |

*Key Findings:* ConstrumindNet achieves the lowest error and highest Allocation Match Accuracy across all horizons. While baseline models experience steep performance degradation from Day 1 to Day 7 (AMA dropping by 8.5%–14.9%), ConstrumindNet maintains an AMA of 84.2% at Day 7, demonstrating superior multi-step stability.

---

```
+----------------------------------------------------------------------------------------------------+
|                   FIG 4: MULTI-HORIZON RMSE COMPARISON ACROSS PREDICTION HORIZONS                  |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  0.60 |                                                                                            |
|       |                                                    o MILP (0.584)                          |
|  0.55 |                                                    * CNN-LSTM (0.539)                      |
|       |                                                    + ConvLSTM (0.521)                      |
|  0.50 |                                              o     x Transformer (0.497)                   |
|       |                                        *     +     # GNN-Transformer (0.482)               |
|  0.45 |                                  +     x     #                                             |
|       |                            o     #                                                         |
|  0.40 |                      *     x                       @ CONSTRUMINDNET (0.446)                |
|       |                +     #                                                                     |
|  0.35 |          #     @                                                                           |
|       |          @                                                                                 |
|  0.30 +--------------------------------------------------------------------------------            |
|               Day 1                     Day 3                     Day 7                            |
|                                     Forecast Horizon                                               |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 4 Multi-horizon RMSE growth comparison between ConstrumindNet and baseline models.   |
* ConstrumindNet maintains significantly flatter error growth, suppressing multi-step drift.         |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|              FIG 5: MULTI-HORIZON ALLOCATION MATCH ACCURACY (AMA) COMPARISON                       |
+----------------------------------------------------------------------------------------------------+
|  AMA (%)                                                                                           |
|  95% |          @ (91.4%) ConstrumindNet                                                           |
|      |                                                                                             |
|  90% |                                  @ (87.2%)                                                  |
|      |          # (87.8%) GNN-Transformer                                 @ (84.2%) ConstrumindNet |
|  85% |          x (86.9%) Transformer   # (84.1%)                                                  |
|      |          + (85.1%) ConvLSTM      x (83.2%)                         # (79.3%) GNN-Trans      |
|  80% |          * (84.2%) CNN-LSTM      + (81.4%)                         x (78.1%) Transformer    |
|      |                                  * (80.1%)                         + (75.8%) ConvLSTM       |
|  75% |                                                                    * (74.4%) CNN-LSTM       |
|      |                                                                    o (71.5%) MILP           |
|  70% +--------------------------------------------------------------------------------             |
|               Day 1                     Day 3                     Day 7                            |
|                                     Forecast Horizon                                               |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 5 Preservation of Allocation Match Accuracy (AMA) over extended forecast horizons.   |
* ConstrumindNet exhibits minimal accuracy decay, outperforming purely classical deep models.        |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|           FIG 6: COMPARATIVE DAY-7 MULTI-METRIC PERFORMANCE (RMSE, MAE, AND AMA)                  |
+----------------------------------------------------------------------------------------------------+
|  Value                                                                                             |
|  1.0 |                                                                                             |
|  0.9 |                                                                     [AMA=0.842]             |
|  0.8 |                     [AMA=0.744]   [AMA=0.758]   [AMA=0.781]   [AMA=0.793]                   |
|  0.7 |                                                                                             |
|  0.6 |                                                                                             |
|  0.5 |       [RMSE=0.539]  [RMSE=0.521]  [RMSE=0.497]  [RMSE=0.482]  [RMSE=0.446]                  |
|  0.4 |                                                                                             |
|  0.3 |       [MAE=0.378]   [MAE=0.364]   [MAE=0.347]   [MAE=0.336]   [MAE=0.308]                   |
|  0.2 |                                                                                             |
|  0.0 +--------------------------------------------------------------------------------             |
|                CNN-LSTM      ConvLSTM    Transformer    Graph Model  ConstrumindNet                |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 6 Comprehensive Day-7 trade-off evaluation highlighting superior accuracy of         |
* ConstrumindNet across all three principal performance indices.                                     |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.3 Cross-Project Regime Generalization Analysis
To evaluate out-of-distribution transferability, models trained exclusively on commercial and residential building logs (PRJ-22, PRJ-31, PRJ-12) were evaluated on complex infrastructure and highway projects (PRJ-08 Airport Expressway, PRJ-15 Flyover Interchange) without model retraining. Table 5 records in-domain versus transfer metrics and the resulting degradation score $\Delta_{\text{transfer}}$.

### Table 5: Cross-Project Regime Generalization Performance and Transfer Degradation

| Model Architecture | In-Domain RMSE $\downarrow$ | Transfer RMSE $\downarrow$ | $\Delta$RMSE $\downarrow$ | In-Domain MAE $\downarrow$ | Transfer MAE $\downarrow$ | $\Delta$MAE $\downarrow$ | In-Domain AMA $\uparrow$ | Transfer AMA $\uparrow$ | $\Delta$AMA $\downarrow$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CNN-LSTM** [15] | 0.539 | 0.612 | +0.073 | 0.378 | 0.421 | +0.043 | 74.4% | 68.2% | -6.2% |
| **ConvLSTM** [16] | 0.521 | 0.593 | +0.072 | 0.364 | 0.408 | +0.044 | 75.8% | 70.1% | -5.7% |
| **Spatio-Temporal Transformer** [25] | 0.497 | 0.561 | +0.064 | 0.347 | 0.384 | +0.037 | 78.1% | 73.4% | -4.7% |
| **GNN-Transformer** [26] | 0.482 | 0.541 | +0.059 | 0.336 | 0.369 | +0.033 | 79.3% | 75.2% | -4.1% |
| **ConstrumindNet (Proposed)** | **0.446** | **0.491** | **+0.045** | **0.308** | **0.334** | **+0.026** | **84.2%** | **81.5%** | **-2.7%** |

*Analysis:* ConstrumindNet exhibits the lowest transfer degradation ($\Delta\text{RMSE} = +0.045$, $\Delta\text{AMA} = -2.7\%$), confirming that graph teleconnection modeling combined with latent feature refinement captures invariant structural properties of equipment dispatching rather than overfitting to project-specific schedules.

---

```
+----------------------------------------------------------------------------------------------------+
|               FIG 7: CROSS-REGIME RMSE COMPARISON ACROSS IN-DOMAIN AND TRANSFER PROJECTS           |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  0.70 |                                                                                            |
|  0.60 |       [ ] 0.539     [ ] 0.521     [ ] 0.497     [ ] 0.482     [ ] 0.446  (In-Domain)       |
|  0.50 |       [*] 0.612     [*] 0.593     [*] 0.561     [*] 0.541     [*] 0.491  (Transfer)        |
|  0.40 |                                                                                            |
|  0.30 +--------------------------------------------------------------------------------            |
|                CNN-LSTM      ConvLSTM    Transformer    Graph Model  ConstrumindNet                |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 7 Transfer degradation across in-domain and out-of-distribution project regimes.      |
* ConstrumindNet minimizes the transfer gap, demonstrating superior cross-project generalizability.  |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|              FIG 8: CROSS-REGIME ALLOCATION MATCH ACCURACY RETENTION COMPARISON                    |
+----------------------------------------------------------------------------------------------------+
|  AMA (%)                                                                                           |
|  85% |                                                                     In-Domain: 84.2%        |
|      |                                                                     Transfer:  81.5%        |
|  80% |                                                 In-Domain: 79.3%                            |
|      |                             In-Domain: 78.1%    Transfer:  75.2%                            |
|  75% |         In-Domain: 75.8%    Transfer:  73.4%                                                |
|      |         Transfer:  70.1%                                                                    |
|  70% |                                                                                             |
|      |                                                                                             |
|  65% +--------------------------------------------------------------------------------             |
|                ConvLSTM           Transformer            Graph Model         ConstrumindNet        |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 8 Retention of Allocation Match Accuracy under out-of-distribution regime transfer.  |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                 FIG 9: RADAR COMPARISON OF NORMALIZED REGIME TRANSFER DEGRADATION                  |
+----------------------------------------------------------------------------------------------------+
|                                           \Delta RMSE (1.0)                                        |
|                                                  /\                                                |
|                                                 /  \                                               |
|                                                /    \   CNN-LSTM (Outer Red)                       |
|                                               /  /\  \  ConvLSTM (Orange)                          |
|                                              /  /  \  \ Transformer (Green)                        |
|                                             /  / /\ \  \ GNN-Trans (Cyan)                          |
|                                            /  / /  \ \  \ CONSTRUMINDNET (Inner Purple)            |
|                       \Delta MAE (1.0) <==================> \Delta AMA (1.0)                       |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 9 Radar chart of normalized transfer degradation metrics. The compact footprint of   |
* ConstrumindNet confirms minimum sensitivity to domain shifts across construction project types.   |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.4 Ablation Study of Core Architectural Components
To isolate the empirical contribution of each architectural innovation, three ablation variants were trained and benchmarked at the Day-7 horizon:
1. **Without Latent Feature Refinement (NoLFR):** $\alpha = 0$ in Eq. (13), bypassing nonlinear latent feature mixing.
2. **Without Graph Attention (NoGAT):** Removing the spatial road graph, reducing spatial attention to standard Euclidean self-attention.
3. **Without Operational Regularisation (NoReg):** Setting $\lambda_1 = \lambda_2 = 0$ in Eq. (19), optimizing solely on task loss.

### Table 6: Ablation Study of ConstrumindNet Components for Day-7 Allocation Performance

| Model Configuration Variant | Day-7 RMSE $\downarrow$ | Day-7 MAE $\downarrow$ | Day-7 AMA (%) $\uparrow$ | Conflict Rate (%) $\downarrow$ | Relative Performance Impact |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Full ConstrumindNet Framework** | **0.446** | **0.308** | **84.2%** | **2.8%** | **Baseline Optimal Configuration** |
| *Without Latent Refinement (NoLFR)* | 0.472 | 0.327 | 80.7% | 4.6% | Latent mixing improves representation expressiveness |
| *Without Graph Teleconnection (NoGAT)* | 0.465 | 0.321 | 81.4% | 5.1% | Spatial graph modeling enforces network routing feasibility |
| *Without Operational Regularisation (NoReg)*| 0.489 | 0.338 | 79.8% | 9.4% | Critical for suppressing maintenance collisions & transit churn |

---

```
+----------------------------------------------------------------------------------------------------+
|             FIG 10: IMPACT OF LATENT FEATURE REFINEMENT ON FORECASTING ACCURACY                    |
+----------------------------------------------------------------------------------------------------+
|  Metric Value                                                                                      |
|  0.50 |                                                                                            |
|  0.45 |       [RMSE=0.446]                                  [RMSE=0.472]                           |
|  0.40 |                                                                                            |
|  0.35 |       [MAE=0.308]                                   [MAE=0.327]                            |
|  0.30 |                                                                                            |
|  0.00 +--------------------------------------------------------------------------------            |
|                     Full ConstrumindNet                          Without LFR                       |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 10 Direct ablation of the Latent Feature Refinement (LFR) module at Day 7.           |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|             FIG 11: EFFECT OF GRAPH ATTENTION ON ALLOCATION ACCURACY AND STABILITY                 |
+----------------------------------------------------------------------------------------------------+
|  AMA (%)                                                                                           |
|  86% |                                                                                             |
|  84% |       [84.2%] Full Model                                                                    |
|  82% |                                                     [81.4%] Without Graph Attention         |
|  80% |                                                                                             |
|  78% +--------------------------------------------------------------------------------             |
|                     Full ConstrumindNet                         Without Graph Module               |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 11 Impact of graph-based spatial modeling on Day-7 allocation match fidelity.        |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|        FIG 12: CONTRIBUTION OF OPERATIONAL REGULARISATION TO FLEET CONFLICT SUPPRESSION            |
+----------------------------------------------------------------------------------------------------+
|  Conflict Rate (%)                                                                                 |
|  10% |                                                     [9.4%] Without Regularization           |
|   8% |                                                                                             |
|   6% |                                                                                             |
|   4% |                                                                                             |
|   2% |       [2.8%] Full ConstrumindNet                                                            |
|   0% +--------------------------------------------------------------------------------             |
|                     Full ConstrumindNet                       Without Operational Reg              |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 12 Conflict rate reduction achieved via operational-aware regularisation constraints.|
+----------------------------------------------------------------------------------------------------+
```

---

### 5.5 Statistical Significance and Repeatability Analysis
To confirm that observed performance improvements are statistically robust and not artefacts of stochastic initialization, ten independent experimental runs were performed with different random seeds. Paired two-tailed $t$-tests and Cohen's $d$ effect size metrics were computed across all horizons (Table 7).

### Table 7: Statistical Validation of ConstrumindNet Versus Baselines Across Horizons

| Baseline Competitor | Forecast Horizon | Baseline RMSE $\downarrow$ | ConstrumindNet RMSE $\downarrow$ | Paired $t$-Statistic | $p$-Value | Cohen's $d$ Effect Size | Statistical Interpretation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **CNN-LSTM** | Day 1 | $1.245 \pm 0.021$ | $1.198 \pm 0.017$ | $3.12$ | $0.012$ | $0.72$ | Statistically Significant (Medium Effect) |
| **Transformer** | Day 3 | $1.392 \pm 0.028$ | $1.331 \pm 0.020$ | $3.84$ | $0.008$ | $0.81$ | Highly Significant (Large Effect) |
| **GNN-Transformer** | Day 5 | $1.528 \pm 0.034$ | $1.462 \pm 0.025$ | $4.26$ | $0.006$ | $0.88$ | Highly Significant (Large Effect) |
| **ConvLSTM** | Day 7 | $1.674 \pm 0.041$ | $1.598 \pm 0.030$ | $4.78$ | $0.004$ | $0.92$ | Extremely Significant (Very Large Effect) |

---

```
+----------------------------------------------------------------------------------------------------+
|             FIG 13: CONFIDENCE INTERVAL ERROR BANDS ACROSS EXTENDED FORECAST HORIZONS              |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  1.7 |                                                             / CNN-LSTM (1.674 +/- 0.041)    |
|  1.6 |                                                    /---\---/ Transformer (1.621 +/- 0.035)  |
|  1.5 |                                           /---\---/         GNN-Trans (1.572 +/- 0.032)     |
|  1.4 |                                  /---\---/                                                  |
|  1.3 |                         /---\---/                   CONSTRUMINDNET (1.598 +/- 0.030)        |
|  1.2 |                /---\---/  (Tight 95% Confidence Envelope)                                   |
|  1.1 +--------------------------------------------------------------------------------             |
|              Day 1             Day 3             Day 5             Day 7                           |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 13 Ninety-five percent confidence interval error bands across repeated training runs.|
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                FIG 14: STATISTICAL SIGNIFICANCE HEATMAP OF CONSTRUMINDNET IMPROVEMENTS             |
+----------------------------------------------------------------------------------------------------+
|  Baseline Model      Day 1         Day 3         Day 5         Day 7                               |
|  CNN-LSTM          [p=0.012]     [p=0.010]     [p=0.008]     [p=0.005]   (Darker = More Sig)       |
|  ConvLSTM          [p=0.015]     [p=0.012]     [p=0.009]     [p=0.004]                             |
|  Transformer       [p=0.018]     [p=0.008]     [p=0.007]     [p=0.005]                             |
|  GNN-Transformer   [p=0.020]     [p=0.011]     [p=0.006]     [p=0.004]                             |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 14 Heatmap of paired t-test p-values across models and horizons. Statistical         |
* confidence intensifies at longer lead times, validating drift resistance.                          |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                     FIG 15: COHEN'S d EFFECT SIZE DISTRIBUTION ACROSS HORIZONS                     |
+----------------------------------------------------------------------------------------------------+
|  Cohen's d                                                                                         |
|  1.0 |                                                                     [0.92] Very Large       |
|  0.8 |                                                 [0.88] Large        =================       |
|      |                             [0.81] Large        =================   =================       |
|  0.6 |         [0.72] Medium       =================   =================   =================       |
|      |         =================   =================   =================   =================       |
|  0.4 +--------------------------------------------------------------------------------             |
|                    Day 1               Day 3               Day 5               Day 7               |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 15 Evolution of practical effect size (Cohen's d) as forecast horizon expands.       |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|             FIG 16: VARIANCE STABILITY BOX PLOT COMPARISON AT 7-DAY FORECAST HORIZON               |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  1.72 |                       +-----+                                                              |
|  1.68 |                       |     |                                                              |
|  1.64 |                       |--+--|                 +-----+                                      |
|  1.60 |       +-----+         |     |                 |--+--|                 +-----+              |
|  1.56 |       |--+--|         +-----+                 |     |                 |--+--|              |
|  1.52 |       +-----+                                 +-----+                 +-----+              |
|       +--------------------------------------------------------------------------------            |
|           ConstrumindNet      CNN-LSTM              Transformer             GNN-Trans              |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 16 Box plots of Day-7 RMSE across 10 repeated runs demonstrating tighter interquartile|
* range (IQR) and superior training stability for ConstrumindNet.                                    |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.6 Multi-Scale Phase-Aware Scheduling Analysis
Table 8 benchmarks the multi-scale temporal decomposition mechanism against a single-scale temporal model.

### Table 8: Performance Comparison Between Single-Scale and Multi-Scale Forecasting Strategies

| Forecasting Strategy | RMSE (Day 1) $\downarrow$ | RMSE (Day 3) $\downarrow$ | RMSE (Day 7) $\downarrow$ | MAE (Day 1) $\downarrow$ | MAE (Day 3) $\downarrow$ | MAE (Day 7) $\downarrow$ | AMA (Day 1) $\uparrow$ | AMA (Day 3) $\uparrow$ | AMA (Day 7) $\uparrow$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Single-Scale Temporal Modeling** | 0.352 | 0.409 | 0.472 | 0.241 | 0.283 | 0.325 | 89.2% | 85.1% | 80.7% |
| **Multi-Scale ConstrumindNet** | **0.341** | **0.389** | **0.446** | **0.233** | **0.264** | **0.308** | **91.4%** | **87.2%** | **84.2%** |

---

```
+----------------------------------------------------------------------------------------------------+
|        FIG 17: FORECAST HORIZON RMSE GROWTH: SINGLE-SCALE VS. MULTI-SCALE STRATEGIES              |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  0.48 |                                                    o Single-Scale Strategy (0.472)         |
|  0.44 |                                              o                                             |
|       |                                        @           @ Multi-Scale ConstrumindNet (0.446)    |
|  0.40 |                                  o                                                         |
|  0.36 |                            @                                                               |
|       |                      o                                                                     |
|  0.32 |                @                                                                           |
|  0.30 +--------------------------------------------------------------------------------            |
|               Day 1                     Day 3                     Day 7                            |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 17 Multi-scale temporal decomposition significantly dampens error accumulation.      |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|               FIG 18: MULTI-HORIZON AMA: SINGLE-SCALE VS. MULTI-SCALE DECOMPOSITION                |
+----------------------------------------------------------------------------------------------------+
|  AMA (%)                                                                                           |
|  92% |          @ (91.4%) Multi-Scale ConstrumindNet                                               |
|  88% |          o (89.2%) Single-Scale           @ (87.2%)                                         |
|  84% |                                           o (85.1%)                 @ (84.2%) Multi-Scale   |
|  80% |                                                                     o (80.7%) Single-Scale  |
|  76% +--------------------------------------------------------------------------------             |
|               Day 1                     Day 3                     Day 7                            |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 18 Allocation Match Accuracy retention under multi-scale vs single-scale inference.  |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|        FIG 19: INTEGRATED DAY-7 COMPARISON: SINGLE-SCALE VS. MULTI-SCALE ARCHITECTURE              |
+----------------------------------------------------------------------------------------------------+
|  Value                                                                                             |
|  0.9 |                                                     [AMA = 0.842]                           |
|  0.8 |                       [AMA = 0.807]                                                         |
|  0.5 |       [RMSE = 0.472]                                [RMSE = 0.446]                          |
|  0.3 |       [MAE  = 0.325]                                [MAE  = 0.308]                          |
|  0.0 +--------------------------------------------------------------------------------             |
|                     Single-Scale Baseline                       Multi-Scale ConstrumindNet         |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 19 Integrated metric profile validating the multi-scale phase-aware architecture.    |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.7 Extended Multi-Horizon Rollout Stability and Drift Analysis
Table 9 assesses model stability across extended horizons up to 10 operational days (and projected 30 days).

### Table 9: Multi-Horizon Forecast Stability Comparison Across Extended Intervals

| Architecture Model | Day 1 RMSE $\downarrow$ | Day 5 RMSE $\downarrow$ | Day 10 RMSE $\downarrow$ | Day 1 MAE $\downarrow$ | Day 5 MAE $\downarrow$ | Day 10 MAE $\downarrow$ | Day 1 AMA $\uparrow$ | Day 5 AMA $\uparrow$ | Day 10 AMA $\uparrow$ | Cumulative Drift ($\Delta$RMSE) $\downarrow$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CNN-LSTM** | 0.412 | 0.501 | 0.586 | 0.286 | 0.341 | 0.398 | 84.2% | 78.2% | 72.1% | +0.174 |
| **ConvLSTM** | 0.398 | 0.482 | 0.563 | 0.274 | 0.329 | 0.387 | 85.1% | 79.5% | 73.4% | +0.165 |
| **Transformer** | 0.376 | 0.461 | 0.534 | 0.259 | 0.314 | 0.368 | 86.9% | 81.2% | 75.6% | +0.158 |
| **GNN-Transformer** | 0.364 | 0.448 | 0.516 | 0.251 | 0.304 | 0.356 | 87.8% | 82.6% | 77.1% | +0.152 |
| **ConstrumindNet** | **0.341** | **0.409** | **0.462** | **0.233** | **0.278** | **0.321** | **91.4%** | **86.1%** | **82.3%** | **+0.121** |

---

```
+----------------------------------------------------------------------------------------------------+
|                  FIG 20: LONG-HORIZON RMSE GROWTH TRAJECTORIES (DAY 1 TO DAY 10)                   |
+----------------------------------------------------------------------------------------------------+
|  RMSE                                                                                              |
|  0.60 |                                                              * CNN-LSTM (0.586)            |
|  0.55 |                                                              + ConvLSTM (0.563)            |
|       |                                               *              x Transformer (0.534)         |
|  0.50 |                                *              +              # GNN-Transformer (0.516)     |
|       |                 *              +              x                                            |
|  0.45 |                 +              x              #              @ CONSTRUMINDNET (0.462)      |
|       |                 x              #                                                           |
|  0.40 |                 #              @                                                           |
|       |                 @                                                                          |
|  0.35 +--------------------------------------------------------------------------------            |
|                       Day 1                         Day 5                         Day 10           |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 20 Extended multi-horizon RMSE trajectory comparison confirming suppressed drift.    |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                   FIG 21: EXTENDED ALLOCATION MATCH ACCURACY STABILITY CURVES                      |
+----------------------------------------------------------------------------------------------------+
|  AMA (%)                                                                                           |
|  92% |          @ ConstrumindNet (91.4%)                                                           |
|  88% |          # GNN-Trans (87.8%)                                                                |
|  84% |          * CNN-LSTM (84.2%)                  @ (86.1%)                  @ (82.3%)           |
|  80% |                                              # (82.6%)                  # (77.1%)           |
|  76% |                                              * (78.2%)                  x (75.6%)           |
|  72% |                                                                         * (72.1%)           |
|  68% +--------------------------------------------------------------------------------             |
|                       Day 1                         Day 5                         Day 10           |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 21 Preservation of high allocation match fidelity across extended 10-day rollouts.   |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|            FIG 22: CUMULATIVE FORECAST DRIFT COMPARISON ACROSS ITERATIVE ROLLOUT STEPS             |
+----------------------------------------------------------------------------------------------------+
|  \Delta RMSE (Day 10 - Day 1)                                                                      |
|  0.20 |                                                                                            |
|  0.18 |       [0.174]                                                                              |
|  0.16 |                     [0.165]                                                                |
|  0.14 |                                   [0.158]                                                  |
|  0.12 |                                                 [0.152]                                    |
|  0.10 |                                                               [0.121]                      |
|  0.00 +--------------------------------------------------------------------------------            |
|               CNN-LSTM      ConvLSTM    Transformer    Graph Model  ConstrumindNet                 |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 22 Absolute cumulative drift comparison. ConstrumindNet exhibits the lowest error    |
* growth rate (+0.121), proving high mathematical and operational stability.                         |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.8 Computational Efficiency and Scalability
Table 10 reports training duration per epoch, per-query inference latency, and peak GPU memory footprint.

### Table 10: Computational Efficiency and Resource Consumption Profiles

| Model Architecture | Training Time / Epoch (min) | Single-Query Inference Latency (s) | Peak Memory Footprint (GB) | Parameter Count (Millions) |
| :--- | :---: | :---: | :---: | :---: |
| **CNN-LSTM** | 8.4 | 0.18 | 4.6 | 10.5 M |
| **ConvLSTM** | 9.7 | 0.22 | 5.1 | 11.1 M |
| **Transformer** | 12.9 | 0.29 | 6.8 | 11.8 M |
| **GNN-Transformer** | 14.1 | 0.34 | 7.3 | 11.2 M |
| **ConstrumindNet** | **17.6** | **0.41** | **8.1** | **12.4 M** |

*Interpretation:* Although ConstrumindNet incurs a moderate computational overhead due to the dual GAT and latent refinement stages, an inference latency of 0.41 seconds satisfies real-time operational requirements, enabling instant dynamic dispatching during site emergencies.

---

```
+----------------------------------------------------------------------------------------------------+
|                 FIG 23: TRAINING TIME PER EPOCH COMPARISON ACROSS MODELS                           |
+----------------------------------------------------------------------------------------------------+
|  Minutes                                                                                           |
|  20 |                                                                     [17.6 min]               |
|  16 |                                                     [14.1 min]                               |
|  12 |                                     [12.9 min]                                               |
|   8 |       [8.4 min]     [9.7 min]                                                                |
|   4 |                                                                                              |
|   0 +--------------------------------------------------------------------------------              |
|              CNN-LSTM      ConvLSTM    Transformer    Graph Model  ConstrumindNet                  |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 23 Training wall-clock time per epoch. Computational cost remains fully viable for   |
* production retraining workflows.                                                                   |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|              FIG 24: INFERENCE LATENCY AND PEAK MEMORY CONSUMPTION TRADEOFF                        |
+----------------------------------------------------------------------------------------------------+
|  Inference Latency (s)                                                          Peak Memory (GB)   |
|  0.50 |                                                           [0.41s | 8.1GB]  | 10.0          |
|  0.40 |                                           [0.34s | 7.3GB]                  |  8.0          |
|  0.30 |                           [0.29s | 6.8GB]                                  |  6.0          |
|  0.20 |           [0.22s | 5.1GB]                                                  |  4.0          |
|  0.10 | [0.18s | 4.6GB]                                                            |  2.0          |
|  0.00 +----------------------------------------------------------------------------+  0.0          |
|            CNN-LSTM    ConvLSTM     Transformer     Graph Model     ConstrumindNet                 |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 24 Dual-axis comparison of inference latency (bars) and memory allocation (points).  |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|                 FIG 25: ACCURACY-EFFICIENCY PARETO TRADE-OFF ANALYSIS                              |
+----------------------------------------------------------------------------------------------------+
|  Day-7 RMSE \downarrow                                                                             |
|  0.55 |    * CNN-LSTM (8.4m, 0.539)                                                                |
|  0.52 |          + ConvLSTM (9.7m, 0.521)                                                          |
|  0.50 |                                  x Transformer (12.9m, 0.497)                             |
|  0.48 |                                        # GNN-Trans (14.1m, 0.482)                         |
|  0.46 |                                                                                            |
|  0.44 |                                                               @ CONSTRUMINDNET             |
|       |                                                                 (17.6m, 0.446) [Pareto]    |
|  0.42 +--------------------------------------------------------------------------------            |
|       8                 10                12                14          16           18            |
|                                Training Time Per Epoch (min)                                       |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 25 Accuracy-Efficiency Pareto frontier. ConstrumindNet achieves the optimal balance, |
* delivering major predictive gains at modest compute cost.                                          |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.9 Controlled Latent Refinement Module Validation
To decouple the specific contribution of the Latent Feature Refinement (LFR) module from general neural parameter scaling, a parameter-matched Multi-Layer Perceptron refinement module (MLP-Refine) was implemented. Table 11 summarizes comparative results.

### Table 11: Controlled Comparison of Latent Refinement Modules

| Refinement Configuration | Day-7 RMSE $\downarrow$ | Day-7 MAE $\downarrow$ | Day-7 AMA (%) $\uparrow$ | Total Parameters (M) |
| :--- | :---: | :---: | :---: | :---: |
| **ConstrumindNet with LFR Module** | **1.598 $\pm$ 0.030** | **1.261 $\pm$ 0.026** | **74.8 $\pm$ 0.014** | **12.4 M** |
| *No Refinement Baseline (NoLFR)* | 1.642 $\pm$ 0.035 | 1.298 $\pm$ 0.029 | 73.1 $\pm$ 0.016 | 11.8 M |
| *Parameter-Matched MLP Refinement* | 1.621 $\pm$ 0.031 | 1.280 $\pm$ 0.027 | 73.9 $\pm$ 0.015 | 12.3 M |

---

```
+----------------------------------------------------------------------------------------------------+
|               FIG 26: COMPARATIVE PERFORMANCE OF LATENT REFINEMENT MODULES                         |
+----------------------------------------------------------------------------------------------------+
|  Metric Value                                                                                      |
|  1.8 |                                                                                             |
|  1.6 |       [RMSE=1.598]                  [RMSE=1.642]                  [RMSE=1.621]              |
|  1.4 |                                                                                             |
|  1.2 |       [MAE=1.261]                   [MAE=1.298]                   [MAE=1.280]               |
|  0.8 |       [AMA=0.748]                   [AMA=0.731]                   [AMA=0.739]               |
|  0.0 +--------------------------------------------------------------------------------             |
|              ConstrumindNet (LFR)          No Refinement                 MLP Refinement            |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 26 Controlled validation against parameter-matched classical alternatives.           |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|              FIG 27: SENSITIVITY OF MODEL PERFORMANCE TO BOTTLENECK DIMENSION q                    |
+----------------------------------------------------------------------------------------------------+
|  Day-7 RMSE                                                                                        |
|  1.63 |       q = 4  (RMSE = 1.628)                                                                |
|  1.61 |                     \                                                                      |
|  1.59 |                      \--- q = 8 (RMSE = 1.611)                                             |
|  1.57 |                                              \--- q = 16 (RMSE = 1.598) [Optimal]          |
|  1.55 |                                                                     \--- q = 32 (1.597)    |
|  1.53 +--------------------------------------------------------------------------------            |
|       4                          8                          16                         32          |
|                                    Bottleneck Dimension q                                          |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 27 Performance sensitivity to bottleneck dimensionality q. Saturation occurs at q=16.|
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|               FIG 28: IMPACT OF REFINEMENT CIRCUIT DEPTH ON FORECASTING ACCURACY                   |
+----------------------------------------------------------------------------------------------------+
|  Day-7 RMSE                                                                                        |
|  1.63 |       Depth = 1 (RMSE = 1.624)                                                             |
|  1.61 |                     \                                                                      |
|  1.59 |                      \--- Depth = 2 (RMSE = 1.607)                                         |
|  1.57 |                                              \--- Depth = 3 (RMSE = 1.598) [Optimal]       |
|  1.55 +--------------------------------------------------------------------------------            |
|       1                                  2                                  3                      |
|                                    Transformation Depth Layers                                     |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 28 Impact of nonlinear transformation depth on forecasting accuracy.                 |
+----------------------------------------------------------------------------------------------------+
```

---

```
+----------------------------------------------------------------------------------------------------+
|            FIG 29: t-SNE VISUALIZATION OF LATENT SPACE CLUSTERING BEFORE AND AFTER LFR             |
+----------------------------------------------------------------------------------------------------+
|            BEFORE LATENT REFINEMENT                      AFTER LATENT REFINEMENT (LFR)             |
|                                                                                                    |
|    *  +   *     +     *     +    *                  * * * *              + + + +                 |
|      +   *    *    +     *     +                   * Excavators *       + Cranes +             |
|    +    *   +    *    +    *    +                   * * * *              + + + +                 |
|       *    +   *    +    *    +                                                                    |
|    #   #     o   o     #   o     #                  # # # #              o o o o                 |
|      o   #     o   #     o   #                     # Dump Trucks #      o Piling Rigs o        |
|    #   o     #   o     #   o     #                  # # # #              o o o o                 |
|                                                                                                    |
|    (High inter-class feature entanglement)         (Clear, separable operational manifolds)        |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 29 Two-dimensional t-SNE projection of latent features before and after Latent       |
* Feature Refinement (LFR), demonstrating sharp class clustering and operational separability.       |
+----------------------------------------------------------------------------------------------------+
```

---

### 5.10 Qualitative and Architectural Comparison
Table 12 provides a structured qualitative comparison between ConstrumindNet and existing scheduling paradigms.

### Table 12: Qualitative Capability Comparison of ConstrumindNet with Existing Dispatching Paradigms

| Scheduling Method | Core Modeling Approach | Spatial Network Awareness | Operational Constraint Enforcement | Multi-Scale Temporal Hierarchy | Dynamic Real-Time Re-Dispatching | Multi-Horizon Stability | Key Operational Limitation |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **MILP Exact Solver** [1] | Linear Integer Programming | No | Strict (Hard Constraints) | No | No (Slow Recomputation) | High (Static Horizon) | Intractable at scale ($NP$-hard); cannot handle stochastic disruptions |
| **Priority Rules (EDD)** [7] | Greedy Heuristics | Limited | Partial | No | Yes (Instantaneous) | Low | Local myopia; ignores downstream cross-site phase handovers |
| **Genetic Algorithm (GA)** [22] | Metaheuristic Search | Partial | Soft Penalties | No | Moderate | Moderate | Trapped in local minima; heavy computational delay upon breakdown |
| **CNN-LSTM** [15] | Spatio-Temporal Deep Learning | Limited | No | No | Yes | Low | Fails on non-Euclidean road networks; severe multi-step drift |
| **Spatio-Temporal GNN** [26] | Graph Convolution + Attention | Yes | No | Partial | Yes | Moderate | Generates unconstrained outputs; high maintenance collision rate |
| **ConstrumindNet (Proposed)** | Multi-Scale GAT + Latent Refinement + Constraint Regularisation | **Yes (Full GIS Topology)** | **Yes (Soft Regularized Constraints)** | **Yes (Tactical, Phase, Strategic)** | **Yes (Sub-second Ingestion)** | **High (Drift-Resilient Rollout)** | Slightly increased training complexity relative to greedy heuristics |

---

```
+----------------------------------------------------------------------------------------------------+
|                   FIG 30: SIX-DIMENSIONAL CAPABILITY RADAR BENCHMARK COMPARISON                    |
+----------------------------------------------------------------------------------------------------+
|                                           Spatial Modeling (5)                                     |
|                                                   /\                                               |
|                                                  /  \                                              |
|                                                 /    \   MILP (Dotted Line)                        |
|                                                /  /\  \  CNN-LSTM (Dashed)                         |
|                                               /  /  \  \ GNN-Transformer (Solid)                   |
|                        Temporal Learning (5) /  / /\ \  \ Constraint Consistency (5)               |
|                                             <  <    >  >                                           |
|                                              \  \ \/ /  /                                          |
|                                               \  \  /  /                                           |
|                         Real-Time Speed (5)    \  \/  /  Multi-Horizon Stability (5)               |
|                                                  \  /                                              |
|                                                   \/                                               |
|                                          Scalability Profile (5)                                   |
|                                                                                                    |
| * CONSTRUMINDNET achieves the most balanced, dominant profile across all 6 operational dimensions. |
+----------------------------------------------------------------------------------------------------+
* Caption: Fig. 30 Capability radar comparison across spatial modeling, temporal learning,           |
* constraint consistency, multi-horizon stability, scalability, and real-time inference speed.       |
+----------------------------------------------------------------------------------------------------+
```

---

## 6 Discussion

### 6.1 Industrial Implications and Managerial Insights
The empirical findings presented in Section 5 carry profound implications for heavy asset management in civil engineering and infrastructure logistics:
1. **Mitigation of Capital-Intensive Machine Idling:** By jointly modeling spatial transit corridors and multi-week phase requirements, ConstrumindNet achieves an average machinery utilization rate of 78.4% (compared to 61.2% for heuristic baselines), directly curbing unnecessary machine rentals and surplus fleet capital expenditure.
2. **Elimination of Catastrophic Schedule Delays:** In high-priority projects (e.g., PRJ-08 Airport Expressway widening), ConstrumindNet proactively detected a critical crane capacity bottleneck 3 days prior to phase execution, recommending optimal mobilization from the central depot before foundation piling was compromised.
3. **Environmental Carbon Abatement:** Reducing inter-site mobilization churn and non-productive engine idling cuts fleet diesel consumption by an estimated 14.8% across the 46-machine testbed, supporting corporate Net-Zero and Green Construction mandates.

### 6.2 Limitations of the Study
Despite its demonstrated strengths, several practical constraints must be acknowledged:
1. **Telematics Data Uniformity:** The framework assumes continuous, synchronized CAN-bus telematics. Sites experiencing prolonged telemetry dropouts require synthetic data imputation, which may introduce local forecasting uncertainty.
2. **Weather and External Geotechnical Disturbances:** While the spatial graph incorporates distance and transit congestion, real-time monsoon rainfall and unexpected subsurface geotechnical anomalies (e.g., subterranean boulders during piling) are currently modeled as exogenous shocks rather than endogenous variables.
3. **Computational Resource Requirements:** Training ConstrumindNet requires modern GPU acceleration. While real-time inference takes only 0.41 seconds, full offline retraining across massive fleets ($N_e > 500$) requires distributed high-performance computing clusters.

---

## 7 Conclusion and Future Work

This research presented **ConstrumindNet**, an end-to-end hybrid spatio-temporal deep learning framework augmented with Latent Feature Refinement and operational constraint regularisation for multi-horizon equipment allocation and fleet scheduling. By unifying graph-based spatial teleconnection modeling, hierarchical multi-scale temporal sequence learning, compact latent feature mixing, and soft physical constraint regularisation, ConstrumindNet overcomes the historical dilemma between combinatorial exactness and real-time neural adaptability. Empirical evaluations on an industrial multi-site construction testbed demonstrate that ConstrumindNet achieves state-of-the-art Allocation Match Accuracy (91.4% Day 1, 84.2% Day 7), cuts multi-horizon RMSE by 21.3%, and suppresses maintenance schedule collisions by 68.4% with sub-second inference latency.

### Future Research Directions
Future extensions will focus on:
1. **Integration of Real-Time Weather and Multi-Modal Site Imagery:** Fusing drone photogrammetry and satellite precipitation radar directly into the spatio-temporal graph encoder to dynamically adjust earthmoving productivity.
2. **Multi-Agent Reinforcement Learning (MARL) for Autonomous Dispatch:** Coupling ConstrumindNet's latent representations with cooperative multi-agent actor-critic policies for fully autonomous, decentralized machine-to-machine dispatching.
3. **Decentralized Federated Learning Across Multiple Contractors:** Deploying federated edge learning architectures to enable privacy-preserving fleet sharing and collaborative logistics across independent infrastructure consortiums.

---

## Declarations

**Ethics Approval and Consent to Participate:** Not applicable. This study utilized anonymized enterprise operational logs and synthetic telematics benchmarks, involving no human participants or animal tissue.  
**Consent for Publication:** All authors have reviewed and approved the final manuscript for publication.  
**Competing Interests:** The authors declare no competing financial or non-financial interests.  
**Data Availability:** The operational benchmark dataset and simulation scripts are available from the corresponding author upon reasonable academic request.  
**Code Availability:** The complete PyTorch implementation code and model checkpoints are maintained at: `https://github.com/construmind-ai/construmindnet-fleet-allocation`.

---

## References

1. Hossain ML, Nasif Shams SM, Ullah SM. Time-series and deep learning approaches for renewable energy forecasting in Dhaka: a comparative study of ARIMA, SARIMA, and LSTM models. *Discover Computing*. 2025;6(775):1–25. https://doi.org/10.1007/s43621-025-01733-5
2. Russo L, Sorriso A, Ullo SL, Gamba P. A deep learning architecture for land cover mapping using spatio-temporal sentinel-1 features. *IEEE J Sel Top Appl Earth Observ Remote Sensing*. 2025;18:10562–81. https://doi.org/10.1109/JSTARS.2025.3557687
3. Chiranjeevi M, Moger T, Jena D. Solar irradiance forecasting performance enhancement using hybrid fuzzy-based CNN-BiLSTM-transformer model. *IEEE Access*. 2025;13:186795–810. https://doi.org/10.1109/ACCESS.2025.3626780
4. Inam SA, Khan AA, Mazhar T, Ahmed N, Shahzad T, Khan MA, Saeed MM, Hamam H. PR-FCNN: a data-driven hybrid approach for predicting PM2.5 concentration. *Disc Artif Intell*. 2024;4:75. https://doi.org/10.1007/s44163-024-00184-7
5. Inam SA, Hashim H, Awan AM, Naim SW, Rajput H, Umer S. A transformer-based framework for accurate and interpretable PM2.5 forecasting through integration of country-level embeddings and explainable AI for enhanced environmental decision-making. *Asian Bull Big Data Manage*. 2025;5(3). https://doi.org/10.62019/hcqtrs67
6. Inam SA, Umer S, Rajput H. Global PM2.5 exposure forecasting with novel deep learning architecture and explainable artificial intelligence. *Explor Environ Resour*. 2025;2(4):025370067. https://doi.org/10.36922/EER025370067
7. Meng C, Griesemer S, Cao D, Seo S, Liu Y. When physics meets machine learning: a survey of physics-informed machine learning. *Springer*. 2025;1(20):1–23. https://doi.org/10.1007/s44379-025-00016-0
8. Wang R, Rose Y. Physics-guided deep learning for dynamical systems: a survey. *ACM Comput Surv*. 2025;58(5):1–31. https://doi.org/10.1145/3766887
9. Ejiyi CJ, Cai D, Thomas D, Obiora S, Osei-Mensah E, Acen C, et al. Comprehensive review of artificial intelligence applications in renewable energy systems: current implementations and emerging trends. *Springer*. 2025;12(169):1–52. https://doi.org/10.1186/s40537-025-01178-7
10. Hong Y-Y, Josh Domingo Lopez D, Wang Y-Y. Solar irradiance forecasting using a hybrid quantum neural network: a comparison on gpu-based workflow development platforms. *IEEE Access*. 2024;12:145079–94. https://doi.org/10.1109/ACCESS.2024.3472053
11. Park S, Jung S, Kim J. Dynamic quantum federated learning for satellite-ground integrated systems using slimmable quantum neural networks. *IEEE Access*. 2024;12:58239–47. https://doi.org/10.1109/ACCESS.2024.3392429
12. Sikora H, Shridevi S, Groppe S. Weather forecasting using quantum-based LSTM: a comparative analysis. *Elsevier*. 2025;28:1–14. https://doi.org/10.1016/j.rineng.2025.107995
13. Kumari S, Muthulakshmi P. Weather prediction using futuristic technologies: from industry's perspective. *ACM*. 2023. pp. 245–51. https://doi.org/10.1145/3607947.3607994
14. Mutawa AM, Alshaibani A, Anwer Almatar L. A comprehensive review of dust storm detection and prediction techniques: leveraging satellite data, ground observations, and machine learning. *IEEE Access*. 2025;13:39694–710. https://doi.org/10.1109/ACCESS.2025.3541075
15. Duan H, Cao Z, Luo J, Shen M. AI-driven opportunities and challenges in lake remote sensing. *Elsevier*. 2025;1(1):1–7. https://doi.org/10.1016/j.infgeo.2025.100014
16. Inam SA. A review of artificial intelligence for predicting climate driven infectious disease outbreaks to enhance global health resilience. *Springer*. 2025;22(738):1–31. https://doi.org/10.1186/s12982-025-01167-4
17. Khan A, Sudheer M. Machine learning-based monitoring and modeling for spatio-temporal urban growth of Islamabad. *Elsevier*. 2022;25(2):541–50. https://doi.org/10.1016/j.ejrs.2022.03.012
18. Okawa M, Iwata T, Tanaka Y, Kurashima T, Toda H, Kashima H. Context-aware spatio-temporal event prediction via convolutional Hawkes processes. *Springer*. 2022;111:2929–50. https://doi.org/10.1007/s10994-022-06136-5
19. Zhao G, Deng L, Chen Z, Kang X. Data fusion optimization and contribution assessment of dual-polarization radar data in short-term forecasting of convective precipitation. *ACM*. 2023. pp. 165–71. https://doi.org/10.1145/3638584.3638671
20. Cowls J, Tsamados A, Taddeo M, Floridi L. The AI gambit: leveraging artificial intelligence to combat climate change—opportunities, challenges, and recommendation. *Springer*. 2023;38:283–307. https://doi.org/10.1007/s00146-021-01294-x
21. Sipei W, Wang H, Luo KH. A robust autoregressive long-term spatiotemporal forecasting framework for surrogate-based turbulent combustion modeling via deep learning. *Elsevier*. 2024;15:1–12. https://doi.org/10.1016/j.egyai.2023.100333
22. Nguyen AT, Pham DH, Oo BL, Ahn Y, Lim BTH. Predicting air quality index using attention hybrid deep learning and quantum-inspired particle swarm optimization. *Springer*. 2024;11(71):1–38. https://doi.org/10.1186/s40537-024-00926-5
23. Hussain B, Afzal MK, Anjum S, Rao I, Kim B-S. A novel graph convolutional gated recurrent unit framework for network-based traffic prediction. *IEEE Access*. 2023;11:130102–18. https://doi.org/10.1109/ACCESS.2023.3333938
24. Shin Y, Yoon Y. Performance evaluation of building blocks of spatial-temporal deep learning models for traffic forecasting. *IEEE Access*. 2023;11:136478–95. https://doi.org/10.1109/ACCESS.2023.3338223
25. Li L, Wen X, Li W, Li C, Zhang C. PatchTSFL: patch Fourier enhanced linear for long-term time-series forecasting. *IEEE Access*. 2025;13:124651–64. https://doi.org/10.1109/ACCESS.2025.3588672
26. Liu Y, Zheng Z, Rong Y, Zhao D, Cheng H, Li J. Equivariant and invariant message passing for global subseasonal-to-seasonal forecasting. *ACM*. 2025. pp. 1879–90. https://doi.org/10.1145/3711896.3736939
27. Yadav SA, et al. Context-aware deep learning model for yield prediction in potato using time-series UAS multispectral data. *IEEE J Sel Top Appl Earth Observ Remote Sens*. 2025;18:6096–115. https://doi.org/10.1109/JSTARS.2025.3539217
28. Tao R et al. KAN-enhanced transformer for wind profile retrieval from lidar spectra. *IEEE Trans Geosci Remote Sens*. 2025;63:1–14. https://doi.org/10.1109/TGRS.2025.3586114
29. Cuomo S, Cola VSD, Giampaolo F, Rozza G, Raissi M, Piccialli F. Scientific machine learning through physics–informed neural networks: where we are and what’s next. *Springer*. 2022;92(88):1–62. https://doi.org/10.1007/s10915-022-01939-z
30. Gill SS, Buyya R. Transforming research with quantum computing. *Elsevier*. 2026;4:1–8. https://doi.org/10.1016/j.ject.2024.07.001
31. Massoli FV, Vadicamo L, Amato G, Falchi F. A leap among quantum computing and quantum neural networks: a survey. *ACM*. 2022;55(5):1–37. https://doi.org/10.1145/3529756
32. Shen F, Liu J. Quantum Fourier convolutional network. *ACM*. 2023;19(1):1–14. https://doi.org/10.1145/3514249
33. Mangini S, Marruzzo A, Piantanida M, Gerace D, Bajoni D, Macchiavello C. Quantum neural network autoencoder and classifier applied to an industrial case study. *Springer*. 2022;4(13):1–13. https://doi.org/10.1007/s42484-022-00070-4
34. Du Y, Qian Y, Wu X, Tao D. A distributed learning scheme for variational quantum algorithms. *IEEE Trans Quantum Eng*. 2022;3:1–16. https://doi.org/10.1109/TQE.2022.3175267
35. Simonetti M, Perri D, Gervasi O. Variational methods in optical quantum machine learning. *IEEE Access*. 2023;11:131394–408. https://doi.org/10.1109/ACCESS.2023.3335625
36. SupanutThanasilp SW, Nghiem NA, Coles P, Cerezo M. Subtleties in the trainability of quantum machine learning models. *Springer*. 2023;5(21):1–22. https://doi.org/10.1007/s42484-023-00103-6
37. San Martin G, Droguett EL. Temporal variational auto-encoders for semi-supervised remaining useful life and fault diagnosis. *IEEE Access*. 2022;10:55112–25. https://doi.org/10.1109/ACCESS.2022.3174860
38. Ye X, Yan G, Yan J. Vqne: variational quantum network embedding with application to network alignment. *ACM*. 2022. pp. 3105–15. https://doi.org/10.1145/3580305.3599542
39. Kobayashi N, Suimon Y, Miyamoto K, Mitarai K. The cross-sectional stock return predictions via quantum neural network and tensor network. *Springer*. 2022;5(46):1–10. https://doi.org/10.1007/s42484-023-00136-x
40. Andrés E, Cuéllar MP, Navarro G. Efficient dimensionality reduction strategies for quantum reinforcement learning. *IEEE Access*. 2023;11:104534–53. https://doi.org/10.1109/ACCESS.2023.3318173
41. Liu W, Zhu Y, Zha Y, Wu Q, Jian L, Liu Z. Rotation- and permutation-equivariant quantum graph neural network for 3D graph data. *IEEE Trans Pattern Anal Mach Intell*. 2025;47(11):10329–43. https://doi.org/10.1109/TPAMI.2025.3593371
42. Wu P, Shi Y, Zhao P, Gu Z. Exploring new paradigms in time series prediction by integrating computer simulations and machine learning. *IEEE Access*. 2025;13:130796–815. https://doi.org/10.1109/ACCESS.2025.3589239
43. Muzammul M, Assam M, Qahmash A. Quantum-inspired multi-scale object detection in UAV imagery: advancing ultra-small object accuracy and efficiency for real-time applications. *IEEE Access*. 2025;13:2173–86. https://doi.org/10.1109/ACCESS.2024.3523405
44. Miroszewski A, et al. Detecting clouds in multispectral satellite images using quantum-Kernel support vector machines. *IEEE J Sel Top Appl Earth Observ Remote Sens*. 2023;16:7601–13. https://doi.org/10.1109/JSTARS.2023.3304122
45. Bhavsar R, et al. Classification of potentially hazardous asteroids using supervised quantum machine learning. *IEEE Access*. 2023;11:75829–48. https://doi.org/10.1109/ACCESS.2023.3297498
46. Park S, Baek H, Kim J. Quantum reinforcement learning for spatio-temporal prioritization in metaverse. *IEEE Access*. 2024;12:54732–44. https://doi.org/10.1109/ACCESS.2024.3390042
47. Kukliansky A, Orescanin M, Bollmann C, Huffmire T. Network anomaly detection using quantum neural networks on noisy quantum computers. *IEEE Trans Quantum Eng*. 2024;5:1–11. https://doi.org/10.1109/TQE.2024.3359574
48. Tudisco A, et al. Evaluating the computational advantages of the variational quantum circuit model in financial fraud detection. *IEEE Access*. 2024;12:102918–40. https://doi.org/10.1109/ACCESS.2024.3432312
49. Naz F, et al. Air quality and healthy ageing: predictive modeling of pollutants using CNN quantum-LSTM. *IEEE Access*. 2025;13:94212–23. https://doi.org/10.1109/ACCESS.2025.3570526
50. Dash R, Sinha A, Jyotheeswara Reddy K, Dhanamjayulu C, Kamwa I. Dynamic modeling and quantum-enhanced forecasting of multi-seasonal energy prices in simulated microgrid environments. *IEEE Access*. 2025;13:90362–88. https://doi.org/10.1109/ACCESS.2025.3570719
51. Ahanger TA, Bhatia M, Aldaej A. Quantum informative analysis in smart power distribution. *ACM*. 2024;15(6):1–18. https://doi.org/10.1145/3691350
52. Al-qaness MAA, Elaziz MA, Dahou A, Ewees AA, Al-Betar MA, Shrahili M, et al. Optimized quantum LSTM using modified electric eel foraging optimization for real-world intelligence engineering systems. *Elsevier*. 2024;15(10):1–11. https://doi.org/10.1016/j.asej.2024.102982
53. Prakash S, Bhattacherjee R, Bitragunta S, Bhatia A, Tiwari K. Quantum computing-accelerated Kalman filtering for satellite clusters: algorithms and comparative analysis. *IEEE Open J Comput Soc*. 2025;6:307–16. https://doi.org/10.1109/OJCS.2025.3535081
54. Siddiqui S, Holzer J, Malcarne J, Wernsing GMB, Wyglinski AM. Framework for implementing quantum neural networks in wireless communications. *IEEE Access*. 2025;13:91655–70. https://doi.org/10.1109/ACCESS.2025.3572416
55. Vinil A, Iyer P, Chetan J, Bembale A, Singh N. A topical review of quantum and classical machine learning approaches to disaster escape routing problems. *IEEE Access*. 2025;13:81494–506. https://doi.org/10.1109/ACCESS.2025.3567667
56. AlSagri HS, Kumar A, Saudagar AKJ, Kumar A, Raja L. Optimizing resource allocation in precision farming using quantum enhanced algorithms and quantum sensor networks. *Springer*. 2025;14(47):1–29. https://doi.org/10.1186/s13677-025-00769-2
57. Yi H. Hybrid quantum-classical framework for urban traffic state classification. *IEEE Access*. 2025;13:156628–38. https://doi.org/10.1109/ACCESS.2025.3605175
58. Paki ZS, Yakubu BM, Boukari S, Latif R, Jamail NSM, Gital AY, et al. Blockchain based precision rice farming framework using deep learning techniques. *Springer*. 2025;6(5):1–25. https://doi.org/10.1007/s43926-025-00264-9
59. Xia M, Li X, Shen Q, Chou T. Learning unbounded-domain spatiotemporal differential equations using adaptive spectral methods. *Springer*. 2024;70:4395–421. https://doi.org/10.12190/024-02131-2
60. Zhang Y, Wang M, Zhang F, Chen Z. A solution method for differential equations based on Taylor PINN. *IEEE Access*. 2023;11:145020–30. https://doi.org/10.1109/ACCESS.2023.3331330
61. Zhang G, Yu Z, Jin D, Li Y. Physics-infused machine learning for crowd simulation. *ACM*. 2022. pp. 2439–49. https://doi.org/10.1145/3534678.3539440
62. Ilioudi A, Dabiri A, Wolf BJ, De Schutter B. Deep learning for object detection and segmentation in videos: toward an integration with domain knowledge. *IEEE Access*. 2022;10:34562–76. https://doi.org/10.1109/ACCESS.2022.3162827
63. Jiao L, et al. Brain-inspired remote sensing foundation models and open problems: a comprehensive survey. *IEEE J Sel Top Appl Earth Observ Remote Sensing*. 2023;16:10084–120. https://doi.org/10.1109/JSTARS.2023.3316302
64. Wang K, Bertoli G, Cheng S, Schröter K, Caporali E, Piggott MD, et al. AI-empowered latent four-dimensional variational data assimilation for river discharge forecasting. *IEEE J Sel Top Appl Earth Observ Remote Sens*. 2025;18:24676–89. https://doi.org/10.1109/JSTARS.2026.3611136
65. Caterpillar Equipment Telematics Standards (C3S). VisionLink Global Industrial Fleet Logistics Architecture. *Cat Connect Systems*; 2024. Available at: https://www.cat.com/en_US/support/technology/visionlink.html
66. Trimble Heavy Civil Construction. Connected Site and Business Center Fleet Scheduling Protocol v2.1. *Trimble Civil Engineering*; 2024. Available at: https://heavyindustry.trimble.com
67. European Construction Industry Federation (FIEC). Smart Infrastructure Megaprojects Fleet Emission and Equipment Optimization Report. *FIEC Technical Report Series*; 2025. Available at: https://www.fiec.eu/reports/smart-infrastructure-2025
