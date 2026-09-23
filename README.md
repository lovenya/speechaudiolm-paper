# Contextual Audio–Speech Co-Synthesis paper companion

The repository root is the static GitHub Pages site at
`https://lovenya.github.io/speechaudiolm-paper/`. `index.html` is the paper-title
entry point; Dataset, G-Eval Audio, Model, Results, and Examples are linked from
its navigation. The site has no runtime API, packages, or remote assets.

The Dataset page describes candidate construction and direction-specific
cleaning, including the Qwen3-Omni-30B-A3B-Instruct G-Eval judge. The Examples
workspace contains 100 common clean-v2 test IDs and 700 original WAV files.
Each example shows paired reference recordings and text, then opens speaker
labels and the saved pairing rationale under one Dataset metadata disclosure.
Scene-group browsing is omitted because that field is not in the source
manifest.

Generated systems are compared side by side on wide screens. Each output has a
compact block for all five G-Eval Audio v6 criterion scores. Open a score to
read its feedback, then expand the saved evaluation prompt. The Results page
presents full-test objective metrics without repeating per-system coverage
counts. The G-Eval page includes full-test criterion means, a matched/mismatched
diagnostic, and highest-/lowest-scoring listening examples for each criterion.
The Model architecture page is reserved for later content.

The old 50-example site was preserved as a legacy artifact before this release.
The exporter, data checks and source templates live in the SALM-model repository;
this publication repository contains the built site and media required by
GitHub Pages.
