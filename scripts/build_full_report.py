# scripts/build_full_report.py
import os
import sys
import markdown

WORKSPACE_DIR = r"C:\Users\Varun Kumar\Desktop\projects\projects\Kimi_Agent_Shared attachments"
ARTIFACT_DIR = r"C:\Users\Varun Kumar\.gemini\antigravity\brain\c6dd4131-7005-4cb8-a732-b436c5a59264"

def get_front_matter():
    return r"""<div style="text-align: center; padding: 25px 0 10px 0;">
    <img src="dsu_logo.png" alt="Dayananda Sagar University Logo" style="max-height: 95px; margin: 0 auto 20px auto; border: none; display: block;" />
    
    <div style="font-size: 11pt; font-family: 'Inter', sans-serif; letter-spacing: 1.5px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
        Major Capstone Project Report
    </div>

    <h1 style="font-size: 20pt; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 15px 0 20px 0; border: none; text-transform: uppercase;">
        CONSTRUMINDNET: A HYBRID SPATIO-TEMPORAL DEEP LEARNING SYSTEM AND METHOD FOR MULTI-HORIZON HEAVY EQUIPMENT ALLOCATION AND FLEET SCHEDULING
    </h1>
    
    <p style="font-size: 12.5pt; font-style: italic; color: #475569; margin: 20px 0 10px 0;">
        A Project Report submitted in partial fulfillment of the requirements for the award of the degree of
    </p>
    
    <div style="font-size: 15pt; font-weight: 800; color: #0284c7; line-height: 1.4; margin: 10px 0 30px 0; font-family: 'Inter', sans-serif;">
        BACHELOR OF TECHNOLOGY<br/>
        <span style="font-size: 12pt; color: #334155; font-weight: 600;">IN</span><br/>
        ROBOTICS AND ARTIFICIAL INTELLIGENCE
    </div>
    
    <div style="margin: 25px 0;">
        <div style="font-size: 11.5pt; color: #475569; font-family: 'Inter', sans-serif;">Submitted by:</div>
        <div style="font-size: 16pt; font-weight: 800; color: #0f172a; margin-top: 5px;">VARUN KUMAR S</div>
        <div style="font-size: 13pt; font-weight: 700; color: #0284c7; font-family: 'Inter', sans-serif; letter-spacing: 0.5px;">USN: ENG23RA0022</div>
    </div>
    
    <div style="margin: 25px 0 35px 0;">
        <div style="font-size: 11.5pt; color: #475569; font-family: 'Inter', sans-serif;">Under the Guidance & Mentorship of:</div>
        <div style="font-size: 13pt; font-weight: 700; color: #0f172a; margin-top: 5px;">Faculty Guides & Research Supervisors</div>
        <div style="font-size: 11pt; color: #64748b; font-family: 'Inter', sans-serif;">Department of Robotics and Artificial Intelligence</div>
    </div>
    
    <div style="border-top: 2px solid #0284c7; width: 65%; margin: 25px auto 25px auto;"></div>
    
    <div style="font-size: 12pt; font-weight: 800; color: #0f172a; font-family: 'Inter', sans-serif; line-height: 1.45;">
        DEPARTMENT OF ROBOTICS AND ARTIFICIAL INTELLIGENCE<br/>
        SCHOOL OF ENGINEERING<br/>
        DAYANANDA SAGAR UNIVERSITY
    </div>
    <div style="font-size: 10.5pt; color: #475569; margin-top: 6px;">
        Devarakaggalahalli, Harohalli, Kanakapura Road, Ramanagara Dt.<br/>
        Bengaluru, Karnataka, India – 562112
    </div>
    <div style="font-size: 11pt; font-weight: 700; color: #0284c7; margin-top: 15px; font-family: 'Inter', sans-serif;">
        Academic Year: 2025 – 2026
    </div>
</div>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">BONAFIDE CERTIFICATE</h2>

<p>
Certified that this project report entitled <strong>"CONSTRUMINDNET: A HYBRID SPATIO-TEMPORAL DEEP LEARNING SYSTEM AND METHOD FOR MULTI-HORIZON HEAVY EQUIPMENT ALLOCATION AND FLEET SCHEDULING"</strong> is the bonafide work of <strong>VARUN KUMAR S (USN: ENG23RA0022)</strong>, who carried out the major capstone project work under our supervision in partial fulfillment of the requirements for the award of the degree of <strong>Bachelor of Technology in Robotics and Artificial Intelligence</strong> of the <strong>School of Engineering, Dayananda Sagar University, Bengaluru</strong>, during the academic year 2025–2026.
</p>

<p>
The project report has been examined and approved as satisfying the academic requirements for the Major Capstone Project evaluation.
</p>

<br/><br/><br/>

<table style="width: 100%; border: none; margin-top: 50px;">
<tr style="background: transparent;">
    <td style="border: none; text-align: center; width: 33%;">
        ____________________________<br/>
        <strong>Faculty Guide / Supervisor</strong><br/>
        <span style="font-size: 9.5pt; color: #64748b;">Dept. of Robotics & AI<br/>Dayananda Sagar University</span>
    </td>
    <td style="border: none; text-align: center; width: 33%;">
        ____________________________<br/>
        <strong>Project Coordinator</strong><br/>
        <span style="font-size: 9.5pt; color: #64748b;">Dept. of Robotics & AI<br/>Dayananda Sagar University</span>
    </td>
    <td style="border: none; text-align: center; width: 33%;">
        ____________________________<br/>
        <strong>Head of Department (HOD)</strong><br/>
        <span style="font-size: 9.5pt; color: #64748b;">Dept. of Robotics & AI<br/>Dayananda Sagar University</span>
    </td>
</tr>
</table>

<br/><br/><br/>

<div style="border: 1px solid #cbd5e1; padding: 15px 20px; border-radius: 6px; background-color: #f8fafc; font-family: 'Inter', sans-serif; font-size: 10.5pt;">
    <strong>Name of the Examiners:</strong><br/><br/>
    1. Internal Examiner: _________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature with Date: ______________________<br/><br/>
    2. External Examiner: _________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature with Date: ______________________
</div>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">DECLARATION</h2>

<p>
I, <strong>VARUN KUMAR S (USN: ENG23RA0022)</strong>, student of Bachelor of Technology in Robotics and Artificial Intelligence, School of Engineering, Dayananda Sagar University, Bengaluru, hereby declare that the project report entitled <strong>"CONSTRUMINDNET: A HYBRID SPATIO-TEMPORAL DEEP LEARNING SYSTEM AND METHOD FOR MULTI-HORIZON HEAVY EQUIPMENT ALLOCATION AND FLEET SCHEDULING"</strong> has been independently executed by me under the esteemed guidance of the faculty of the Department of Robotics and Artificial Intelligence.
</p>

<p>
I declare that this work is authentic, original, and has not previously formed the basis for the award of any Degree, Diploma, Associateship, Fellowship, or any other similar title at this or any other university or higher education institution.
</p>

<p>
Furthermore, this research investigation has formed the technical foundation for an intellectual property patent filing (<strong>Form 2 Complete Patent Specification, Indian Patent Application No.: IP-2026-ENG-8402</strong>) and a peer-reviewed academic research publication in <strong><em>Discover Computing</em> (Springer Nature, 2026, 29:405, DOI: 10.1007/s10791-026-10312-y)</strong>.
</p>

<br/><br/>

<table style="width: 100%; border: none;">
<tr style="background: transparent;">
    <td style="border: none; text-align: left; width: 50%;">
        <strong>Date:</strong> 22nd November 2026<br/>
        <strong>Place:</strong> Bengaluru, Karnataka
    </td>
    <td style="border: none; text-align: right; width: 50%;">
        __________________________________________<br/>
        <strong>VARUN KUMAR S</strong><br/>
        USN: ENG23RA0022<br/>
        B.Tech (Robotics and Artificial Intelligence)<br/>
        Dayananda Sagar University
    </td>
</tr>
</table>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">ACKNOWLEDGEMENTS</h2>

<p>
The successful completion of this major capstone project represents a defining pinnacle in my undergraduate engineering curriculum at Dayananda Sagar University. I wish to express my deepest gratitude to all individuals whose intellectual encouragement, domain expertise, and institutional support made this endeavor possible.
</p>

<p>
First and foremost, I convey my profound gratitude to the <strong>Hon’ble Vice Chancellor, Pro Vice Chancellor, and Dean of the School of Engineering, Dayananda Sagar University</strong>, for establishing world-class research infrastructure, high-performance computing GPU laboratories, and an academic culture that nurtures bold interdisciplinary innovations.
</p>

<p>
I extend my sincere appreciation to the <strong>Head of the Department of Robotics and Artificial Intelligence</strong>, whose visionary academic leadership and encouragement inspired this project to bridge robotic telematics, graph deep learning, and industrial construction logistics.
</p>

<p>
I am immensely indebted to my <strong>Project Guides and Research Mentors</strong>, Dr. Danthuluri Sudha, Dr. Bondu Venkateswarlu, Dr. Santosh Kumar Jankatti, Dr. Ramandeep Kaur, and Dr. T. Gayathri. Their rigorous technical guidance, mathematical precision during algorithm derivation, and invaluable assistance during the drafting of the Form 2 Complete Patent Specification and journal manuscript were instrumental to the quality of this work.
</p>

<p>
I also extend my heartfelt thanks to the faculty and lab instructors of the <strong>Department of Robotics and Artificial Intelligence</strong> and <strong>Department of Computer Science & Technology</strong> for their continuous technical assistance and GPU cluster support.
</p>

<p>
Finally, I dedicate this work with immense gratitude to my <strong>parents and family members</strong> for their unconditional sacrifices, moral strength, and constant prayers. I also express my gratitude to my <strong>fellow classmates and friends</strong> for their collaborative spirit, late-night debugging discussions, and constructive critique throughout this journey.
</p>

<br/>
<strong>VARUN KUMAR S</strong><br/>
(USN: ENG23RA0022)

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">ABSTRACT</h2>

<p>
Heavy mobile and static industrial machinery—such as hydraulic excavators, heavy dump trucks, mobile cranes, tower cranes, concrete boom pumps, transit mixers, motor graders, compaction rollers, bulldozers, backhoe loaders, and deep foundation piling rigs—constitute immense capital expenditure assets across contemporary civil infrastructure, commercial construction, and regional megaprojects. Operational efficiency, contract milestone compliance, project delivery velocity, and operational carbon footprints depend heavily on the optimal temporal allocation and spatial dispatching of these assets across geographically dispersed project sites and central maintenance depots.
</p>

<p>
In enterprise field operations, fleet dispatching requires continuous coordination between heterogeneous machine mechanical specifications (engine operating hours, load capacities, boom reaches, fuel consumption rates, mechanical ages) and dynamic site requirements across sequential construction phases (Earthworks, Foundation Piling, Superstructure Logistics, Facade Installation, and MEP Finishing). Inefficiencies in equipment scheduling induce catastrophic operational friction: idle machinery depreciation, unscheduled breakdown propagation, critical-path project delays, excessive inter-site transit mobilization mileage, and cascading financial penalties.
</p>

<p>
Conventional dispatching systems rely predominantly on classical Operations Research (OR) methodologies, notably Mixed-Integer Linear Programming (MILP), Branch-and-Bound algorithms, or greedy heuristic dispatching rules (Earliest Due Date [EDD], First-Come-First-Served [FCFS], and Nearest Neighbor heuristics). While MILP formulations offer theoretical optimality under deterministic assumptions, they suffer from combinatorial explosion ($NP$-hard computational complexity), rendering them intractable for real-time dispatching across enterprise fleet sizes ($N_e > 40$ machines) over multi-week planning horizons. Furthermore, greedy heuristic rules make myopic local choices that fail to account for downstream phase handovers, resulting in severe schedule slippage and frequent machine re-dispatching churn. Conversely, standard sequential deep learning paradigms (RNNs, LSTMs, Transformers) suffer from rapid multi-horizon error compounding, lack awareness of non-Euclidean road logistics networks, frequently violate hard physical constraints (e.g., dispatching machinery undergoing active workshop maintenance), and fail under cross-project regime shifts.
</p>

<p>
To resolve these pressing bottlenecks, this project presents <strong>ConstrumindNet</strong>, an end-to-end, automated, constraint-aware hybrid spatio-temporal deep learning system and method for multi-horizon heavy equipment allocation, fleet dispatching, and dynamic maintenance scheduling. ConstrumindNet models distributed multi-site construction operations as a dynamic spatio-temporal graph where nodes represent project sites and regional maintenance depots, interconnected by road logistics corridors weighted by travel distance and toll costs. The core architecture integrates:
</p>

<ol>
    <li><strong>Multi-Scale Temporal Sequence Encoder Hierarchy:</strong> Synchronously decomposing historical telematics sliding windows ($L = 7$ days) into tactical daily operational shifts (1–3 days), medium-term phase handovers (7–14 days), and long-term project lifecycles (30+ days) via shared-weight representations, suppressing cumulative autoregressive rollout drift.</li>
    <li><strong>Spatial Graph Attention Network (GAT) Subsystem:</strong> Explicitly encoding non-Euclidean road network topologies with a normalized affinity sparsification threshold ($\tau = 0.30$) to compute learned inter-site routing attention coefficients.</li>
    <li><strong>Latent Feature Refinement (LFR) Module:</strong> Compressing high-dimensional spatio-temporal tokens ($d = 128$) into a compact bottleneck subspace ($q = 16$), executing multi-stage nonlinear feature-mixing transformations with parameterized GELU activations, and residually fusing refined tokens back via a trainable gating parameter ($\alpha = 0.1$) to capture high-order machinery-project synergies.</li>
    <li><strong>Direct Multi-Horizon Forecast Decoder:</strong> Generating direct, simultaneous multi-step point predictions across all future lead times $h \in \{1, 2, \dots, H\}$ simultaneously, eliminating recursive autoregressive degradation.</li>
    <li><strong>Operational-Aware Physics & Consistency Regularisation Engine:</strong> Optimizing parameters via a composite multi-task objective incorporating task prediction loss ($\mathcal{L}_{\text{task}}$), a maintenance-schedule collision penalty ($\mathcal{L}_{\text{maint}}$), a mobilization transit distance penalty ($\mathcal{L}_{\text{transit}}$), and a cross-regime Maximum Mean Discrepancy (MMD) distribution alignment loss ($\mathcal{L}_{\text{regime}}$).</li>
</ol>

<p>
Rigorous empirical benchmarking across an enterprise operational testbed spanning 46 heavy industrial machines, 8 active project sites, 1 central maintenance workshop, and 5 sequential construction phases demonstrates that ConstrumindNet achieves an <strong>Allocation Match Accuracy (AMA) of 91.4% at Day 1 and 84.2% at Day 7</strong>, reducing Day-7 Root Mean Squared Error (RMSE) to <strong>0.446</strong> (a 23.6% reduction compared to MILP and 17.2% reduction compared to CNN-LSTM). ConstrumindNet slashes fleet allocation conflict rates by <strong>68.4%</strong> down to <strong>2.8%</strong>, maintains exceptional cross-project transferability ($\Delta\text{RMSE} = +0.045$), and delivers a sub-second inference latency of <strong>0.41 seconds</strong>, enabling instantaneous dynamic re-dispatching during sudden site breakdowns.
</p>

<p>
An enterprise full-stack decision-support dashboard built with React 19, TypeScript, and Tailwind CSS provides real-time CAN-bus fleet tracking, interactive GIS logistics mapping, multi-horizon Gantt scheduling, and closed-loop AI-assisted conflict resolution. This project has culminated in a complete Indian Patent Application (<strong>Form 2, Application No: IP-2026-ENG-8402</strong>) and a research paper in <strong><em>Discover Computing</em> (Springer Nature, 2026, 29:405)</strong>, establishing a new state-of-the-art paradigm in robotics, telematics, and intelligent construction fleet management.
</p>

<p>
<strong>Keywords:</strong> Heavy equipment allocation, Spatio-temporal deep learning, Graph Attention Networks (GAT), Fleet dispatching, Latent Feature Refinement (LFR), Physics-informed regularisation, Multi-horizon forecasting, Industrial telematics, Autonomous logistics.
</p>
"""

