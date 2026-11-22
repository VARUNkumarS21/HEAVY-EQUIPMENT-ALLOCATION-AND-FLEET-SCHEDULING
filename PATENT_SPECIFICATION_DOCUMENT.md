# PATENT SPECIFICATION DOCUMENT

**Application Number:** IP-2026-ENG-8402  
**Standard:** Form 2 (Complete Specification under The Patents Act, 1970 & The Patents Rules, 2003 / USPTO / PCT Guidelines)  

---

## TITLE OF THE INVENTION
**A HYBRID SPATIO-TEMPORAL DEEP LEARNING SYSTEM AND METHOD FOR MULTI-HORIZON HEAVY EQUIPMENT ALLOCATION AND FLEET SCHEDULING**

---

### APPLICANTS AND INVENTORS
1. **Dr. Danthuluri Sudha**, Department of Computer Science and Technology, Dayananda Sagar University, Bangalore, Karnataka, India.
2. **Dr. Santosh Kumar Jankatti**, Department of Computer Science and Technology, Dayananda Sagar University, Bangalore, Karnataka, India.
3. **Dr. Ramandeep Kaur**, Department of Computer Science and Technology, Dayananda Sagar University, Bangalore, Karnataka, India.
4. **Dr. Bondu Venkateswarlu**, Department of Computer Science and Engineering, Dayananda Sagar University, Bangalore, Karnataka, India.
5. **Dr. T. Gayathri**, Department of Computer Science and Engineering, Dayananda Sagar University, Bangalore, Karnataka, India.
6. **Dr. G. Manjula**, Department of Computer Science and Design, Dayananda Sagar Academy of Technology and Management, Bangalore, Karnataka, India.
7. **Dr. Harish H. Kenchannavar**, Department of Computer Science and Engineering (Data Science), Dayananda Sagar College of Engineering, Bangalore, Karnataka, India.

---

### PREAMBLE TO THE DESCRIPTION
*The following specification particularly describes the invention and the manner in which it is to be performed.*

---

## 1. FIELD OF THE INVENTION
The present invention relates generally to artificial intelligence, spatio-temporal deep learning, and industrial telematics. More specifically, the present invention relates to an automated, intelligent, and constraint-aware system and computer-implemented method for multi-horizon heavy equipment allocation, fleet dispatching, and dynamic maintenance scheduling across distributed, multi-site civil infrastructure and industrial construction projects.

---

## 2. BACKGROUND OF THE INVENTION AND PRIOR ART
In contemporary civil infrastructure engineering, commercial construction, and regional megaprojects, heavy mobile and static industrial machinery---including hydraulic excavators, dump trucks, heavy mobile cranes, tower cranes, concrete boom pumps, transit mixers, motor graders, compaction rollers, bulldozers, and deep foundation piling rigs---constitute immense capital expenditure assets. Operational efficiency, contract adherence, project delivery velocity, and operational carbon footprints depend heavily on the optimal temporal allocation and spatial dispatching of these assets across geographically dispersed project sites and central maintenance depots.

In real-world enterprise operations, fleet dispatching requires continuous coordination between heterogeneous machine specifications (e.g., engine operating hours, load capacities, boom reaches, fuel consumption rates, mechanical ages) and time-varying site requirements across multiple sequential construction phases (e.g., Earthworks, Foundation Piling, Superstructure Logistics, Facade Installation, and MEP Finishing). Inefficiencies in equipment scheduling cause severe project disruptions: idle machinery depreciation, unscheduled breakdown propagation, bottlenecking on critical-path milestones, excessive transit mobilization mileage, and cascading contractual financial penalties.

Conventional equipment scheduling systems predominantly rely on classical Operations Research (OR) methodologies, notably Mixed-Integer Linear Programming (MILP), Branch-and-Bound algorithms, or greedy heuristic dispatching rules (e.g., Earliest Due Date [EDD], First-Come-First-Served [FCFS], and Nearest-Neighbor heuristics). While MILP formulations offer theoretical optimality under deterministic assumptions, they suffer from combinatorial explosion ($NP$-hard computational complexity), rendering them intractable for real-time dispatching across enterprise fleet sizes ($>40$ machines) over multi-week planning horizons. Furthermore, greedy heuristic rules make myopic local choices that fail to account for downstream phase handovers, resulting in severe schedule slippage and frequent machine re-dispatching churn.

