---
title: "LLMs reason directly on raw scientific data, approaching domain expert models"
date: 2026-11-26
description: "Across 54 raw-record benchmarks and seven frontier models with zero tools and zero fine-tuning, general language models already beat entry specialists on 38 of 49 tasks and match or beat the median specialist on 37 of 47."
author: "Kejun Albert Ying"
tags: ["science", "AI"]
thumbnail: "blog/general-models-raw-scientific-data/cover.png"
showdate: true
draft: false
---

Last week, Xinming Tu and Leo Tianlai Chen [showed](https://xinmingtu.cn/blog/2026/claude-opus-5-5-protein-sequences/) that a frontier language model, handed half a protein sequence with no tools and no fine-tuning, could predict the next amino acid. That same week I wrote about [the future of science without human understanding](/blog/science-without-human-understanding/): scientific concepts and theories are lossy compressions of raw measurements, and capable models will eventually reason directly over raw records rather than human summaries. Tu and Chen's result set off an immediate debate in computational biology: are general language models about to replace protein language models?

I wanted to know whether proteins were a special case, or whether frontier language models can already reason directly on raw data across the rest of science. Over the past week I built [RawSci-Bench](https://lab.kejunying.com/rawsci-bench/) to test that ability across **six scientific domains and 20 measurement modalities** (biological sequences, molecules and materials, single-cell omics, brain imaging and physiological signals, clinical records, and earth and astronomical systems): **54 raw-record benchmarks plus two post-cutoff controls**, evaluated across seven frontier language models with **zero tools, zero code execution and zero fine-tuning**.

**I was shocked by what came back.** Proteins are not special at all. Across **24,020 scored answers**, general language models are already approaching domain specialists directly on raw scientific data:

- **38 of 49 benchmarks (78%):** a zero-shot frontier LLM outright beats the entry-level published domain specialist.
- **37 of 47 benchmarks (79%):** a zero-shot LLM matches or beats the median published domain specialist within 95% confidence intervals (**25 of 49** match or beat SOTA; **14** win outright on point estimate).
- **58% to 80% of the SOTA gap already closed:** median standing against the strongest published domain specialist across 54 raw-record benchmarks, with **zero task-specific training**.
- **95 of 143 record-removal tests drop significantly (0 improve):** removing the raw record collapses performance, backed by two post-cutoff proofs (2026 NEON ecological forecasts and July to November 2026 PDB protein contacts) and RDKit SMILES randomization.
- **The boundary is perceptual, not scientific:** zero-shot LLMs beat **34 of 36 entry specialists (94%)** on sparse or symbolic records (sequences, SMILES, NMR, MS/MS, single-cell RNA, brain fMRI connectomes), versus **4 of 13 (31%)** on dense waveforms and pixel grids. Yet on **512 by 512 clinical brain tumor MRI**, all four vision models still hit **90.0% to 92.5% accuracy** zero-shot.

You can inspect every benchmark, model, confidence interval and negative control on the [RawSci-Bench explorer](https://lab.kejunying.com/rawsci-bench/), or check the harness, benchmark cards and full score tables on [GitHub](https://github.com/albert-ying/RawSci-Bench).

![RawSci-Bench interactive specimen showcase comparing seven frontier language models against published entry, median and SOTA specialists across 54 raw-record scientific benchmarks](/blog/general-models-raw-scientific-data/cover.png)

## 1. Fifty-four raw scientific benchmarks without tools

Every benchmark in the suite passed two filters. **First, the input must be raw scientific data, never textbook prose or multiple-choice trivia** (protein, RNA or DNA sequences, SMILES strings, NMR peak lists, tandem MS/MS spectra, ranked single-cell expression, resting-state brain fMRI connectomes, multi-lead ECG or EEG waveforms, clinical ICU tables, or raw clinical MRI, pathology, dermatology, astronomical and satellite images). Ten legacy tasks that leaked metadata headers, wrapped multiple-choice questions or leaned on English summaries were removed. **Second, every comparator must be a published domain-trained specialist on the official test split**, excluding fine-tuned LLMs, zero-shot VLMs and near-chance baselines.

The 54 main benchmarks cover six domains: biological sequences (15 tasks), molecules and materials (15), cells and omics (4), physiological signals and images (12, including seven brain and neuroscience benchmarks), health records and society (2), and earth and physical systems (6). Each task samples 40 units from the official public test split (20 on Stargazer, 32 on MoleculeACE activity cliffs), strips dataset names and sample identifiers, and scores answers using the benchmark's own evaluation code. Every task is paired against a trivial baseline, the published specialist and an identical prompt with the raw record removed.

**All seven frontier models finished 100% of their eligible benchmarks:** Claude Fable 5.2, Claude Opus 5.5, GPT-6.2 Sol and GPT-6.2 Astra completed all 54 main benchmarks plus both post-cutoff controls (56 of 56), while Gemini 4 Neon, Gemini 4 Hydrogen and Gemini 3.8 Flash completed all 45 non-image text benchmarks plus both post-cutoff controls (47 of 47, excluding nine vision tasks unsupported by the text-only CLI).

Normalize each metric from trivial baseline (0) to metric ceiling (1) for skill, and from baseline (0) to the strongest published specialist (1) for specialist position. **On the 45 shared text benchmarks, Claude Fable 5.2 and Gemini 4 Neon lead the field:** Claude Fable 5.2 reaches **0.526 median skill and 0.744 median specialist position** (37 of 44 above baseline, 11 SOTA point wins), while Gemini 4 Neon reaches **0.500 median skill and 0.799 median specialist position** (0.805 on domain-trained specialists, 33 of 44 above baseline, 8 SOTA point wins). Claude Opus 5.5 follows at 0.442 median skill (0.645 vs specialist), ahead of Gemini 4 Hydrogen (0.414 / 0.652), GPT-6.2 Astra (0.370 / 0.600), GPT-6.2 Sol (0.351 / 0.575) and Gemini 3.8 Flash (0.333 / 0.486).

Across all 54 tasks including the nine image benchmarks, **Claude Fable 5.2 reaches 0.522 median skill (0.709 vs specialist, 42 of 51 above baseline)**, Claude Opus 5.5 reaches 0.441 (0.631, 36 of 51), GPT-6.2 Astra reaches 0.405 (0.587, 35 of 51) and GPT-6.2 Sol reaches 0.400 (0.581, 35 of 51). **Removing the raw record unit by unit significantly lowers accuracy on 95 of 143 paired comparisons** across Claude Opus 5.5 (35 of 51), GPT-6.2 Sol (29 of 48) and Gemini 4 Neon (31 of 44), while raising accuracy on zero.

## 2. Outperforming entry and median published specialists

Comparing a zero-shot LLM solely against the single winning leaderboard entry hides how science actually operates. **Most labs do not deploy last month's winning ensemble; they train a standard published domain model** such as a GCN, CNN, ResNet, LSTM, ESM-1v, DeepNovo or classical RNA folder. To locate general LLMs inside published leaderboards, I compiled verified entry-level (weakest published domain model, excluding dummy floors) and median published domain specialists on the same official split and metric across 49 of the 54 benchmarks.

**Taking the best of the seven frontier models on each task, zero-shot LLMs outright beat the entry published specialist on 38 of 49 benchmarks (78%, and 40 of 49 within 95% CI).** Against the median published specialist across 47 tasks, they outright beat the point estimate on **21 of 47 (45%)** and match or beat it within 95% CI on **37 of 47 (79%)**. Even one model at a time, **Claude Fable 5.2 alone beats the entry specialist on 34 of 49 benchmarks (69%, median 1.10x of entry and 0.88x of median)**, and **Gemini 4 Neon beats entry on 26 of 41 text benchmarks (63%, median 1.12x of entry and 0.94x of median)**. The lighter Gemini 3.8 Flash sits right at 1.00x of the entry published specialist across 41 text tasks.

![Task explorer heatmap comparing all seven frontier language models side by side against published median and SOTA specialists](/blog/general-models-raw-scientific-data/heatmap.png)

Here is what that looks like on concrete scientific benchmarks:

- **Protein clinical variants (ProteinGym, 1,990 human genes, same-unit comparison vs PoET 200M with zero MSA):** PoET 200M scores 0.899 AUROC on the 40-unit sample (0.920 full split). **All seven frontier models are statistically indistinguishable from PoET 200M**, led by Claude Fable 5.2 at **0.938** and Gemini 4 Neon at 0.889.
- **NMR structure elucidation (NMRArena, paired 1H and 13C peak lists):** **Claude Fable 5.2 hits 85.0% top-1 exact structure accuracy** and Gemini 4 Neon hits 75.0%, both well ahead of NMRPeak at 50.0% on the exact same 40 molecules (54.3% full split).
- **Clinical brain tumor MRI (Cheng 512 by 512 T1-CE MRI, patient-disjoint Fold 1):** **All four vision models classify meningioma, glioma and pituitary tumor at 90.0% to 92.5% accuracy** (Claude Opus 5.5 and GPT-6.2 Astra at **92.5%**, Claude Fable 5.2 and GPT-6.2 Sol at 90.0%, versus 45.0% with the image removed), beating both the Cheng intensity-histogram SVM entry specialist (87.5%) and BoW-SVM median specialist (91.3%), with 95% CIs reaching Deepak and Ameer's transfer-learned GoogLeNet SOTA (97.1%).
- **Brain fMRI connectomes (ABIDE I resting-state fMRI, 116 AAL regions):** From functional connectivity alone (zero age, sex or clinical metadata), **Gemini 3.8 Flash reaches 0.716 AUROC**, ahead of Graphormer (0.635), BrainGB (0.697) and BrainGNN (0.713) on the NeurIPS 2022 BrainNetTF leaderboard, while Claude Opus 5.5 (0.618), Claude Fable 5.2 (0.599) and Gemini 4 Neon (0.595) sit just below entry level.
- **Small-molecule ADMET (TDC):** On Lipophilicity logD, **Claude Fable 5.2 (0.385 MAE) and Claude Opus 5.5 (0.448) both beat rank-1 specialist MiniMol (0.456)**, and all seven models beat DeepPurpose CNN (0.743). On Ames mutagenicity, **Gemini 4 Neon reaches 0.888 AUROC against ZairaChem (0.871)**. On cardiac hERG block, all seven models (0.848 to 0.876) beat both Chemprop (0.721) and AttrMasking (0.778), matching MapLight+GNN (0.880).
- **RNA secondary structure (ArchiveII):** **Gemini 4 Neon (0.679 F1) and Claude Fable 5.2 (0.631) outperform Vienna RNAfold (0.577), RNAStructure (0.573), EternaFold (0.599) and CONTRAfold (0.617).**
- **Proteomics, chemistry and epidemiology:** On Nine-Species yeast de novo peptide sequencing from raw MS/MS peak lists, **Gemini 4 Neon decodes 65.0% of peptides exactly** (ahead of DeepNovo 37.0%, PointNovo 46.0% and Casanovo 53.0%, statistically tied with PrimeNovo 70.0%). On USPTO-MIT forward synthesis, **GPT-6.2 Astra and Gemini 4 Hydrogen hit 40 of 40 (1.000)** against Chemformer (0.928). On RXNMapper-v2 atom mapping, three models hit 97.5% against 89.1%. On CDC FluSight weekly influenza forecasts, all seven models beat the median competing team (0.760 relative WIS), and **Claude Fable 5.2 (0.526) matches the winning ensemble Google_SAI-FluEns (0.555 on the same 40 units)**.

**Only 9 of the 49 benchmarks stay below the entry published specialist**, and every single one is a dense medical image, multi-channel or intracranial EEG, 12-lead ECG, galaxy image or raw DNA promoter classification task.

![Task inspector for NMRArena showing native-unit 95% confidence intervals against entry, median and SOTA published specialists](/blog/general-models-raw-scientific-data/inspector.png)

## 3. Intrinsic data reasoning versus pretraining literature

As soon as a general LLM beats a domain specialist, the right question follows: **is the model reasoning over the raw data itself, or recognizing familiar genes, drugs and textbook patterns from pretraining corpora?**

Answering that cleanly requires two separate axes: **knowledge source** (how much literature or entity knowledge could help) and **input channel** (whether the raw signal enters as discrete tokens or as dense waveforms and pixel grids).

### Axis 1: Knowledge source across all 54 benchmarks

| Knowledge regime | Tasks | Best vs SOTA (median) | Beat entry | Beat median (95% CI) | Beat SOTA pt (95% CI) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Zero-entity / de novo signal (all)** | 24 (+2 post-cutoff) | 0.701 | 10 / 20 (50%) | 6 / 19 (10 / 19) | 1 / 24 (7 / 24) |
| *Sparse / token-native zero-entity subset* | 9 (+2 post-cutoff) | 0.733 | 6 / 7 (86%) | 4 / 6 (5 / 6) | 1 / 9 (5 / 9) |
| *Dense waveform and raw image zero-entity subset* | 15 | 0.689 | 4 / 13 (31%) | 2 / 13 (5 / 13) | 0 / 15 (2 / 15) |
| **2. Domain rules and structural priors** | 18 | 0.888 | 17 / 17 (100%) | 9 / 17 (16 / 17) | 6 / 18 (8 / 18) |
| **3. Entity- and literature-coupled records** | 12 | 1.035 | 11 / 12 (92%) | 6 / 11 (11 / 11) | 7 / 12 (10 / 12) |

### Axis 2: Input channel across all 54 benchmarks

| Input channel | Tasks | Best vs SOTA (median) | Beat entry | Beat median (95% CI) | Beat SOTA pt (95% CI) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Sparse, discrete or symbolic tokens** | 39 | 0.839 | 34 / 36 (94%) | 19 / 34 (32 / 34) | 14 / 39 (23 / 39) |
| **Dense continuous waveforms and raw images** | 15 | 0.689 | 4 / 13 (31%) | 2 / 13 (5 / 13) | 0 / 15 (2 / 15) |

Separating those two axes makes both effects unmistakable.

**First, pretraining literature raises the ceiling (0.701 to 0.888 to 1.035 median standing vs SOTA).** Entity and biomedical literature knowledge clearly helps on **Group 3** (12 tasks: 3 named-gene `scGPT` benchmarks, named-variable `PhysioNet 2012` ICU records, and 8 well-studied protein tasks including `CARE`, `ProteinShake`, `CAFA3`, `Bernett PPI`, `ProteinGym`, `PEER GFP` and `FLIP Meltome`), accounting for 7 of the 14 SOTA point wins. On **Group 2** (18 tasks: `NMRArena` spectroscopy, organic reactions, 5 SMILES tasks, 3 crystal CIF tasks, classical `ArchiveII` ncRNA, `CB513` secondary structure, `Tsuboyama` mini-protein unfolding, `ABIDE` brain fMRI connectomes, plus `FluSight` and `German COVID` which carry calendar dates and locations), models apply physical, chemical, neuroanatomical or epidemiological rules directly to the record, **beating 17 of 17 entry specialists and matching or beating 16 of 17 median specialists**. Here `USPTO-MIT` is tested invariant under full RDKit SMILES randomization, whereas overlap with public PubChem compounds, Rfam families or historical seasons has not yet been randomized out on TDC, crystals, ArchiveII or surveillance forecasting.

**Second, intrinsic signal reading holds even on zero-entity tasks whenever tokenization preserves the signal.** Across all 24 zero-entity tasks combined, the rate looks modest (10 of 20 entry, 6 of 19 median) only because 15 of those 24 tasks are dense waveforms and raw images. Look at the **9 sparse zero-entity tasks** (anonymous `M1` annual series, `Nine-Species` yeast MS/MS b/y-ion ladders, `MassSpecGym`, `Stargazer`, synthetic `EternaBench` RNA, unlabeled DNA in `DeepSTARR`, `Mouse enhancers` and `GUE`, plus `Tu and Chen` unstudied microbial proteins where Claude draws on raw sequence pretraining rather than papers): **frontier models still beat 6 of 7 entry specialists (86%), match or beat 5 of 6 median specialists (83%), and match or beat 5 of 9 SOTA specialists within 95% CI**, backed up by both post-cutoff controls.

**Third, Axis 2 isolates where frontier models fail: every single SOTA point win (14 of 14) and 34 of 36 entry wins (94%) occur on sparse, discrete or symbolic inputs.** On the 15 dense waveform and raw image tasks, SOTA point wins drop to **0 of 15** and entry wins drop to **4 of 13 (31%)**. Literature raises the ceiling on named biology, **but the wall separating wins from losses is perceptual encoding.**

## 4. Two post-cutoff proofs and five channel ablations

Any strong score on public benchmarks invites an obvious objection: memorization. Stripping dataset names does not guarantee a model never saw a sequence or reaction during pretraining. **Two post-cutoff controls and five paired channel ablations test memorization directly.**

**First, on post-cutoff NEON water-temperature forecasts (40 windows across 27 sites measured strictly after every model's training cutoff), every frontier model beats all three statistical baselines cleanly:** Gemini 4 Neon scores **1.013 CRPS**, Claude Opus 5.5 **1.242** and GPT-6.2 Sol **1.269**, against persistence (2.209), a 7-day empirical ensemble (2.012) and a 30-day linear drift model (2.225). Post-cutoff skill matches earlier 2024 to 2026 windows within 0.03 points.

**Second, on 40 single-chain proteins deposited in the Protein Data Bank between July and November 2026, all three models predict sparse, high-precision long-range C-beta contacts** (sequence separation at least 24 residues, 11,017 contacts, base rate 1.56%, sequence-blind rule 2.9%): **Claude Opus 5.5 reaches 39.2% precision** (217 of 554 pairs correct), **Gemini 4 Neon reaches 31.3%** (975 of 3,111, F1 0.1405, top-L/5 precision 31.4%) and **GPT-6.2 Sol reaches 25.5%** (117 of 458). Shuffling each chain internally while preserving length and composition collapses all three to chance (1.84%, 2.73% and 1.89%). Stratifying against every pre-July 2026 PDB structure at 80% sequence identity reveals 27 novel chains and 13 close homologs, and **every model scores slightly higher on the 27 novel chains** (Gemini 0.153 vs 0.115 F1, Claude 0.049 vs 0.030, GPT 0.041 vs 0.028).

Five paired channel ablations on identical 40-unit samples separate signal reading from shortcuts:

1. **Randomized SMILES (USPTO-MIT):** Randomizing every reactant and reagent atom traversal (`doRandom=True`) and shuffling component order across all 40 reactions rewrites 40 of 40 strings while preserving 40 of 40 molecular graphs. **Accuracy barely moved:** Claude Opus 5.5 scored **0.950 vs 0.975** canonical, Gemini 4 Neon **0.950 vs 0.975** and GPT-6.2 Sol **0.925 vs 0.950**. All three still match or beat Chemformer (0.928) on non-canonical strings, confirming graph-invariant chemistry rather than string lookup.
2. **Marker masking (scGPT hPancreas):** Masking all four textbook hormone markers (GCG, INS, PPY and SST) still leaves **Claude Opus 5.5 at 0.850, GPT-6.2 Sol at 0.875 and Gemini 4 Neon at 0.925** across 14 cell types, confirming multi-gene signature reading.
3. **Image removal (Micro-Bench diagnostic control):** Text choices alone beat chance (0.643 and 0.403 vs 0.208), yet **adding the raw microscopy image drives a +24.7 to +45.5 point jump** (to 0.890 and 0.857).
4. **Coordinate removal (ProteinShake negative control):** Stripping every 3D backbone coordinate and leaving only residue identities **changes nothing** (Claude 0.900 vs 0.900, GPT 0.800 vs 0.825, Gemini 0.875 vs 0.900). The models ignored 3D geometry and read the sequence.
5. **CpG removal (legacy methylation age, dropped from v2):** Removing all 200 CpG sites while keeping the brief donor demographic header left Claude and GPT statistically unchanged, while only Gemini 4 Neon extracted significant signal from the CpG values (+0.123). On CARE enzyme classification, Claude and Gemini also name the exact UniProt accession for 7 of 40 proteins from sequence alone.

**Negative controls are half the story.** A benchmark that cannot tell raw signal reading apart from identifier recall or header shortcuts cannot tell us what a model learned.

## 5. The dense-signal wall points straight to the adapter

**Whenever a domain specialist recovers at least 70% skill above baseline, the specialist stays ahead on 30 of 36 tasks**, and almost every wide gap shares one root cause: dense continuous waveforms, low-resolution pixel grids or residue-aligned coordinate fields that plain text or generic vision patches break apart.

**On physiological and neural waveforms, frontier models read partial signal yet trail specialists sharply:** 12-lead ECG (PTB-XL) reaches 0.865 macro AUROC for Gemini 4 Neon and 0.840 for GPT-6.2 Sol against 0.943 for RA-ASFL; **5-class intracranial and scalp epilepsy EEG (Bonn, 178 raw microvolt samples per second) lifts every frontier model far above 20% chance** (GPT-6.2 Astra **62.5%**, Gemini 4 Neon **60.0%**, Claude Opus 5.5 and Fable 5.2 **55.0%**, versus 15.0% to 25.0% with the waveform removed) while trailing 1D-CNN specialists at 89.0% to 94.0%; 22-channel motor-imagery EEG (BCI-IV-2a) stalls at 0.440 against 0.964 for DMB-EDN; Sleep-EDF20 EEG stays at 0.625 against 0.897 for LGFNet; smartphone IMU activity (UCI-HAR) hits 0.700 against 0.980 for Light-PTNet. On per-residue protein secondary structure (CB513 Q3), Opus 5.5 (0.242), GPT-6.2 Sol (0.282) and Gemini 4 Neon (0.400) fall below the 0.457 majority floor, while **Claude Fable 5.2 jumps to 0.706** against 0.885 for Ankh Large, still short of a native per-token head.

**Medical and scientific imaging splits cleanly by resolution.** On **512 by 512 clinical brain tumor MRI (Cheng T1-CE)**, all four vision models hit **90.0% to 92.5% accuracy zero-shot**, beating both entry and median specialists. On **28 by 28 medical scans and specialized microscopy or remote-sensing benchmarks**, the adapter ceiling returns immediately: PneumoniaMNIST chest X-rays (0.807 GPT-6.2 Sol vs 0.989 sample ResNet-50), BloodMNIST microscopy (0.450 Claude Opus 5.5 vs 1.000), OrganAMNIST abdominal CT (0.375 vs 0.925), PathMNIST (0.840 vs 0.993), ISIC 2018 dermoscopy (0.724 vs 0.895), Galaxy10 morphology (0.650 vs 0.897) and EuroSAT satellite land use (0.550 vs 0.970). Dense physical arrays show the same ceiling: Stargazer stellar spectra (5% to 20% pass vs 95% classical solver), Matbench Discovery crystal stability (0.250 to 0.364 F1 vs 0.941 DPA-4.1), JARVIS-DFT formation energy (0.155 to 0.210 eV/atom vs 0.027 kgcnn_coGN) and MoleculeACE activity cliffs (1.275 to 1.392 RMSE vs 0.671 SemiMol).

**Meanwhile, the general reasoning backbone is climbing fast.** Across 13 shared tasks completed across five Claude Opus generations (4.5 through 5.5), **median skill jumped from 0.093 to 0.492**, and **Claude Fable 5.2 pushes the full 54-task median to 0.522** while running faster per call (7.0 seconds median latency vs 8.4 seconds for Opus 5.5). Across 14 shared tasks, GPT Sol climbed from 0.217 (5.6) to 0.417 (6.2). Test-time compute pays off heavily: Gemini 4 Neon spends a median of 5,297.0 output tokens (58.7 seconds per call) compared with 452.0 tokens for Claude Fable 5.2 and 198.5 for GPT-6.2 Sol, driving its results on NMR structure elucidation, Nine-Species peptide MS/MS, epilepsy EEG and post-cutoff protein contacts.

## 6. Every domain specialist with the right adapter

People are asking whether general language models will absorb protein language models only because amino-acid strings already look like text, so the overlap showed up there first.

**What [RawSci-Bench](https://lab.kejunying.com/rawsci-bench/) shows is that protein sequences were simply the first scientific modality whose native representation passed intact through a text tokenizer.** Whenever a raw record reaches a general backbone without being shredded, whether as human missense variants, randomized SMILES reactions, lipophilicity and toxicity graphs, tandem MS/MS peak lists, ranked single-cell transcriptomes, NMR peak tables, high-resolution clinical brain MRI or ecological time series, **frontier language models already beat entry published specialists on 78% of benchmarks and match or beat median specialists on 79%**. Where they still trail is almost always an input bottleneck: multi-lead waveforms, 3D coordinates, low-resolution scans and dense spectra.

**We probably do not need fifty isolated foundation models relearning physics, chemistry and biology from scratch.** If an unmodified language backbone already closes **58% to 80% of the gap to SOTA specialists across 54 raw-record benchmarks**, placing lightweight modality-native encoders for waveforms, spectra, 3D structures and scientific images in front of a general backbone puts almost every standalone domain model on the same convergence curve. **The question for AI in science is no longer whether general models will replace protein language models. It is which standalone domain models will still survive once the right adapters arrive.**

*Explore the interactive leaderboard, 49-benchmark specialist range plot, 54-task heatmap, native-unit task inspector, record-removal matrix, five channel ablations and post-cutoff controls on [RawSci-Bench](https://lab.kejunying.com/rawsci-bench/), or inspect the harness, benchmark cards, native scorers and full result tables on [GitHub](https://github.com/albert-ying/RawSci-Bench).*