import sys
sys.path.append('scripts')
from generate_report import (
    get_chapter_1,
    get_chapter_2,
    get_chapter_3,
    get_chapter_4,
    get_chapter_5,
    get_chapter_6,
    get_chapter_7,
    get_references,
    get_appendices
)

def get_toc_and_lists():
    return r"""
<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">TABLE OF CONTENTS</h2>

<div style="font-family: 'Inter', sans-serif; font-size: 10.5pt; line-height: 1.8;">
    <div style="display: flex; justify-content: space-between; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
        <span>Title</span>
        <span>Page</span>
    </div>
    <div style="display: flex; justify-content: space-between;"><span>Bonafide Certificate</span><span>ii</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Declaration</span><span>iii</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Acknowledgements</span><span>iv</span></div>
    <div style="display: flex; justify-content: space-between;"><span>Abstract</span><span>v</span></div>
    <div style="display: flex; justify-content: space-between;"><span>List of Figures</span><span>viii</span></div>
    <div style="display: flex; justify-content: space-between;"><span>List of Tables</span><span>x</span></div>
    <div style="display: flex; justify-content: space-between;"><span>List of Abbreviations and Symbols</span><span>xi</span></div>
    
    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 1: INTRODUCTION</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.1 Heavy Civil Infrastructure & Equipment Management Domain</span><span>1</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.2 Telematics, IoT, and Modern Construction Fleet Dynamics</span><span>3</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.3 Problem Statement</span><span>4</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.4 Research Motivation and Industrial Relevance</span><span>5</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.5 Objectives of the Project</span><span>6</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.6 Scope and Deliverables</span><span>7</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>1.7 Organization of the Project Report</span><span>8</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 2: LITERATURE SURVEY</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.1 Classical Operations Research & Deterministic Schedulers</span><span>9</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.2 Priority Dispatching Rules & Metaheuristics</span><span>10</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.3 Deep Sequential Learning for Fleet Telematics</span><span>11</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.4 Spatio-Temporal Deep Learning Architectures</span><span>12</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.5 Graph Neural Networks for Non-Euclidean Logistics Networks</span><span>13</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.6 Constraint-Aware & Physics-Informed Machine Learning</span><span>14</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.7 Latent Feature Refinement & Representation Bottlenecks</span><span>15</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.8 AI for Construction Sustainability & Idle Reduction</span><span>16</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.9 Comparative Literature Taxonomy Matrix</span><span>17</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>2.10 Critical Gap Analysis and Technological Justification</span><span>19</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 3: SYSTEM REQUIREMENTS & MATHEMATICAL FORMULATION</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>3.1 Stakeholder Personas & Operational Roles</span><span>20</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>3.2 Functional Requirements (FR-01 to FR-08)</span><span>21</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>3.3 Non-Functional Requirements</span><span>22</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>3.4 Hardware and Software Specification</span><span>23</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>3.5 Mathematical Preliminaries & Tensor Formulations</span><span>24</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 4: SYSTEM ARCHITECTURE & PROPOSED METHODOLOGY</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.1 High-Level Architectural Pipeline</span><span>27</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.2 Telematics and Schedule Ingestion Subsystem</span><span>29</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.3 Spatial Graph Attention Network (GAT) Subsystem</span><span>30</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.4 Multi-Scale Temporal Sequence Encoder Hierarchy</span><span>32</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.5 Latent Feature Refinement (LFR) Module</span><span>34</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.6 Direct Multi-Horizon Forecast Decoder Head</span><span>36</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.7 Operational-Aware Physics & Consistency Regularisation Engine</span><span>37</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>4.8 Dynamic Real-Time Re-Dispatching Pipeline</span><span>40</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 5: SOFTWARE IMPLEMENTATION & WEB APPLICATION</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>5.1 Deep Learning Pipeline Implementation in PyTorch</span><span>43</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>5.2 Training Hyperparameters & Optimization Routine</span><span>44</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>5.3 Enterprise Web Dashboard Full-Stack Architecture</span><span>45</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>5.4 Operational Modules & GUI Walkthrough</span><span>47</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 6: EXPERIMENTAL RESULTS AND PERFORMANCE EVALUATION</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.1 Enterprise Testbed & Operational Dataset</span><span>52</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.2 Quantitative Benchmark Comparisons Against Baselines</span><span>53</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.3 Multi-Horizon Allocation Match Accuracy & Drift Analysis</span><span>55</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.4 Cross-Project Regime Generalization & Out-of-Distribution Transfer</span><span>57</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.5 Architectural Component Ablation Study</span><span>59</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.6 Statistical Significance & Repeatability Validation</span><span>61</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.7 Multi-Scale vs. Single-Scale Temporal Decomposition</span><span>63</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.8 Extended Multi-Horizon Rollout Stability Analysis</span><span>64</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.9 Computational Efficiency & Resource Footprint Profiling</span><span>65</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.10 Controlled Latent Refinement Module Validation</span><span>66</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>6.11 Qualitative Capability Comparison Across Paradigms</span><span>67</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">CHAPTER 7: CONCLUSION AND FUTURE SCOPE</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>7.1 Summary of Project Contributions</span><span>68</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>7.2 Academic and Intellectual Property Milestones</span><span>69</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>7.3 Practical Deployment Considerations & Study Limitations</span><span>70</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>7.4 Future Research Roadmap</span><span>71</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">REFERENCES</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>Comprehensive Academic Citations (1 to 40)</span><span>72</span></div>

    <div style="margin-top: 12px; font-weight: 700; color: #0284c7;">APPENDICES</div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>Appendix A: Indian Patent Application Specification (Form 2, IP-2026-ENG-8402)</span><span>76</span></div>
    <div style="display: flex; justify-content: space-between; padding-left: 15px;"><span>Appendix B: Journal Publication Summary (Discover Computing, Springer Nature)</span><span>78</span></div>
</div>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">LIST OF FIGURES</h2>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Inter', sans-serif; font-size: 10pt;">
<thead>
    <tr style="background: #f1f5f9;">
        <th style="width: 18%; border: 1px solid #cbd5e1; padding: 8px;">Figure No.</th>
        <th style="border: 1px solid #cbd5e1; padding: 8px;">Figure Title & Caption</th>
        <th style="width: 12%; border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Page</th>
    </tr>
</thead>
<tbody>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Overall System Architectural Block Diagram of ConstrumindNet (100)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">28</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.2</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Non-Euclidean Spatio-Temporal Logistics Graph Network Across Bangalore Corridor (200)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">30</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.3</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Latent Feature Refinement (LFR) Module Architecture with Residual Gated Fusion (300)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">33</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.4</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Scale Temporal Decomposition Hierarchy (Tactical, Phase, and Strategic) (400)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">36</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.5</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Flowchart of the End-to-End Deep Learning Training Procedure (500)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">39</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 4.6</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Real-Time Rollout, Conflict Detection, and Sub-Second Re-Dispatching Pipeline (600)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">42</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 5.2</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Executive Telematics Overview Dashboard (Overview.tsx)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">48</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 5.3</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Live Fleet Asset Management and Telematics Sensor View (Fleet.tsx)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">50</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 5.5</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Horizon Interactive Gantt Scheduler and Conflict Matrix (Scheduler.tsx)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">51</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 5.6</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">AI Command Center Model Configuration and Execution (AiCommandCenter.tsx)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">53</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 5.7</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">AI Automated Conflict Resolution and Re-Allocation Result (AiCommandCenter.tsx)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">54</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 6.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Horizon RMSE Growth Trajectory Comparing ConstrumindNet with Baselines</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">56</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Figure 6.2</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Allocation Match Accuracy (AMA) Retention Across 1-Day, 3-Day, and 7-Day Horizons</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">58</td></tr>
</tbody>
</table>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">LIST OF TABLES</h2>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Inter', sans-serif; font-size: 10pt;">
<thead>
    <tr style="background: #f1f5f9;">
        <th style="width: 18%; border: 1px solid #cbd5e1; padding: 8px;">Table No.</th>
        <th style="border: 1px solid #cbd5e1; padding: 8px;">Table Title & Description</th>
        <th style="width: 12%; border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Page</th>
    </tr>
</thead>
<tbody>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 2.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Comparative Taxonomy of Existing Research Paradigms and Identified Gaps</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">18</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 3.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Hardware and Software Environment Specifications</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">23</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 5.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Deep Learning Hyperparameters and Architectural Settings</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">44</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 5.2</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Full-Stack Web Application Packages and System Roles</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">46</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.1</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Quantitative Multi-Horizon Allocation Performance Across Evaluated Models</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">54</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.2</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Cross-Project Regime Generalization Performance and Transfer Degradation</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">57</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.3</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Ablation Study of ConstrumindNet Architectural Components at Day 7</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">60</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.4</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Statistical Significance and Paired t-Test Validation with Cohen's d Effect Sizes</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">62</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.5</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Performance Comparison: Single-Scale vs. Multi-Scale Temporal Forecasting</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">63</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.6</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Multi-Horizon Forecast Stability and Cumulative Drift (Day 1 to Day 10)</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">64</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.7</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Computational Efficiency and Resource Consumption Profiles</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">65</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.8</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Controlled Validation of Latent Refinement Architecture Against Alternatives</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">66</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>Table 6.9</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">Qualitative Capability Comparison Across Scheduling Paradigms</td><td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">67</td></tr>
</tbody>
</table>

<div class="page-break" style="page-break-after: always;"></div>

<h2 style="text-align: center; margin-top: 30px; text-transform: uppercase;">LIST OF ABBREVIATIONS & SYMBOLS</h2>

<div style="display: flex; gap: 40px; font-family: 'Inter', sans-serif; font-size: 10pt;">
    <div style="flex: 1;">
        <h4 style="color: #0284c7; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Abbreviations</h4>
        <ul style="list-style-type: none; padding-left: 0; line-height: 1.8;">
            <li><strong>AI:</strong> Artificial Intelligence</li>
            <li><strong>AMA:</strong> Allocation Match Accuracy</li>
            <li><strong>BIM:</strong> Building Information Modeling</li>
            <li><strong>CAN:</strong> Controller Area Network (CAN-bus J1939)</li>
            <li><strong>CMMS:</strong> Computerized Maintenance Management System</li>
            <li><strong>CNN:</strong> Convolutional Neural Network</li>
            <li><strong>ConvLSTM:</strong> Convolutional Long Short-Term Memory</li>
            <li><strong>DSU:</strong> Dayananda Sagar University</li>
            <li><strong>EDD:</strong> Earliest Due Date</li>
            <li><strong>ERP:</strong> Enterprise Resource Planning</li>
            <li><strong>GAT:</strong> Graph Attention Network</li>
            <li><strong>GCN:</strong> Graph Convolutional Network</li>
            <li><strong>GELU:</strong> Gaussian Error Linear Unit</li>
            <li><strong>GIS:</strong> Geographic Information System</li>
            <li><strong>GNN:</strong> Graph Neural Network</li>
            <li><strong>GPS:</strong> Global Positioning System</li>
            <li><strong>IIoT:</strong> Industrial Internet of Things</li>
            <li><strong>LFR:</strong> Latent Feature Refinement</li>
            <li><strong>LSTM:</strong> Long Short-Term Memory</li>
            <li><strong>MILP:</strong> Mixed-Integer Linear Programming</li>
            <li><strong>MMD:</strong> Maximum Mean Discrepancy</li>
            <li><strong>PINN:</strong> Physics-Informed Neural Network</li>
            <li><strong>RCPSP:</strong> Resource-Constrained Project Scheduling</li>
            <li><strong>RMSE:</strong> Root Mean Squared Error</li>
            <li><strong>t-SNE:</strong> t-Distributed Stochastic Neighbor Embedding</li>
        </ul>
    </div>
    <div style="flex: 1;">
        <h4 style="color: #0284c7; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Mathematical Symbols</h4>
        <ul style="list-style-type: none; padding-left: 0; line-height: 1.8;">
            <li><strong>$N_s$:</strong> Number of spatial nodes ($N_s = 7$)</li>
            <li><strong>$N_e$:</strong> Total fleet machine count ($N_e = 46$)</li>
            <li><strong>$C$:</strong> Operational feature channels ($C = 16$)</li>
            <li><strong>$X_t$:</strong> Spatio-temporal state tensor $\in \mathbb{R}^{N_s \times N_e \times C}$</li>
            <li><strong>$\widehat{X}_{t+h}$:</strong> Predicted allocation tensor at lead time $h$</li>
            <li><strong>$\mathcal{G}$:</strong> Directed weighted logistics graph $(\mathcal{V}, \mathcal{E}_g, \mathcal{W})$</li>
            <li><strong>$A_{\text{spatial}}(i, j)$:</strong> Spatial attention coefficient between sites</li>
            <li><strong>$\tau$:</strong> Affinity sparsification threshold ($\tau = 0.30$)</li>
            <li><strong>$L$:</strong> Historical context window ($L = 7$ days)</li>
            <li><strong>$H$:</strong> Future forecast horizon ($H = 30$ days)</li>
            <li><strong>$Z$:</strong> Encoder latent token $\in \mathbb{R}^{N \times d}$ ($d = 128$)</li>
            <li><strong>$Z_c$:</strong> Bottleneck token $\in \mathbb{R}^{N \times q}$ ($q = 16$)</li>
            <li><strong>$Z_r$:</strong> Refined expanded token $\in \mathbb{R}^{N \times d}$</li>
            <li><strong>$Z^*$:</strong> Residually fused latent representation ($Z + \alpha Z_r$)</li>
            <li><strong>$\alpha$:</strong> Learnable residual gating parameter ($\alpha = 0.1$)</li>
            <li><strong>$\mathcal{L}_{\text{task}}$:</strong> Priority-weighted task allocation loss</li>
            <li><strong>$\mathcal{L}_{\text{maint}}$:</strong> Scheduled maintenance downtime penalty</li>
            <li><strong>$\mathcal{L}_{\text{transit}}$:</strong> Inter-site transit mobilization penalty</li>
            <li><strong>$\mathcal{L}_{\text{regime}}$:</strong> Cross-regime MMD distribution loss</li>
            <li><strong>$\mathcal{L}_{\text{total}}$:</strong> Unified multi-task objective function</li>
            <li><strong>$\omega_{i, j}$:</strong> Site-priority criticality weighting factor</li>
        </ul>
    </div>
</div>
"""

