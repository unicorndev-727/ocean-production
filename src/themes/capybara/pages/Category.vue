<template>
  <div id="category">
    <div class="main section">
      <div class="sidebar desktop-only">
        <div>
          <OmVehicleCardCategory
            :vehicle="activeVehicle"
            :active="true"
          />
        </div>
        <div class="filters">
          <lazy-hydrate :trigger-hydration="!loading">
            <SfAccordion
              open="Accessories"
              :first-open="true"
              :multiple="true"
              transition=""
              show-chevron
            >
              <template v-for="(filters, filterType) in availableFilters">
                <SfAccordionItem :key="filterType" :header="title(filterType)">
                  <template v-if="filterType === 'colour_filter'">
                    <div class="filters__colors" :key="filterType + 'filter'">
                      <SfColor
                        v-for="filter in filters"
                        :key="filter.id"
                        :color="filter.color"
                        :selected="isFilterActive(filter)"
                        class="filters__color"
                        @click="changeFilter(filter)"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <SfFilter
                      v-for="filter in filters"
                      :key="filter.id"
                      :label="filter.label"
                      :count="filter.count"
                      :color="filter.color"
                      :selected="isFilterActive(filter)"
                      class="filters__item"
                      @change="changeFilter(filter)"
                    />
                  </template>
                </SfAccordionItem>
              </template>
            </SfAccordion>
          </lazy-hydrate>
        </div>
      </div>
      <div class="products">
        <lazy-hydrate :trigger-hydration="!loading">
          <OmCategoryHeader
            v-if="!!getCurrentCategory"
            :title="getCategoryTitle"
            :products="getCurrentCategory.children_data"
            :description="getCurrentCategory.description"
            :parent-id="getCurrentCategory.parent_id "
          />
        </lazy-hydrate>
        <div class="navbar section">
          <div class="navbar__main">
            <div class="navbar__filter mobile-only">
              <SfButton
                class="sf-button--text navbar__filters-button"
                @click="isFilterSidebarOpen = true"
              >
                <SfIcon size="18px" class="navbar__filters-icon" color="#BEBFC4" icon="filter" />
                {{ $t("Filters") }}
              </SfButton>
              <template v-if="activeFiltersCount">
                ({{ activeFiltersCount }})
                <span> &nbsp;&mdash;&nbsp;</span>
                <button @click="clearAllFilters" class="sf-button sf-button--text navbar__filters-clear-all">
                  {{ $t('Clear all') }}
                </button>
              </template>
            </div>
            <div class="navbar__counter">
              <span class="navbar__label desktop-only">
                {{ $t("Products found") }}:
              </span>
              <strong class="desktop-only">{{ productTotalCount }}</strong>
              <span class="navbar__label mobile-only">
                {{ $t("{count} items", { count: productTotalCount }) }}
              </span>
            </div>
            <div class="navbar__sort">
              <span class="navbar__label desktop-only">{{ $t("Sort By") }}:</span>
              <SfSelect
                class="navbar__select sort-by"
                ref="SortBy"
                :selected="sortOrder"
                @change="changeSortOder"
              >
                <SfSelectOption
                  v-for="option in sortOptions"
                  :key="option.id"
                  :value="option.id"
                  class="sort-by__option"
                >
                  {{ option.label }}
                </SfSelectOption>
              </SfSelect>
              <SfButton
                class="sf-button--text navbar__filters-button sort-by__button mobile-only"
                @click="$refs.SortBy.toggle()"
              >
                {{ $t("Sort By") }}
                <ASortIcon />
              </SfButton>
            </div>
          </div>
        </div>
        <SfLoader v-if="loading" :loading="loading" />
        <SfHeading
          v-if="isCategoryEmpty"
          :title="$t('No products found!')"
          :subtitle="
            $t(
              'Please change Your search criteria and try again. If still not finding anything relevant, please visit the Home page and try out some of our bestsellers!'
            )
          "
        />
        <template v-else>
          <lazy-hydrate :trigger-hydration="!loading">
            <transition-group
              appear
              name="products__slide"
              tag="div"
              class="products__grid"
            >
              <SfProductCard
                v-for="product in currentPageProducts"
                :key="product.id"
                :title="product.enhanced_title || product.title"
                :image="product.image"
                :regular-price="product.price.regular"
                :special-price="product.price.special"
                :link="product.link"
                link-tag="router-link"
                :wishlist-icon="false"
                class="products__product-card"
              >
                <template v-if="!isJpgRender(product)" #image>
                  <svg-viewer
                    :width="200"
                    :height="200"
                    :image-id="getImageId(product.main_image)"
                    :image-code="product.main_image"
                    :dom-id="product.id"
                  />
                </template>
                <template v-if="!product.price.regular && !product.price.special" #price>
                  <b :style="{color: 'black'}">Not Available Online</b>
                </template>
              </SfProductCard>
            </transition-group>
          </lazy-hydrate>
          <SfPagination
            v-if="totalPages > 1"
            class="products__pagination desktop-only"
            :current="currentPage"
            :total="totalPages"
            :visible="3"
          />
        </template>
      </div>
    </div>
    <SfBreadcrumbs class="breadcrumbs desktop-only" :breadcrumbs="breadcrumbs">
      <template #link="{ breadcrumb }">
        <router-link
          :to="breadcrumb.route.link"
          class="sf-breadcrumbs__breadcrumb"
        >
          {{ breadcrumb.text }}
        </router-link>
      </template>
    </SfBreadcrumbs>
    <SfSidebar
      :visible="isFilterSidebarOpen"
      :title="$t('Filters')"
      class="sidebar-filters"
      @close="isFilterSidebarOpen = false"
    >
      <div v-if="shouldShowVehicleCard">
        <OmVehicleCartCard
          :vehicle="activeVehicle"
          :active="true"
        />
      </div>
      <div class="filters">
        <lazy-hydrate :trigger-hydration="!loading">
          <SfAccordion
            open="Accessories"
            :first-open="true"
            :multiple="true"
            transition=""
            show-chevron
          >
            <template v-for="(filters, filterType) in availableFilters">
              <SfAccordionItem :key="filterType" :header="$t(filterType)">
                <template v-if="filterType === 'colour_filter'">
                  <div class="filters__colors" :key="filterType + 'filter'">
                    <SfColor
                      v-for="filter in filters"
                      :key="filter.id"
                      :color="filter.color"
                      :selected="isFilterActive(filter)"
                      class="filters__color"
                      @click="changeFilter(filter)"
                    />
                  </div>
                </template>
                <template v-else>
                  <SfFilter
                    v-for="filter in filters"
                    :key="filter.id"
                    :label="filter.label"
                    :count="filter.count"
                    :color="filter.color"
                    :selected="isFilterActive(filter)"
                    class="filters__item"
                    @change="changeFilter(filter)"
                  />
                </template>
              </SfAccordionItem>
            </template>
          </SfAccordion>
        </lazy-hydrate>
      </div>
      <template #content-bottom>
        <div class="filters__buttons">
          <SfButton
            class="sf-button--full-width"
            @click="isFilterSidebarOpen = false"
          >
            {{ $t("Done") }}
          </SfButton>
          <SfButton
            class="sf-button--full-width filters__button-clear"
            @click="clearAllFilters"
          >
            {{ $t("Clear all") }}
          </SfButton>
        </div>
      </template>
    </SfSidebar>
  </div>
