<template>
  <NoSSR>
    <div id="detailed-cart">
      <div class="detailed-cart">
        <div v-if="totalItems" class="detailed-cart__aside">
          <OOrderSummary />
          <SfButton class="om-btn--primary checkout--btn" @click="goToCheckout">
            Go to checkout
          </SfButton>
        </div>
        <div class="detailed-cart__main">
          <transition name="sf-fade" mode="out-in">
            <div
              v-if="totalItems"
              key="detailed-cart"
              class="collected-product-list"
            >
              <transition-group name="sf-fade">
                <SfCollectedProduct
                  v-for="product in productsInCart"
                  :key="product.id"
                  v-model="product.qty"
                  :image="getThumbnailForProductExtend(product)"
                  :regular-price="getProductPrice(product).regular"
                  :special-price="getProductPrice(product).special"
                  class="sf-collected-product--detailed collected-product"
                  @click:remove="removeHandler(product)"
                  @input="changeQuantity(product, $event)"
                >
                  <template v-if="!isJpgRender(product)" #image>
                    <OmSvgViewer
                      :width="50"
                      :height="50"
                      :image-code="getImage(product)"
                      :dom-id="product.id"
                    />
                  </template>
                  <template #title>
                    <div v-if="product.groupedParents" class="title-container">
                      <div
                        v-for="(p, index) in product.groupedParents"
                        :key="p.name"
                      >
                        <span v-if="index !== 0" class="divider">|</span>
                        <router-link
                          :to="localizedRoute(p.link)"
                          :title="$t('Home Page')"
                          class="a-logo"
                        >
                          {{ p.name }}
                        </router-link>
                      </div>
                    </div>
                    <div v-else>
                      {{ product.name }}
                    </div>
                  </template>
                  <template #configuration>
                    <div class="collected-product__properties">
                      <SfProperty
                        v-for="(property, key) in product.configuration"
                        :key="key"
                        :name="property.name"
                        :value="property.value"
                      />
                    </div>
                  </template>
                  <template #actions>
                    <div class="actions desktop-only">
                      <!-- <SfButton class="sf-button--text actions__button"
                      >Edit</SfButton
                    >
                    <SfButton class="sf-button--text actions__button"
                      >Save for later</SfButton
                    >
                    <SfButton class="sf-button--text actions__button"
                      >Add to compare</SfButton
                    >
                    <SfButton class="sf-button--text actions__button"
                      >Add message or gift wrap</SfButton
                    > -->
                      <div v-if="product.fitVehicles && product.fitVehicles.length">
                        <p class="fitment-vehicles">
                          <b>Fitment Vehicles</b>
                        </p>
                        <p v-for="vehicle in product.fitVehicles" :key="vehicle.National_Code">
                          {{ vehicle.Model }} : {{ vehicle.VRN }}
                        </p>
                      </div>

                      <!-- <span class="actions__description">
                      Usually arrives in 5-13 business days. A shipping timeline
                      specific to your destination can be viewed in Checkout.
                    </span> -->
                      <OmRadioCheckbox
                        v-if="isFittingProduct(product.sku)"
                        v-model="fittingRadioModels[product.sku]"
                        :items="fittingItems"
                        @change="onFittingChange(product)"
                        :price="getFittingPrice(product.sku, product.qty)"
                      />
                    </div>
                  </template>
                </SfCollectedProduct>
              </transition-group>
            </div>
            <div v-else key="empty-cart" class="empty-cart">
              <transition name="fade" mode="out-in">
                <div key="empty-cart" class="empty-cart">
                  <div class="empty-cart__banner">
                    <SfHeading
                      :title="$t('Your bag is empty')"
                      :subtitle="
                        $t(
                          'Looks like you haven’t added any items to the bag yet. Start shopping to fill it in.'
                        )
                      "
                      :level="2"
                      class="empty-cart__heading"
                    />
                  </div>
                </div>
              </transition>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </NoSSR>
