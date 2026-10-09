# Speaker script: ARIANE for ENIGMA

About 13 minutes plus the application walkthrough. One block per slide. Square brackets are cues for the speaker.

## Slide 1

Good morning. My name is Kamila Clarová. I work in Jiří Vondrášek's group at IOCB Prague, and I develop ARIANE together with Zdeněk Kleibl and Jana Soukupová from the First Faculty of Medicine. ARIANE is a software implementation of your BRCA1/2 specification, version 1.2. I will show you what it is, which criteria it implements and at which level of automation, how every result keeps its provenance, how it handles updates and other genes, what we are missing for validation, and where Phase 2 stands.

## Slide 2

ARIANE is a software implementation of the specification. Our requirement was simple to state: the same variant has to give the same criteria, the same strengths and the same reasoning every time, and a reviewer has to be able to see which inputs produced them. Applying the specification by hand is harder than it looks. The rules branch by variant type, by transcript context and by what evidence is available, and the evidence sits in tables, supplementary files, registries and databases that change over time. A single PVS1 or PM2 decision can depend on five or six inputs, and each of them is a place where two curators can diverge.

ARIANE does four things. It validates and normalizes the variant against the reference transcript, NM_007294.4 for BRCA1 and NM_000059.4 for BRCA2. It collects evidence from fixed data releases: every table, dataset and registry it uses is one specific version, verified by its checksum, so a result cannot change because a source changed underneath it. It evaluates the branches of version 1.2 that apply. And it returns the criteria with strength, reason and source, together with warnings and the classification.

There is a web interface, an API and batch processing. All three use the same engine, so they cannot give different answers for the same input. The screenshot shows a result for BRCA1 c.5266dup. Class 5, with PVS1 Very Strong from Table 4, PS3 Strong from Table 9 and PM5 for the premature termination codon. Each row has its reason, and the decision path can be opened.

ARIANE is in beta. Every result still needs expert review. And one thing about missing evidence: when a rule needs something ARIANE does not have, the result says so. Missing evidence is never counted as evidence against.

## Slide 3

These are the criteria as implemented today. Automated from the fixed data releases: the population criteria from gnomAD v2.1.1 and v3.1.2 non-cancer, with the Appendix G populations, coverage and QC checks and the founder variant exclusion. PVS1 and PM5 from Table 4. PVS1 RNA from exact ERepo assertions and from eligible ST2 records. PS3 and BS3 from Table 9. The computational codes from a local SpliceAI with the Appendix J profile, from BayesDel and from the functional domains. Protein-level PS1 from ST7 references. PP4 and BP5 from the variant-specific combined LR.

On the right are the criteria that go through structured expert review. PS4, PM3, PP1, BS2 and BS4. Functional evidence outside Table 9. RNA evidence. The initiation codon branch. PS1 for splicing. For these the reviewer enters the facts and ARIANE derives the strength from the thresholds in version 1.2. The strength itself cannot be typed in.

## Slide 4

We work with three levels of automation.

Automatic: criteria decided from bioinformatic tools and the curated tables. Population criteria, PVS1 and PM5 from Table 4, PS3 and BS3 from Table 9, PVS1 RNA from exact ERepo and ST2 records, the computational codes, PS1 protein from ST7, PP4 and BP5 from the combined LR track. No input from the reviewer; the result carries criterion, strength, reason and source.

Semi-automatic: a review form that ARIANE opens with the known facts filled in, and the expert adds the conclusion. PVS1 RNA, where the exact ST2 record prefills the form. The initiation codon branch, where the variant, the transcript and the SpliceAI context are prefilled. PS1 for splicing, with the reference variant checks and the SpliceAI scores. BP7 RNA, where ARIANE checks the variant type, the domain location and the Table 9 status. The strength is then derived from the flowchart or the thresholds.

Manual: facts from publications, families and cohorts, entered by the expert through a form. PS4 with cases, controls, p-value, odds ratio and matching. PM3 and BS2 with the co-occurring variant, phase, phenotype and points. PP1 and BS4 with the co-segregation LR and its components. PS3 and BS3 from a publication outside Table 9. PP4 and BP5 from a reviewed source other than the clinical LR track. Here too the strength is derived by ARIANE; there is no manual override.

The same criterion can sit at two levels depending on the source. PS3 from Table 9 is automatic. PS3 from a new publication goes through the manual form.

## Slide 5

[Switch to the application.] Let me show you the three levels in the application, one variant each.

BRCA1 c.509G>A, Arg170Gln. BS1 Supporting from gnomAD. BS3 Strong from Table 9. BP5 Strong from the combined LR. BP1 Strong because the variant is outside a functional domain and SpliceAI is below 0.1. Class 1, no manual input.

Second, BRCA2 c.1A>G. ARIANE finds PM2 Supporting and stops at class 3. It recognizes the initiation codon and opens the PVS1 form for it, with the variant, the transcript and the SpliceAI context already filled in. The reviewer does the alternative start analysis, and ARIANE derives the strength from the flowchart.

Third, the same variant with a PP1 form. The reviewer enters the co-segregation LR and its components. ARIANE gives Supporting at 2.08, Moderate at 4.3, Strong at 18.7, and Very Strong at 350 only when a splicing or protein effect has been shown.