More recently, sequential deep learning models, such as Recurrent Neural Networks (RNNs), Long Short-Term Memory networks (LSTMs), and self-attention Transformers, have been investigated for time-series forecasting in industrial logistics. However, existing deep learning approaches suffer from several acute technical drawbacks:
1. **Multi-Horizon Rollout Error Drift:** Purely data-driven sequence networks suffer from rapid error compounding when deployed in multi-step autoregressive rollouts, leading to catastrophic allocation drift over extended horizons.
2. **Neglect of Non-Euclidean Logistics Graphs:** Standard neural networks assume regular Euclidean coordinates, failing to represent real-world road networks, transit tolls, mobilization travel durations, and shared maintenance depot constraints.
3. **Lack of Operational Constraint Enforcement:** Unconstrained neural networks frequently output schedules that violate hard physical and contractual boundaries, such as scheduling machinery during active preventive maintenance work orders or exceeding site parking capacities.
4. **Poor Cross-Project Generalization:** Neural models trained on mature commercial building projects experience severe distribution shifts when transferred to newly initiated infrastructure or highway projects.

Therefore, there exists an urgent technological need in the construction and fleet management industries for an intelligent, constraint-aware, hybrid spatio-temporal deep learning system and method that overcomes the computational intractability of classical mathematical solvers while eliminating the cumulative error drift and constraint violations of unconstrained neural models.

---

## 3. OBJECTS OF THE INVENTION
- **Primary Object:** To provide an end-to-end hybrid spatio-temporal deep learning system and method (termed **ConstrumindNet**) for multi-horizon heavy equipment allocation and fleet scheduling across geographically distributed construction project sites.
- **Secondary Object:** To provide a multi-scale temporal learning hierarchy that simultaneously models high-frequency daily operational shifts, medium-term construction phase transitions, and long-term project lifecycle horizons, thereby suppressing multi-step cumulative rollout drift.
- **Secondary Object:** To provide a spatial Graph Attention Network (GAT) that models non-Euclidean road logistics networks, transit distances, mobilization costs, and regional site-depot teleconnections.
- **Secondary Object:** To provide a Latent Feature Refinement (LFR) module that compresses high-dimensional latent states into a compact bottleneck representation and executes expressive nonlinear feature-mixing transformations to capture high-order machinery-project synergies.
- **Secondary Object:** To provide an operational-aware physics and consistency regularisation engine that penalizes maintenance schedule collisions, suppresses unnecessary inter-site mobilization churn, and aligns latent representations across heterogeneous project regimes.
- **Secondary Object:** To provide a real-time decision engine capable of generating conflict-free, multi-horizon equipment allocations with sub-second inference latency ($<0.5$ seconds), enabling instantaneous re-dispatching during unexpected site breakdowns.

---

## 4. SUMMARY OF THE INVENTION
The present invention discloses an automated, computer-implemented hybrid spatio-temporal deep learning system and method for multi-horizon heavy equipment allocation and fleet scheduling.

