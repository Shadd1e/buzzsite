(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // The homepage is authored directly in index.html. Inner routes are rendered by the dedicated page modules below.
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/') {
    const pageTitles = {
      '/app': 'The Buzz App', '/buzz-pro': 'Buzz Pro', '/marketplace': 'Marketplace',
      '/payments': 'Payments', '/safety': 'Safety', '/about': 'About Buzz',
      '/careers': 'Careers', '/contact': 'Contact', '/waitlist': 'Join the waitlist',
      '/logistics': 'Buzz Logistics', '/logistics/how-it-works': 'How Buzz Logistics works',
      '/track-my-package': 'Track my package', '/logistics/coverage': 'Delivery coverage',
      '/logistics/partners': 'Become a logistics partner', '/logistics/partners/apply': 'Partner application',
      '/logistics/partner-login': 'Partner login', '/logistics/partner-dashboard': 'Partner dashboard',
      '/help': 'Help Centre', '/privacy-policy': 'Privacy Policy', '/terms': 'Terms of Use',
      '/community-guidelines': 'Community Guidelines', '/safety-guidelines': 'Safety Guidelines',
      '/marketplace-terms': 'Marketplace Terms', '/logistics-terms': 'Logistics Terms',
      '/payment-terms': 'Payment Terms', '/cookie-policy': 'Cookie Policy'
    };
    const title = pageTitles[path];
    if (title) {
      const descriptions = {
        '/app':'Discover the Buzz app: communication, social discovery, Marketplace access and everyday connections.',
        '/buzz-pro':'Buzz Pro is an optional professional mode within the same Buzz app for sellers, businesses and professionals.',
        '/marketplace':'Discover products, property, services and professionals through Buzz Marketplace.',
        '/payments':'Learn about the Buzz and SunPay payment proposition and the details still requiring confirmation.',
        '/safety':'Explore the safety direction at Buzz, including awareness and incident-related tools with clear limitations.',
        '/about':'Learn why Buzz is building a connected platform for everyday life, with an African perspective.',
        '/careers':'Explore careers and future opportunities with Buzz.',
        '/contact':'Contact Buzz for general, support, business, logistics and media enquiries.',
        '/waitlist':'Join the Buzz waitlist to follow product and availability updates.',
        '/logistics':'Buzz Logistics connects Buzz purchases with independent delivery providers.',
        '/logistics/how-it-works':'Understand the delivery journey for goods purchased through Buzz.',
        '/track-my-package':'Enter a Buzz Logistics tracking reference. Live package lookup is not connected yet.',
        '/logistics/coverage':'Review the delivery coverage information available for Buzz Logistics.',
        '/logistics/partners':'Learn about joining the independent Buzz Logistics partner network.',
        '/logistics/partners/apply':'Start the nine-step Buzz Logistics partner application.',
        '/logistics/partner-login':'Partner portal access for approved Buzz Logistics providers.',
        '/logistics/partner-dashboard':'Partner dashboard information and current access status.',
        '/help':'Search Buzz Help Centre answers across the app, Marketplace, Pro, payments, safety and logistics.',
        '/privacy-policy':'Draft privacy policy structure pending approval.',
        '/terms':'Draft Buzz terms of use pending approval.',
        '/community-guidelines':'Draft Buzz community guidelines pending approval.',
        '/safety-guidelines':'Draft Buzz safety guidelines pending approval.',
        '/marketplace-terms':'Draft Buzz Marketplace terms pending approval.',
        '/logistics-terms':'Draft Buzz Logistics terms pending approval.',
        '/payment-terms':'Draft Buzz payment terms pending approval.',
        '/cookie-policy':'Draft website cookie policy pending approval.'
      };
      document.title = `${title} — Buzz`;
      const description = descriptions[path] || 'A connected ecosystem for everyday life.';
      const descriptionMeta = document.querySelector('meta[name="description"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (descriptionMeta) descriptionMeta.setAttribute('content', description);
      if (ogTitle) ogTitle.setAttribute('content', `${title} — Buzz`);
      if (ogDescription) ogDescription.setAttribute('content', description);
      const shell = document.getElementById('site-shell');
      const main = shell && shell.querySelector('main');
      const renderer = window.BUZZ_PAGE_RENDERERS && window.BUZZ_PAGE_RENDERERS[path];
      if (main && renderer) main.innerHTML = renderer();
      else if (main) main.innerHTML = `<section class="route-placeholder"><div><p class="eyebrow"><span class="eyebrow-line"></span> BUZZ / BUILDING IN PROGRESS</p><h1>${title}</h1><p>This page is part of the agreed Buzz website. Its full experience is being implemented in the next build passes. We will only publish product details and service actions that can be verified.</p><a class="button button-blue" href="/">Return to the homepage <span aria-hidden="true">↗</span></a></div></section>`;
    } else {
      document.title = 'Page not found — Buzz';
      const shell = document.getElementById('site-shell');
      const main = shell && shell.querySelector('main');
      if (main) main.innerHTML = `<section class="route-placeholder"><div><p class="eyebrow"><span class="eyebrow-line"></span> BUZZ / 404</p><h1>We couldn't find that page.</h1><p>The address may have changed or the page may not exist.</p><a class="button button-blue" href="/">Back to Buzz <span aria-hidden="true">↗</span></a></div></section>`;
    }
  }

  // Honest, front-end-only interaction states until production services are configured.
  const trackingForm = document.getElementById('tracking-form');
  if (trackingForm) trackingForm.addEventListener('submit', event => {
    event.preventDefault();
    const field = trackingForm.elements.reference;
    const feedback = document.getElementById('tracking-result');
    if (!field.value.trim()) { field.focus(); feedback.textContent = 'Enter a tracking reference to continue.'; feedback.className = 'form-feedback is-error'; return; }
    feedback.textContent = 'Live package lookup is not connected yet. Buzz cannot retrieve or confirm a package status from this website at the moment.';
    feedback.className = 'form-feedback is-warning';
  });

  const loginForm = document.getElementById('partner-login-form');
  if (loginForm) loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = document.getElementById('login-feedback');
    if (!loginForm.reportValidity()) return;
    feedback.textContent = 'Partner authentication is not connected. No sign-in was attempted and no credentials were transmitted.';
    feedback.className = 'form-feedback is-warning';
  });

  const simpleForms = [
    ['waitlist-form','waitlist-feedback','The waitlist service is not connected. Your details were not transmitted and you have not been added to a list.'],
    ['contact-form','contact-feedback','The contact destination is not connected. Your enquiry was validated in this browser but was not sent.']
  ];
  simpleForms.forEach(([formId,feedbackId,message])=>{
    const form=document.getElementById(formId);
    if(!form)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const feedback=document.getElementById(feedbackId);
      feedback.textContent=message;
      feedback.className='form-feedback is-warning';
    });
  });

  const faqResults=document.getElementById('faq-results');
  if(faqResults && window.BUZZ_FAQ_CATEGORIES){
    let activeCategory=-1;
    const search=document.getElementById('faq-search');
    const count=document.getElementById('faq-count');
    const categoryButtons=[...document.querySelectorAll('[data-category]')];
    const renderFaqs=()=>{
      const q=(search.value||'').trim().toLowerCase();
      const found=[];
      window.BUZZ_FAQ_CATEGORIES.forEach((cat,ci)=>{
        if(activeCategory!==-1 && activeCategory!==ci)return;
        cat[1].forEach(([question,answer])=>{
          if(!q || `${question} ${answer} ${cat[0]}`.toLowerCase().includes(q))found.push({category:cat[0],question,answer});
        });
      });
      count.textContent=`${found.length} question${found.length===1?'':'s'} found`;
      faqResults.innerHTML=found.length?found.map((f,i)=>`<details class="faq-item"><summary><span>${f.question.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span><i aria-hidden="true">+</i></summary><div class="faq-answer"><small>${f.category}</small><p>${f.answer.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</p></div></details>`).join(''):'<div class="faq-empty"><h3>No matching questions</h3><p>Try another word or choose a different category.</p></div>';
    };
    categoryButtons.forEach(button=>button.addEventListener('click',()=>{
      activeCategory=Number(button.dataset.category);
      categoryButtons.forEach(b=>b.classList.toggle('is-active',b===button));
      renderFaqs();
    }));
    search.addEventListener('input',()=>{activeCategory=-1;categoryButtons.forEach(b=>b.classList.remove('is-active'));renderFaqs();});
    document.getElementById('faq-clear').addEventListener('click',()=>{search.value='';activeCategory=-1;categoryButtons.forEach(b=>b.classList.remove('is-active'));renderFaqs();search.focus();});
    renderFaqs();
  }

  const partnerForm = document.getElementById('partner-form');
  if (partnerForm) {
    let currentStep = 0;
    const steps = [...partnerForm.querySelectorAll('.application-step')];
    const prev = document.getElementById('application-prev');
    const next = document.getElementById('application-next');
    const submit = document.getElementById('application-submit');
    const title = document.getElementById('application-step-title');
    const progressLabel = document.getElementById('application-progress-label');
    const progressFill = document.getElementById('application-progress-fill');
    const feedback = document.getElementById('application-feedback');
    const names = ['Legal','Business','Services','Coverage','Capacity','Experience','Systems','Additional','Review'];
    const showStep = () => {
      steps.forEach((step,i)=>step.classList.toggle('is-active',i===currentStep));
      title.textContent = `0${currentStep+1} / ${names[currentStep]}`;
      progressLabel.textContent = `Step ${currentStep+1} of 9`;
      progressFill.style.width = `${((currentStep+1)/9)*100}%`;
      prev.disabled = currentStep===0;
      next.hidden = currentStep===8;
      submit.hidden = currentStep!==8;
      feedback.textContent = '';
      if(currentStep===8) buildReview();
    };
    const validateCurrent = () => {
      const controls = [...steps[currentStep].querySelectorAll('input,textarea,select')].filter(el=>el.required && el.type!=='checkbox');
      for(const control of controls){ if(!control.checkValidity()){ control.reportValidity(); return false; } }
      return true;
    };
    const buildReview = () => {
      const data = new FormData(partnerForm);
      const rows = [['Business',data.get('businessName')],['Jurisdiction',data.get('jurisdiction')],['Contact',data.get('contactPerson')],['Email',data.get('email')],['Phone',data.get('phone')],['Services',data.getAll('services').join(', ') || 'Not specified'],['Coverage',data.get('cities') || data.get('countries') || 'Not specified'],['Systems',data.getAll('systems').join(', ') || 'Not specified']];
      document.getElementById('application-review').innerHTML = rows.map(([k,v])=>`<div><span>${k}</span><strong>${String(v||'Not provided').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</strong></div>`).join('');
    };
    next.addEventListener('click',()=>{if(!validateCurrent())return; currentStep=Math.min(8,currentStep+1);showStep();});
    prev.addEventListener('click',()=>{currentStep=Math.max(0,currentStep-1);showStep();});
    partnerForm.addEventListener('submit',event=>{
      event.preventDefault();
      const consent=document.getElementById('partner-consent');
      if(!consent.checked){consent.focus();feedback.textContent='Please confirm the declaration before continuing.';feedback.className='form-feedback is-error';return;}
      feedback.textContent='Your application is ready for review in this browser, but the secure submission service is not connected. Nothing has been sent or saved to Buzz. Please do not treat this as an application receipt.';
      feedback.className='form-feedback is-warning';
    });
    showStep();
  }
})();
