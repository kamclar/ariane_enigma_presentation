window.ARIANE_CONTENTS = window.ARIANE_CONTENTS || {};
window.ARIANE_CONTENTS.en = {
  deck: {
    title: "ARIANE for ENIGMA",
    headerTitle: "ARIANE",
    headerSubtitle: "implementation of ENIGMA BRCA1/2 VCEP v1.2",
    authorName: "Kamila Clarová",
    authorGroup: "Jiří Vondrášek Group",
    institution: "ÚOCHB AV ČR",
    logoSrc: "images/uochb-iocb-prague-logo.png",
    logoAlt: "IOCB Prague / ÚOCHB AV ČR",
    notesShow: "Show notes",
    notesHide: "Hide notes",
    notesLabel: "Presenter notes",
    footer: ""
  },

  slides: [

    {
      id: "title",
      kicker: "Slide 1",
      layout: "title",
      title: "ARIANE",
      subtitle: "Implementation of ENIGMA BRCA1/2 VCEP v1.2. Current state and proposal for validation.",
      meta: [
        {
          key: "Presenter",
          valueHtml: "Kamila Clarová<small>Jiří Vondrášek Group, IOCB Prague</small>"
        },
        {
          key: "Collaboration",
          valueHtml: "Zdeněk Kleibl, Jana Soukupová<small>Institute of Biochemistry and Experimental Oncology, First Faculty of Medicine, Charles University</small>"
        },
        {
          key: "Application",
          value: "ariane-app.duckdns.org",
          href: "https://ariane-app.duckdns.org"
        }
      ],
      notes: [
        "What ARIANE is, which criteria it implements and at which level of automation, how every result keeps its provenance, how updates and new genes are handled, what is missing for validation, and the state of Phase 2."
      ]
    },

    {
      id: "what",
      kicker: "Slide 2",
      title: "What ARIANE is",
      layout: "product",
      left: [
        {
          type: "paragraphs",
          items: [
            "A software implementation of the ENIGMA BRCA1/2 specification, version 1.2. The same variant gives the same criteria, strengths and reasoning on every run, and a reviewer can see which inputs produced them."
          ]
        },
        {
          type: "numbered",
          items: [
            "Validates and normalizes the variant against the reference transcript",
            "Collects evidence from fixed data releases: every table, dataset and registry is one specific version, verified by its checksum",
            "Evaluates the applicable v1.2 branches",
            "Returns criteria, strengths, reasons, sources, warnings and the classification"
          ]
        },
        {
          type: "keyValues",
          items: [
            {
              key: "Reference transcripts",
              valueHtml: "BRCA1 NM_007294.4<br>BRCA2 NM_000059.4"
            },
            {
              key: "Interfaces",
              value: "Web interface, versioned API, batch processing; one engine behind all three"
            },
            {
              key: "Status",
              value: "Beta, under validation. Expert review is required for every result."
            }
          ]
        }
      ],
      right: [
        {
          type: "media",
          label: "ARIANE web application",
          description: "Classification result with applied criteria, strengths, points and reasons.",
          src: "images/ariane-result.png",
          alt: "ARIANE result for BRCA1 c.5266dup: Class 5 with PVS1 Very Strong, PS3 Strong and PM5 PTC Strong"
        }
      ],
      notes: [
        "Why software: the rules branch by variant type, transcript context and available evidence, and the evidence sits in tables, supplementary files, registries and databases that change over time. A single PVS1 or PM2 decision can depend on the variant type, the Table 4 row, SpliceAI under the Appendix J profile, the gnomAD release and population, whether an RNA record exists for the exact variant, and which specification version was active. Each of these is a place where two curators can diverge.",
        "Each criterion in the result has a reason and a source, for example the Table 4 row or the Table 9 record used. The decision path can be expanded for each criterion.",
        "If evidence required by a rule is missing, the result reports it. Missing evidence does not count as negative evidence."
      ]
    },

    {
      id: "implementation",
      kicker: "Slide 3",
      title: "Implemented criteria",
      layout: "standard",
      left: [
        {
          type: "table",
          heading: "Automated from v1.2 tables and fixed data releases",
          columns: ["Criteria", "Source"],
          rows: [
            ["BA1, BS1, PM2", "gnomAD v2.1.1 and v3.1.2 non-cancer, Appendix G populations, coverage and QC checks, founder-variant exclusion"],
            ["PVS1, PM5 PTC", "Table 4. PVS1 RNA from exact ERepo assertions and eligible ST2 records"],
            ["PS3, BS3", "Table 9"],
            ["PP3, BP4, BP7, BP1", "Local SpliceAI with the Appendix J profile, BayesDel, functional domains"],
            ["PS1 protein", "ST7 P/LP references"],
            ["PP4, BP5", "Variant-specific combined LR"]
          ]
        }
      ],
      right: [
        {
          type: "list",
          heading: "Through structured expert review",
          items: [
            "PS4, PM3, PP1, BS2, BS4",
            "PS3 and BS3 outside Table 9",
            "PVS1 RNA and BP7 RNA",
            "Initiation-codon PVS1",
            "PS1 splicing"
          ]
        },
        {
          type: "callout",
          heading: "Strength",
          text: "For reviewed evidence the reviewer enters the facts and ARIANE derives the strength from the v1.2 thresholds. The strength cannot be typed in."
        }
      ],
      notes: [
        "SpliceAI runs as our own service from one specific container image, identified by its digest and checked against reference scores. The public endpoint is not used.",
        "Every criterion of the specification is covered either by an automated branch or by a review form; nothing is left without a defined path."
      ]
    },

    {
      id: "levels",
      kicker: "Slide 4",
      title: "Three levels of automation",
      layout: "wide",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Automatic: criteria decided from bioinformatic tools and the curated tables. Semi-automatic: a review form with the known facts filled in. Manual: facts from publications, families and cohorts, entered by the expert."
          ]
        },
        {
          type: "cards",
          items: [
            {
              label: "Automatic",
              title: "Bioinformatic tools and curated tables",
              variant: "",
              items: [
                "BA1, BS1, PM2 from gnomAD",
                "PVS1 and PM5 PTC from Table 4",
                "PS3 and BS3 from Table 9",
                "PVS1 RNA from exact ERepo assertions and eligible ST2 records",
                "PP3, BP4, BP7, BP1 from SpliceAI, BayesDel and domains",
                "PS1 protein from ST7, PP4 and BP5 from the combined LR"
              ],
              result: "Criterion, strength, reason and source in the result."
            },
            {
              label: "Semi-automatic",
              title: "Prefilled form",
              variant: "",
              items: [
                "PVS1 RNA: the exact ST2 RNA record prefills the form",
                "Initiation-codon PVS1: variant, transcript and SpliceAI context prefilled",
                "PS1 splicing: reference variant checks and SpliceAI scores prefilled",
                "BP7 RNA: variant type, domain location and Table 9 status checked by ARIANE"
              ],
              result: "Strength derived by ARIANE from the v1.2 flowchart or thresholds."
            },
            {
              label: "Manual",
              title: "Facts from publications, families and cohorts",
              variant: "",
              items: [
                "PS4: cases, controls, p-value, OR, confidence interval, matching",
                "PM3 and BS2: co-occurring variant, phase, phenotype, points",
                "PP1 and BS4: co-segregation LR and its components",
                "PS3 and BS3 outside Table 9: assay, calibration, result",
                "PP4 and BP5 from a reviewed source other than the clinical LR track"
              ],
              result: "Strength derived by ARIANE. No manual override."
            }
          ]
        }
      ],
      notes: [
        "The same criterion can sit at two levels depending on the source: PS3 from Table 9 is automatic, PS3 from a new publication goes through the manual form.",
        "In every case the automated classification is kept. The expert's input produces a separate amended result with reviewer, date, notes and references."
      ]
    },

    {
      id: "example",
      kicker: "Slide 5",
      title: "Presentation of the ARIANE application",
      layout: "wide",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "One variant per level, shown in the application: the automated path, a prefilled form and a form filled by the expert."
          ]
        },
        {
          type: "cards",
          items: [
            {
              label: "Automatic",
              title: "Deterministic path",
              variant: "BRCA1 c.509G>A p.(Arg170Gln)",
              items: [
                "BS1 Supporting from gnomAD FAF95",
                "BS3 Strong from Table 9",
                "BP5 Strong from the combined LR",
                "BP1 Strong: outside functional domain, SpliceAI below 0.1"
              ],
              result: "Class 1. No manual input."
            },
            {
              label: "Semi-automatic",
              title: "Prefilled form",
              variant: "BRCA2 c.1A>G p.(Met1?)",
              items: [
                "Automated result: PM2 Supporting, Class 3",
                "Initiation codon recognized, PVS1 initiation-codon form opened",
                "Variant identity, transcript and SpliceAI context prefilled",
                "Reviewer completes the alternative start analysis"
              ],
              result: "Strength derived by ARIANE from the v1.2 flowchart."
            },
            {
              label: "Manual",
              title: "Evidence entered by the expert",
              variant: "Same variant, PP1 form",
              items: [
                "Reviewer enters the co-segregation LR and its components",
                "Supporting at LR 2.08, Moderate at 4.3, Strong at 18.7",
                "Very Strong at 350 only with a demonstrated splicing or protein effect",
                "Independence of components confirmed by the reviewer"
              ],
              result: "Strength derived by ARIANE. No manual override."
            }
          ]
        },
        {
          type: "paragraphs",
          items: [
            "The original automated classification is kept. The amended result records reviewer, date, notes and references and can be exported as JSON."
          ]
        }
      ],
      notes: [
        "The first variant shows that the whole path can be deterministic when every source is a fixed table or dataset.",
        "The second shows what prefilling means: the known facts from the variant and the data releases are filled in; the expert adds the conclusion.",
        "The third shows that the strength is derived by the backend from v1.2 thresholds in every case. A reviewer cannot set the strength directly.",
        "Alternative for the prefilled form: BRCA1 c.5074G>A, where PS3 Strong comes from Table 9 and the exact ST2 RNA record prefills the PVS1 RNA form. This variant touches the open question of PS3 together with PVS1 RNA.",
        "Prepared answer if asked how ARIANE handles PS3 together with PVS1 RNA for c.5074G>A: Table 9 assigns PS3 Strong from Findlay et al., where the assay measured loss of BRCA1 cellular function. ST2 holds a separate RNA result for the same variant. ARIANE applies PS3 Strong automatically because it is an explicit Table 9 record. The ST2 record only prefills the PVS1 RNA form. No PVS1 RNA points are assigned automatically.",
        "If the reviewer accepts PVS1 RNA alongside PS3, ARIANE keeps both criteria and shows a warning about assay scope, functional result and independence of the evidence. The review also compares the Table 9 PMID with the ST3 publication PMIDs and flags a PMID that appears in both roles. For BRCA2 c.7976G>A this flags PMID 33293522; the PVS1 RNA prefill then points to three other ST3 publications.",
        "The question whether both codes may be counted when one assay covers both mechanisms has been discussed with Jana Soukupová and is being passed to the VCEP. Her view: PVS1 RNA is for mRNA evidence only, PS3 stays when a further assay shows a functional effect beyond splicing. Until the VCEP answers, ARIANE follows the literal v1.2 text and flags the case for review."
      ]
    },

    {
      id: "provenance",
      kicker: "Slide 6",
      title: "Every classification has its provenance",
      layout: "standard",
      left: [
        {
          type: "list",
          heading: "Each result records",
          items: [
            "Application version, VCEP policy version and reference transcript",
            "Classifier fingerprint",
            "Normalized variant",
            "Reason and source for each criterion: the table row, the record, the score and the data release",
            "Reviewer identity, date, notes and references for amended results"
          ]
        }
      ],
      right: [
        {
          type: "list",
          heading: "What that gives",
          items: [
            "A result can be reproduced later from its recorded inputs",
            "Two results for the same variant can be compared criterion by criterion",
            "A changed source or specification shows up as a changed input in the record, so a change of class can be traced to it",
            "An amended result keeps the original automated result next to it"
          ]
        },
        {
          type: "callout",
          heading: "Unavailable sources",
          text: "If an external source is unavailable, ARIANE uses the last approved checksum-validated snapshot. Incomplete or corrupted ENIGMA tables stop the application from starting."
        }
      ],
      notes: [
        "Provenance is what makes validation possible: for every disagreement we can show which input led to the decision."
      ]
    },

    {
      id: "updates",
      kicker: "Slide 7",
      title: "System for updates of criteria and sources",
      layout: "standard",
      left: [
        {
          type: "list",
          heading: "What is monitored",
          items: [
            "CSpec: new versions of the VCEP specification, weekly",
            "ClinGen ERepo: new and changed assessments, weekly",
            "UCSC ENIGMA clinical LR track, monthly",
            "gnomAD releases, monthly",
            "SpliceAI profile and model image, reference bundle and curated registries: reviewed on a defined trigger"
          ]
        },
        {
          type: "callout",
          heading: "Example: clinical LR track, August 2026",
          text: "The track released a new version on 18 August 2026 in which the case-control component changed from the Parsons iCOGS data to Zanti 2025. Monitoring reported the changed checksum; the new release was diffed against the active one variant by variant, passed the regression tests and was approved and activated on 1 September."
        }
      ],
      right: [
        {
          type: "flow",
          heading: "How a new release enters ARIANE",
          items: [
            "Read-only monitoring reports a changed source",
            "Candidate release stored outside production",
            "Record-level and criterion-level diff against the active snapshot",
            "Regression tests over the variant matrix",
            "Expert approval, then activation in one versioned step"
          ]
        }
      ],
      notes: [
        "A new specification version becomes a new policy package; the old one stays available, so a result can always be read against the version it was produced with.",
        "A newer release is not automatically a suitable one. A different gnomAD major release has different cohorts, coverage and schema and is a separate validation step."
      ]
    },

    {
      id: "architecture",
      kicker: "Slide 8",
      title: "Architecture of the engine",
      layout: "standard",
      left: [
        {
          type: "list",
          heading: "Components",
          items: [
            "Variant processing: HGVS normalization and reference checks against a fixed transcript bundle (cdot, transcript and protein sequences)",
            "Evidence sources: gnomAD snapshots, local SpliceAI service, ENIGMA tables, ERepo registries, clinical LR track; each one a fixed release verified by its checksum",
            "Classification graph: one node per criterion branch with reason, source and an explicit state when evidence is unavailable",
            "Policy package: the gene's specification version, transcript, thresholds, domains and do-not-use rules, loaded at start",
            "Manual review service: forms, backend-derived strength, amended results stored next to the automated ones",
            "Source monitoring and release process; about 700 automated tests in continuous integration"
          ]
        }
      ],
      right: [
        {
          type: "flow",
          heading: "One classification request",
          items: [
            "Normalize the variant",
            "Collect evidence from the fixed data releases",
            "Evaluate the applicable v1.2 branches",
            "Assemble criteria, strengths, points, reasons, warnings and class",
            "Optional expert review through the forms",
            "Amended result with reviewer, date, notes and references"
          ]
        },
        {
          type: "keyValues",
          items: [
            { key: "Stack", value: "Python backend (FastAPI), web front end, versioned JSON API, batch processing" },
            { key: "Start-up", value: "Checksums of all data releases verified; a missing or corrupted required table stops the application" }
          ]
        }
      ],
      notes: [
        "The same engine serves the web interface, the API and batch, so the three cannot disagree.",
        "SpliceAI runs as our own service from one specific container image, identified by its digest and checked against reference scores."
      ]
    },

    {
      id: "genes",
      kicker: "Slide 9",
      title: "Ready for other genes",
      layout: "standard",
      left: [
        {
          type: "list",
          heading: "Shared",
          items: [
            "The engine, the review framework, the monitoring and the interfaces",
            "No BRCA setting is hard-coded; gene settings live in the policy package",
            "A gene without an approved policy package does not run"
          ]
        }
      ],
      right: [
        {
          type: "list",
          heading: "Per gene",
          items: [
            "The VCEP specification encoded as a policy package, including rule branches that differ from BRCA1/2",
            "Gene data: coordinates, gnomAD snapshot, SpliceAI profile, curated functional and RNA tables",
            "Regression matrix, validation set and expert approval"
          ]
        }
      ],
      notes: [
        "Most of the work for a new gene is in encoding the VCEP, curating data and validating.",
        "For a larger number of genes we would also build a local HGVS mapper with genomic sequences for both assemblies; the current reference bundle covers BRCA1/2 only."
      ]
    },

    {
      id: "validation",
      kicker: "Slide 10",
      title: "What we lack: a validation set",
      layout: "standard",
      left: [
        {
          type: "list",
          heading: "Independent validation set from ENIGMA",
          items: [
            "Expert-classified variants not used in the specification or as ARIANE inputs (ST7, ERepo records)",
            "Coverage of variant types, both directions and borderline VUS",
            "Per variant: gene, c. notation on the reference transcript, expert class, applied criteria with strengths, date and specification version"
          ]
        }
      ],
      right: [
        {
          type: "callout",
          heading: "What we do with it",
          text: "ARIANE classifies the variants through the batch API; we compare criteria, strengths, points and class with the expert result and go through the disagreements together with a curator."
        }
      ],
      notes: [
        "We can check that ARIANE reproduces ST7 and the ERepo records, but those are inputs to ARIANE, so agreement there proves little.",
        "We run the variants through the batch API and export a comparison table with class, points, criteria, agreement and ARIANE warnings per variant. We have used this format on the ENIGMA tutorial variants, so the tooling exists.",
        "ENIGMA receives the per-variant report of disagreements with our attribution. We would like to agree on the size and composition of the set and on who reviews the disagreements."
      ]
    },

    {
      id: "literature",
      kicker: "Slide 11",
      title: "Phase 2: evidence from structured sources and literature",
      layout: "literature",
      left: [
        {
          type: "table",
          heading: "Criteria that depend on published or unpublished observations",
          columns: ["Criteria", "Observations needed"],
          rows: [
            ["PS3, BS3", "Assay, calibration against VCEP-recognized controls, variant-specific result"],
            ["PVS1 RNA, BP7 RNA", "Patient RNA or minigene, allele-specific quantification, transcript consequence"],
            ["PS4", "Cases, controls, p-value, OR, confidence interval, population matching"],
            ["PM3, BS2", "Co-occurring P/LP variant, phase, phenotype, evidence points"],
            ["PP1, BS4", "Co-segregation LR per family, independence of components"]
          ]
        },
        {
          type: "callout",
          heading: "Access to full texts",
          text: "Of the 79 publications cited in ST3 and Table 9, 25 full texts are readable through open sources, 48 are available as an abstract only and 6 are not in PMC. The legal side (text and data mining under lawful access, licences for sending text to external services) is being settled with the library and does not block processing on our own hardware."
        }
      ],
      right: [
        {
          type: "list",
          heading: "Step 1: structured sources",
          items: [
            "MaveDB extends Table 9 with PS3 and BS3 results published later or not yet included in the specification.",
            "ARIANE stores the calibration, URN, version, PMID, OddsPath and who calibrated.",
            "The derived code stays switched off in the review form until the calibration of the whole dataset is approved.",
            "Individual LRs from publications are stored as components of one PP4/BP5 calculation, so no evidence is counted twice."
          ]
        },
        {
          type: "list",
          heading: "Step 2: literature",
          items: [
            "RNA, co-segregation, co-occurrence and case-control data, for which no complete structured source exists.",
            "Extraction is first verified on the publications used in ENIGMA curations, where the expected per-variant evidence is known.",
            "Then extended to further suitable studies from ClinVar, PubMed and their citations.",
            "Output: prefilled review forms with citations and provenance. The final decision stays with the expert."
          ]
        }
      ],
      notes: [
        "The record schema comes from the ARIANE review forms: they define the fields each criterion requires. Phase 2 fills candidate records in those fields.",
        "Approved records become a versioned registry, in the same way the ERepo RNA registry is used today. The live classifier does not use a language model.",
        "A separate deck describes the design in detail."
      ]
    },

    {
      id: "ask",
      kicker: "Slide 12",
      title: "What we ask from ENIGMA",
      layout: "standard",
      left: [
        {
          type: "numbered",
          items: [
            "An independent validation set and a curator to review the disagreements with us",
            "Answers to the specification questions collected during implementation"
          ]
        }
      ],
      right: [
        {
          type: "keyValues",
          heading: "Contact",
          items: [
            {
              key: "Application",
              value: "ariane-app.duckdns.org",
              href: "https://ariane-app.duckdns.org"
            },
            {
              key: "Presenter",
              valueHtml: "Kamila Clarová<small>kamila.clarova@uochb.cas.cz</small>"
            },
            {
              key: "Collaboration",
              value: "Zdeněk Kleibl, Jana Soukupová"
            }
          ]
        }
      ],
      notes: [
        "The validation set is the main request. ARIANE stays in beta without it."
      ]
    }
  ]
};