According to a first aspect, the system comprises:
1. **Telematics and Schedule Ingestion Module:** Synchronizes CAN-bus fleet telemetry data, multi-project construction phase schedules, workshop maintenance work orders, and geographic information system (GIS) transit distance matrices into a unified spatio-temporal state tensor $X_t \in \mathbb{R}^{N_s \times N_e \times C}$.
2. **Spatial Graph Attention Network (GAT) Subsystem:** Represents distributed construction sites and depots as a non-Euclidean weighted directed graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}_g, \mathcal{W})$, computing learned spatial attention coefficients across road transit corridors.
3. **Multi-Scale Temporal Transformer Encoder:** Hierarchically processes sliding historical context windows of length $L$ across tactical daily shifts (1--3 days), phase handovers (7--14 days), and strategic milestones (30+ days), generating a spatio-temporal latent representation $Z \in \mathbb{R}^{N \times d}$.
4. **Latent Feature Refinement (LFR) Module:** Projects the latent representation $Z$ into a lower-dimensional bottleneck space $Z_c \in \mathbb{R}^{N \times q}$ ($q \ll d$), subjects compressed tokens to multi-stage nonlinear feature-mixing transformations, and projects refined features back to embedding space via a trainable residual gating mechanism $Z^* = Z + \alpha Z_r$.
5. **Multi-Horizon Forecast Decoder:** Simultaneously predicts point estimates and allocation state fields $\widehat{X}_{t+1:t+H}$ across all future lead times $h \in \{1, 2, \dots, H\}$ in a direct multi-step mapping.
6. **Operational-Aware Regularisation Engine:** Optimizes model parameters via a composite loss function comprising a task prediction loss, a maintenance-schedule collision penalty ($\mathcal{L}_{\text{maint}}$), a mobilization transit distance penalty ($\mathcal{L}_{\text{transit}}$), and a cross-regime Maximum Mean Discrepancy (MMD) distribution alignment loss ($\mathcal{L}_{\text{regime}}$).

---

## 5. BRIEF DESCRIPTION OF THE ACCOMPANYING DRAWINGS
- **FIG. 1:** Overall system architectural block diagram of the intelligent spatio-temporal equipment allocation and fleet scheduling system (**ConstrumindNet**).
- **FIG. 2:** Schematic network diagram of the non-Euclidean spatial logistics graph interconnecting project sites and central maintenance depots across an urban-regional corridor.
- **FIG. 3:** Detailed block diagram of the Latent Feature Refinement (LFR) module and residual gated fusion pathway.
- **FIG. 4:** Workflow diagram of the multi-scale temporal decomposition hierarchy modeling daily shifts, phase handovers, and project lifecycles.
- **FIG. 5:** Flowchart of the computer-implemented end-to-end training procedure integrating operational-aware regularisation constraints.
- **FIG. 6:** Flowchart of the dynamic real-time multi-horizon rollout, conflict detection, and sub-second dispatching process during site operational execution.

---

## 6. DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS

### 6.1 System Architecture and Telematics Pipeline
Referring to **FIG. 1**, the system 100 comprises an Ingestion Subsystem 102 communicatively coupled to an on-board CAN-bus telematics receiver 104, an Enterprise Resource Planning / Project Schedule database 106, a Computerized Maintenance Management System (CMMS) database 108, and a GIS Road Network service 110. The Ingestion Subsystem 102 samples machine engine hours, fuel consumption, GPS coordinates, rated payload capacities, and active construction phase milestones at discrete shift intervals (e.g., daily epochs).

The sampled telematics and project requirements are synchronized into a continuous-discrete spatio-temporal tensor field $X_t \in \mathbb{R}^{N_s \times N_e \times C}$. In the preferred embodiment, the system manages a multi-site network of $N_s = 7$ spatial locations (including $N_p = 6$ active project sites and $N_d = 1$ central fleet maintenance depot) coordinating a heterogeneous fleet of $N_e = 46$ machines across 12 distinct equipment classes (Hydraulic Excavators, Dump Trucks, Mobile Cranes, Tower Cranes, Concrete Boom Pumps, Transit Mixers, Rollers, Motor Graders, Bulldozers, Backhoe Loaders, Piling Rigs, and Scissor Lifts).

### 6.2 Spatio-Temporal Graph Attention Network
Referring to **FIG. 2**, the distributed sites and depots 200 are represented as a non-Euclidean graph $\mathcal{G} = (\mathcal{V}, \mathcal{E}_g, \mathcal{W})$, where vertices $\mathcal{V}$ correspond to sites (Central Depot 202, Electronic City 204, Whitefield 206, Hoskote 208, Airport Site 210, Yelahanka 212, and Hebbal 214). Edges $\mathcal{E}_g$ represent heavy transport transit corridors weighted by road travel distance (km) and mobilization toll costs $\mathcal{W}$.

