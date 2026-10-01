  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var siteNav=document.querySelector('nav');
  function syncNavSurface(){siteNav.classList.toggle('scrolled',window.scrollY>24);}
  syncNavSurface();
  window.addEventListener('scroll',syncNavSurface,{passive:true});

  var navToggle=document.getElementById('navToggle'),primaryNav=document.getElementById('primaryNav');
  function setNavOpen(open){
    primaryNav.classList.toggle('open',open);
    navToggle.classList.toggle('open',open);
    navToggle.setAttribute('aria-expanded',String(open));
    navToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  }
  navToggle.addEventListener('click',function(){setNavOpen(navToggle.getAttribute('aria-expanded')!=='true');});
  primaryNav.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){setNavOpen(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setNavOpen(false);});
  document.addEventListener('click',function(e){if(!e.target.closest('.nav-in'))setNavOpen(false);});
  window.addEventListener('resize',function(){if(window.innerWidth>860)setNavOpen(false);});

  var lockDate=document.getElementById('lockDate');
  if(lockDate){
    lockDate.textContent=new Intl.DateTimeFormat('en-NZ',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  }

  var HEADLINES = {
    a:"Shared bills shouldn’t sit on one person’s shoulders.",
    b:"Shared bills shouldn’t sit on one person’s shoulders.",
    c:"Shared bills shouldn’t sit on one person’s shoulders."
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

  var gArc=document.getElementById('gaugeArc'),gNum=document.getElementById('gaugeNum'),gDone=false,SCORE=92,LEN=490;
  var gio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!gDone){gDone=true;
    if(reduce){gArc.style.strokeDashoffset=LEN-(LEN*SCORE/100);gNum.textContent=SCORE;return;}
    gArc.style.transition='stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)';
    requestAnimationFrame(function(){gArc.style.strokeDashoffset=LEN-(LEN*SCORE/100);});
    var t0=null;requestAnimationFrame(function a(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1400,1);gNum.textContent=Math.round(SCORE*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(a);else gNum.textContent=SCORE;});
  }});},{threshold:0.5});
  gio.observe(document.querySelector('.health'));

  var quoteCarousel=document.getElementById('quoteCarousel');
  if(quoteCarousel){
    var quoteSlides=quoteCarousel.querySelectorAll('.quote-slide');
    var quoteDots=quoteCarousel.querySelectorAll('.quote-dots button');
    var quotePrev=quoteCarousel.querySelector('.quote-prev');
    var quoteNext=quoteCarousel.querySelector('.quote-next');
    var quoteProgress=quoteCarousel.querySelector('.quote-progress-bar');
    var quoteIndex=0,quoteTimer=null,quoteVisible=false,quotePaused=false;
    function restartQuoteProgress(){
      if(!quoteProgress)return;
      quoteProgress.classList.remove('is-running');
      void quoteProgress.offsetWidth;
      if(!reduce&&quoteVisible&&!quotePaused)quoteProgress.classList.add('is-running');
    }
    function showQuote(index){
      quoteIndex=(index+quoteSlides.length)%quoteSlides.length;
      quoteSlides.forEach(function(slide,i){
        var active=i===quoteIndex;
        slide.classList.toggle('is-active',active);
        slide.setAttribute('aria-hidden',String(!active));
      });
      quoteDots.forEach(function(dot,i){
        var active=i===quoteIndex;
        dot.classList.toggle('is-active',active);
        dot.setAttribute('aria-current',String(active));
      });
    }
    function stopQuotes(){if(quoteTimer){clearInterval(quoteTimer);quoteTimer=null;}}
    function startQuotes(){
      stopQuotes();
      if(!reduce&&quoteVisible&&!quotePaused&&quoteSlides.length>1){
        restartQuoteProgress();
        quoteTimer=setInterval(function(){showQuote(quoteIndex+1);restartQuoteProgress();},5000);
      }
    }
    function setQuotePaused(paused){
      quotePaused=paused;
      quoteCarousel.classList.toggle('is-paused',paused);
      if(paused)stopQuotes();else startQuotes();
    }
    quoteDots.forEach(function(dot,i){dot.addEventListener('click',function(){showQuote(i);startQuotes();});});
    quotePrev.addEventListener('click',function(){showQuote(quoteIndex-1);startQuotes();});
    quoteNext.addEventListener('click',function(){showQuote(quoteIndex+1);startQuotes();});
    quoteCarousel.addEventListener('mouseenter',function(){setQuotePaused(true);});
    quoteCarousel.addEventListener('mouseleave',function(){setQuotePaused(false);});
    quoteCarousel.addEventListener('focusin',function(){setQuotePaused(true);});
    quoteCarousel.addEventListener('focusout',function(e){
      if(!quoteCarousel.contains(e.relatedTarget))setQuotePaused(false);
    });
    var quoteObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){
      quoteVisible=entry.isIntersecting;
      if(quoteVisible)startQuotes();else{stopQuotes();quoteProgress.classList.remove('is-running');}
    });},{threshold:0.3});
    quoteObserver.observe(quoteCarousel);
    document.addEventListener('visibilitychange',function(){if(document.hidden)stopQuotes();else startQuotes();});
  }

  var signupToast=document.getElementById('signupToast'),signupToastTitle=document.getElementById('signupToastTitle'),signupToastText=document.getElementById('signupToastText'),signupToastClose=document.getElementById('signupToastClose'),toastTimer;
  function hideToast(){signupToast.classList.remove('is-visible');}
  function showToast(type,title,text){
    clearTimeout(toastTimer);
    signupToast.classList.toggle('is-error',type==='error');
    signupToastTitle.textContent=title;
    signupToastText.textContent=text;
    signupToast.classList.add('is-visible');
    toastTimer=setTimeout(hideToast,5200);
  }
  signupToastClose.addEventListener('click',hideToast);

  function wire(f,m){f.addEventListener('submit',function(e){
    e.preventDefault();
    var button=f.querySelector('button[type="submit"]'),buttonLabel=button.textContent;
    m.textContent="Sending...";
    button.disabled=true;
    button.textContent="Joining...";
    fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
    .then(function(r){
      if(r.ok){
        f.reset();
        m.textContent="You're in! Welcome to Nest — we'll keep you posted.";
        showToast('success',"You’re in!","Welcome to Nest — we’ll keep you posted.");
      }else{
        m.textContent="Something went wrong. Please try again.";
        showToast('error',"Couldn’t join just yet","Please try again in a moment.");
      }
    })
    .catch(function(){
      m.textContent="Something went wrong. Please try again.";
      showToast('error',"Couldn’t join just yet","Please check your connection and try again.");
    })
    .finally(function(){button.disabled=false;button.textContent=buttonLabel;});
  });}
  wire(document.getElementById('form1'),document.getElementById('msg1'));
  wire(document.getElementById('form2'),document.getElementById('msg2'));
