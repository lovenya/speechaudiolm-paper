# Contextual Audio–Speech Co-Synthesis paper companion

The repository root is the static GitHub Pages site at
`https://lovenya.github.io/speechaudiolm-paper/`. `index.html` is the paper-title
entry point; Dataset, G-Eval Audio, Model, Results, and Examples are linked from
its navigation. The site has no runtime API, packages, or remote assets.

The listening workspace contains 100 common clean-v2 test IDs and 700 original
WAV files. Each example shows paired reference recordings and text, the saved
dataset rationale, speaker metadata, and vertically arranged system outputs.
Each of five direction/system combinations has a saved G-Eval Audio v6 judgment
with five visible criterion scores. Open a criterion for written feedback and
then its exact saved evaluation prompt.

The G-Eval page shows full-test criterion means for every system and both
directions, a 120-pair matched/mismatched diagnostic for each direction, and
highest-/lowest-scoring listening examples for every criterion. The current v6
numbers are a consistent snapshot; the paper's revised prompts and final
numbers will replace them together. Objective metrics are on the Results page.
`missing-data.json` identifies cascade intermediates and generated-output
transcripts/captions awaiting author-supplied records. The Model architecture
page is intentionally reserved for later content.

The old 50-example site was preserved as a legacy artifact before this release.
The exporter, data checks and source templates live in the SALM-model repository;
this publication repository contains only the built site and media required by
GitHub Pages.
