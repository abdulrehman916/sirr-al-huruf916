// Daily production controls. Supporting maintenance tools live under Settings.
export const ADMIN_NAVIGATION = [
  { label: 'Overview', items: [{path:'/admin/access-dashboard',label:'Dashboard',icon:'dashboard'}] },
  { label: 'Customer access', items: [
    {path:'/admin/approved-users',label:'Customers',icon:'users'},
    {path:'/admin/access-codes',label:'Codes & renewals',icon:'codes'},
    {path:'/admin/access-requests',label:'Access requests',icon:'requests'},
    {path:'/admin/redeem-approvals',label:'Redeem approvals',icon:'approvals'},
    {path:'/admin/page-permissions',label:'Pages & pricing',icon:'pages'},
    {path:'/admin/support',label:'Customer support',icon:'support'},
  ]},
  { label: 'App management', items: [
    {path:'/admin/shop',label:'Shop',icon:'shop'},
    {path:'/admin/system-settings',label:'Settings',icon:'settings'},
  ]},
];
export const ADMIN_MAINTENANCE = [
  {label:'Independent publishing',items:[
    {path:'/admin/content-studio',label:'Content Studio',description:'Create and publish website pages.'},
    {path:'/admin/books-studio',label:'Books Studio',description:'Manage independent book publications.'},
    {path:'/admin/resource-studio',label:'Resource access & pricing',description:'Manage independent resource entitlements and prices.'},
  ]},
  {label:'Configuration',items:[
    {path:'/admin/settings',label:'App settings',description:'Existing app preferences and maintenance controls.'},
    {path:'/admin/feature-pricing',label:'Feature pricing',description:'Manage individual feature prices.'},
  ]},
  {label:'Activity',items:[
    {path:'/admin/access-logs',label:'Access history',description:'Investigate code activation and access issues.'},
    {path:'/admin/audit-log',label:'Owner audit history',description:'Review recorded owner actions.'},
    {path:'/admin/analytics',label:'Analytics',description:'Review usage reports.'},
    {path:'/admin/products',label:'Products',description:'Manage the products shown in the existing shop.'},
  ]},
  {label:'Content maintenance',items:[
    {path:'/admin/master-pdf-library',label:'Source documents',description:'Connected to the Astro Clock indexing pipeline; keep when maintaining source content.'},
    {path:'/admin/pending-reviews',label:'Source content review',description:'Approve or reject extracted source pages before using them.'},
    {path:'/admin/knowledge-search',label:'Source search',description:'Search indexed documents and maintain the knowledge cache.'},
    {path:'/admin/purpose-dictionary',label:'Purpose dictionary',description:'Maintain the existing Mizan interpretation dictionary.'},
    {path:'/admin/astro-library-status',label:'Astro Clock library status',description:'Inspect the existing indexed Astro Clock content.'},
    {path:'/admin/astro-approval-queue',label:'Astro Clock source review',description:'Review flagged source records.'},
  ]},
];
