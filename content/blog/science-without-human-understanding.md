---
title: "The future of science without human understanding"
date: 2026-11-20
description: "Scientific concepts, claims and theories are lossy compressions of reality. Human understanding is made of them, and a higher intelligence may not need them."
author: "Kejun Ying"
tags: ["science", "AI"]
thumbnail: "blog/science-without-human-understanding/cover.png"
showdate: true
draft: false
---

In June 2000, Nature printed a [short story](https://doi.org/10.1038/35014679) by Ted Chiang, written as a Nature editorial from the future. In that future, metahumans do the original science and human scientists interpret what the metahumans find. The line under the title reads "In the face of metahuman science, humans have become metascientists."

Something like that seems to be happening in mathematics. On 20 November 2026, Levent Alpöge, a mathematician at Anthropic, [wrote](https://alpo.ge/remark.pdf) that he believes he has found a proof of the Riemann Hypothesis working with Claude. Written out in prose, it runs past 250,000 pages. He said he hadn't yet mastered much of the mathematics in it. Terence Tao [wrote](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/) that he imagines "the digestion process will take some time". A proof of this size is being [checked by machines](https://math.mit.edu/~drew/grh/) while it is still beyond human understanding. I think most of science will work this way within ten years.

Digestion is the right word. To digest a result is to turn it into concepts, claims and theories small enough for one person to hold. I have five points to make about that.

![A band of individual records flows past a small circle that holds a five-node summary of them](/blog/science-without-human-understanding/cover.png)

## 1. Scientific concepts, claims and theories are lossy compressions of reality

A compression replaces many things with fewer. It is lossy when the few don't carry everything the many did. Concepts, claims and theories all work this way, and whatever they drop is missing when we reason with them.

Start with a concept. A gas is molecules, each with its own position and speed. Temperature is one number for all of them. An enormous number of different arrangements of the molecules (the microstates) have the same temperature, so the temperature can't tell you which arrangement you have. Cell types are similar. A human body has about 37 trillion cells ([Bianconi et al., 2013](https://doi.org/10.3109/03014460.2013.807878)) and we sort them under labels like "T cell", though each cell may be in a microstate of its own, shared with no other cell. The label keeps the few features the cells share and drops everything else. Pathways and diseases are probably concepts of the same kind.

![Many molecules are reduced to one temperature, and many cells are sorted into a few cell types](/blog/science-without-human-understanding/temperature-and-cell-types.png)

A claim puts a few concepts together, and it compresses the records behind it. A transcriptomics paper measures about twenty thousand genes in every sample. A line like "in sample 17, gene X was counted 4,212 times" is a record, not a claim. What most readers take away is a sentence or two, like "gene X is more active in tumors than in healthy tissue". That sentence is a claim. It was built from thousands of records and carries a small part of what they hold. The authors write it once, at publication, to answer the question they had at the time. Whatever else the records could say isn't in it.

A theory compresses claims. "DNA makes RNA, and RNA makes protein" is a theory, not any single claim. It stands for thousands of claims about how cells read their genes, and it drops the ones that don't fit, like [retroviruses](https://www.genome.gov/genetics-glossary/Retrovirus), whose RNA is copied back into DNA. Natural selection and the germ theory of disease are theories in the same sense.

From reality to a concept, from records to a claim, from claims to a theory, something is dropped at each step. The records may still exist. What was dropped is just missing whenever we reason with the compressed form.

## 2. Human understanding might be an illusion

We compress because it makes computation easy, especially for human cognition. Nobody can hold the measurements from ten thousand studies or the state of every cell in mind. A person can reason well with a handful of theories and claims, and from a theory we can reason by logic and generalize to cases nobody has measured. It has a cost, because the compression isn't lossless.

If understanding a field means holding its compressed form, then the feeling of understanding comes when the form fits our brains and answers the questions we've asked. It doesn't tell us how much of reality was left out. That is the sense in which understanding might be an illusion. It may simply be what we call a representation that fits the way our brains work, not some deeper contact with reality.

The brain is the hardest case. To understand a brain without compression, a brain would have to hold a full record of itself, and it has no room. Whatever a brain understands about brains is compressed, however complete it feels. Emerson Pugh is [credited with the line](https://quoteinvestigator.com/2016/03/05/brain/) "If the human brain were so simple that we could understand it, we would be so simple that we couldn't."

I find this uncomfortable. Understanding is why most of us became scientists, and it's the part of the work I love. But I think it has been how we do science more than what science is for.

## 3. A higher intelligence may understand without compression

The need to compress comes from our own limits. A mind with more capacity may not have it. This is where I started, with a [thought experiment by Jonathan Gorard](https://youtu.be/dwI0mXKKf1A) about an intelligence that could track every molecule in a fluid and so might never form the concept of a fluid.

A model with enough capacity could look at the experimental conditions, the individual outcomes and the different readouts across many studies together, and decide which details matter for each question. It might still abstract when that helps. But the records would stay within its reach, so nothing would be missing when it reasons, and it wouldn't have to fix the abstraction before anyone knows the question. Its understanding would be a different kind from ours. It would hold the records, where we hold the summary. Most of its intermediate concepts will probably have no names in our vocabulary.

A mind like this is an old idea in philosophy. Thomas Aquinas [argued](https://www.ccel.org/ccel/aquinas/summa.FP_Q14_A7.html) that God "sees all things together, and not successively". Kant [called](https://plato.stanford.edu/entries/kant-aesthetics/) human understanding discursive, because it has to work through concepts, and contrasted it with an intuitive understanding that would not. For both of them, such a mind was not a human one. We have started to build something like it.

There are already signs. This week Xinming Tu and Leo Tianlai Chen [reported](https://xinmingtu.cn/blog/2026/claude-opus-5-5-protein-sequences/) that the latest Claude models can continue the sequences of bacterial and archaeal proteins that almost nobody has studied. The best of them gets the next amino acid right 54% of the time, against 9% on shuffled copies of the same proteins. Most of those protein families have no papers about them, so there were no claims to learn from. Their conclusion is that the models were trained on protein sequences at scale. If so, a general model is already reading the records of biology directly.

![Six experiments are each reduced to one claim and the claims form a sparse network, while the same experiments are also carried through in full as records](/blog/science-without-human-understanding/claims-and-records.png)

## 4. By applying AI modeling in science, we are giving up our understanding chunk by chunk without formally realizing it

We don't have to wait for such a mind. The handover has started with much narrower models. A predictive model gives answers without an explanation we could hold. Each time we adopt one, we accept answers in that part of science without the explanation we used to ask for.

AlphaFold is the best-known case. It was trained on protein sequences and experimentally solved structures, and its predictions reached accuracy comparable to experiment in a majority of cases ([Jumper et al., 2021](https://doi.org/10.1038/s41586-021-03819-2)). It hasn't given us a theory of folding a person could apply by hand. We use the structures anyway. The models built for the genome are the same. AlphaMissense predicts, for each of the 71 million possible single amino-acid changes in human proteins, whether it is likely to cause disease ([Cheng et al., 2023](https://pubmed.ncbi.nlm.nih.gov/37733863/)). AlphaGenome takes a million letters of DNA and predicts thousands of readouts of how that stretch of the genome is used, such as gene expression and chromatin accessibility ([Avsec et al., 2026](https://pubmed.ncbi.nlm.nih.gov/41606153/)). Virtual cell models predict how a cell will respond to a drug or a genetic change, and disease prediction models predict which illnesses a person is likely to develop. Nearly everything we call AI for science is a predictive model of this kind. Daniel Dennett had a phrase for systems like these, [competence without comprehension](https://en.wikipedia.org/wiki/From_Bacteria_to_Bach_and_Back), meaning organisms and machines that do sophisticated things without understanding why.

Each model covers a narrow domain, and we hand over one chunk each time we adopt one. I'd go further. Any AI modeling in biology, and actually any computational modeling in biology, is a way to give up understanding, because we take the output of a computation that no person can follow. Each adoption is decided on how accurate the predictions are, and nobody has formally decided that we should give the understanding up. The philosopher Paul Humphreys saw this with computer simulation in 2009 and [called](https://doi.org/10.1007/s11229-008-9435-2) it the anthropocentric predicament, the question of how we can understand and evaluate computational methods that go beyond our own abilities.

## 5. Science can go forward without human understanding

Science goes forward when a result survives a check. That doesn't require anyone to understand why the result is right. Alpöge's proof will stand or fall on the proof checkers, before anyone has digested it. AlphaFold's structures are used because they match experiment, whether or not anyone can explain them.

Summaries drop information that other questions need, and progress doesn't depend on our holding them. So the future of science should be large models reasoning on raw records at the petabyte scale and beyond, without the need to summarize them, or at least not in a form humans can understand. Chris Anderson argued something close to this in 2008 in a Wired essay, [The End of Theory](https://www.wired.com/2008/06/pb-theory/). He wrote that with petabytes of data "correlation is enough" and that the scientific method was becoming obsolete. I don't think it is. Without theories and claims, we'd still have experiments, predictions and checks. The predictions would do what theories did for us and reach cases nobody has measured, and the checks would tell us when to believe them.

We'd have to keep experiments as full records, because whatever does the reasoning reads the records, not the abstract. Each prediction would have to come with the result that would refute it, and the check would have to be run by something separate from whatever made the prediction. In math that's a proof checker. In biology it could be an efficient automated wet lab that tests predictions about as fast as a model makes them. We'd still write papers, after the fact and for each other, much like the human scientists in Chiang's story. Working that way, we verify results before we understand them (if we ever do), so we're limited by how fast we can check. That's why I think building the checker is the most important thing biology can do.

I'll still want to understand things. I expect to miss the years when understanding came first. I also expect to be amazed by what we find without it.
