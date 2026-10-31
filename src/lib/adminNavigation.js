// Daily production controls. Supporting maintenance tools live under Settings.
export const ADMIN_NAVIGATION = [
  { label: 'Overview', items: [{path:'/admin/access-dashboard',label:'Dashboard',icon:'dashboard'}] },
  { label: 'Customer access', items: [
    {path:'/admin/approved-users',label:'Customers',icon:'users'},
    {path:'/admin/online-payments',label:'Online payments',icon:'payments'},
    {path:'/admin/access-codes',label:'Gift codes & renewals',icon:'codes'},
    {path:'/admin/page-permissions',label:'Pages & pricing',icon:'pages'},
    {path:'/admin/support',label:'Customer support',icon:'support'},
  ]},
  { label: 'App management', items: [
    {path:'/admin/shop',label:'Shop',icon:'shop'},
    {path:'/admin/purpose-dictionary',label:'Purpose dictionary',icon:'library'},
    {path:'/admin/system-settings',label:'Settings',icon:'settings'},
  ]},
];
export const ADMIN_MAINTENANCE = [
  {label:'Configuration',items:[
    {path:'/admin/settings',label:'App settings',description:'Existing app preferences and maintenance controls.'},
    {path:'/admin/feature-pricing',label:'Feature pricing',description:'Manage individual feature prices.'},
  ]},
  {label:'Activity',items:[
    {path:'/admin/access-logs',label:'Access history',description:'Investigate code activation and access issues.'},
    {path:'/admin/access-requests',label:'Old access requests',description:'Read-only history of the retired customer request flow.'},
    {path:'/admin/redeem-approvals',label:'Old redeem approvals',description:'History of the retired customer code-approval flow.'},
    {path:'/admin/audit-log',label:'Owner audit history',description:'Review recorded owner actions.'},
    {path:'/admin/analytics',label:'Analytics',description:'Review usage reports.'},
    {path:'/admin/products',label:'Products',description:'Manage the products shown in the existing shop.'},
  ]},
  {label:'Content maintenance',items:[
    {path:'/admin/master-pdf-library',label:'Source documents',description:'Connected to the Astro Clock indexing pipeline; keep when maintaining source content.'},
    {path:'/admin/pending-reviews',label:'Source content review',description:'Approve or reject extracted source pages before using them.'},
    {path:'/admin/knowledge-search',label:'Source search',description:'Search indexed documents and maintain the knowledge cache.'},
    {path:'/admin/astro-library-status',label:'Astro Clock library status',description:'Inspect the existing indexed Astro Clock content.'},
    {path:'/admin/astro-approval-queue',label:'Astro Clock source review',description:'Review flagged source records.'},
  ]},
];