The spatial attention module 112 computes dynamic inter-site attention coefficients $A_{\text{spatial}}(i, j)$ according to:
$$A_{\text{spatial}}(i, j) = \frac{\exp\left(\text{LeakyReLU}\left(a^T [W h_i \,\|\, W h_j]\right)\right)}{\sum_{k \in \mathcal{N}_i} \exp\left(\text{LeakyReLU}\left(a^T [W h_i \,\|\, W h_k]\right)\right)}$$
where $\mathcal{N}_i$ denotes the neighborhood of location $i$ retaining transit connections with normalized affinity exceeding sparsification threshold $\tau = 0.30$.

### 6.3 Multi-Scale Temporal Decomposition Hierarchy
Referring to **FIG. 4**, the temporal sequence encoder 114 operates over a sliding historical observation window of length $L = 7$ days. The system decomposes temporal scheduling dynamics into three synchronized pathways:
- **Short-Term Tactical Pathway 402 (1--3 Days):** Captures high-frequency daily operational shifts, immediate machine dispatch requests, and urgent breakdown replacements.
- **Medium-Term Phase Pathway 404 (7--14 Days):** Aligns equipment mobilization with sequential construction phase handovers (Earthworks $\to$ Foundation Piling $\to$ Superstructure Erection $\to$ Scaffolding \& MEP).
- **Long-Term Strategic Pathway 406 (30+ Days):** Manages enterprise fleet balance, inter-city equipment demobilization, and major depot overhaul cycles.

### 6.4 Latent Feature Refinement (LFR) Module
Referring to **FIG. 3**, the Spatio-Temporal Graph Transformer outputs high-dimensional latent tokens $Z \in \mathbb{R}^{N \times d}$ ($d = 128$). To enable rich, high-order nonlinear interactions across heterogeneous fleet variables without prohibitive computational complexity, $Z$ is compressed via linear projection 302 into a compact bottleneck representation:
$$Z_c = \text{LinearCompress}(Z) \in \mathbb{R}^{N \times q}$$
where $q = 16$ ($q \ll d$). The compressed representations undergo Layer Normalization 304 and are fed into multi-stage nonlinear feature-mixing blocks 306 comprising parameterized transformations:
$$\widetilde{Z}_c = \sigma\left(W_2 \cdot \text{GELU}(W_1 Z_c + b_1) + b_2\right)$$
The refined representations are projected back to the full latent dimension via projection layer 308:
$$Z_r = W_{\text{proj}} \widetilde{Z}_c \in \mathbb{R}^{N \times d}$$
and fused through a trainable residual gating mechanism 310:
$$Z^* = Z + \alpha Z_r$$
where $\alpha \in \mathbb{R}$ is a learnable scaling parameter initialized to $0.1$.

### 6.5 Multi-Horizon Decoder and Operational Regularisation
The refined latent embedding $Z^*$ is supplied to a multi-horizon forecast decoder 116 that outputs direct multi-step point predictions across all future lead times $h \in \{1, \dots, H\}$ simultaneously:
$$\widehat{X}_{t+1:t+H} = g_\Phi(Z^*)$$

Referring to **FIG. 5**, the training procedure 500 optimizes network parameters $\Theta = \{\Theta_e, \Theta_r, \Theta_d\}$ using a multi-task composite loss function:
$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{task}} + \lambda_1 \left(\mathcal{L}_{\text{maint}} + \beta \mathcal{L}_{\text{transit}}\right) + \lambda_2 \mathcal{L}_{\text{regime}}$$
where $\mathcal{L}_{\text{task}}$ evaluates priority-weighted MSE, $\mathcal{L}_{\text{maint}}$ penalizes assignments of machinery during scheduled maintenance downtime windows, $\mathcal{L}_{\text{transit}}$ discourages unnecessary mobilization travel churn between distant sites, and $\mathcal{L}_{\text{regime}}$ enforces Maximum Mean Discrepancy (MMD) feature alignment between source commercial projects and target infrastructure projects.

### 6.6 Dynamic Real-Time Rollout and Sub-Second Re-Dispatching
Referring to **FIG. 6**, during field operational execution 600, the system monitors live CAN-bus telemetry 602. Upon receipt of an emergency breakdown event or ad-hoc site request 604, the system executes an automated multi-step decision pipeline:
1. Ingests current fleet status and updates the active context buffer (606);
2. Computes forward pass inference through ConstrumindNet ($\approx 0.41$ seconds) (608);
3. Identifies peer machinery within the same equipment class and ranks candidates based on next-available date, road mobilization transit hours, and maintenance conflict status (610);
4. Audits site parking capacity and phase prerequisite constraints; and
5. Issues a validated dispatch instruction (612), notifying site engineers and transmitting digital work orders directly to depot dispatchers.

