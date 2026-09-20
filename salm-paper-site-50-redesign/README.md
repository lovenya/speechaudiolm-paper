# SpeechAudioLM paper website

Static, framework-free site intended for GitHub Pages. `index.html`, `style.css`,
and `app.js` are the maintained source. `site-data.js` is a tiny development
fixture; the release builder replaces it with joined evaluation data and copies
the selected browser-compatible WAV files.

Build a 50-example release outside Git:

```bash
uv run --no-project python scripts/build_paper_website.py \
  --examples 50 \
  --output /scratch/lovenya/salm_model_outputs/paper_website_50
```

Preview it from the repository root:

```bash
uv run --no-project python -m http.server 8000 \
  --directory /scratch/lovenya/salm_model_outputs/paper_website_50
```

Then open `http://localhost:8000`. The exported directory is self-contained and
can become the root of a dedicated GitHub Pages repository. Keep it outside this
training repository because it contains hundreds of megabytes of audio.

The builder deliberately keeps corpus-only metrics (FAD, KAD, Inception Score,
and KL PaSST) out of individual example cards. G-Eval Audio and other sample-level
metrics may appear per example. Aggregate rows always come from the full clean-v2
test sets: 2,197 A2S pairs and 1,878 S2A pairs.