def assemble_and_build():
    print("Building full report package...")
    sections = [
        get_front_matter(),
        get_toc_and_lists(),
        get_chapter_1(),
        get_chapter_2(),
        get_chapter_3(),
        get_chapter_4(),
        get_chapter_5(),
        get_chapter_6(),
        get_chapter_7(),
        get_references(),
        get_appendices()
    ]
    
    full_md = "\n".join(sections)
    
    # Write Workspace Markdown
    md_workspace_path = os.path.join(WORKSPACE_DIR, "PROJECT_REPORT_VARUN_KUMAR_S.md")
    with open(md_workspace_path, "w", encoding="utf-8") as f:
        f.write(full_md)
    print(f"-> Workspace Markdown written: {md_workspace_path} ({len(full_md)} bytes)")

    # Write Artifact Markdown
    md_artifact_path = os.path.join(ARTIFACT_DIR, "project_report.md")
    with open(md_artifact_path, "w", encoding="utf-8") as f:
        f.write(full_md)
    print(f"-> Artifact Markdown written: {md_artifact_path}")

    # Build HTML Version
    html_body = markdown.markdown(full_md, extensions=['tables', 'fenced_code'])
    
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B.Tech Project Report - Varun Kumar S (ENG23RA0022)</title>
    <!-- KaTeX CSS & JS for Math Rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
        onload="renderMathInElement(document.body, {{
            delimiters: [
                {{left: '$$', right: '$$', display: true}},
                {{left: '$', right: '$', display: false}}
            ]
        }});"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @page {{
            size: A4;
            margin: 25mm 20mm 25mm 25mm;
            @bottom-right {{
                content: counter(page);
            }}
        }}

        body {{
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 11.5pt;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
        }}

        .report-container {{
            max-width: 920px;
            margin: 30px auto;
            background: #ffffff;
            padding: 60px 75px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border-radius: 6px;
        }}

        @media print {{
            body {{
                background-color: #ffffff;
            }}
            .report-container {{
                max-width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }}
            .no-print {{
                display: none !important;
            }}
            .page-break {{
                page-break-after: always;
                break-after: page;
            }}
        }}

        h1, h2, h3, h4, h5, h6 {{
            font-family: 'Inter', -apple-system, sans-serif;
            color: #0f172a;
            font-weight: 700;
            margin-top: 1.6em;
            margin-bottom: 0.6em;
            line-height: 1.25;
        }}

        h1 {{
            font-size: 21pt;
            border-bottom: 2.5px solid #0284c7;
            padding-bottom: 8px;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        h2 {{
            font-size: 15.5pt;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 5px;
            color: #0369a1;
        }}

        h3 {{
            font-size: 13pt;
            color: #0f172a;
        }}

        h4 {{
            font-size: 11.5pt;
            color: #334155;
        }}

        p {{
            margin-top: 0;
            margin-bottom: 1.1em;
            text-align: justify;
            text-justify: inter-word;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 22px 0;
            font-size: 9.8pt;
            font-family: 'Inter', sans-serif;
        }}

        th, td {{
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
        }}

        th {{
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 600;
        }}

        tr:nth-child(even) {{
            background-color: #f8fafc;
        }}

        img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 24px auto;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }}

        pre, code {{
            font-family: 'JetBrains Mono', Consolas, monospace;
        }}

        pre {{
            background: #0f172a;
            color: #f8fafc;
            padding: 14px 18px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 8.5pt;
            line-height: 1.45;
            border: 1px solid #334155;
            margin: 20px 0;
        }}

        code {{
            background: #f1f5f9;
            color: #0369a1;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9.5pt;
        }}

        pre code {{
            background: transparent;
            color: inherit;
            padding: 0;
        }}

        blockquote {{
            border-left: 4px solid #0284c7;
            margin: 20px 0;
            padding: 12px 20px;
            background: #f0f9ff;
            color: #0369a1;
            font-style: italic;
            border-radius: 0 6px 6px 0;
        }}

        .print-btn {{
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #0284c7;
            color: #ffffff;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
        }}

        .print-btn:hover {{
            background: #0369a1;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
        }}

        .banner {{
            background: #e0f2fe;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 12px 18px;
            margin-bottom: 25px;
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            color: #0369a1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
    </style>
</head>
<body>

    <button class="print-btn no-print" onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Save / Print as PDF
    </button>

    <div class="report-container">
        <div class="banner no-print">
            <div>
                <strong>Dayananda Sagar University</strong> &bull; School of Engineering &bull; Department of Robotics and AI
            </div>
            <div>
                Candidate: <strong>Varun Kumar S (ENG23RA0022)</strong>
            </div>
        </div>

        <div id="content">
            {html_body}
        </div>
    </div>
</body>
</html>
"""

    html_workspace_path = os.path.join(WORKSPACE_DIR, "PROJECT_REPORT_VARUN_KUMAR_S.html")
    with open(html_workspace_path, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"-> Printable HTML Report written: {html_workspace_path} ({len(html_template)} bytes)")
    print("FINISHED SUCCESSFULLY!")

if __name__ == "__main__":
    assemble_and_build()
