(() => {
  const image = id => ({
    30677594:'https://images.pexels.com/photos/30677594/pexels-photo-30677594.jpeg?cs=srgb&amp;dl=pexels-ninthgrid-2149521550-30677594.jpg&amp;fm=jpg',
    30690402:'https://images.pexels.com/photos/30690402/pexels-photo-30690402.jpeg?cs=srgb&amp;dl=pexels-ninthgrid-2149521550-30690402.jpg&amp;fm=jpg',
    14881644:'https://images.pexels.com/photos/14881644/pexels-photo-14881644.jpeg?cs=srgb&amp;dl=pexels-david-iloba-28486424-14881644.jpg&amp;fm=jpg',
    30688914:'https://images.pexels.com/photos/30688914/pexels-photo-30688914.jpeg?cs=srgb&amp;dl=pexels-ninthgrid-2149521550-30688914.jpg&amp;fm=jpg',
    36808462:'https://images.pexels.com/photos/36808462/pexels-photo-36808462.jpeg?cs=srgb&amp;dl=pexels-bolaji-oladeinde-2160554586-36808462.jpg&amp;fm=jpg'
  })[id];
  const pages = {
    '/app': {
      eyebrow:'THE BUZZ APP / EVERYDAY CONNECTION', title:'A little more connected to the things that matter.',
      intro:'Buzz brings communication, discovery and useful everyday experiences into one app. Start with the people you know, then explore the people, places and services around you.',
      image:image(30677594), alt:'A woman in Lagos holding her smartphone', cta:'Join the waitlist', ctaHref:'/waitlist',
      sections:[
        ['Conversations that keep life moving','Private chats, media and voice-note experiences sit at the heart of Buzz. The supplied app source includes chat interfaces and local message storage; connected, cross-device messaging still needs its production service.','Communication'],
        ['Find your people','Communities and Updates give the app room for shared interests and everyday discovery. Social Updates are distinct from Security Updates.','Communities & Updates'],
        ['A simpler way to make an introduction','Buzz IDs and QR contact exchange are part of the intended connection journey. The current source includes a scan screen, but identity lookup is not yet complete.','BuzzDrop & identity'],
        ['Your account, your settings','Profile, privacy, appearance and notification settings are present in the application. Exact data practices and privacy controls will be described only after the approved policy and backend behaviour are confirmed.','Account & privacy']
      ], note:'BuzzDrop nearby discovery and QR identity lookup are not yet confirmed as complete in the supplied application build.'
    },
    '/buzz-pro': {
      eyebrow:'BUZZ PRO / YOUR WORK, IN VIEW', title:'A professional mode. The same Buzz app.',
      intro:'Buzz Pro is an optional mode within Buzz for sellers, businesses, lawyers and other professional users. It gives your work a clearer presence without asking you to move to a separate app.',
      image:image(30690402), alt:'African businesswomen working together in a modern Lagos office', cta:'Explore the Buzz App', ctaHref:'/app',
      sections:[
        ['A profile built around what you do','Present your business or professional identity, describe your work and make it easier for people to understand how to reach you. The current app includes local Pro profile and capability setup.','Business presence'],
        ['Products, property and services','Pro is designed for different professional capabilities, including sellers, property users, professionals and organisations. Live publishing, verification and customer-facing availability depend on connected services.','Professional capabilities'],
        ['Showcase brings your work to life','Showcase is the reel-style experience for eligible Buzz Pro users to create short videos about businesses, products and professional services. Ordinary users watch Showcase from the Me tab.','Showcase'],
        ['Tools to create and manage','Creator Tools provide the creation and presence-management layer. The supplied app has a local creator studio and reel editor; cross-user publishing and network-wide analytics are not connected in that build.','Creator Tools']
      ], note:'Orders, bookings, payments, verification and analytics screens exist in varying stages. Sample records and device-local counts are not live business data.'
    },
    '/marketplace': {
      eyebrow:'MARKETPLACE / DISCOVER WITH CONTEXT', title:'Find the things you need. Meet the people behind them.',
      intro:'Explore products, property, services and professionals in one connected discovery experience. Marketplace is designed to bring listing details and seller conversations closer together.',
      image:image(14881644), alt:'A produce seller at a street market in Lagos', cta:'See the Buzz App', ctaHref:'/app',
      sections:[
        ['Products from local sellers','Browse product categories and listing details, then connect with a seller to ask the questions that matter. The supplied application currently uses local product examples rather than a connected live catalog.','Products'],
        ['Property with clearer context','Property discovery is part of the intended Marketplace experience. Landlords, agents and caretakers may have different roles and authority; listing verification and role approval must be confirmed before any trust claim is made.','Property'],
        ['Services and professionals','Discover people offering services and professional expertise. The app includes local service and legal-directory interfaces; live provider onboarding and availability are not established.','Services'],
        ['A conversation before a decision','Marketplace is intended to connect discovery with direct conversations. Buzz does not guarantee a listing, seller, property or service provider unless a specific verification programme is confirmed.','Seller connection']
      ], note:'Prices, listings, seller identities and property information in the supplied app are local/seeded examples, not a verified live marketplace feed.'
    },
    '/payments': {
      eyebrow:'PAYMENTS / A CONNECTED EXPERIENCE', title:'Make the next step in a transaction clearer.',
      intro:'Buzz and SunPay are described in the project brief as partners for secure payment and escrow-related functionality. The precise operational roles must be confirmed before the website makes promises about processing or protection.',
      image:image(30688914), alt:'Three colleagues in a Lagos office celebrating a shared achievement', cta:'Contact Buzz', ctaHref:'/contact',
      sections:[
        ['A partnership, not a claim of ownership','SunPay is a partner in the payment proposition. Buzz should not be described as owning or independently operating SunPay infrastructure.','Buzz × SunPay'],
        ['Clarity before a payment','The intended experience is to make the transaction context understandable to the people involved. Specific payment methods, currencies, fees and supported transaction types remain to be confirmed.','Transaction context'],
        ['Escrow needs precise rules','Who processes a payment, who holds funds, when funds are released, which transactions qualify and how disputes are handled all require approved documentation.','Escrow and custody'],
        ['Support when something goes wrong','Failed payments, refunds and disputes need a confirmed support route and clear responsibility across the parties. Those service details have not been supplied yet.','Support & disputes']
      ], note:'Payment account linking is explicitly unavailable in the supplied app build. No live payment, wallet, transfer, escrow or settlement integration was found.'
    },
    '/safety': {
      eyebrow:'SAFETY / LOOK OUT FOR EACH OTHER', title:'A more aware community starts with connection.',
      intro:'Safety-related tools are part of the wider Buzz experience. The goal is to support awareness, reporting and communication without overstating what an app can verify or resolve.',
      image:image(36808462), alt:'Two women sharing a joyful moment in Lagos', cta:'Read safety guidance', ctaHref:'/safety-guidelines',
      sections:[
        ['EMBA and Security Updates','The project brief identifies EMBA and Security Updates as part of the safety direction. Ordinary social Updates must remain distinct from security-related alerts. Exact alert sources and operational status need confirmation.','Awareness'],
        ['Reporting and evidence','The app source includes incident-related screens. Submission, evidence storage, review, visibility and escalation workflows need a connected backend and approved policy.','Incident reporting'],
        ['Tools with clear limits','Stealth and Security Live screens appear in the app source. Their availability and behaviour must be verified before they are described as operational safety services.','Safety controls'],
        ['In an immediate emergency','Buzz is not a substitute for emergency services. Contact the appropriate local emergency service directly when immediate assistance is required. Do not wait for an app response.','Emergency guidance']
      ], note:'Buzz does not guarantee rescue, prevention, incident verification, emergency dispatch or law-enforcement response.'
    }
  };

  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const render = page => `
    <section class="page-hero section-wrap">
      <div class="page-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(page.eyebrow)}</p><h1>${esc(page.title)}</h1><p class="page-lede">${esc(page.intro)}</p><a class="button button-blue" href="${page.ctaHref}">${esc(page.cta)} <span aria-hidden="true">↗</span></a></div>
      <figure class="page-hero-image"><img src="${page.image}" alt="${esc(page.alt)}" loading="lazy"><figcaption>BUZZ / CONNECTED EVERYDAY LIFE</figcaption></figure>
    </section>
    <section class="page-editorial"><div class="section-wrap"><div class="page-section-intro"><p class="eyebrow"><span class="eyebrow-line"></span> A closer look</p><h2>Designed around<br><em>real life.</em></h2></div><div class="page-feature-list">${page.sections.map((s,i)=>`<article class="page-feature"><span class="page-feature-index">0${i+1}</span><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div><span class="page-feature-tag">${esc(s[2])}</span></article>`).join('')}</div>${page.note?`<p class="truth-note"><strong>Current implementation note</strong>${esc(page.note)}</p>`:''}</div></section>
    <section class="page-bottom-cta"><div class="section-wrap page-bottom-inner"><p class="eyebrow eyebrow-light"><span class="eyebrow-line"></span> BUZZ / THE NEXT STEP</p><h2>Everyday life,<br><em>more connected.</em></h2><a class="button button-white" href="/waitlist">Join the waitlist <span aria-hidden="true">↗</span></a></div></section>`;
  window.BUZZ_PAGE_RENDERERS = window.BUZZ_PAGE_RENDERERS || {};
  Object.entries(pages).forEach(([path,page]) => window.BUZZ_PAGE_RENDERERS[path] = () => render(page));
})();
