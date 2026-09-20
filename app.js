(() => {
  const data = window.PAPER_DATA;
  if (!data) return;

  const labels = {
    geval_audio_plausibility: 'G-Eval Audio ↑', fad: 'FAD ↓', kad: 'KAD ↓',
    inception_score: 'Inception ↑', kl_passt: 'KL PaSST ↓', target_caption_clap_score: 'CLAPScore ↑',
    utmos: 'UTMOS ↑', dnsmos: 'DNSMOS ↑'
  };
  const descriptions = {
    geval_audio_plausibility: 'Listening-capable judge; mean weighted score on a 1–5 scale.',
    fad: 'Corpus-level Fréchet Audio Distance; lower is better.', kad: 'Corpus-level Kernel Audio Distance; lower is better.',
    inception_score: 'Corpus-level PANNs Inception Score; higher is better.', kl_passt: 'Corpus-level PaSST KL divergence; lower is better.',
    target_caption_clap_score: 'Mean audio–target-caption similarity; higher is better.', utmos: 'Mean predicted speech naturalness; higher is better.',
    dnsmos: 'Mean non-intrusive speech quality; higher is better.'
  };
  const metricOrder = {s2a:['geval_audio_plausibility','fad','kad','inception_score','kl_passt','target_caption_clap_score'],a2s:['geval_audio_plausibility','utmos','dnsmos']};
  let resultDirection = 's2a', exampleDirection = 'a2s', shown = 10;

  function fmt(value) {
    if (value == null) return '—';
    return Math.abs(value) >= 10 ? value.toFixed(2) : value.toFixed(3);
  }
  function renderResults() {
    const block = data.benchmarks[resultDirection], metrics = metricOrder[resultDirection];
    document.querySelector('#metric-head').innerHTML = `<tr><th>System</th>${metrics.map(m=>`<th title="${descriptions[m]}">${labels[m]}<span class="metric-scope">${block.metrics[m]?.scope || ''}</span></th>`).join('')}</tr>`;
    document.querySelector('#metric-body').innerHTML = block.systems.map(system => `<tr><th>${system.name}<span class="metric-scope">${system.detail}</span></th>${metrics.map(metric => {
      const v=system.scores[metric], available=typeof v==='number';
      const values=block.systems.map(s=>s.scores[metric]).filter(x=>typeof x==='number');
      const higher=!['fad','kad','kl_passt'].includes(metric), best=available && v === (higher?Math.max(...values):Math.min(...values));
      const n=system.counts?.[metric], attempted=system.attempted?.[metric];
      const coverage=n ? `n=${n.toLocaleString()}${attempted&&attempted!==n?` of ${attempted.toLocaleString()}`:''}` : '';
      return `<td class="metric-value ${best?'best':''}" title="${coverage}">${fmt(v)}${coverage?`<span class="metric-scope">${coverage}</span>`:''}</td>`;
    }).join('')}</tr>`).join('');
    document.querySelector('#metric-note').textContent = `${block.testCount.toLocaleString()} ${block.directionName} test pairs. ${block.note}`;
  }
  document.querySelectorAll('[data-result-direction]').forEach(button => button.addEventListener('click', () => {
    resultDirection=button.dataset.resultDirection;
    document.querySelectorAll('[data-result-direction]').forEach(b=>b.setAttribute('aria-selected',String(b===button))); renderResults();
  }));

  function track(label, src, cls='') {
    return `<div class="track ${cls}"><label>${label}</label><audio controls preload="none" src="${src}"><a href="${src}">Open WAV</a></audio></div>`;
  }
  function scorePanel(system, judgment) {
    if (!judgment) return `<div class="panel"><h4>${system}</h4><p>No per-example judgment is available.</p></div>`;
    const criteria=Object.entries(judgment.criteria||{}).map(([key,c])=>`<div class="score-row"><span>${key.replaceAll('_',' ')}</span><b>${c.score}/5</b></div><details class="feedback"><summary>Judge feedback</summary><p>${c.feedback}</p></details>${c.prompt?`<details class="feedback"><summary>Exact v6 prompt for this criterion</summary><div class="raw">${c.prompt}</div></details>`:''}`).join('');
    return `<div class="panel"><h4>${system} · G-Eval ${fmt(judgment.score)} / 5</h4>${criteria}<details class="feedback"><summary>Raw evaluator context</summary><div class="raw">${judgment.rawContext||'Prompt version: '+(data.geval.promptVersion||'not recorded')}</div></details></div>`;
  }
  function exampleCard(sample, index) {
    const isA2S=exampleDirection==='a2s';
    const input=isA2S?sample.files.reference_audio:sample.files.reference_speech;
    const reference=isA2S?sample.files.reference_speech:sample.files.reference_audio;
    const ours=isA2S?(sample.files.a2s_model_b||sample.files.a2s_model_a):sample.files.s2a_ours;
    const cascade=isA2S?sample.files.a2s_cascaded:sample.files.s2a_cascaded;
    const judgments=sample.judgments?.[exampleDirection]||{};
    const intermediate=sample.cascade?.[exampleDirection]?.intermediate_text;
    const prompt=sample.cascade?.[exampleDirection]?.prompt;
    return `<article class="example" id="sample-${sample.sample_id}"><div class="example-main"><div class="example-index">${String(index+1).padStart(2,'0')}</div><div class="example-title"><h3>${sample.audio_caption}</h3><p>${sample.sample_id} · ${sample.scene_group.replaceAll('_',' ')}</p></div><div class="tracks">${track('Input',input)}${track('Ours',ours,'ours')}${track('Cascade',cascade,'cascade')}</div></div><details class="example-details"><summary>View transcript, scores & judge feedback</summary><div class="deep-grid"><div class="panel"><h4>Paired reference</h4><p>${sample.speech_text}</p>${track('Reference',reference)}<h4 style="margin-top:18px">Cascade intermediate text</h4><p>${intermediate||'Intermediate text was not preserved in the transferred presentation bundle.'}</p><details class="feedback"><summary>Generation prompt</summary><div class="raw">${prompt||'See the paper appendix / release artifact for the exact cascade template.'}</div></details></div>${scorePanel('Ours',judgments.ours)}${scorePanel('Cascade',judgments.cascade)}</div></details></article>`;
  }
  function filteredSamples() {
    const q=document.querySelector('#search').value.trim().toLowerCase(), scene=document.querySelector('#scene-filter').value;
    return data.samples.filter(s=>(!scene||s.scene_group===scene) && (!q||[s.sample_id,s.audio_caption,s.speech_text].join(' ').toLowerCase().includes(q)));
  }
  function renderExamples(reset=false) {
    if(reset) shown=10;
    const samples=filteredSamples(), visible=samples.slice(0,shown);
    document.querySelector('#example-list').innerHTML=visible.map(exampleCard).join('');
    document.querySelector('#example-count').textContent=`Showing ${visible.length} of ${samples.length} published examples`;
    const more=document.querySelector('#load-more'); more.hidden=shown>=samples.length;
    document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(other=>{if(other!==a)other.pause()})));
  }
  const scenes=[...new Set(data.samples.map(s=>s.scene_group))].sort();
  document.querySelector('#scene-filter').insertAdjacentHTML('beforeend',scenes.map(s=>`<option value="${s}">${s.replaceAll('_',' ')}</option>`).join(''));
  document.querySelectorAll('[data-example-direction]').forEach(button=>button.addEventListener('click',()=>{exampleDirection=button.dataset.exampleDirection;document.querySelectorAll('[data-example-direction]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));renderExamples(true)}));
  document.querySelector('#search').addEventListener('input',()=>renderExamples(true)); document.querySelector('#scene-filter').addEventListener('change',()=>renderExamples(true));
  document.querySelector('#load-more').addEventListener('click',()=>{shown+=10;renderExamples()}); document.querySelector('#pause-all').addEventListener('click',()=>document.querySelectorAll('audio').forEach(a=>a.pause()));
  document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();document.querySelector('#search').focus()}});

  const dialog=document.querySelector('#method-dialog');
  document.querySelector('#criteria-description').innerHTML=Object.entries(data.geval.criteria).map(([name,text])=>`<div class="criteria-item"><b>${name.replaceAll('_',' ')}</b><span>${text}</span></div>`).join('');
  document.querySelector('[data-open-method]').addEventListener('click',()=>dialog.showModal()); document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  document.querySelector('#copy-citation').addEventListener('click',async e=>{await navigator.clipboard.writeText(e.currentTarget.dataset.citation);e.currentTarget.textContent='Copied';setTimeout(()=>e.currentTarget.textContent='Copy BibTeX',1500)});
  renderResults(); renderExamples();
})();
