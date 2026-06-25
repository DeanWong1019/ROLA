(function(){
  var mounts = document.querySelectorAll('[data-site-nav]');
  if (!mounts.length) return;

  var logo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" fill="none" aria-hidden="true"><g fill="#11A757" clip-path="url(#rola-logo)"><path d="M13 4a5 5 0 0 1 0 10v4a9 9 0 1 0-9-9h4a5 5 0 0 1 5-5"/><path d="M2 15a5 5 0 0 1 5 5h4a9 9 0 0 0-9-9z" opacity=".4"/></g><defs><clipPath id="rola-logo"><path fill="#fff" d="M0 20V0h24v20z"/></clipPath></defs></svg><svg xmlns="http://www.w3.org/2000/svg" width="76" height="13" fill="none" aria-label="ROLA-IP" class="logo__wordmark"><path fill="#D4DADD" d="M2.7 12.24H0V.18h6.66q1.494 0 2.538.432 1.044.414 1.584 1.224t.54 1.962q0 .99-.378 1.692T9.81 6.624q-.756.414-1.89.522v.144q.81.216 1.206.648T9.864 9l1.746 3.24H8.478L6.822 9.108A3.2 3.2 0 0 0 6.3 8.37a1.47 1.47 0 0 0-.702-.378q-.414-.126-1.116-.126H2.7zm0-9.63v3.222h3.942q.954 0 1.404-.324.45-.342.45-1.296 0-.9-.45-1.242-.45-.36-1.404-.36zm17.053 9.81q-1.98 0-3.456-.756a5.5 5.5 0 0 1-2.25-2.16q-.774-1.404-.774-3.294t.774-3.276a5.35 5.35 0 0 1 2.25-2.16Q17.773 0 19.753 0q2.052 0 3.51.774a5.35 5.35 0 0 1 2.25 2.16q.792 1.386.792 3.276t-.792 3.294a5.5 5.5 0 0 1-2.25 2.16q-1.458.756-3.51.756m0-2.592q1.332 0 2.124-.342.81-.36 1.17-1.152.378-.792.378-2.124 0-1.35-.378-2.124a2.17 2.17 0 0 0-1.17-1.134q-.792-.36-2.124-.36-1.314 0-2.106.36a2.17 2.17 0 0 0-1.152 1.134q-.36.774-.36 2.124 0 1.332.36 2.124t1.152 1.152q.792.342 2.106.342m11.51 2.412h-2.7V.18h2.7zm7.181 0h-9.126V9.81h9.126zm4.381 0h-3.024L45.075.18h3.852l5.31 12.06h-3.096L47.83 4.518l-.738-1.872h-.198l-.738 1.872zm8.352-2.664h-8.496v-2.43h8.496zm11.327 2.664h-2.7V.18h2.7zm8.794-3.33h-5.364V6.48h5.076q1.134 0 1.656-.396.54-.414.54-1.548 0-1.098-.54-1.512-.522-.414-1.656-.414h-5.076V.18h5.364q1.404 0 2.43.522a3.63 3.63 0 0 1 1.584 1.476q.576.972.576 2.358t-.576 2.376a3.74 3.74 0 0 1-1.584 1.494q-1.026.504-2.43.504m-3.6 3.33h-2.7V.18h2.7z"/></svg>';

  var desktopLinks = [
    {key:'home', label:'Home', href:'index.html'},
    {key:'home-2', label:'Home 2', href:'index-v2.html'},
    {key:'proxies', label:'Proxies', href:'proxies.html'},
    {key:'purposes', label:'Purposes', href:'#', mega:true},
    {key:'pricing', label:'Pricing', href:'pricing.html'},
    {key:'use-cases', label:'Use Cases', href:'use-case.html'},
    {key:'blog', label:'Blog', href:'blog.html'},
    {key:'faq', label:'FAQs', href:'faq.html'}
  ];

  // ---- "Purposes" mega menu data ----
  var purposesGroups = [
    { icon:'shopping-cart', title:'E-commerce', items:[
      {name:'Amazon', kind:'letter', letter:'A', color:'#FF9900'},
      {name:'BestBuy', kind:'letter', letter:'B', color:'#0046BE'},
      {name:'Ebay', kind:'brand', slug:'ebay'},
      {name:'Etsy', kind:'brand', slug:'etsy'},
      {name:'Shopee', kind:'brand', slug:'shopee'}
    ]},
    { icon:'search', title:'Search Engines', items:[
      {name:'Bing', kind:'letter', letter:'B', color:'#008373'},
      {name:'Duckduckgo', kind:'brand', slug:'duckduckgo'},
      {name:'Google', kind:'brand', slug:'google'}
    ]},
    { icon:'share-2', title:'Social Networks', items:[
      {name:'Dating', kind:'icon', icon:'heart', color:'#ec4899'},
      {name:'Instagram', kind:'brand', slug:'instagram'},
      {name:'Reddit', kind:'brand', slug:'reddit'},
      {name:'(X) Twitter', kind:'brand', slug:'x'},
      {name:'Facebook', kind:'brand', slug:'facebook'},
      {name:'OnlyFans', kind:'brand', slug:'onlyfans'},
      {name:'TikTok', kind:'brand', slug:'tiktok'}
    ]},
    { icon:'radio', title:'Streaming', items:[
      {name:'Spotify', kind:'brand', slug:'spotify'},
      {name:'Twitch', kind:'brand', slug:'twitch'},
      {name:'Youtube', kind:'brand', slug:'youtube'}
    ]},
    { icon:'gamepad-2', title:'Games', items:[
      {name:'Aion', kind:'letter', letter:'A', color:'#6EC1E4'},
      {name:'Growtopia', kind:'letter', letter:'G', color:'#FFC107'},
      {name:'Minecraft', kind:'letter', letter:'M', color:'#4CAF50'},
      {name:'RuneScape', kind:'letter', letter:'R', color:'#2C2C2C'},
      {name:'World of Warcraft', kind:'letter', letter:'W', color:'#1E3A8A'},
      {name:'Diablo 2', kind:'letter', letter:'D', color:'#8B0000'},
      {name:'Lords Mobile', kind:'letter', letter:'L', color:'#1565C0'},
      {name:'Path of Exile', kind:'letter', letter:'P', color:'#8D6E63'},
      {name:'SilkRoad', kind:'letter', letter:'S', color:'#B8860B'}
    ]},
    { icon:'layout-grid', title:'Others', items:[
      {name:'ChatGPT', kind:'letter', letter:'C', color:'#74AA9C'},
      {name:'Discord', kind:'brand', slug:'discord'},
      {name:'Sneakers', kind:'icon', icon:'footprints', color:'#6b7280'},
      {name:'Steam', kind:'brand', slug:'steam'},
      {name:'Telegram', kind:'brand', slug:'telegram'},
      {name:'Tickets', kind:'icon', icon:'ticket', color:'#6b7280'},
      {name:'Upwork', kind:'brand', slug:'upwork'},
      {name:'WhatsApp', kind:'brand', slug:'whatsapp'},
      {name:'Wikipedia', kind:'brand', slug:'wikipedia'}
    ]}
  ];
  // 3 top-level columns, each stacking 2 groups (matches the reference layout)
  var purposesColumns = [
    [purposesGroups[0], purposesGroups[1]],
    [purposesGroups[2], purposesGroups[3]],
    [purposesGroups[4], purposesGroups[5]]
  ];

  function iconBadge(item){
    if (item.kind === 'brand') {
      return '<span class="nav__mega-icon"><img src="https://cdn.simpleicons.org/' + item.slug + '" alt="" loading="lazy" width="16" height="16"></span>';
    }
    if (item.kind === 'icon') {
      return '<span class="nav__mega-icon" style="color:' + item.color + '"><i data-lucide="' + item.icon + '"></i></span>';
    }
    return '<span class="nav__mega-icon nav__mega-icon--letter" style="background:' + item.color + '">' + item.letter + '</span>';
  }

  function renderMegaGroup(group){
    var half = Math.ceil(group.items.length / 2);
    var multi = group.items.length > 5;
    var cols = multi ? [group.items.slice(0, half), group.items.slice(half)] : [group.items];
    var listsHtml = cols.map(function(col){
      return '<ul class="nav__mega-sublist">' + col.map(function(item){
        return '<li class="nav__mega-item">' + iconBadge(item) + '<span>' + item.name + '</span></li>';
      }).join('') + '</ul>';
    }).join('');
    return '<div class="nav__mega-group">' +
      '<div class="nav__mega-group-title"><i data-lucide="' + group.icon + '"></i><span>' + group.title + '</span></div>' +
      '<div class="nav__mega-lists">' + listsHtml + '</div>' +
      '</div>';
  }

  function renderMegaMenu(){
    var colsHtml = purposesColumns.map(function(groups){
      return '<div class="nav__mega-col">' + groups.map(renderMegaGroup).join('') + '</div>';
    }).join('');
    return '<div class="nav__megamenu" role="menu">' + colsHtml + '</div>';
  }

  function renderMegaFlatList(){
    // simplified flat version for the mobile nav panel
    return purposesGroups.map(function(group){
      return '<div class="mobile-mega__group">' +
        '<div class="mobile-mega__group-title"><i data-lucide="' + group.icon + '"></i><span>' + group.title + '</span></div>' +
        '<div class="mobile-mega__items">' + group.items.map(function(item){
          return '<span class="mobile-mega__item">' + iconBadge(item) + '<span>' + item.name + '</span></span>';
        }).join('') + '</div>' +
        '</div>';
    }).join('');
  }

  function mobileLinksFor(active){
    if (active === 'home') {
      return [
        {key:'home-2', label:'Home 2', href:'index-v2.html'},
        {key:'proxies', label:'Proxies', href:'proxies.html'},
        {key:'pricing', label:'Pricing', href:'pricing.html'},
        {key:'use-cases', label:'Use Cases', href:'use-case.html'},
        {key:'blog', label:'Blog', href:'blog.html'},
        {key:'faq', label:'FAQs', href:'faq.html'}
      ];
    }
    if (active === 'home-2') {
      return [
        {key:'home', label:'Home', href:'index.html'},
        {key:'proxies', label:'Proxies', href:'proxies.html'},
        {key:'pricing', label:'Pricing', href:'pricing.html'},
        {key:'use-cases', label:'Use Cases', href:'use-case.html'},
        {key:'blog', label:'Blog', href:'blog.html'},
        {key:'faq', label:'FAQs', href:'faq.html'}
      ];
    }
    if (active === 'proxies') {
      return [
        {key:'features', label:'Features', href:'#features'},
        {key:'pricing', label:'Pricing', href:'pricing.html'},
        {key:'coverage', label:'Coverage', href:'#geo'},
        {key:'use-cases', label:'Use Cases', href:'use-case.html'},
        {key:'blog', label:'Blog', href:'blog.html'},
        {key:'docs', label:'Docs', href:'#integration'},
        {key:'faq', label:'FAQs', href:'faq.html'}
      ];
    }
    return [
      {key:'home', label:'Home', href:'index.html'},
      {key:'home-2', label:'Home 2', href:'index-v2.html'},
      {key:'proxies', label:'Proxies', href:'proxies.html'},
      {key:'features', label:'Features', href:'proxies.html#features'},
      {key:'pricing', label:'Pricing', href:'pricing.html'},
      {key:'use-cases', label:'Use Cases', href:'use-case.html'},
      {key:'blog', label:'Blog', href:'blog.html'},
      {key:'faq', label:'FAQs', href:'faq.html'},
      {key:'docs', label:'Docs', href:'proxies.html#integration'}
    ];
  }

  function inferActive(){
    var path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === 'index-v2.html') return 'home-2';
    if (path === 'pricing.html') return 'pricing';
    if (path === 'use-case.html') return 'use-cases';
    if (path === 'blog.html') return 'blog';
    if (path === 'faq.html') return 'faq';
    if (path === 'proxies.html') return 'proxies';
    return 'home';
  }

  function localizedHref(lang){
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var url = new URL(path, window.location.href);
    url.searchParams.set('lang', lang);
    return url.pathname.split('/').pop() + url.search + url.hash;
  }

  function isActive(active, key){
    return active === key || (active === 'proxies' && key === 'home');
  }

  function renderLinks(links, active){
    return links.map(function(link){
      if (link.mega) {
        return '<div class="nav__dropdown">' +
          '<button type="button" class="nav__dropdown-trigger" aria-haspopup="true" aria-expanded="false">' + link.label + '<span class="nav__chev" aria-hidden="true"></span></button>' +
          renderMegaMenu() +
          '</div>';
      }
      return '<a href="' + link.href + '"' + (isActive(active, link.key) ? ' class="active"' : '') + '>' + link.label + '</a>';
    }).join('');
  }

  function renderLanguageSwitch(){
    var lang = new URLSearchParams(window.location.search).get('lang') === 'zh' ? 'zh' : 'en';
    return '<div class="nav__lang" aria-label="Language switch"><a href="' + localizedHref('en') + '" data-lang-option="en"' + (lang === 'en' ? ' class="active"' : '') + '>EN</a><span>/</span><a href="' + localizedHref('zh') + '" data-lang-option="zh"' + (lang === 'zh' ? ' class="active"' : '') + '>中文</a></div>';
  }

  function renderMobileLanguageLinks(){
    return '<a href="' + localizedHref('en') + '" data-lang-option="en">EN</a><a href="' + localizedHref('zh') + '" data-lang-option="zh">中文</a>';
  }

  function render(active){
    var ctaLabel = active === 'proxies' ? 'Buy Now' : 'Start Free Trial';
    var ctaHref = active === 'proxies' || active === 'use-cases' ? '#' : 'pricing.html';
    var navClass = active === 'blog' || active === 'faq' ? 'nav nav--light' : active === 'pricing' || active === 'use-cases' ? 'nav nav--transparent-dark' : 'nav';
    return '<nav class="' + navClass + '" id="nav"><div class="nav__inner"><a href="index.html" class="logo">' + logo + '</a><div class="nav__links">' + renderLinks(desktopLinks, active) + '</div><div class="nav__actions">' + renderLanguageSwitch() + '<a href="#" class="nav__login">Register/Login</a></div><button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button></div></nav><div class="mobile-nav" id="mobileNav">' + renderLinks(mobileLinksFor(active), active) + '<button type="button" class="mobile-nav__mega-toggle" id="mobilePurposesToggle">Purposes<span class="nav__chev" aria-hidden="true"></span></button><div class="mobile-mega" id="mobilePurposesPanel">' + renderMegaFlatList() + '</div>' + renderMobileLanguageLinks() + '<a href="' + ctaHref + '" class="btn btn--secondary btn--block">' + ctaLabel + '</a></div>';
  }

  function ensureLucide(cb){
    if (window.lucide && window.lucide.createIcons) { cb(); return; }
    var existing = document.getElementById('lucide-cdn-script');
    if (existing) { existing.addEventListener('load', cb); return; }
    var s = document.createElement('script');
    s.id = 'lucide-cdn-script';
    s.src = 'https://unpkg.com/lucide@latest';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function wireDropdown(){
    var dropdown = document.querySelector('.nav__dropdown');
    if (!dropdown) return;
    var trigger = dropdown.querySelector('.nav__dropdown-trigger');
    var closeTimer = null;

    function open(){
      clearTimeout(closeTimer);
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close(){
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function scheduleClose(){
      clearTimeout(closeTimer);
      closeTimer = setTimeout(close, 160);
    }

    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', scheduleClose);
    trigger.addEventListener('click', function(e){
      e.preventDefault();
      dropdown.classList.contains('open') ? close() : open();
    });
    document.addEventListener('click', function(e){
      if (!dropdown.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') close();
    });
  }

  function wireMobileMega(){
    var toggle = document.getElementById('mobilePurposesToggle');
    var panel = document.getElementById('mobilePurposesPanel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function(){
      panel.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }

  mounts.forEach(function(mount){
    mount.outerHTML = render(mount.getAttribute('data-active') || inferActive());
  });

  wireDropdown();
  wireMobileMega();
  ensureLucide(function(){ window.lucide.createIcons(); });
})();
