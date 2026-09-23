  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var HEADLINES = {
    a:"See where your flat's money actually goes.",
    b:"Know when money gets tight, before it does.",
    c:"Flatting shouldn't mean one person carries all the risk."
  };
  var v=(new URLSearchParams(location.search).get('v')||'c').toLowerCase();
  if(!HEADLINES[v])v='c';
  document.getElementById('headline').textContent=HEADLINES[v];
  document.querySelectorAll('.vf').forEach(function(el){el.value=v;});

  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.12});
  document.querySelectorAll('.rise').forEach(function(el){io.observe(el);});

  function countUp(el,dur){
    var to=parseFloat(el.dataset.to),suf=el.dataset.suf||"",pre=el.dataset.pre||"",dec=(to%1!==0)?1:0,t0=null;
    dur=dur||3000;
    function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1);var e=1-Math.pow(1-p,3);
      el.textContent=pre+(to*e).toFixed(dec)+suf; if(p<1)requestAnimationFrame(step); else el.textContent=pre+to.toFixed(dec)+suf;}
    requestAnimationFrame(step);
  }
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
    var el=e.target;
    if(reduce){ el.textContent=(el.dataset.pre||"")+el.dataset.to+(el.dataset.suf||""); }
    else{
      var delay=parseInt(el.dataset.delay||"0",10);
      setTimeout(function(){ countUp(el,3000); }, delay);
    }
    cio.unobserve(el);}});},{threshold:0.15});
  document.querySelectorAll('.count').forEach(function(el){cio.observe(el);});

  var scrs=document.querySelectorAll('#deck .scr'),dns=document.querySelectorAll('#dotsNav .dn'),tabs=document.querySelectorAll('#tabbar .tab'),cur=0,timer=null;
  function go(n){cur=n;scrs.forEach(function(s,i){s.classList.toggle('on',i===n);});dns.forEach(function(d,i){d.classList.toggle('on',i===n);});tabs.forEach(function(t,i){t.classList.toggle('act',i===n);});}
  function loop(){timer=setInterval(function(){go((cur+1)%scrs.length);},2800);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  dns.forEach(function(d,i){d.addEventListener('click',function(){stop();go(i);loop();});});
  if(!reduce){var st=false;var pio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!st){st=true;loop();}});},{threshold:0.3});pio.observe(document.getElementById('phone'));}

  document.querySelectorAll('#fcbars2 .bar').forEach(function(b){b.style.height='0%';});
  function flipScene(scene){
    if(scene.classList.contains('done'))return;
    scene.classList.add('done');
    var bars=scene.querySelectorAll('#fcbars2 .bar');
    if(bars.length){ bars.forEach(function(b,i){ setTimeout(function(){ b.style.height=b.dataset.h+'%'; }, reduce?0:500+90*i); }); }
  }
  var sceneIds=['scene1','scene2','scene3'];
  var sio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){ if(reduce){ e.target.classList.add('done'); e.target.querySelectorAll('#fcbars2 .bar').forEach(function(b){b.style.height=b.dataset.h+'%';}); }
      else{ setTimeout(function(){ flipScene(e.target); }, 700); }
      sio.unobserve(e.target); }
  });},{threshold:0.45});
  sceneIds.forEach(function(id){var el=document.getElementById(id);if(el)sio.observe(el);});

  var people=4,total=1800;
  var seg=document.getElementById('seg'),rng=document.getElementById('rng'),rngv=document.getElementById('rngv');
  var rt=document.getElementById('riskToday'),rn=document.getElementById('riskNest'),ft=document.getElementById('fillToday'),fn=document.getElementById('fillNest');
  function fmt(n){return '$'+Math.round(n).toLocaleString();}
  function animNum(el,to){var from=parseFloat((el.textContent||'0').replace(/[^0-9.]/g,''))||0,t0=null;if(reduce){el.textContent=fmt(to);return;}
    requestAnimationFrame(function a(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/450,1);el.textContent=fmt(from+(to-from)*p);if(p<1)requestAnimationFrame(a);});}
  function update(){
    var share=total/people;
    rngv.textContent=fmt(total)+' / month';
    animNum(rt,total); animNum(rn,share);
    ft.style.width='100%';
    fn.style.width=Math.max(8,(share/total*100))+'%';
  }
  seg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;seg.querySelectorAll('button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');people=+b.dataset.n;update();});
  rng.addEventListener('input',function(){total=+rng.value;update();});
  var rvis=false;var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!rvis){rvis=true;update();}});},{threshold:0.35});
  rio.observe(document.getElementById('risk'));

  var gArc=document.getElementById('gaugeArc'),gNum=document.getElementById('gaugeNum'),gDone=false,SCORE=92,LEN=490;
  var gio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!gDone){gDone=true;
    if(reduce){gArc.style.strokeDashoffset=LEN-(LEN*SCORE/100);gNum.textContent=SCORE;return;}
    gArc.style.transition='stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)';
    requestAnimationFrame(function(){gArc.style.strokeDashoffset=LEN-(LEN*SCORE/100);});
    var t0=null;requestAnimationFrame(function a(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1400,1);gNum.textContent=Math.round(SCORE*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(a);else gNum.textContent=SCORE;});
  }});},{threshold:0.5});
  gio.observe(document.querySelector('.health'));

  var ENDPOINT="https://formspree.io/f/meebbekd";
  function wire(f,m){f.addEventListener('submit',function(e){e.preventDefault();m.textContent="Sending...";
    fetch(ENDPOINT,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
    .then(function(r){if(r.ok){f.reset();m.textContent="You're on the list. We'll be in touch.";}else{m.textContent="Something went wrong. Try again in a sec.";}})
    .catch(function(){m.textContent="Something went wrong. Try again in a sec.";});});}
  wire(document.getElementById('form1'),document.getElementById('msg1'));
  wire(document.getElementById('form2'),document.getElementById('msg2'));