</template>
<script>
import {
  SfCollectedProduct,
  SfButton,
  SfImage,
  SfProperty,
  SfHeading
} from '@storefront-ui/vue';
import OOrderSummary from 'theme/components/organisms/o-order-summary';
import { mapGetters, mapActions } from 'vuex';
import OMicrocartPanelList from 'theme/components/organisms/o-microcart-panel-list.vue';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import { getProductPrice, getProductPriceFromTotals } from 'theme/helpers';
import { onlineHelper } from '@vue-storefront/core/helpers';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import * as VehicleStorage from 'theme/store/vehicles-storage';
import OmRadioCheckbox from 'theme/components/omni/om-radio-checkbox';
import buildQuery from '@vue-storefront/core/modules/catalog/helpers/associatedProducts/buildQuery.ts';
import { ProductService } from '@vue-storefront/core/data-resolver/ProductService';
import rates from 'theme/resource/rates.json';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import OmSvgViewer from 'theme/components/svg-viewer.vue';
import { ModalList } from 'theme/store/ui/modals'
import NoSSR from 'vue-no-ssr'

export default {
  name: 'CartPage',
  components: {
    SfCollectedProduct,
    SfImage,
    SfButton,
    SfHeading,
    SfProperty,
    OOrderSummary,
    OMicrocartPanelList,
    OmRadioCheckbox,
    OmSvgViewer
  },
  data () {
    return {
      fittingProducts: [],
      fittingItems: [
        {
          value: false,
          title: 'No Fitment',
          description: 'Collection from Dealership'
        },
        {
          value: true,
          title: 'Fitted by Us',
          description: 'We will fit this item'
        }
      ],
      fittingRadioModels: {}
    };
  },
  computed: {
    ...mapGetters({
      productsInCart: 'cart/getCartItems',
      totals: 'cart/getTotals',
      getAttributeLabelById: 'vehicles/getAttributeLabelById',
      cartToken: 'cart/getCartToken',
      userToken: 'user/getToken'
    }),
    totalItems () {
      return this.productsInCart.reduce(
        (totalItems, product) => totalItems + parseInt(product.qty, 10),
        0
      );
    },
    missingVin () {
      let flag = false;
      this.productsInCart.map(product => {
        if (product.fitVehicles) {
          product.fitVehicles.map(vehicle => {
            if (!vehicle.VIN && !vehicle.VRN) flag = true;
          })
        }
      })

      return flag;
    }
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    getThumbnailForProductExtend (product) {
      return getThumbnailForProduct(product);
    },
    getProductPrice (product) {
      return onlineHelper.isOnline && product.totals && getProductPrice(product);
    },
    getProductOptions (product) {
      return onlineHelper.isOnline && product.totals && product.totals.options
        ? product.totals.options
        : product.options || {};
    },
    async removeHandler (product) {
      this.$store.dispatch('cart/removeItem', { product: product });
      await VehicleStorage.removeFittingProduct(product.sku)
    },
    goToCheckout () {
      if (this.missingVin) {
        this.openModal({
          name: ModalList.OmCartCheckoutModal
        })
      } else {
        this.$router.push(localizedRoute('/checkout'));
      }
    },
    changeQuantity (product, newQuantity) {
      this.$store.dispatch('cart/updateQuantity', {
        product: product,
        qty: newQuantity
      });
    },
    getFittingPrice (sku, qty) {
      const currentFittingProduct = this.fittingProducts.find(p => p.sku === sku);

      return qty * currentFittingProduct.price;
    },
    isFittingProduct (sku) {
      return this.fittingProducts.find(p => p.sku === sku);
    },
    async onFittingChange (product) {
      await VehicleStorage.updateFittingProductVisible(product.sku, this.fittingRadioModels[product.sku])

      this.$bus.$emit('cart-fitment-item-changed');
    },
    isJpgRender (product) {
      if (product.main_image) return false
      else return true;
    },
    getImage (product) {
      if (product.groupedParents && product.groupedParents.length) {
        const imageList = product.image_list.split(',');

        return imageList.length ? imageList[0] : '';
      } else {
        return product.main_image;
      }
    }
  },
  async mounted () {
    this.fittingProducts = await VehicleStorage.getFittingProducts();
    this.fittingProducts.map(p => {
      this.fittingRadioModels[p.sku] = p.status
    })
    const fitmentSkus = this.fittingProducts.map(product => product.sku);
    const query = buildQuery(fitmentSkus)
    const { items } = await ProductService.getProducts({
      query,
      options: {
        prefetchGroupProducts: false,
        fallbackToDefaultWhenNoAvailable: false,
        setProductErrors: false,
        setConfigurableProductOptions: false,
        assignProductConfiguration: false,
        separateSelectedVariant: false
      }
    })

    this.fittingProducts.forEach(product => {
      const newFitmentProduct = items.find(p => p.sku === product.sku)
      if (newFitmentProduct) {
        if (newFitmentProduct.fitment_time) {
          const productFitRate = rates['rates'].find(rate => +rate.store === +currentStoreView().storeId);
          product.price = +productFitRate.rate * +newFitmentProduct.fitment_time
        } else {
          product.price = newFitmentProduct.fixed_fitment_price;
        }
      }
    });

    await VehicleStorage.asyncLocalStorage.removeItem(currentStoreView().storeCode + '/fitting-products');
    await VehicleStorage.asyncLocalStorage.setItem(currentStoreView().storeCode + '/fitting-products', JSON.stringify(this.fittingProducts));
  }
};
</script>
<style lang='scss' scoped>
@import '~@storefront-ui/vue/styles';