</template>

<script>
import LazyHydrate from 'vue-lazy-hydration';
import { mapGetters, mapActions } from 'vuex';
import castArray from 'lodash-es/castArray';
import config from 'config';
import {
  buildFilterProductsQuery,
  isServer
} from '@vue-storefront/core/helpers';
import i18n from '@vue-storefront/i18n';
import onBottomScroll from '@vue-storefront/core/mixins/onBottomScroll';
import { htmlDecode } from '@vue-storefront/core/filters';
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';
import { getSearchOptionsFromRouteParams } from '@vue-storefront/core/modules/catalog-next/helpers/categoryHelpers';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import {
  getTopLevelCategories,
  prepareCategoryMenuItem,
  prepareCategoryProduct
} from 'theme/helpers';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import ASortIcon from 'theme/components/atoms/a-sort-icon';
import {
  SfIcon,
  SfList,
  SfColor,
  SfButton,
  SfSelect,
  SfFilter,
  SfLoader,
  SfSidebar,
  SfHeading,
  SfMenuItem,
  SfAccordion,
  SfPagination,
  SfBreadcrumbs,
  SfProductCard,
  SfSearchBar
} from '@storefront-ui/vue';
import OmVehicleCardCategory from 'theme/components/omni/om-vehicle/om-vehicle-card-category';
import OmCategoryHeader from 'theme/components/omni/om-category-header';
import SvgViewer from 'theme/components/svg-viewer.vue';
import { ModalList } from 'theme/store/ui/modals';
import { createSmoothscroll } from 'theme/helpers';
import SearchPanelMixin from '@vue-storefront/core/compatibility/components/blocks/SearchPanel/SearchPanel';