---

## 7. CLAIMS

### WE CLAIM:
1. An automated, computer-implemented hybrid spatio-temporal deep learning system for multi-horizon heavy equipment allocation and fleet scheduling across geographically distributed construction projects, the system comprising:
   - a telematics and schedule ingestion processor configured to ingest and synchronize continuous telematics data from a heavy machinery fleet, project phase requirement schedules, workshop maintenance work orders, and geographic transit matrices into a multi-dimensional spatio-temporal state tensor;
   - a spatial graph attention network configured to model distributed project sites and maintenance depots as vertices in a non-Euclidean road logistics graph, computing spatial attention coefficients across inter-site transit corridors;
   - a multi-scale temporal sequence encoder configured to hierarchically process sliding context sequences of historical fleet states across daily tactical shifts, multi-day construction phase handovers, and project delivery horizons to generate spatio-temporal latent embeddings;
   - a latent feature refinement module comprising a linear compression bottleneck layer, one or more nonlinear feature-mixing blocks, and a residual gating connection configured to generate refined latent feature representations;
   - a multi-horizon forecast decoder configured to generate point estimates and discrete allocation indicators across a multi-step future planning horizon simultaneously; and
   - an operational-aware regularisation engine configured to optimize parameters of the system by penalizing maintenance-schedule collisions, inter-site transit churn, and cross-project distribution shifts.

2. The system as claimed in claim 1, wherein said multi-dimensional spatio-temporal state tensor is defined as $X_t \in \mathbb{R}^{N_s \times N_e \times C}$, wherein $N_s$ denotes a total count of spatial project sites and central depots, $N_e$ denotes a total fleet size, and $C$ denotes a quantity of operational, mechanical, and phase telemetry channels.

3. The system as claimed in claim 1, wherein said spatial graph attention network models road mobilization transit times between spatial nodes by sparsifying edges in said logistics graph using a normalized affinity threshold $\tau = 0.30$.

4. The system as claimed in claim 1, wherein said multi-scale temporal sequence encoder decomposes temporal dynamics into:
   - a short-term tactical pathway covering a forecast horizon of 1 to 3 days;
   - a medium-term phase pathway covering a forecast horizon of 7 to 14 days; and
   - a long-term strategic pathway covering a forecast horizon of 30 days or greater;  
   wherein each of said pathways shares parameters of said spatio-temporal sequence encoder.

5. The system as claimed in claim 1, wherein said latent feature refinement module compresses latent tokens from dimension $d = 128$ to a bottleneck dimension $q = 16$, executes parameterized nonlinear transformations, and projects refined representations back to dimension $d = 128$ via residual fusion $Z^* = Z + \alpha Z_r$, wherein $\alpha$ is a learnable scaling factor.

6. The system as claimed in claim 1, wherein said operational-aware regularisation engine executes a composite loss function $\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{task}} + \lambda_1 (\mathcal{L}_{\text{maint}} + \beta \mathcal{L}_{\text{transit}}) + \lambda_2 \mathcal{L}_{\text{regime}}$, wherein:
   - $\mathcal{L}_{\text{task}}$ comprises a priority-weighted Mean Squared Error assigning higher penalty weights to critical-path projects;
   - $\mathcal{L}_{\text{maint}}$ penalizes scheduled allocations of machines possessing active maintenance work orders;
   - $\mathcal{L}_{\text{transit}}$ penalizes inter-site mobilization road travel distances between consecutive operational shifts; and
   - $\mathcal{L}_{\text{regime}}$ enforces Maximum Mean Discrepancy (MMD) distribution alignment between source project domains and target project domains.

7. The system as claimed in claim 1, wherein said multi-horizon forecast decoder outputs point predictions for lead times $h \in \{1, 2, \dots, H\}$ simultaneously in a direct multi-step mapping, suppressing cumulative autoregressive error drift.

