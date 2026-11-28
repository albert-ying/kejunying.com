---
title: "LLMs reason directly on raw scientific data, matching domain expert models"
date: 2026-11-26
description: "On 54 raw-record benchmarks, seven frontier language models with no tools and no fine-tuning were placed among 1,667 published specialist scores. The best model ranks in the upper half of the specialists on 20 of 48 benchmarks and above all of them on 14."
author: "Kejun Albert Ying"
tags: ["science", "AI"]
thumbnail: "blog/general-models-raw-scientific-data/cover.png"
showdate: true
draft: false
---

*Updated 28 November 2026. The paper is out as a PDF, and the numbers below now match it. Each model is compared with every published specialist score we verified at its source, where the first version used three picked per benchmark.*

Last week, Xinming Tu and Leo Tianlai Chen [showed](https://xinmingtu.cn/blog/2026/claude-opus-5-5-protein-sequences/) that a frontier language model could predict the next amino acid when handed half a protein sequence, with no tools and no fine-tuning. That same week I wrote about [the future of science without human understanding](/blog/science-without-human-understanding/). My argument was that scientific concepts and theories are lossy compressions of raw measurements, and that capable models will eventually reason over the raw records themselves instead of human summaries. Tu and Chen's result started an immediate debate in computational biology: are general language models about to replace protein language models?

I wanted to know whether proteins were a special case, or whether frontier language models can already reason on raw data across the rest of science. Over the past week we built [RawSci-Bench](https://albert-ying.github.io/RawSci-Bench/) to test this. It spans **six scientific domains and 18 record types**: biological sequences, molecules and materials, single-cell omics, physiological signals and images, clinical records, and earth and astronomical systems. That makes **54 raw-record benchmarks plus two post-cutoff controls**, run on seven frontier language models with **no tools, no code execution and no fine-tuning**.

The paper is here: [**A benchmark of general language models on raw scientific records** (PDF)](https://albert-ying.github.io/RawSci-Bench/RawSci-Bench_paper.pdf).

**I was shocked by what came back.** Proteins are not special. Across **24,020 scored answers**, general language models already reach the range of the domain specialists on most benchmarks whose records are sequences, chemical strings, peak lists or tables:

- **Ranked among 1,667 published specialist scores** on the 48 benchmarks with a comparable published list, the best of the seven models ranks **in the upper half of the specialists on 20 of 48**. It equals or beats **every published specialist on 14**, and at least one specialist on 34.
- **One model alone gets most of the way.** Claude Fable 5.2 ranks in the upper half on 19 of 48 benchmarks and above every specialist on 12. Gemini 4 Neon does so on 14 and 10 of the 41 text benchmarks it could take.
- **Remove the record and the score falls.** Removing the raw record lowers the score on **95 of 143 paired comparisons** and raises it on none. Two tests on data recorded after every model's training cutoff back this up: 2026 NEON ecological forecasts, and protein contacts from PDB chains deposited July to November 2026. RDKit SMILES randomization does too.
- **The boundary is perceptual, not scientific.** On sparse or symbolic records (sequences, SMILES, NMR and MS/MS peak lists, ranked single-cell expression, tables), the best model ranks in the upper half on **20 of 36** benchmarks. On dense waveforms and pixel grids it does so on **0 of 12**. Yet on **512 by 512 clinical brain tumour MRI**, four vision models still classify **90.0% to 92.5%** of scans correctly zero-shot.

You can inspect every benchmark, model, interval and negative control on the [RawSci-Bench explorer](https://albert-ying.github.io/RawSci-Bench/), and check the harness, benchmark cards and score tables on [GitHub](https://github.com/albert-ying/RawSci-Bench).

![One NMR test unit from the RawSci-Bench explorer: the paired peak lists, the question, and the scores of the published NMR models and the three best language models](/blog/general-models-raw-scientific-data/site-nmr-example.png)

*One test unit from the [explorer](https://albert-ying.github.io/RawSci-Bench/). The paired ¹H and ¹³C peak lists of one molecule go to each model in a single call, and the answers are scored against the four published NMR models.*

## 1. Fifty-four raw scientific benchmarks without tools

Every benchmark in the suite passed two filters. **First, the input must be raw scientific data, never textbook prose or multiple-choice trivia.** That covers protein, RNA and DNA sequences, SMILES strings, NMR peak lists, tandem MS/MS spectra, ranked single-cell expression, resting-state brain fMRI connectomes, multi-lead ECG and EEG waveforms, clinical ICU tables, and raw clinical MRI, pathology, dermatology, astronomical and satellite images. We removed ten earlier tasks that leaked metadata headers, wrapped multiple-choice questions or leaned on English summaries. **Second, the benchmark must have published specialist models scored on its official test split with its own metric.** For each benchmark we collected every published specialist score we could verify at its source, which came to 1,667 scores, from 1 to 427 per benchmark. On six benchmarks the published specialists were evaluated under another protocol: influenza forecasting, brain tumour MRI, autism from fMRI, epilepsy EEG, yeast peptide sequencing and land cover. These six keep their model scores but are not ranked against specialists, which leaves 48.

The 54 benchmarks cover six domains: biological sequences (15 tasks), molecules and materials (15), cells and omics (4), physiological signals and images (12, seven of them brain and neuroscience benchmarks), health records and society (2), and earth and physical systems (6). Each task samples 40 units from the official public test split (20 on Stargazer, 32 on MoleculeACE activity cliffs). It strips dataset names and sample identifiers, and scores answers with the benchmark's own evaluation code. Each task also has a trivial baseline, the full list of published specialists where a comparable one exists, and the same prompt with the raw record removed.

**All seven frontier models finished every benchmark they could take.** Claude Fable 5.2, Claude Opus 5.5, GPT-6.2 Sol and GPT-6.2 Astra completed all 54 main benchmarks plus both post-cutoff controls. Gemini 4 Neon, Gemini 4 Hydrogen and Gemini 3.8 Flash completed all 45 text benchmarks plus both controls; their text-only client cannot take the nine image tasks.

Skill rescales each metric so that the trivial baseline is 0 and the best possible value is 1. **On the 45 text benchmarks all seven took, Claude Fable 5.2 and Gemini 4 Neon lead.** Claude Fable 5.2 reaches a median skill of **0.526** and Gemini 4 Neon **0.500**. Claude Opus 5.5 follows at 0.442, ahead of Gemini 4 Hydrogen (0.414), GPT-6.2 Astra (0.370), GPT-6.2 Sol (0.351) and Gemini 3.8 Flash (0.333). Across all 54 benchmarks, Claude Fable 5.2 reaches a median skill of **0.522** and its interval clears the baseline on 42 of 51 benchmarks. The other three are Claude Opus 5.5 at 0.441 (36 of 51), GPT-6.2 Astra at 0.405 (35 of 51) and GPT-6.2 Sol at 0.400 (35 of 51). **Removing the raw record lowers the score on 95 of 143 paired comparisons** across Claude Opus 5.5 (35 of 51), GPT-6.2 Sol (29 of 48) and Gemini 4 Neon (31 of 44), and raises it on none.

![Record removal for three models across all benchmarks: black squares mark benchmarks where the score fell without the record](/blog/general-models-raw-scientific-data/site-record-removal.png)

*From the explorer: one square per benchmark and model. Black means the score fell when the record was removed from the prompt; none rose.*

## 2. Ranking among the published specialists

Comparing a zero-shot model only with the winning leaderboard entry hides how science works. **Most labs do not deploy last month's winning ensemble; they train a standard published model** such as a GCN, CNN, ResNet, LSTM, ESM-1v, DeepNovo or a classical RNA folder. So we placed each model's score in the full list of published specialists of its benchmark, on the same split and metric, and counted how many of them it equals or beats.

**Taking the best of the seven models on each benchmark, it equals or beats every published specialist on 14 of 48, at least half of them on 20, and at least one on 34.** On the remaining 14 it beats none. Across all 48 lists it equals or beats **903 of the 1,667 published specialist scores**. One model at a time, **Claude Fable 5.2 alone beats every specialist on 12 benchmarks, at least half on 19 and at least one on 33**. Gemini 4 Neon does so on 10, 14 and 26 of its 41 text benchmarks, and the small Gemini 3.8 Flash still beats at least one specialist on 21 of 41.

![Published specialist range on each of the 48 benchmarks with the best of seven language models, grouped by the share of specialists it equals or beats](/blog/general-models-raw-scientific-data/site-specialist-range.png)

*The 48 benchmarks with a published list, from the explorer. Each grey bar spans the published specialists of one benchmark, weakest to strongest, and the dot is the best of the seven language models. Benchmarks are grouped by the share of specialists that model equals or beats.*

Here is what that looks like on concrete benchmarks:

- **Clinical variant pathogenicity (ProteinGym, from sequence alone):** **Claude Fable 5.2 reaches 0.938 AUROC, above all seven published predictors** (the best, EVE, reports 0.927). On the same 40 units, PoET 200M scores 0.899, and all seven models are statistically indistinguishable from it.
- **NMR structure elucidation (NMRArena, paired ¹H and ¹³C peak lists):** **Claude Fable 5.2 names the exact structure for 85.0% of molecules** and Gemini 4 Neon for 75.0%. NMRPeak, the best published model, gets 50.0% on the same 40 molecules (54.3% on the full split), and both models beat it with paired intervals.
- **Protein function from sequence (CAFA3 molecular function):** **Gemini 4 Neon (F-max 0.650) and Claude Opus 5.5 (0.646) score above all 145 published methods**, whose best, GOLabeler, reports 0.618. On protein melting temperature (FLIP), Claude Fable 5.2 ranks above 340 of 427 published entries.
- **Small-molecule ADMET (TDC):** On lipophilicity, **Claude Fable 5.2 (0.385 MAE) and Claude Opus 5.5 (0.448) beat all 21 published specialists**, the best of which is MiniMol at 0.456. On Ames mutagenicity, **Gemini 4 Neon reaches 0.888 AUROC against ZairaChem's 0.871**, above all 20 published. On cardiac hERG block, all seven models score 0.848 to 0.876. Claude Fable 5.2 is above 19 of 20 published specialists; only MapLight+GNN (0.880) is higher.
- **Reactions:** On USPTO-MIT forward synthesis, **GPT-6.2 Astra and Gemini 4 Hydrogen predict all 40 products correctly**, against 0.906 for the best of five published models. On atom mapping, Claude Fable 5.2, Gemini 4 Neon and GPT-6.2 Sol map 97.5% of reactions, against 89.1% for RXNMapper-v2.
- **RNA secondary structure (ArchiveII):** **Gemini 4 Neon (0.679 F1) and Claude Fable 5.2 (0.631)** rank above 6 of 10 published folding methods. BPfold leads at 0.820.
- **Forecasting:** On the M1 annual series, **Claude Opus 5.5 (MASE 2.37) is more accurate than all 40 published forecasters**, including a fine-tuned TimesFM (3.28).
- **Without a comparable list:** On brain tumour MRI, **all four vision models classify meningioma, glioma and pituitary tumour at 90.0% to 92.5%**, against 45.0% with the image removed. On yeast tandem mass spectra, **Gemini 4 Neon decodes 65.0% of peptides exactly**. Published specialists on both datasets used other splits or protocols, so neither enters the ranking.

![NMR peak lists, the structure proposed by Claude Fable 5.2 and the answer key, with right and wrong answers for each model on 40 molecules](/blog/general-models-raw-scientific-data/panel-nmr-answer.png)

*Figure 3c of the paper. The ¹H and ¹³C peaks of one molecule (left), the structure Claude Fable 5.2 proposed (rust) and the answer key (black); numbers tie each fragment to its peaks. The strip on the right marks every model right (filled) or wrong (open) on the 40 molecules.*

**On 14 of the 48 benchmarks the best model beats no published specialist.** Ten of them are dense waveforms or images: 12-lead ECG, three EEG tasks, smartphone motion sensors, blood cell and histology microscopy, abdominal CT, chest X-ray and satellite land use. The other four are sparse: human core promoters, fly enhancer activity, protein unfolding free energy and stellar radial velocities. Two of those four have only one published specialist.

## 3. Reading the data versus recalling the literature

As soon as a general model beats a domain specialist, the next question follows. **Is the model reasoning over the raw data, or recognizing familiar genes, drugs and textbook patterns from pretraining?**

Answering that needs two separate axes. One is **knowledge source**: how much literature or knowledge of named entities could help. The other is **input channel**: whether the record arrives as discrete tokens or as dense waveforms and pixel grids. The tables count the 48 benchmarks with a published list. The last column is the median share of published specialists that the best model equals or beats.

### Axis 1: Knowledge source

| Knowledge regime | Benchmarks | Every specialist | At least half | At least one | Median share beaten |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Named entities and literature** | 12 | 7 | 8 | 12 | 1.00 |
| **Domain rules and structural priors** | 16 | 5 | 8 | 15 | 0.49 |
| **No named entity (all)** | 20 | 2 | 4 | 7 | 0.00 |
| *No named entity, sparse records* | 8 | 2 | 4 | 5 | 0.32 |
| *No named entity, dense waveforms and images* | 12 | 0 | 0 | 2 | 0.00 |

### Axis 2: Input channel

| Input channel | Benchmarks | Every specialist | At least half | At least one | Median share beaten |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Sparse, discrete or symbolic tokens** | 36 | 14 | 20 | 32 | 0.68 |
| **Dense continuous waveforms and images** | 12 | 0 | 0 | 2 | 0.00 |

![How a SMILES string, an ECG and an image reach a language model, and the share of specialists the best model matches on each benchmark by knowledge source and record class](/blog/general-models-raw-scientific-data/panel-sparse-dense.png)

*Figure 5a,b of the paper. A SMILES string reaches the model as written, an ECG as 12,000 numbers and an image as patches (a). The share of published specialists the best model equals or beats on each benchmark, by knowledge source and record class (b).*

Separating the two axes makes both effects visible.

**First, pretraining literature raises the ceiling.** The median share of specialists beaten climbs from 0 on records with no named entity to 0.49 with domain rules and 1.00 with named entities. On the 12 named-entity benchmarks (three single-cell annotation tasks with gene names, ICU records with named variables, and eight well-studied protein tasks), the best model beats at least one specialist on all 12 and every specialist on 7. On the 16 domain-rule benchmarks (NMR spectroscopy, reactions, SMILES property tasks, crystals, RNA and protein structure, and the COVID-19 nowcast), models apply physical, chemical and epidemiological rules to the record, beating at least one specialist on 15. Reaction prediction holds up under full RDKit SMILES randomization (section 4). Overlap with public compounds, RNA families and past seasons has not yet been randomized out on the property, crystal, RNA and surveillance tasks.

**Second, reading the signal holds on records with no named entity, as long as tokenization preserves it.** Take the 8 sparse benchmarks in this group: anonymous M1 annual series, MassSpecGym spectra, Stargazer radial velocities, synthetic EternaBench RNA, and unlabelled DNA in DeepSTARR, mouse enhancers and core promoters, plus Tu and Chen's little-studied microbial proteins. **The best model beats at least one specialist on 5 of these 8, at least half on 4, and every specialist on 2** (the annual series and MassSpecGym). Both post-cutoff controls back this up.

**Third, the input channel separates success from failure.** All 14 benchmarks where the best model beats every specialist, and 32 of the 34 where it beats at least one, have sparse, discrete or symbolic inputs. On the 12 dense waveform and image benchmarks, it never reaches the upper half. It beats any specialist only on dermoscopy (100 of 340 entries) and galaxy morphology (43 of 100). Literature raises the ceiling on named biology, **but what separates wins from losses is how the signal is encoded.**

## 4. Two post-cutoff tests and five channel ablations

Any strong score on a public benchmark invites an obvious objection: memorization. Stripping dataset names does not guarantee that a model never saw a sequence or reaction during pretraining. **Two post-cutoff tests and five paired channel ablations test memorization directly.**

**First, on NEON water-temperature forecasts measured after every model's training cutoff (40 windows across 27 sites), every model beats all three statistical baselines.** Gemini 4 Neon scores **1.013 CRPS**, Claude Opus 5.5 **1.242** and GPT-6.2 Sol **1.269**. The baselines are persistence (2.209), a 7-day empirical ensemble (2.012) and a 30-day linear drift (2.225). Skill after the cutoff matches skill on earlier windows.

**Second, on 40 single-chain proteins deposited in the Protein Data Bank between July and November 2026, all three models predict sparse, high-precision long-range Cβ contacts.** The test counts contacts with a sequence separation of at least 24 residues: 11,017 contacts, a base rate of 1.56%, and 2.9% for a sequence-blind rule. **Claude Opus 5.5 reaches 39.2% precision** (217 of 554 pairs correct), **Gemini 4 Neon 31.3%** (975 of 3,111; top-L/5 precision 31.4%) and **GPT-6.2 Sol 25.5%** (117 of 458). Shuffling each chain while keeping its length and composition drops all three to chance (1.84%, 2.73% and 1.89%). We compared each chain with every PDB structure from before July 2026 at 80% sequence identity, which gives 27 novel chains and 13 with close homologues. **Every model scores slightly higher on the 27 novel chains.**

![Water-temperature forecasts made after the training cutoffs: three language models against three statistical baselines](/blog/general-models-raw-scientific-data/site-water-temperature.png)

*From the explorer: forecast error on the 40 NEON windows measured after every model's training cutoff.*

Five paired channel ablations on the same 40-unit samples separate signal reading from shortcuts:

1. **Randomized SMILES (USPTO-MIT):** We randomized every reactant and reagent atom traversal (`doRandom=True`) and shuffled component order across all 40 reactions. That rewrites 40 of 40 strings and keeps all 40 molecular graphs. **Accuracy barely moved.** Claude Opus 5.5 scored **0.950** against 0.975 on canonical strings, Gemini 4 Neon **0.950** against 0.975, and GPT-6.2 Sol **0.925** against 0.950. All three stay above every published specialist on non-canonical strings, so they read the molecular graph, not a memorized string.
2. **Marker masking (pancreas cell types):** Masking all four textbook hormone markers (GCG, INS, PPY and SST) still leaves **Claude Opus 5.5 at 0.850, GPT-6.2 Sol at 0.875 and Gemini 4 Neon at 0.925** across 14 cell types. The models read a multi-gene signature.
3. **Image removal (Micro-Bench control):** The answer choices alone beat chance (0.643 and 0.403, against 0.208). **Adding the microscopy image raises accuracy by another 24.7 to 45.5 points** (to 0.890 and 0.857).
4. **Coordinate removal (ProteinShake):** **Stripping every 3D backbone coordinate and keeping only residue identities changes nothing.** Claude Opus 5.5 scores 0.900 with and without coordinates, GPT-6.2 Sol 0.825 and 0.800, and Gemini 4 Neon 0.900 and 0.875. The models ignored the geometry and read the sequence.
5. **CpG removal (methylation age, outside the suite):** We removed all 200 CpG sites and kept only the short donor header. Claude and GPT did not change detectably, and only Gemini 4 Neon extracted signal from the CpG values (+0.123). On CARE enzyme classification, Claude Opus 5.5 and Gemini 4 Neon also name the exact UniProt accession of 7 of 40 proteins from sequence alone.

**Negative controls are half the story.** A benchmark that cannot separate reading the signal from recalling identifiers or exploiting headers cannot tell us what a model learned.

## 5. The dense-signal wall points to the adapter

Where specialists stay ahead, the record is almost always a dense continuous waveform, a low-resolution pixel grid or a numeric field that plain text and generic image patches break apart.

**On physiological and neural waveforms, models read part of the signal but trail the specialists.** On 12-lead ECG (PTB-XL), Gemini 4 Neon reaches 0.865 macro AUROC, below the weakest published specialist (0.896); RA-ASFL leads at 0.943. On epilepsy EEG (Bonn, 178 samples per second, five classes), every model is far above the 20% chance level: GPT-6.2 Astra reaches **62.5%** and Gemini 4 Neon **60.0%**, against 15.0% to 25.0% with the waveform removed. On 22-channel motor-imagery EEG (BCI-IV-2a), the best model reaches 0.440 against 0.964 for DMB-EDN. On sleep staging EEG it reaches 0.625 against 0.844 for AttnSleep, and on smartphone motion sensors (UCI-HAR) 0.800 against 0.980 for Light-PTNet. On per-residue protein secondary structure (CB513), six models fall below the 0.457 majority floor, while **Claude Fable 5.2 reaches 0.706**. That ranks above 3 of 12 published methods, still short of OntoProtein at 0.820.

**Medical and scientific imaging splits by resolution.** On **512 by 512 clinical brain tumour MRI**, all four vision models are **90.0% to 92.5%** accurate. On 28 by 28 medical scans and on specialized microscopy and remote sensing, the gap returns at once. On chest X-ray pneumonia the best model reaches 0.807 AUROC against 0.942 for the weakest published specialist. Blood cell microscopy scores 0.450 against 0.878, abdominal CT 0.375 against 0.762, histology 0.840 against 0.934 and satellite land use 0.775 against 0.941. Dermoscopy (0.724 balanced accuracy, above 100 of 340 challenge entries) and galaxy morphology (0.650, above 43 of 100) are the two image tasks where the best model beats any specialist. Crystal and activity-cliff tasks, though written as text, stay low too. Crystal stability reaches 0.364 F1 against 0.941 for the best of 57 published models, formation energy 0.143 eV per atom against 0.027, and activity cliffs 1.26 RMSE against 0.82. Stellar radial velocities pass at 20% against 95% for the classical pipeline.

![Every waveform and image benchmark with one record each, the published specialists and the seven language models](/blog/general-models-raw-scientific-data/panel-waveforms-images.png)

*Figure 5d of the paper. Every waveform and image benchmark, with one record of each (left empty where the record may not be redistributed). Grey dashes are the published specialists, coloured marks the seven models.*

**Meanwhile the general backbone is improving fast.** On 13 benchmarks shared by five Claude Opus generations (4.5 to 5.5), **the median skill rose from 0.093 to 0.492**. Claude Fable 5.2 reaches 0.57 on the same 13 while answering faster (7.0 seconds median latency against 8.4 for Opus 5.5). On 14 shared benchmarks, GPT Sol rose from 0.217 (5.6) to 0.417 (6.2). The models also spend very different amounts of compute. Gemini 4 Neon uses a median of 5,297 output tokens and 58.7 seconds per call, against 452 tokens for Claude Fable 5.2 and 198.5 for GPT-6.2 Sol.

## 6. Every domain specialist with the right adapter

People ask whether general language models will absorb protein language models only because amino-acid strings already look like text, so the overlap showed up there first.

**What [RawSci-Bench](https://albert-ying.github.io/RawSci-Bench/) shows is that protein sequences were simply the first scientific modality whose native form passes intact through a text tokenizer.** Missense variants, randomized SMILES reactions, lipophilicity and toxicity, MS/MS peak lists, ranked single-cell transcriptomes, NMR peak tables, annual time series: whenever a raw record reaches a general backbone without being shredded, **the best frontier model already ranks in the upper half of the published specialists on 20 of 36 such benchmarks and beats at least one on 32**. Where it still trails, the cause is almost always the input: multi-lead waveforms, 3D coordinates, low-resolution scans and dense spectra.

**We probably do not need fifty isolated foundation models relearning physics, chemistry and biology from scratch.** An unmodified language backbone already equals or beats **903 of 1,667 published specialist scores** across 48 raw-record benchmarks. Lightweight modality-native encoders for waveforms, spectra, 3D structures and scientific images, placed in front of a general backbone, would put almost every standalone domain model on the same curve. **The question for AI in science is no longer whether general models will replace protein language models. It is which standalone domain models will survive once the right adapters arrive.**

*Read the [paper (PDF)](https://albert-ying.github.io/RawSci-Bench/RawSci-Bench_paper.pdf). Explore the leaderboard, the specialist ranges, the task inspector, the record-removal matrix, the channel ablations and the post-cutoff controls on [RawSci-Bench](https://albert-ying.github.io/RawSci-Bench/). Or inspect the harness, benchmark cards, native scorers and full result tables on [GitHub](https://github.com/albert-ying/RawSci-Bench).*