In every case the automated result stays as it was. The expert's input produces a separate amended result with the reviewer's name, the date, notes and references, and it can be exported as JSON.

## Slide 6

Every classification has its provenance. Each result records the application version, the VCEP policy version and the transcript, a fingerprint of the classifier, the normalized variant, and for every criterion the reason and the source: the table row, the record, the score, the data release. Amended results add the reviewer, the date, notes and references.

What that gives us: a result can be reproduced later from its recorded inputs. Two results for the same variant can be compared criterion by criterion. When a source or the specification changes, it shows up as a changed input in the record, so a change of class can be traced to it. And an amended result always keeps the original automated result next to it.

If an external source is down, ARIANE keeps using the last approved snapshot. If a required ENIGMA table is incomplete or corrupted, the application does not start. This is also what makes validation possible: for every disagreement we can show which input led to the decision.

## Slide 7

Criteria and sources change, and we have a system for that. ARIANE monitors the CSpec for new versions of the specification, ClinGen ERepo, the UCSC clinical LR track and gnomAD; read-only, weekly for CSpec and ERepo, monthly for the track and gnomAD. The SpliceAI profile, the reference bundle and the curated registries are reviewed when a defined trigger occurs.

When something changes, the new release becomes a candidate outside production. We compare it with the active snapshot record by record and criterion by criterion, we run the regression tests over the variant matrix, and only after expert approval does it become active, in one versioned step. A new specification version becomes a new policy package, and the old one stays available, so any result can be read against the version it was produced with.

This has already happened. On 18 August the clinical LR track released a new version in which the case-control component changed from the Parsons iCOGS data to Zanti 2025. Monitoring reported the changed checksum, we diffed the new release against the active one variant by variant, the regression tests passed, and on 1 September the release was approved and activated.

A newer release is not automatically a suitable one. A different gnomAD major release has different cohorts, coverage and schema, and that is a separate validation step.

## Slide 8

A short look at the architecture. Variant processing normalizes the HGVS description and checks it against a fixed transcript bundle. The evidence sources are gnomAD snapshots, SpliceAI from our own local service, the ENIGMA tables, the ERepo registries and the clinical LR track; each one is a fixed release verified by its checksum. The classification graph has one node per criterion branch, each with its reason, its source and an explicit state when evidence is unavailable. The policy package holds the gene's specification version, transcript, thresholds, domains and do-not-use rules and is loaded at start. The manual review service provides the forms, derives the strength and stores amended results next to the automated ones. Monitoring and the release process sit beside it, with about seven hundred automated tests behind the whole thing.

One request goes through the same steps every time: normalize, collect evidence, evaluate the applicable branches, assemble the result with its provenance, and optionally continue into expert review. The backend is Python with FastAPI, with a web front end, a versioned JSON API and batch processing on top of the same engine. At start-up the checksums of all data releases are verified; a missing or corrupted required table stops the application.

## Slide 9

The engine is ready for other genes. The engine, the review framework, the monitoring and the interfaces are shared, and nothing for BRCA is hard-coded; gene settings live in the policy package. What a new gene needs is its own package with the specification encoded, including the rule branches that differ from BRCA, its data, a regression matrix, a validation set and approval. A gene without an approved package does not run.

## Slide 10

What we lack is a validation set, and this is the main reason I am here.

We can check that ARIANE reproduces ST7 and the ERepo records. But those are inputs to ARIANE, so agreement there proves little. What we need is an independent set from you: expert-classified variants that are not in the specification and not among our inputs, covering the variant types, both directions and borderline VUS. For each variant we need the gene, the c. notation on the reference transcript, the class, the criteria with strengths, the date and the specification version.

ARIANE would classify them through the batch API, we would compare criteria, strengths, points and class with your result, and go through the disagreements together with a curator. The tooling for this exists; we have used it on the tutorial variants.

## Slide 11

Phase 2, briefly. It is about the evidence that lives only in publications. On the left are the criteria that depend on it and what each one needs: the assay and its calibration for PS3 and BS3, the material and the transcript consequence for RNA evidence, cases and controls for PS4, the co-occurring variant and phenotype for PM3 and BS2, the LR per family for PP1 and BS4.

The design: a pipeline that watches a defined corpus and searches per variant, including an index over supplementary tables, extracts candidate records into the schema of our existing review forms with a quote and a location for every value, detects overlap between studies, and sends the records to expert review. Approved records go into a versioned registry. The language model proposes records; the reviewer assigns the criteria; the live classifier does not use a language model at all.

We have a pilot running over the publications that ENIGMA cites in ST3 and Table 9. What it showed first is the bottleneck for any machine processing: access. Through open sources we could read 25 of the 79 full texts; 48 are available only as an abstract and 6 are not in PMC at all. The legal side, text and data mining under lawful access and the licences for sending text to external services, is being settled with our library; it does not block processing on our own hardware, where no article text leaves the institute. This is a preliminary design and it will change as requirements come in. I have a separate deck on it if there is interest.

## Slide 12

So this is what we ask. First, an independent validation set and someone who will go through the disagreements with us. Second, answers to the specification questions we collected while implementing; I will send them separately.

Without the validation set, ARIANE stays in beta. Thank you.
