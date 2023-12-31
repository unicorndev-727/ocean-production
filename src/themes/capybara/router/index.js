const Home = () =>
  import(/* webpackChunkName: "vsf-home" */ 'theme/pages/Home');
const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Product = () =>
  import(/* webpackChunkName: "vsf-product" */ 'theme/pages/Product');
const Category = () =>
  import(/* webpackChunkName: "vsf-category" */ 'theme/pages/Category');
const Checkout = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Checkout');
const Cart = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Cart');
const MyAccount = () =>
  import(/* webpackChunkName: "vsf-cart" */ 'theme/pages/MyAccount');
const Static = () =>
  import(/* webpackChunkName: "vsf-static" */ 'theme/pages/Static');
const Vehicle = () =>
  import(/* webpackChunkName: "vsf-static" */ 'theme/pages/Vehicle');
const VehicleSvg = () =>
  import(/* webpackChunkName: "vsf-static" */ 'theme/pages/VehicleSvg');
const About = () =>
  import(/* webpackChunkName: "vsf-static" */ 'theme/pages/About');
const ExternalSuccessPage = () => import(/* webpackChunkName: "vsf-ExternalSuccessPage" */ '../pages/ExternalSuccess.vue');
const DeliverPage = () => import(/* webpackChunkName: "vsf-ExternalSuccessPage" */ 'theme/pages/Deliver.vue');

let routes = [
  { name: 'home', path: '/', component: Home, alias: '/pwa.html', meta: { breadcrumb: 'Home' } },
  { name: 'storyblok', path: '/static/:pageId', component: About, meta: { breadcrumb: 'Static' } },
  { name: 'cart', path: '/cart', component: Cart, meta: { breadcrumb: 'Cart' } },
  { name: 'checkout', path: '/checkout', component: Checkout, meta: { subLayout: 'checkout', breadcrumb: 'Checkout' } },
  { name: 'legal', path: '/legal', component: Static, meta: { breadcrumb: 'Legal' } },
  { name: 'privacy', path: '/privacy', component: Static, meta: { breadcrumb: 'Privacy' } },
  { name: 'my-account', path: '/my-account', component: MyAccount, meta: { breadcrumb: 'My account' } },
  { name: 'about-us', path: '/about-us', component: Static, meta: { breadcrumb: 'About us' } },
  { name: 'customer-service', path: '/customer-service', component: Static, meta: { breadcrumb: 'Customer Service' } },
  { name: 'store-locator', path: '/store-locator', component: Static, meta: { breadcrumb: 'Store locator' } },
  { name: 'size-guide', path: '/size-guide', component: Static, meta: { breadcrumb: 'Size guide' } },
  { name: 'delivery', path: '/delivery', component: Static, meta: { breadcrumb: 'Delivery' } },
  { name: 'returns', path: '/returns', component: Static, meta: { breadcrumb: 'Returns' } },
  { name: 'contact', path: '/contact', component: Static, meta: { breadcrumb: 'Contact' } },
  { name: 'page-not-found', path: '*', component: ErrorPage, meta: { breadcrumb: 'Error' } },
  { name: 'error', path: '/error', component: ErrorPage, meta: { layout: 'minimal', breadcrumb: 'Error' } },
  { name: 'virtual-product', path: '/p/:parentSku/:slug', component: Product, meta: { breadcrumb: 'Virtual product' } },
  { name: 'bundle-product', path: '/p/:parentSku/:slug', component: Product, meta: { breadcrumb: 'Bundle product' } },
  { name: 'simple-product', path: '/p/:parentSku/:slug', component: Product, meta: { breadcrumb: 'Simple product' } },
  { name: 'downloadable-product', path: '/p/:parentSku/:slug', component: Product, meta: { breadcrumb: 'Downloadable product' } },
  { name: 'grouped-product', path: '/p/:parentSku/:slug', component: Product, meta: { breadcrumb: 'Grouped product' } },
  { name: 'configurable-product', path: '/p/:parentSku/:slug/:childSku', component: Product, meta: { breadcrumb: 'Configurable product' } },
  { name: 'product', path: '/p/:parentSku/:slug/:childSku', component: Product, meta: { breadcrumb: 'Product' } },
  { name: 'category', path: '/c/:slug', component: Category, meta: { breadcrumb: 'Category' } },
  { name: 'cms-page', path: '/i/:slug', component: Static, meta: { breadcrumb: 'CMS page' } },
  { name: 'vehicle-page', path: '/vehicle', component: Vehicle, meta: { breadcrumb: 'Vehicle page' } },
  { name: 'vehicle-svg', path: '/vehicle/:nationalCode/parts/:visualGroup', component: VehicleSvg, meta: { breadcrumb: 'Vehicle svg page' } },
  { name: 'external-thank-you', path: '/order-success', component: ExternalSuccessPage, meta: { layout: 'default' } },
  { name: 'deliver', path: '/cart/deliver', component: DeliverPage, meta: { breadcrumb: 'Deliver' } }
];

export default routes;
