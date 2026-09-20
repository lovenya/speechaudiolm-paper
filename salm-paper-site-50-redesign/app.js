(() => {
  const data = window.PAPER_DATA;
  if (!data) return;

  const metricInfo = {
    geval_audio_plausibility: {name:'G-Eval Audio', short:'G-Eval', direction:'higher', definition:'Listening-based cross-modal plausibility and quality score (1–5).'},
    fad: {name:'Fréchet Audio Distance (FAD)', short:'FAD', direction:'lower', definition:'Corpus-level distance between reference and generated audio distributions.'},
    kad: {name:'Kernel Audio Distance (KAD)', short:'KAD', direction:'lower', definition:'Distribution-free corpus distance computed with KADTK.'},
    inception_score: {name:'Inception Score', short:'IS', direction:'higher', definition:'Corpus-level PANNs score for quality and diversity.'},
    kl_passt: {name:'KL PaSST', short:'KL PaSST', direction:'lower', definition:'Corpus-level divergence using PaSST audio representations.'},
    target_caption_clap_score: {name:'Target-caption CLAPScore', short:'CLAPScore', direction:'higher', definition:'Similarity between generated audio and the paired target caption.'},
    utmos: {name:'UTMOS', short:'UTMOS', direction:'higher', definition:'Non-intrusive prediction of generated-speech naturalness.'},
    dnsmos: {name:'DNSMOS', short:'DNSMOS', direction:'higher', definition:'Non-intrusive generated-speech perceptual quality score.'}
  };
  const orders = {s2a:['geval_audio_plausibility','fad','kad','inception_score','kl_passt','target_caption_clap_score'],a2s:['geval_audio_plausibility','utmos','dnsmos']};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const format = value => value == null ? '—' : (Math.abs(value) >= 10 ? value.toFixed(2) : value.toFixed(3));

  function coverage(system, metric, testCount) {
    const n = system.counts?.[metric];
    if (!n) return '';
    const attempted = system.attempted?.[metric] || testCount;
    return n === attempted ? `n = ${n.toLocaleString()}` : `n = ${n.toLocaleString()} of ${attempted.toLocaleString()}`;
  }
  function resultsMarkup(direction) {
    const block=data.benchmarks[direction], systems=block.systems;
    const rows=orders[direction].map(metric => {
      const info=metricInfo[metric], vals=systems.map(s=>s.scores[metric]).filter(Number.isFinite);
      const best=info.direction==='higher'?Math.max(...vals):Math.min(...vals);
      return `<tr><th><span class="metric-name">${info.name}<span class="metric-direction">${info.direction==='higher'?'↑ higher':'↓ lower'} is better</span></span><span class="metric-definition">${info.definition}</span></th>${systems.map(system=>{const value=system.scores[metric], isBest=Number.isFinite(value)&&value===best;return `<td class="result-cell ${isBest?'best':''}"><span class="result-number">${format(value)}</span>${isBest?'<span class="best-label">Best</span>':''}<span class="coverage">${coverage(system,metric,block.testCount)}</span></td>`}).join('')}</tr>`;
    }).join('');
    return `<table><thead><tr><th>Metric</th>${systems.map(s=>`<th>${esc(s.name)}<span class="coverage">${esc(s.detail)}</span></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="table-scope"><strong>Evaluation scope:</strong> ${block.testCount.toLocaleString()} ${esc(block.directionName)} clean-v2 test pairs. ${esc(block.note)}</div>`;
  }
  function renderResults(container, direction) { container.dataset.resultsTable=direction; container.innerHTML=resultsMarkup(direction); }
  document.querySelectorAll('[data-results-table]').forEach(el=>renderResults(el,el.dataset.resultsTable));
  document.querySelectorAll('[data-table-switch]').forEach(button=>button.addEventListener('click',()=>{const direction=button.dataset.tableSwitch;document.querySelectorAll('[data-table-switch]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));const table=document.querySelector('[data-results-table]');if(table)renderResults(table,direction)}));
  document.querySelectorAll('[data-metric-notes]').forEach(el=>{el.innerHTML=orders[el.dataset.metricNotes].map(metric=>`<article class="metric-note"><h3>${metricInfo[metric].name}</h3><p>${metricInfo[metric].definition} <strong>${metricInfo[metric].direction==='higher'?'Higher':'Lower'} is better.</strong></p></article>`).join('')});

  const gevalTable=document.querySelector('[data-geval-table]');
  if(gevalTable){
    const rows=['a2s','s2a'].map(direction=>{const b=data.benchmarks[direction], ours=b.systems[0], cascade=b.systems[1];return `<tr><th><span class="metric-name">${direction==='a2s'?'Audio → Speech':'Speech → Audio'}</span><span class="metric-definition">Full clean-v2 test set</span></th>${[ours,cascade].map((s,i)=>`<td class="result-cell ${s.scores.geval_audio_plausibility>=(i?ours:cascade).scores.geval_audio_plausibility?'best':''}"><span class="result-number">${format(s.scores.geval_audio_plausibility)}</span><span class="coverage">${coverage(s,'geval_audio_plausibility',b.testCount)}</span></td>`).join('')}</tr>`}).join('');
    gevalTable.innerHTML=`<table><thead><tr><th>Direction</th><th>SpeechAudioLM</th><th>Text cascade</th></tr></thead><tbody>${rows}</tbody></table><div class="table-scope">Scores range from 1 to 5; higher is better. Version: <code>${esc(data.geval.promptVersion)}</code>.</div>`;
  }
  const criteria=document.querySelector('#criteria-list');
  if(criteria) criteria.innerHTML=Object.entries(data.geval.criteria).map(([name,description])=>`<article class="criterion-card"><h3>${esc(name.replaceAll('_',' '))}</h3><p>${esc(description)}</p></article>`).join('');

  document.querySelectorAll('[data-copy-citation]').forEach(button=>button.addEventListener('click',async()=>{await navigator.clipboard.writeText('@article{speechaudiolm2026, title={SpeechAudioLM}, year={2026}}');button.textContent='Copied';setTimeout(()=>button.textContent='Copy BibTeX',1400)}));

  const list=document.querySelector('#example-list');
  if(!list) return;
  let exampleDirection=new URLSearchParams(location.search).get('direction')==='s2a'?'s2a':'a2s', shown=10;
  const metricNames={utmos:'UTMOS',dnsmos:'DNSMOS',target_caption_clap_score:'CLAPScore'};
  function player(label,src){return `<div class="audio-player"><label>${esc(label)}</label><audio controls preload="none" src="${esc(src)}"><a href="${esc(src)}">Open WAV</a></audio></div>`}
  function extraScores(sample,system){const values=sample.scores?.[exampleDirection]?.[system]||{};return Object.entries(values).map(([name,value])=>`<div class="sample-metric"><strong>${format(value)}</strong><span>${metricNames[name]||esc(name)}</span></div>`).join('')}
  function judgmentDetails(judgment){
    if(!judgment)return '<p class="corpus-reminder">No individual G-Eval judgment is available for this output.</p>';
    const criteria=Object.entries(judgment.criteria||{}).map(([name,item])=>`<div class="criterion-row"><div class="criterion-score"><span>${esc(name.replaceAll('_',' '))}</span><b>${esc(item.score)} / 5</b></div><p>${esc(item.feedback)}</p>${item.prompt?`<details><summary>Show exact v6 prompt</summary><pre class="raw-prompt">${esc(item.prompt)}</pre></details>`:''}</div>`).join('');
    return `<details class="judgment-details"><summary>Criterion scores, feedback, and exact prompts</summary>${criteria}</details>`;
  }
  function outputCard(sample,system,label,src,judgment){const cls=system==='ours'?'ours':'cascade';return `<article class="output-card ${cls}"><div class="output-head"><div><span class="system-tag">${system==='ours'?'Direct model':'Text-mediated baseline'}</span><h4>${esc(label)}</h4></div><div class="score-badge"><strong>${judgment?format(judgment.score):'—'}</strong><span>G-Eval / 5</span></div></div>${player('Generated output',src)}<div class="sample-metrics">${extraScores(sample,system)}</div><p class="corpus-reminder">FAD, KAD, Inception Score, and KL PaSST are corpus metrics; see the Results page.</p>${judgmentDetails(judgment)}</article>`}
  function card(sample,index){
    const a2s=exampleDirection==='a2s', files=sample.files, judgments=sample.judgments?.[exampleDirection]||{};
    const inputSrc=a2s?files.reference_audio:files.reference_speech, inputLabel=a2s?'Input environmental audio':'Input speech audio';
    const inputText=a2s?sample.audio_caption:sample.speech_text, textLabel=a2s?'Audio caption (shown for human understanding)':'Input speech transcript';
    const refSrc=a2s?files.reference_speech:files.reference_audio, refLabel=a2s?'Paired reference speech':'Paired reference environmental audio';
    const refText=a2s?sample.speech_text:sample.audio_caption, refTextLabel=a2s?'Reference transcript':'Reference audio caption';
    const ours=a2s?(files.a2s_model_b||files.a2s_model_a):files.s2a_ours, cascade=a2s?files.a2s_cascaded:files.s2a_cascaded;
    return `<article class="example-card"><header class="example-heading"><span class="example-number">${String(index+1).padStart(2,'0')}</span><div><h2>${esc(a2s?sample.audio_caption:sample.speech_text)}</h2><p>${esc(sample.sample_id)} · ${esc(sample.scene_group.replaceAll('_',' '))} · ${esc(sample.speaker_gender)} · ${esc(sample.speaker_emotion)}</p></div></header><section class="context-block"><p class="context-title">Model input</p><div class="context-grid">${player(inputLabel,inputSrc)}<div class="context-copy"><strong>${textLabel}</strong>${esc(inputText)}</div></div></section><section class="context-block"><p class="context-title">Paired ground truth / reference</p><div class="context-grid">${player(refLabel,refSrc)}<div class="context-copy"><strong>${refTextLabel}</strong>${esc(refText)}</div></div></section><section class="outputs"><h3>Generated outputs</h3><div class="output-grid">${outputCard(sample,'ours','SpeechAudioLM',ours,judgments.ours)}${outputCard(sample,'cascade','Cascade',cascade,judgments.cascade)}</div></section></article>`;
  }
  const scenes=[...new Set(data.samples.map(s=>s.scene_group))].sort(), sceneFilter=document.querySelector('#scene-filter'), search=document.querySelector('#search');
  sceneFilter.insertAdjacentHTML('beforeend',scenes.map(s=>`<option value="${esc(s)}">${esc(s.replaceAll('_',' '))}</option>`).join(''));
  function filtered(){const q=search.value.trim().toLowerCase(),scene=sceneFilter.value;return data.samples.filter(s=>(!scene||s.scene_group===scene)&&(!q||[s.sample_id,s.audio_caption,s.speech_text].join(' ').toLowerCase().includes(q)))}
  function renderExamples(reset=false){if(reset)shown=10;const samples=filtered(),visible=samples.slice(0,shown);list.innerHTML=visible.length?visible.map(card).join(''):'<p class="empty">No examples match those filters.</p>';document.querySelector('#example-count').textContent=`Showing ${visible.length} of ${samples.length} examples`;document.querySelector('#load-more').hidden=shown>=samples.length;document.querySelectorAll('audio').forEach(audio=>audio.addEventListener('play',()=>document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause()})))}
  document.querySelectorAll('[data-example-direction]').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.exampleDirection===exampleDirection));button.addEventListener('click',()=>{exampleDirection=button.dataset.exampleDirection;document.querySelectorAll('[data-example-direction]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));history.replaceState(null,'',`?direction=${exampleDirection}`);renderExamples(true)})});
  search.addEventListener('input',()=>renderExamples(true));sceneFilter.addEventListener('change',()=>renderExamples(true));document.querySelector('#load-more').addEventListener('click',()=>{shown+=10;renderExamples()});document.querySelector('#pause-all').addEventListener('click',()=>document.querySelectorAll('audio').forEach(a=>a.pause()));renderExamples();
})();
