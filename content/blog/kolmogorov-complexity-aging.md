---
title: "On Kolmogorov complexity and why aging is hard"
date: 2026-03-15
lastmod: 2026-07-12
description: "The organism is a compact program. Its decay has no compact description. Repair needs a reference, and for much of aging the body no longer holds one."
author: "Kejun Ying"
tags: ["aging", "science", "AI"]
thumbnail: "blog/kolmogorov-complexity-aging/cover.png"
showdate: true
draft: false
---

Jonathan Gorard recently wrote a [thread](https://x.com/getjonwithit/status/2032853995790692793) arguing that LLMs exposed how much of human knowledge lives at surprisingly low Kolmogorov complexity. The minimal algorithmic representation of most text and code is far more compact than the artifact itself. LLMs succeed because they learn to decompress efficiently.

I think this framing applies to biology, with an important caveat.

![DNA decompresses into organism complexity, which decays into somatic entropy](/blog/kolmogorov-complexity-aging/cover.png)

The organism itself is low complexity. The haploid human genome is about 3.1 billion base pairs, which at two bits per base is roughly 780 megabytes of raw encoding. The true information content is lower than that, because more than half of the sequence is repetitive ([Lander et al., 2001](https://doi.org/10.1038/35057062)). For what it builds, this is a small program: on the order of 37 trillion cells and hundreds of cell types ([Bianconi et al., 2013](https://doi.org/10.3109/03014460.2013.807878)). Gene regulation, transcription, folding, and morphogenesis are all steps in a decompression pipeline that unpacks a compact code into an organism.

Two things I should have said the first time I wrote this. The genome is the tape, and the egg is the machine that reads it. Mouse embryos assembled from two maternal or two paternal pronuclei carry a complete, normal diploid genome and still fail to develop ([McGrath and Solter, 1984](https://doi.org/10.1016/0092-8674(84)90313-1)). Same base pairs, different outcome. And AlphaFold, which I used as my example of decompression, runs on a multiple sequence alignment rather than on your one sequence. Its own authors report that accuracy falls substantially once the alignment drops below about thirty homologs ([Jumper et al., 2021](https://doi.org/10.1038/s41586-021-03819-2)). The sequence-to-structure map is compressible and learnable, and the information it reads lives in the evolutionary record. Hold onto that, because it comes back at the end and it costs me something.

Where the analogy breaks is aging.

A compact system running for decades accumulates damage that has no compact description. Gladyshev calls this the deleteriome, the cumulative burden of deleterious changes across every level of biological organization ([Gladyshev, 2016](https://doi.org/10.1111/acel.12480)). I had the source of that damage wrong. In his account, living is imperfect: every biological process throws off deleterious byproducts as a side effect of doing its job, and genetic and environmental factors adjust the rate rather than cause it. That is the worse version for us. You cannot escape the damage by cleaning up the environment, because the damage is a byproduct of being alive.

As he once put it to me: aging might be more complex than life itself. For life, you need to know how to build. For aging, there is a combinatorial space of things that can go wrong. Strictly, a combinatorial space is not itself complex, since the set of all possible damage states has a short description. What has no short description is the particular configuration an eighty-year-old is carrying: the record of eighty years of stochastic draws, one per cell, and nothing shorter than that record specifies it.

Now the part I got wrong, and it was the hinge of the whole essay.

I argued that because the damage is incompressible, the fix cannot be compact. That does not follow. The description length of a problem tells you nothing about the size of a program that corrects it. A DNA glycosylase is about a kilobase of coding sequence, and it corrects an unbounded stream of incompressible lesions: it scans, recognizes a chemically defined error, cuts it out, and lets a polymerase copy the right base back from the other strand. Had that argument been sound, it would have killed my own conclusion along with everything else, because a designed protein is the most compact intervention anyone has ever proposed.

The quantity that matters is whether the correct state can still be recovered from something that survived.

Biological repair runs on exactly this. Excision repair cuts out a thirty-nucleotide stretch around a lesion and rewrites it by copying the undamaged strand ([Hu et al., 2013](https://doi.org/10.1074/jbc.M113.482257)). Mismatch repair has to be told which strand is the new one, because at a mismatch both bases are chemically normal and neither is wrong on its face. Methylation is restorable because a hemimethylated site still carries a copy to copy from ([Sharif et al., 2007](https://doi.org/10.1038/nature06397)). Each of these is a compact program that beats incompressible damage, and each one works by holding a reference.

I wrote the right sentence in the original and then walked past it. There is no undo button, because the system itself doesn't know what all the damage is. That is the argument. It is a claim about missing references and missing error signals, and it has nothing to do with description length.

This also resolves something I fudged. Lipsitz and Goldberger proposed that aging brings a loss of physiological complexity, the fractal richness of cardiovascular and neural output ([Lipsitz and Goldberger, 1992](https://doi.org/10.1001/jama.1992.03480130122036)). That runs opposite to my thesis, and I bridged it with one hand-waving sentence. They are different quantities. Aging raises the description length of the body's state and lowers the dynamic range of its behavior. This is what noise does: it adds bits that carry no function. The body gets harder to describe and less able to act.

The pattern in medicine follows from the same idea. Where a disease has a compact cause, a compact intervention can control it. Imatinib targets one fusion gene, and people diagnosed with chronic myeloid leukemia in 2013 lose fewer than three years of life expectancy ([Bower et al., 2016](https://doi.org/10.1200/JCO.2015.66.2866)). CFTR modulators target one misfolded channel and raise lung function by about fourteen points in cystic fibrosis patients carrying the common allele ([Middleton et al., 2019](https://doi.org/10.1056/NEJMoa1908639)).

I originally listed Yamanaka factors here. That was wrong twice over. Cell identity is not a disease, so there is no compact cause being cured, and I then spent a later paragraph arguing that those same four factors cannot solve aging. One example cannot carry both sides of the argument.

A compact cause is also no guarantee. Huntington's disease has been traced to a single repeat expansion since 1993 ([The Huntington's Disease Collaborative Research Group, 1993](https://doi.org/10.1016/0092-8674(93)90585-E)). This month Roche discontinued tominersen, the flagship huntingtin-lowering drug, after it lowered mutant huntingtin, lowered neurofilament light, and changed nothing for the patients. Thirty-three years, an exactly known cause, a confirmed molecular hit, and still no disease-modifying therapy. Huntington's is my thesis rather than a challenge to it: an exactly known cause stops helping you once the neurons that held the reference are already dead.

Aging has no compact cause at all, and no single locus to aim at. So the question to ask of any intervention that tries to restore the biological state is where it gets its reference. There are four answers, and then a wall. Prosthetics and dialysis sit outside the scheme entirely, since they substitute for the function and give up on the state, which is the most successful thing clinical medicine does and a standing reproach to everything below.

The first is rate control. Rapamycin and caloric restriction lower the rate at which damage is produced. This works, and it works better than I gave it credit for: in the NIA Interventions Testing Program, rapamycin at 42 ppm raised median lifespan by 23 percent in male and 26 percent in female mice ([Miller et al., 2014](https://doi.org/10.1111/acel.12194)). I also put it in the wrong company. Metformin alone did not significantly extend lifespan in that program ([Strong et al., 2016](https://doi.org/10.1111/acel.12496)), and neither did fisetin, the flagship senolytic ([Harrison et al., 2023](https://doi.org/10.1007/s11357-023-01011-0)). Rate control does not restore lost structure. It slows the accrual of damage it never has to see. The categories are not disjoint, and rapamycin is the reason: mTOR inhibition also lifts an active suppression of autophagy, which puts part of its effect in the next category.

The second is unblocking capacity the body still has. Partial reprogramming is the clean case. OSK, three of the four factors that induce pluripotency ([Takahashi and Yamanaka, 2006](https://doi.org/10.1016/j.cell.2006.07.024)), reads a record the cell still holds, which is why it works at all and why it needs the TET enzymes to do it ([Lu et al., 2020](https://doi.org/10.1038/s41586-020-2975-4)). Nothing youthful is written in. I should flag that the retained-record reading is a hypothesis: the competing account is that OSK simply re-runs the developmental program off the genome, and I do not think the data separate them yet. Plasma dilution belongs here too, and it is the result that most changed my thinking. Replacing half of an old mouse's plasma with saline and albumin, with no young plasma involved at all, restores muscle regeneration to youthful levels and raises hippocampal neurogenesis roughly eightfold ([Mehdipour et al., 2020](https://doi.org/10.18632/aging.103418)). An inhibitory signal is removed and retained capacity does the rest. The albumin is exogenous protein and the authors flag it as a candidate active agent, so the clean version of that experiment is still owed. Senolytics work the same way, by clearing a population that is suppressing function ([Xu et al., 2018](https://doi.org/10.1038/s41591-018-0092-9)).

Everything in this category is bounded by how much the body still retains, which is why reprogramming has a ceiling. Once a somatic mutation is fixed in both strands, the mutation *is* the reference, and colorectal crypt cells take on roughly fifty of these a year ([Cagan et al., 2022](https://doi.org/10.1038/s41586-022-04618-z)). No amount of reprogramming reads back a base that nothing recorded. The reference is held by the tissue, though, and not by the cell. Crypt 47 lost it and crypt 48 still has it. So in a renewing tissue the way around a fixed mutation is to delete the clone and let a correctly-referenced neighbor repopulate, which is what clonal competition and immune surveillance already do. The ceiling binds where the tissue does not renew and the cell is itself the information.

The third is importing a reference from outside, and I left it out of the original completely. A kidney transplant is a simple operation that hauls an entire decompressed tissue state in from another organism, which puts it in a different category from retuning a parameter or unlocking a record the recipient already had. I had been treating procedural simplicity and informational scale as the same thing, and they are two different axes.

The effect is measurable. In recipients over sixty, a kidney from a donor aged twenty to forty cuts death-censored graft failure by 63 percent relative to a donor over sixty ([Lim et al., 2012](https://doi.org/10.1111/j.1432-2277.2012.01429.x)).

The honest version is narrower than I would like. The imported organ is not young. The average deceased donor is middle-aged, and every graft arrives having been through brain death and ischemia-reperfusion injury, so transplantation resets the clock to the donor's age. It does not de-age the recipient: donor age predicts graft failure and not patient death, and older recipients mostly die with a working kidney. Registry donor age also travels with hypertension, cold ischemia time, and allocation policy, so the hazard ratio is not clean evidence of a transported informational payload. There is a reading of all this that needs no information theory at all, which is that an old kidney arrives with about half the filters, roughly 990,000 nonsclerotic glomeruli at twenty-five against 520,000 at seventy ([Denic et al., 2017](https://doi.org/10.1681/ASN.2016020154)). Whether organ youth has an informational component on top of the nephron count is untested as far as I know, and I am putting it forward as a hypothesis rather than a finding.

What transplantation does show is that procedural simplicity and informational scale come apart. It shows it by the crudest route available. To restore the fraction of an organ that was lost, we import the entire organ, including all the state the recipient still encodes perfectly well. By my own argument that is the brute-force baseline a compact corrector has to beat. And because the imported information is foreign, the recipient's immune system, itself a distributed error-correction apparatus, classifies the correct information as error and attacks it. We then defend the correction for life with drugs that accelerate aging elsewhere.

Even a gene edit gets delivered this way. Casgevy is CRISPR, the most information-precise therapy we have, and it reaches the patient inside a transplant: mobilization, apheresis, four days of busulfan to destroy the marrow, then about a month of aplasia while the edited cells engraft. Serious adverse reactions occurred in 45 percent of sickle cell patients, and 10 percent of enrolled patients never received the product at all ([Frangoul et al., 2024](https://doi.org/10.1056/NEJMoa2309676)). The FDA label says the safety profile was generally consistent with what is expected from busulfan myeloablative conditioning and stem cell transplant. The sequence was known from the start. Delivering it to every cell is what required destroying the marrow first.

Import also stops somewhere, and the limit is not donor supply. The immune system is a real exception, and it cuts my way: allogeneic stem cell transplant replaces an entire renewing compartment with a donor's, and it is the cleanest existing test of whether youth travels with imported cells. What no number of donors gets you is the vasculature, the extracellular matrix, the systemic milieu, and the brain. Aging is distributed and transplantation is organ-local.

The fourth is authoring a corrector for damage the body has no reader for. This is the one I care about, and it is where the argument now supports the conclusion, which it did not before.

A designed enzyme is compact, and once the axis is right, that stops being a contradiction. An enzyme works from a local decision procedure and a chemically determined correct state. Give it those, and it corrects an unbounded number of instances with no description of the damage anywhere in the loop. An oxidized guanine is a guanine wearing an oxygen, and the identity of the right base survives inside the lesion. A glycation crosslink should not be there at all, and nothing has to look that up.

Evolution built these readers for the damage that mattered before reproduction, and then it stopped. Glucosepane is the clearest gap. It is the dominant advanced-glycation crosslink of the aged human extracellular matrix, reaching about 2,000 pmol/mg in the skin collagen of ninety-year-olds without diabetes, sixty to a hundred times the level of the other crosslinks measured in the same samples ([Sell et al., 2005](https://doi.org/10.1074/jbc.M500733200)). No characterized enzyme reverses it.

This bet has been placed once already and lost. Alagebrium was the first AGE crosslink breaker to reach the clinic, and its sponsor halted it after phase 2. The instructive part is the mechanism. It cleaves a sugar-derived dicarbonyl bridge, its activity in vivo may come from antioxidant and metal-chelating effects rather than from cleaving anything, and it was never shown to touch glucosepane. The target may not have been there. Glucosepane is a different bet, because that target is now confirmed, quantified, and synthesized ([Draghici et al., 2015](https://doi.org/10.1126/science.aac9655)), which gives us the reagents to go looking for a breaker. The breaker does not yet exist in the literature. That is the job.

The modality is not speculative. Pegvaliase is a PEGylated bacterial phenylalanine ammonia-lyase, approved in 2018, and it runs a reaction that no human enzyme performs. It cut blood phenylalanine by 69 percent over two years in phenylketonuria patients ([Thomas et al., 2018](https://doi.org/10.1016/j.ymgme.2018.03.006)). We already install reactions evolution never gave us. The costs are specificity and immunogenicity, and I do not want to wave at either. A glucosepane breaker has to cut the pathological crosslink while sparing the lysyl-oxidase crosslinks that hold healthy collagen together, and a corrector that cannot tell them apart becomes a new source of damage. Every one of the 261 patients in the pegvaliase phase 3 program developed anti-drug antibodies, and the label carries a boxed warning for anaphylaxis. That tax falls on any non-self corrector, designed or borrowed, since a novel active site is a novel epitope too.

Then there is the wall, and it binds my own program exactly as hard as it binds everyone else's. Some information is gone. A somatic point mutation fixed in both strands, in a tissue with no neighbor to copy from, leaves nothing behind that determines what the base used to be. A dead neuron takes its synaptic weights with it, and the genome never specified which synapse held which memory. No transplant restores that, because a donor brain is a different person. No designed enzyme restores it either. Designed correctors can clear damage classes in a brain, the aggregates and the oxidized residues, and twenty years of anti-amyloid work is the caution there: you can remove the deposit almost entirely and still buy the patient a modest slowing. Clearing a class returns only the function that class was suppressing, and nothing rebuilds a self that was never written down anywhere. Glucosepane is also the easy end of the delivery gradient, because it sits outside cells. Aggregates and lipofuscin sit inside them and behind the blood-brain barrier, which is the same wall that makes Casgevy a transplant.

This changes what I think the foundation-model question is. I said the goal should be to map the full complexity of how biology decays. That was self-refuting: if the decay is incompressible, a full map of it is as large as the decay itself, and a model is a compressor. The instances are the incompressible part, and they will never be enumerated. Nobody is ever going to list which base in which crypt cell mutated in 1998. The chemistry of decay is a short and finite list, and a list like that is learnable. Map the classes of damage, and which of them nothing in the body can read, and you have the specification for what to build.

There is a bill for this program, and it is the AlphaFold caveat from the top of the essay, turned around to point at me. Design reads its own reference out of the evolutionary record, which is precisely why AlphaFold needs the alignment. Pegvaliase is a borrowed bacterial enzyme, so it has that record behind it. The damage classes with no evolved corrector are the ones where the record is empty, and catalysis without precedent is the hardest thing protein design does. The cases where we most need a designed corrector are the cases where design has the least to learn from.

I still think protein design is where the field has to go, for a different reason than the one I gave. Evolution stopped writing correctors around the age it stopped caring what happened to us. The damage it never learned to read is the damage we die of. Nobody has written those correctors yet, and the bill above is what it costs to be the one who does.

*Inspired by [Jonathan Gorard's thread on Kolmogorov complexity and LLMs](https://x.com/getjonwithit/status/2032853995790692793). The quote from Vadim Gladyshev is from a conversation during my time in his lab at Harvard. The tominersen discontinuation was announced by Roche on 9 July 2026 and has no peer-reviewed writeup yet.*

---

**Revision (2026-07-12).** This is a substantial revision. The conclusion is unchanged. Much of the reasoning that led to it is not.

The central inference was invalid. I argued that incompressible damage forecloses a compact fix. A DNA glycosylase is the counterexample, and the inference would have disqualified my own conclusion along with everything else, since a designed protein is a compact intervention. The argument now turns on whether a reference for the correct state survives, which is what I should have said in the first place.

Yamanaka factors appeared as an example of a compact cure for a compact cause, and then six paragraphs later as an example of a compact intervention that fails. Both cannot be true. They now appear only in the second role, and cystic fibrosis takes the first.

Transplantation was missing entirely. It is the intervention that separates procedural simplicity from informational scale, and it turns that distinction against the interventions I favor.

Smaller fixes: rapamycin's lifespan numbers were wrong, and metformin and fisetin do not belong beside it, since both failed in the ITP. The AlphaFold claim was an overclaim, since AF2 leans on multiple sequence alignments. The Gladyshev citation was backwards, since the deleteriome is generated by the imperfectness of biological processes and the environment only adjusts the rate. The tension with Lipsitz and Goldberger was papered over instead of resolved. The closing paragraph asked for a full map of an incompressible process, which the essay had just argued was impossible; it now asks for the taxonomy instead.

**Correction (2026-03-16, revised 2026-07-12).** An earlier version stated the genome compresses to ~4MB. That was wrong, and so was my first attempt at correcting it: 3 million SNPs at 2 bits each is 0.75MB, not 4MB. The haploid genome is about 3.1 billion base pairs, roughly 780MB at two bits per base, with the true information content lower because more than half the sequence is repetitive. The argument never depended on the figure, which is the honest thing to say about a number that moved by two orders of magnitude without changing anything. The gap between a genome and a lifetime of accumulated damage across 37 trillion cells is enormous at either value.

---

**References**

1. Lander ES, Linton LM, Birren B, et al. Initial sequencing and analysis of the human genome. *Nature*. 2001;409(6822):860-921. [doi:10.1038/35057062](https://doi.org/10.1038/35057062)

2. Bianconi E, Piovesan A, Facchin F, et al. An estimation of the number of cells in the human body. *Ann Hum Biol*. 2013;40(6):463-471. [doi:10.3109/03014460.2013.807878](https://doi.org/10.3109/03014460.2013.807878)

3. McGrath J, Solter D. Completion of mouse embryogenesis requires both the maternal and paternal genomes. *Cell*. 1984;37(1):179-183. [doi:10.1016/0092-8674(84)90313-1](https://doi.org/10.1016/0092-8674(84)90313-1)

4. Jumper J, Evans R, Pritzel A, et al. Highly accurate protein structure prediction with AlphaFold. *Nature*. 2021;596(7873):583-589. [doi:10.1038/s41586-021-03819-2](https://doi.org/10.1038/s41586-021-03819-2)

5. Gladyshev VN. Aging: progressive decline in fitness due to the rising deleteriome adjusted by genetic, environmental, and stochastic processes. *Aging Cell*. 2016;15(4):594-602. [doi:10.1111/acel.12480](https://doi.org/10.1111/acel.12480)

6. Lipsitz LA, Goldberger AL. Loss of 'complexity' and aging: potential applications of fractals and chaos theory to senescence. *JAMA*. 1992;267(13):1806-1809. [doi:10.1001/jama.1992.03480130122036](https://doi.org/10.1001/jama.1992.03480130122036)

7. Hu J, Choi JH, Gaddameedhi S, Kemp MG, Reardon JT, Sancar A. Nucleotide excision repair in human cells: fate of the excised oligonucleotide carrying DNA damage in vivo. *J Biol Chem*. 2013;288(29):20918-20926. [doi:10.1074/jbc.M113.482257](https://doi.org/10.1074/jbc.M113.482257)

8. Sharif J, Muto M, Takebayashi S, et al. The SRA protein Np95 mediates epigenetic inheritance by recruiting Dnmt1 to methylated DNA. *Nature*. 2007;450(7171):908-912. [doi:10.1038/nature06397](https://doi.org/10.1038/nature06397)

9. Bower H, Björkholm M, Dickman PW, Höglund M, Lambert PC, Andersson TML. Life expectancy of patients with chronic myeloid leukemia approaches the life expectancy of the general population. *J Clin Oncol*. 2016;34(24):2851-2857. [doi:10.1200/JCO.2015.66.2866](https://doi.org/10.1200/JCO.2015.66.2866)

10. Middleton PG, Mall MA, Dřevínek P, et al. Elexacaftor-tezacaftor-ivacaftor for cystic fibrosis with a single Phe508del allele. *N Engl J Med*. 2019;381(19):1809-1819. [doi:10.1056/NEJMoa1908639](https://doi.org/10.1056/NEJMoa1908639)

11. The Huntington's Disease Collaborative Research Group. A novel gene containing a trinucleotide repeat that is expanded and unstable on Huntington's disease chromosomes. *Cell*. 1993;72(6):971-983. [doi:10.1016/0092-8674(93)90585-E](https://doi.org/10.1016/0092-8674(93)90585-E)

12. Miller RA, Harrison DE, Astle CM, et al. Rapamycin-mediated lifespan increase in mice is dose and sex dependent and metabolically distinct from dietary restriction. *Aging Cell*. 2014;13(3):468-477. [doi:10.1111/acel.12194](https://doi.org/10.1111/acel.12194)

13. Strong R, Miller RA, Antebi A, et al. Longer lifespan in male mice treated with a weakly estrogenic agonist, an antioxidant, an alpha-glucosidase inhibitor or a Nrf2-inducer. *Aging Cell*. 2016;15(5):872-884. [doi:10.1111/acel.12496](https://doi.org/10.1111/acel.12496)

14. Harrison DE, Strong R, Reifsnyder P, et al. Astaxanthin and meclizine extend lifespan in UM-HET3 male mice; fisetin, SG1002, dimethyl fumarate, mycophenolic acid, and 4-phenylbutyrate do not significantly affect lifespan in either sex at the doses and schedules used. *GeroScience*. 2023;46(1):795-816. [doi:10.1007/s11357-023-01011-0](https://doi.org/10.1007/s11357-023-01011-0)

15. Lu Y, Brommer B, Tian X, et al. Reprogramming to recover youthful epigenetic information and restore vision. *Nature*. 2020;588(7836):124-129. [doi:10.1038/s41586-020-2975-4](https://doi.org/10.1038/s41586-020-2975-4)

16. Mehdipour M, Skinner C, Wong N, et al. Rejuvenation of three germ layers tissues by exchanging old blood plasma with saline-albumin. *Aging (Albany NY)*. 2020;12(10):8790-8819. [doi:10.18632/aging.103418](https://doi.org/10.18632/aging.103418)

17. Xu M, Pirtskhalava T, Farr JN, et al. Senolytics improve physical function and increase lifespan in old age. *Nat Med*. 2018;24(8):1246-1256. [doi:10.1038/s41591-018-0092-9](https://doi.org/10.1038/s41591-018-0092-9)

18. Cagan A, Baez-Ortega A, Brzozowska N, et al. Somatic mutation rates scale with lifespan across mammals. *Nature*. 2022;604(7906):517-524. [doi:10.1038/s41586-022-04618-z](https://doi.org/10.1038/s41586-022-04618-z)

19. Lim WH, Clayton P, Wong G, et al. Lack of impact of donor age on patient survival for renal transplant recipients aged 60 years and over. *Transpl Int*. 2012;25(4):401-408. [doi:10.1111/j.1432-2277.2012.01429.x](https://doi.org/10.1111/j.1432-2277.2012.01429.x)

20. Denic A, Lieske JC, Chakkera HA, et al. The substantial loss of nephrons in healthy human kidneys with aging. *J Am Soc Nephrol*. 2017;28(1):313-320. [doi:10.1681/ASN.2016020154](https://doi.org/10.1681/ASN.2016020154)

21. Frangoul H, Locatelli F, Sharma A, et al. Exagamglogene autotemcel for severe sickle cell disease. *N Engl J Med*. 2024;390(18):1649-1662. [doi:10.1056/NEJMoa2309676](https://doi.org/10.1056/NEJMoa2309676)

22. Sell DR, Biemel KM, Reihl O, Lederer MO, Strauch CM, Monnier VM. Glucosepane is a major protein cross-link of the senescent human extracellular matrix. *J Biol Chem*. 2005;280(13):12310-12315. [doi:10.1074/jbc.M500733200](https://doi.org/10.1074/jbc.M500733200)

23. Draghici C, Wang T, Spiegel DA. Concise total synthesis of glucosepane. *Science*. 2015;350(6258):294-298. [doi:10.1126/science.aac9655](https://doi.org/10.1126/science.aac9655)

24. Thomas J, Levy H, Amato S, et al. Pegvaliase for the treatment of phenylketonuria: results of a long-term phase 3 clinical trial program (PRISM). *Mol Genet Metab*. 2018;124(1):27-38. [doi:10.1016/j.ymgme.2018.03.006](https://doi.org/10.1016/j.ymgme.2018.03.006)

25. Takahashi K, Yamanaka S. Induction of pluripotent stem cells from mouse embryonic and adult fibroblast cultures by defined factors. *Cell*. 2006;126(4):663-676. [doi:10.1016/j.cell.2006.07.024](https://doi.org/10.1016/j.cell.2006.07.024)
