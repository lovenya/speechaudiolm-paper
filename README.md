# Contextual Audio–Speech Co-Synthesis paper companion

The repository root is the static GitHub Pages site. `index.html` is its entry
point; the Dataset, G-Eval Audio, Model, Results, and Examples pages are plain
HTML, CSS, and JavaScript. The site has no runtime package or API dependency.

The listening workspace contains 100 shared clean-v2 test IDs and 700 WAV files.
Each of five direction/system combinations has a saved G-Eval Audio v6 judgment
with five criterion scores, feedback, and the rendered evaluation prompt. The
paper and evaluator results are still being revised, so the website labels its
current scores as a v6 snapshot. A `missing-data.json` receipt identifies text
intermediates and generated-output descriptions awaiting the authors' records.

The old 50-example duplicate site was preserved separately as a legacy artifact
before the 100-example release replaced the root. Git history retains the
previous root page. The source exporter and release validator are maintained in
the SALM-model training repository; generated audio and evaluation evidence are
copied into this publication repository only for the paper supplement.