#detailed-cart {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1800px;
    margin: 0 auto;
    padding: 0;
  }
}
.breadcrumbs {
  padding: var(--spacer-base) 0;
}
.detailed-cart {
  &__main {
    padding: 0 var(--spacer-sm);
    @include for-desktop {
      padding: 0;
    }
  }
  &__aside {
    box-sizing: border-box;
    width: 100%;
    background: #fff;
    padding: var(--spacer-base) var(--spacer-sm);
  }
  @include for-desktop {
    display: flex;
    &__main {
      flex: 1;
      padding: 45px;
    }
    &__aside {
      flex: 0 0 33.33333%;
      order: 1;
      margin: 0;
      padding: 45px;
    }
  }
}
.collected-product {
  --collected-product-padding: var(--spacer-sm) 0;
  --collected-product-actions-display: flex;
  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;
  align-items: center;
  &:first-of-type {
    border-top: none;
  }
  &__properties {
    .sf-property {
      margin: var(--spacer-xs) 0;
    }
    --property-value-font-weight: var(--font-weight--normal);
    margin: var(--spacer-sm) 0 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    flex: 2;
  }
  @include for-mobile {
    --collected-product-remove-bottom: var(--spacer-sm);
  }
  @include for-desktop {
    --collected-product-padding: 10px 0;
  }
}
.actions {
  display: flex;

  .fitment-vehicles {
    margin-top: 0;
  }
  &__button {
    display: block;
    margin: 0 0 var(--spacer-xs) 0;
    color: var(--c-text);
    &:hover {
      color: var(--c-text-muted);
    }
  }
  &__description {
    font-family: var(--font-family--primary);
    font-size: var(--font-size--sm);
    font-weight: var(--font-weight--light);
    color: var(--c-text-muted);
    position: absolute;
    bottom: 0;
    padding-bottom: var(--spacer-lg);
  }
}
.empty-cart {
  --heading-title-color: var(--c-primary);
  --heading-title-margin: 0 0 var(--spacer-base) 0;
  --heading-description-margin: 0 0 var(--spacer-xl) 0;
  --heading-title-font-weight: var(--font-weight--semibold);
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  &__image {
    --image-width: 13.1875rem;
    margin: var(--spacer-2xl) 0;
  }
  @include for-desktop {
    &__image {
      --image-width: 22rem;
    }
    &__button {
      --button-width: 20.9375rem;
    }
  }
}

.collection-group {
  border: 1px solid #9a9a9a;
  padding: 10px;
  border-radius: var(--border-radius);
  height: calc(100vh - 200px);
  overflow-y: auto;

  &__title {
    display: flex;
    align-items: center;
    padding: 10px;
    background: var(--_c-gray-accent-darken);
    border-radius: var(--border-radius);
    margin-bottom: 10px;
    .sf-image {
      margin-right: 10px;
    }
  }
}

.divider {
  margin-left: 5px;
}

.title-container {
  display: flex;
  font-size: 10px;
  font-weight: bold;
}
.checkout--btn{
      width: 100%;
    margin-top: 20px;
}
::v-deep .sf-collected-product__quantity-wrapper{
position: relative;
}

::v-deep .svg-container {
  min-width: 40px !important;
  min-height: auto;
}
</style>