8. The system as claimed in claim 1, wherein said system is configured to execute single-query allocation inference and conflict detection with an operational latency of less than 0.50 seconds.

9. The system as claimed in claim 1, wherein said fleet comprises 46 heavy industrial machines across at least 12 distinct equipment classes coordinated among at least 7 spatial nodes across 5 sequential construction phases.

10. A computer-implemented method for multi-horizon heavy equipment allocation and fleet scheduling across distributed construction projects, the method comprising the steps of:
    - receiving, by an ingestion processor, continuous telematics streams from a heavy machinery fleet, project construction phase schedules, workshop maintenance work orders, and road transit cost matrices;
    - synchronizing said received data into a spatio-temporal fleet state tensor $X_t \in \mathbb{R}^{N_s \times N_e \times C}$;
    - constructing a non-Euclidean spatial graph representing project sites and central depots interconnected by road mobilization transit corridors;
    - computing spatio-temporal latent embeddings using a multi-scale temporal hierarchy and a spatial graph attention network;
    - compressing said latent embeddings into a compact bottleneck representation and executing nonlinear feature mixing in a latent refinement module;
    - residually fusing refined latent features with uncompressed encoder embeddings;
    - decoding multi-horizon allocation predictions across future lead times $h \in \{1, \dots, H\}$ simultaneously; and
    - training the network parameters using a composite loss function penalizing task error, maintenance collisions, transit distance churn, and cross-project distribution shifts.

11. The method as claimed in claim 10, further comprising: auditing predicted allocations against an enterprise Computerized Maintenance Management System (CMMS) database to identify and flag overlapping maintenance windows.

12. The method as claimed in claim 10, wherein said multi-scale temporal hierarchy processes tactical daily shifts, phase handovers, and strategic project delivery milestones using shared-weight neural layers.

13. The method as claimed in claim 10, wherein said latent feature mixing is executed in a compressed bottleneck dimension $q = 16$ with residual gating scaling factor $\alpha = 0.1$.

14. The method as claimed in claim 10, wherein said road mobilization transit corridors are weighted by road network mileage and heavy vehicle transit travel hours extracted from a GIS routing service.

15. The method as claimed in claim 10, wherein said step of decoding multi-horizon allocation predictions achieves an Allocation Match Accuracy of at least 91.0\% at a 1-day horizon and at least 84.0\% at a 7-day horizon.

16. The method as claimed in claim 10, wherein cross-project transfer from commercial building projects to highway infrastructure projects exhibits a transfer degradation in Root Mean Squared Error of less than +0.050.

17. The method as claimed in claim 10, further comprising: upon receiving an equipment mechanical breakdown event, executing real-time re-allocation inference within 0.45 seconds to identify and schedule replacement machinery located at a minimum road mobilization distance.

18. A non-transitory computer-readable storage medium storing instructions that, when executed by one or more processors, cause the processors to perform the steps of the method claimed in claims 10 to 17.

---

## 8. ABSTRACT OF THE INVENTION
Disclosed is an automated, constraint-aware hybrid spatio-temporal deep learning system and method (**ConstrumindNet**) for multi-horizon heavy equipment allocation and fleet scheduling across distributed infrastructure projects. The system synchronizes CAN-bus fleet telematics, multi-phase project requirements, workshop work orders, and road transit matrices into a spatio-temporal state tensor. A spatial Graph Attention Network (GAT) explicitly models non-Euclidean road logistics corridors, while a multi-scale temporal sequence encoder hierarchically captures daily tactical shifts (1--3 days), phase handovers (7--14 days), and project lifecycles (30+ days). A Latent Feature Refinement (LFR) module compresses latent representations into a compact bottleneck ($q = 16$), applies multi-stage nonlinear feature-mixing transformations, and residually fuses refined features to capture high-order machinery-project synergies. A multi-task operational regularisation engine optimizes parameters by penalizing maintenance collisions, excessive transit churn, and cross-project distribution shifts. The system achieves 91.4\% allocation accuracy at Day 1 and 84.2\% at Day 7 with sub-second inference latency.