const THEME_PAGE_SIZE = 12;
const LAZY_LOADING_ACTIVATION_BREAKPOINT = 1024;

const composeInitialPageState = async (store, route, forceLoad = false) => {
  try {
    const filters = getSearchOptionsFromRouteParams(route.params);
    const cachedCategory = store.getters['category-next/getCategoryFrom'](
      route.path
    );
    const currentCategory =
      cachedCategory && !forceLoad
        ? cachedCategory
        : await store.dispatch('category-next/loadCategory', { filters });
    await store.dispatch('category-next/loadCategoryProducts', {
      route,
      category: currentCategory,
      pageSize: THEME_PAGE_SIZE
    });
    const breadCrumbsLoader = store.dispatch(
      'category-next/loadCategoryBreadcrumbs',
      {
        category: currentCategory,
        currentRouteName: currentCategory.name,
        omitCurrent: true
      }
    );

    if (isServer) await breadCrumbsLoader;
    catalogHooksExecutors.categoryPageVisited(currentCategory);
  } catch (e) {
    //
  }
};

export default {
  name: 'CategoryPage',
  components: {
    LazyHydrate,
    ASortIcon,
    SfIcon,
    SfList,
    SfColor,
    SfLoader,
    SfButton,
    SfSelect,
    SfFilter,
    SfSidebar,
    SfHeading,
    SfMenuItem,
    SfAccordion,
    SfPagination,
    SfBreadcrumbs,
    SfProductCard,
    OmVehicleCardCategory,
    SvgViewer,
    SfSearchBar,
    OmCategoryHeader
  },
  mixins: [onBottomScroll, SearchPanelMixin],
  data () {
    return {
      loading: true,
      loadingProducts: false,
      currentPage: 1,
      getMoreCategoryProducts: [],
      browserWidth: 0,
      isFilterSidebarOpen: false,
      unsubscribeFromStoreAction: null,
      aggregations: null
    };
  },
  computed: {
    ...mapGetters({
      getCurrentSearchQuery: 'category-next/getCurrentSearchQuery',
      getCategoryProducts: 'category-next/getCategoryProducts',
      getCurrentCategory: 'category-next/getCurrentCategory',
      getCategoryProductsTotal: 'category-next/getCategoryProductsTotal',
      getAvailableFilters: 'category-next/getAvailableFilters',
      getCurrentFilters: 'category-next/getCurrentFilters',
      hasActiveFilters: 'category-next/hasActiveFilters',
      getSystemFilterNames: 'category-next/getSystemFilterNames',
      getCategories: 'category/getCategories',
      getBreadcrumbsRoutes: 'breadcrumbs/getBreadcrumbsRoutes',
      getBreadcrumbsCurrent: 'breadcrumbs/getBreadcrumbsCurrent',
      getAttributeLabelById: 'vehicles/getAttributeLabelById',
      getAttributeIdByLabel: 'vehicles/getAttributeIdByLabel',
      activeVehicle: 'vehicles/activeVehicle'
    }),
    isLazyHydrateEnabled () {
      return config.ssr.lazyHydrateFor.includes('category-next.products');
    },
    isCategoryEmpty () {
      return this.getCategoryProductsTotal === 0;
    },
    productTotalCount () {
      return this.getCategoryProductsTotal;
    },
    isLazyLoadingEnabled () {
      return this.browserWidth < LAZY_LOADING_ACTIVATION_BREAKPOINT;
    },
    breadcrumbs () {
      return this.getBreadcrumbsRoutes
        .map(route => ({
          text: htmlDecode(route.name),
          route: {
            link: route.route_link
          }
        }))
        .concat({
          text: htmlDecode(this.getBreadcrumbsCurrent)
        });
    },
    categories () {
      return getTopLevelCategories(this.getCategories)
        .map(category => {
          const viewAllMenuItem = {
            ...category,
            name: i18n.t('View all'),
            position: 0
          };

          const subCategories = category.children_data
            ? category.children_data
              .map(subCategory =>
                prepareCategoryMenuItem(
                  this.getCategories.find(
                    category => category.id === subCategory.id
                  )
                )
              )
              .filter(Boolean)
            : [];

          return {
            ...prepareCategoryMenuItem(category),
            items: [prepareCategoryMenuItem(viewAllMenuItem)]
              .concat(subCategories)
              .sort((a, b) => a.position - b.position)
          };
        })
        .sort((a, b) => a.position - b.position);
    },
    currentPageProducts () {
      // lazy loading is disabled for desktop screen width (>= 1024px)
      // so products from store have to be filtered out because there could
      // be more than THEME_PAGE_SIZE of them - they could be fetched earlier
      // when lazy loading was enabled
      return this.isLazyLoadingEnabled || this.currentPage === 1
        ? this.getCategoryProducts
          .filter((product, i) => {
            return this.isLazyLoadingEnabled || i < THEME_PAGE_SIZE;
          })
          .map(prepareCategoryProduct)
        : this.getMoreCategoryProducts.map(prepareCategoryProduct);
    },
    totalPages () {
      return Math.ceil(this.getCategoryProductsTotal / THEME_PAGE_SIZE);
    },
    sortOrder () {
      return (
        this.getCurrentSearchQuery.sort ||
        `${config.products.defaultSortBy.attribute}:${config.products.defaultSortBy.order}`
      );
    },
    sortOptions () {
      return Object.entries(config.products.sortByAttributes).map(attribute => {
        const [label, id] = attribute;
        return { id, label };
      });
    },
    sortLabel () {
      const selectedSortOrder =
        this.sortOptions.find(sortOption => sortOption.id === this.sortOrder) ||
        {};
      return selectedSortOrder.label || '';
    },
    availableFilters () {
      const result = Object.entries(this.getAvailableFilters || {})
        .filter(([filterType, filters]) => {
          return (
            filters.length && !this.getSystemFilterNames.includes(filterType)
          );
        })
        .reduce((result, [filterType, filters]) => {
          if (!filterType.includes('national_code')) {
            result[`${filterType}_filter`] = filters.reduce(
              (result, filter) => {
                result = [
                  ...result,
                  {
                    ...filter,
                    label: filter.label,
                    count: this.getFilterCount(filter) || '',
                    color:
                      filterType === 'color'
                        ? (config.products.colorMappings &&
                          config.products.colorMappings[filter.label]) ||
                        filter.label
                        : undefined
                  }
                ];
                return result;
              },
              []
            );
          }
          return result;
        }, {});

      return result;
    },
    activeFiltersCount () {
      let counter = 0;
      Object.keys(this.getCurrentFilters).forEach(key => {
        if (!key.includes('national_code')) {
          counter += this.getCurrentFilters[key].length;
        }
      });
      return counter;
    },
    isFilterActive () {
      return filter =>
        castArray(this.getCurrentFilters[filter.type]).find(
          variant => variant && variant.id === filter.id
        ) !== undefined;
    },
    getCategoryTitle () {
      return this.breadcrumbs && this.breadcrumbs[this.breadcrumbs.length - 1].text
    },
    shouldShowVehicleCard () {
      let existsNationCode = false;
      if (this.activeVehicle && this.activeVehicle.National_Code) existsNationCode = true;

      let isFullWidth = false;
      if (this.getCurrentCategory && this.getCurrentCategory?.page_layout === 'category-full-width') isFullWidth = true;

      if (!Object.keys(this.availableFilters).length) return false;
      return !!existsNationCode && !isFullWidth;
    }
  },
  watch: {
    sortOrder () {
      if (this.currentPage > 1) {
        this.changePage();
      }
    },
    activeVehicle () {
      this.$store.dispatch('category-next/switchSearchFilters', [
        { id: 'updated_at:desc', type: 'sort' }
      ]);
    },
    $route: {
      immediate: true,
      handler (to, from) {
        this.$store.commit('vehicles/toggleSetPrompt', false);
        if (to.query?.page && to?.path === from?.path) {
          this.changePage(parseInt(to.query.page) || 1);
        } else {
          this.initPagination();
        }
      }
    }
  },
  async asyncData ({ store, route, context }) {
    // this is for SSR purposes to prefetch data - and it's always executed before parent component methods
    if (context) context.output.cacheTags.add('category');
    await composeInitialPageState(store, route);
  },
  async beforeRouteEnter (to, from, next) {
    if (isServer) next();
    // SSR no need to invoke SW caching here
    else if (!from.name) {
      // SSR but client side invocation, we need to cache products and invoke requests from asyncData for offline support
      next(async vm => {
        vm.loading = true;
        await composeInitialPageState(vm.$store, to, true);
        await vm.$store.dispatch('category-next/cacheProducts', { route: to }); // await here is because we must wait for the hydration
        vm.loading = false;
      });
    } else {
      // Pure CSR, with no initial category state
      next(async vm => {
        vm.loading = true;
        vm.$store.dispatch('category-next/cacheProducts', { route: to });
        vm.loading = false;
      });
    }
  },
  mounted () {
    this.unsubscribeFromStoreAction = this.$store.subscribeAction(action => {
      if (action.type === 'category-next/loadAvailableFiltersFrom') {
        this.aggregations = action.payload.aggregations;
      }
    });
    this.$bus.$on('product-after-list', this.initPagination);
    window.addEventListener('resize', this.getBrowserWidth);
    this.getBrowserWidth();
  },
  beforeDestroy () {
    this.unsubscribeFromStoreAction();
    this.$bus.$off('product-after-list', this.initPagination);
    window.removeEventListener('resize', this.getBrowserWidth);
  },
  methods: {
    ...mapActions({
      openVehicleCart: 'ui/toggleSidebar',
      openModal: 'ui/openModal'
    }),
    title (filterType) {
      if (filterType === 'right_left_filter') {
        return 'Fitting Position (R / L)';
      } else if (filterType === 'price_filter') {
        return 'Price';
      } else if (filterType === 'size_filter') {
        return 'Size';
      } else return filterType;
    },
    getBrowserWidth () {
      return (this.browserWidth = window.innerWidth);
    },
    async startSearch () {
      if (this.search.length >= 3) {
        await this.$store.dispatch('category-next/switchSearchFilters', [
          { id: 'search', value: this.search }
        ]);
      } else if (this.search.length === 0) {
        await this.$store.dispatch('category-next/switchSearchFilters', [
          { id: 'search', value: '' }
        ]);
      }
    },
    openSvgViewer () {
      this.openModal({
        name: ModalList.OmVehicleViewerModal,
        payload: {
          nationalCode: this.activeVehicle.National_Code,
          visualGroup: '14'
        }
      });
    },
    getSvgImageData (product) {
      if (product.available_images && product.available_images.length) {
        const imageAry = product.available_images[0].split('_');

        return {
          id: imageAry[0],
          code: imageAry[1]
        };
      }

      return {
        id: null,
        code: null
      };
    },
    async onBottomScroll () {
      if (!this.isLazyLoadingEnabled || this.loadingProducts) {
        return;
      }

      this.loadingProducts = true;
      await this.$store.dispatch('category-next/loadMoreCategoryProducts');
      this.loadingProducts = false;
    },
    async changePage (page = this.currentPage) {
      const start = (page - 1) * THEME_PAGE_SIZE;

      if (
        start < 0 ||
        start >= this.getCategoryProductsTotal ||
        this.getCategoryProductsTotal < THEME_PAGE_SIZE
      ) {
        return;
      }

      const { includeFields, excludeFields } = config.entities.productList;
      const { filters } = this.getCurrentSearchQuery;
      if (
        this.getCurrentCategory?.page_layout &&
        this.getCurrentCategory?.page_layout === 'category-full-width'
      ) {
        // Nothing to do
      } else {
        if (this?.activeVehicle && Object.keys(this.activeVehicle).length) {
          let national_code = [];
          national_code.push({
            attribute_code: 'national_code.keyword',
            id: this.activeVehicle.National_Code,
            label: this.activeVehicle.National_Code,
            type: 'national_code.keyword'
          });
          filters['national_code.keyword'] = national_code;
        }
      }

      const filterQuery = buildFilterProductsQuery(
        this.getCurrentCategory,
        filters
      );

      const searchResult = await quickSearchByQuery({
        query: filterQuery,
        sort: this.sortOrder,
        start: start,
        size: THEME_PAGE_SIZE,
        includeFields: includeFields,
        excludeFields: excludeFields
      });

      this.getMoreCategoryProducts = await this.$store.dispatch(
        'category-next/processCategoryProducts',
        {
          products: searchResult.items,
          filters: filters
        }
      );

      createSmoothscroll(
        document.documentElement.scrollTop || document.body.scrollTop,
        0
      );
      this.currentPage = page;
    },
    initPagination () {
      this.currentPage = 1;
    },
    changeSortOder (sortOrder) {
      if (this.getCurrentSearchQuery.sort !== sortOrder) {
        this.$store.dispatch('category-next/switchSearchFilters', [
          { id: sortOrder, type: 'sort' }
        ]);
      }
    },
    changeFilter (filter) {
      this.$store.dispatch('category-next/switchSearchFilters', [filter]);
    },
    clearAllFilters () {
      this.$store.dispatch('category-next/resetSearchFilters');
    },
    getFilterCount (filter) {
      const aggregations = [
        `agg_range_${filter.type}`,
        `agg_terms_${filter.type}`,
        `agg_terms_${filter.type}_options`
      ];

      return aggregations.reduce((result, aggregation) => {
        const bucket =
          this.aggregations &&
          this.aggregations[aggregation] &&
          this.aggregations[aggregation].buckets.find(
            bucket => String(bucket.key) === String(filter.id)
          );

        return bucket ? result + bucket.doc_count : result;
      }, 0);
    },
    isCategoryActive (category) {
      if (!this.getCurrentCategory.path) {
        return false;
      }

      // The 'View all' sub-category (always at position 0) should be marked as active only if it exactly matches current category path,
      // but all other sub-categories will be marked as active when current category path belongs to them.
      return category.position === 0
        ? this.getCurrentCategory.path === category.path
        : this.getCurrentCategory.path.startsWith(category.path);
    },
    isJpgRender (product) {
      if (product.main_image) return false
      else return true;
    },
    getImageId (imageCode) {
      if (imageCode) {
        const imageCodeAry = imageCode.split('_');
        return imageCodeAry[0];
      } else {
        return null;
      }
    }
  },
  metaInfo () {
    const storeView = currentStoreView();
    const {
      meta_title,
      meta_description,
      name,
      slug
    } = this.getCurrentCategory;
    const meta = meta_description
      ? [
        {
          vmid: 'description',
          name: 'description',
          content: htmlDecode(meta_description)
        }
      ]
      : [];

    return {
      title: htmlDecode(meta_title || name),
      meta
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0
}

#category {
  box-sizing: border-box;
  background: #fff;
  @include for-desktop {
    max-width: 100%;
  }
}
.main {
  &.section {
    padding: var(--spacer-xs);
    @include for-desktop {
      padding: 0;
    }
  }
}
.breadcrumbs {
  padding: 10px 0 20px 0;
  margin: 0 40px;
}
.navbar {
  position: relative;
  display: flex;
  border: 0;
  border-width: 0 0 1px 0;
  @include for-desktop {
    border-width: 1px 0 1px 0;
  }
  &.section {
    padding: var(--spacer-sm);
    @include for-desktop {
      padding: 0;
    }
  }
  &__aside {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 300px;
    padding: var(--spacer-sm) var(--spacer-sm);
    border-width: 0 1px 0 0;
    background: #fff;
    box-shadow: 1px 2px 6px 0px #bbbbbb;
    .vehicle-cart-card {
      border-radius: 0;
      margin-bottom: 20px;
    }
    .vehicle-change-button {
      width: 100%;
      height: 40px;
      border-radius: 0;
    }
  }
  &__main {
    align-items: center;
    display: grid;
    flex: 1;
    grid-template-columns: 1fr minmax(auto, max-content) 1fr;
    grid-template-areas: "filter counter sort";
    @include for-desktop {
      grid-template-areas: "filter sort counter";
      grid-column-gap: var(--spacer-2xl);
      grid-template-columns: max-content max-content auto;
      padding: var(--spacer-xs) var(--spacer-xl);
    }
  }
  &__filters-button {
    display: flex;
    align-items: center;
    font-size: 1rem;
    grid-column: 1;
    justify-self: start;
    &:hover {
      .sf-icon {
        fill: var(--c-primary);
      }
    }
    @include for-mobile {
      --button-text-transform: uppercase;
      font-size: var(--font-xs);
      &.sort-by__button {
        order: 1;
      }
    }
  }
  &__filter {
    display: flex;
    grid-area: filter;
    margin-bottom: 1rem;
  }
  &__filters-icon {
    margin: 0 var(--spacer-sm) 0 0;
  }
  &__label {
    font-family: var(--font-family-secondary);
    font-weight: var(--font-normal);
    color: var(--c-text-muted);
    margin: 0 var(--spacer-2xs) 0 0;
    @include for-mobile {
      font-size: var(--font-xs);
    }
  }
  &__select {
    --select-padding: 0 var(--spacer-lg) 0 var(--spacer-2xs);
    --select-margin: 0;
    --select-selected-padding: 0 var(--spacer-xl) 0 0;
  }
  &__sort {
    display: flex;
    align-items: center;
    justify-self: end;
    grid-area: sort;
    @include for-desktop {
      justify-self: center;
    }
  }
  &__counter {
    font-family: var(--font-family-secondary);
    grid-column: 3;
    justify-self: end;
    grid-area: counter;
  }
  &__view {
    display: flex;
    align-items: center;
    margin: 0 var(--spacer-xl);
    @include for-desktop {
      margin: 0 0 0 var(--spacer-2xl);
    }
    &-icon {
      cursor: pointer;
    }
    &-label {
      margin: 0 var(--spacer-sm) 0 0;
      font: var(--font-medium) var(--font-xs) / 1.6 var(--font-family-secondary);
      text-decoration: underline;
    }
  }
}
.sort-by {
  --select-dropdown-z-index: 2;
  flex: unset;
  padding: 0;
  ::v-deep {
    .sf-select__dropdown {
      min-width: max-content;
    }
    .sf-select-option {
      cursor: pointer;
    }
  }
  // This is needed to hide SfSelect main element on mobile view.
  // This code can be removed when SfSelect supports better customization.
  @include for-mobile {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    --select-dropdown-z-index: 2;
    ::v-deep .sf-select__cancel {
      margin: 16px;
      box-shadow: 4px 12px 24px rgba(119, 121, 122, 0.25);
      --button-width: calc(100% - 32px);
    }
  }
}
.products__grid{
      display: grid !important;
      grid-template-columns: 1fr 1fr 1fr;
      margin: 0 40px;
      gap: 30px;
      padding-bottom: 20px;
      @media (min-width: 1024px) and (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  @include for-mobile{
    grid-template-columns: 1fr 1fr;
     margin: 0;
    gap: 10px;
  }
}
.main {
  display: flex;
  margin: 0;
}
.sidebar {
  flex: 0 0 25% !important;
  padding: 30px 0 !important;
}
.sidebar-filters {
  --sidebar-title-display: none;
  --sidebar-top-padding: 0;
  @include for-desktop {
    --sidebar-content-padding: 0 var(--spacer-xl);
    --sidebar-bottom-padding: 0 var(--spacer-xl);
  }
}
.list {
  --menu-item-font-size: var(--font-sm);
  &__item {
    &:not(:last-of-type) {
      --list-item-margin: 0 0 var(--spacer-sm) 0;
    }
  }
}
.products {
  box-sizing: border-box;
  flex: 1;
  margin: 0;
  &__grid,
  &__list {
    display: flex;
    flex-wrap: wrap;
  }
  &__grid {
    justify-content: space-between;
  }
  &__product-card {
   --product-card-max-width: 100%;
  }
  &__product-card-horizontal {
    flex: 0 0 100%;
  }
  &__slide-enter {
    opacity: 0;
    transform: scale(0.5);
  }
  &__slide-enter-active {
    transition: all 0.2s ease;
    transition-delay: calc(0.1s * var(--index));
  }
  @include for-desktop {
    margin: 0;
    background: #f6f6f6;
    &__pagination {
      display: flex;
      justify-content: center;
      margin: var(--spacer-xl) 0 0 0;
    }
    &__product-card-horizontal {
      margin: var(--spacer-lg) 0;
    }
    &__product-card {
      --product-card-max-width: 100%;
    }
    &__list {
      margin: 0 0 0 var(--spacer-sm);
    }
  }
}
::v-deep .sf-accordion-item__header{
  padding: 25px 30px;
}
.filters {
  width: 100%;
  &__title {
    --heading-title-font-size: var(--font-xl);
    margin: var(--spacer-xl) 0 var(--spacer-base) 0;
    width: 100%;
    /* &:first-child {
      margin: calc(var(--spacer-xl) + var(--spacer-base)) 0 var(--spacer-xs) 0;
    } */
  }
  &__color {
    margin: var(--spacer-xs) var(--spacer-xs) var(--spacer-xs) 0;
    border: 1px solid var(--c-light);
  }
  &__item {
    --filter-label-color: var(--c-secondary-variant);
    --filter-count-color: var(--c-secondary-variant);
    --checkbox-padding: 0 var(--spacer-sm) 0 var(--spacer-xl);
    border: 1px solid var(--c-light) !important;
    padding: 10px;
    width: auto;
    &:last-child {
      border-bottom: 0;
    }
    @include for-desktop {
      --checkbox-padding: 0;
      margin: 10px 0;
      padding: 10px;
    }
  }
  &__accordion-item {
    --accordion-item-content-padding: 0;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    width: 100vw;
  }
  &__buttons {
    margin: var(--spacer-sm) 0;
  }
  &__button-clear {
    --button-background: var(--c-light);
    --button-color: var(--c-dark-variant);
    margin: var(--spacer-xs) 0 0 0;
  }
}
::v-deep .om-vehicle-cart-card {
  padding: 25px 30px;
  .sf-call-to-action.header {
    padding: 0;
  }
  .title {
    font-size: 16px;
    margin: 0;
    padding-right: var(--spacer-sm);
  }
  .products__product-card {
    --product-card-max-width: 30%;
  }
}
::v-deep .sidebar {
  flex: 0 0 23%;
  --_image-width: 100;
  --_image-height: 200;
}

.products {
  ::v-deep .sf-image {
    --_image-width: 600 !important;
    --_image-height: 600 !important;
    img {
    position: absolute !important;
    top: 50%;
    left: 50%;
    -webkit-transform: translate3d(0, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
    }
  &:after{
    display: block;
    content: "";
    padding-bottom: calc(var(--_image-height) / var(--_image-width) * 100%);
  }
  }
  ::v-deep .sf-product-card__image-wrapper{
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    a{
    width: 100%;
    height: 100%;
    }
  }
  ::v-deep .products__product-card {
    --product-card-max-width: 100%;
    margin: 0;
  }
  ::v-deep .sf-product-card {
    &__title {
      --product-card-title-margin: 2px;
      @include for-mobile{
        font-size: 12px !important;
      }
    }
  }
}
.category-title{
  .sf-heading__title{
    font-size: 32px;
  }
}
.category-description{
  max-width: 800px;
  text-align: center;
  margin: auto;
}
@include for-desktop {
  .navbar__main {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sidebar {
    padding: 16px 16px 16px 0;
    border: none;
    .sidebar-wrapper {
      padding: var(--spacer-sm);
      margin-top: 30px;
      box-shadow: 1px 2px 6px 0px #bbbbbb;
    }
  }
}
::v-deep .sf-checkbox__checkmark{
  border-radius: 50%;
}
::v-deep .sf-accordion-item__content{
  padding: 0 30px;
}
</style>
