<template>
  <div class="o-payment">
    <div class="form">
      <!-- <SfCheckbox
        v-if="!isVirtualCart && locationKind === 'delivery_estimate_free'"
        v-model="sendToShippingAddress"
        class="form__element form__checkbox"
        name="sendToShippingAddress"
        :label="$t('Copy address data from shipping')"
      /> -->
      <div class="billing-address-container" v-show="!sendToBillingAddress">
        <div class="billing-address-container__title">
          Billing address
        </div>
      </div>
      <div class="billing-address-content" v-show="!sendToBillingAddress">
        {{ billingAddress }}
      </div>
      <!-- <div class="form__element form__checkbox form_button" v-if="sendToBillingAddress" @click="sendToBillingAddress = sendToBillingAddress">
        Change Billing Address
      </div> -->
      <span
        class="form__billing"
        name="sendToBillingAddress"
        @click="handleClick"
        v-show="!sendToBillingAddress"
      >
        {{ locationKind === 'click_collect_free' ? $t('Edit Billing Address') : $t('Change Billing Address') }}
      </span>
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.firstName"
        class="form__element form__element--half"
        name="first-name"
        :label="$t('First name')"
        required
        :valid="!$v.payment.firstName.$error"
        :error-message="
          !$v.payment.firstName.required
            ? $t('Field is required')
            : $t('Name must have at least 2 letters.')
        "
        @blur="$v.payment.firstName.$touch()"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.lastName"
        class="form__element form__element--half form__element--half-even"
        name="last-name"
        :label="$t('Last name')"
        required
        :valid="!$v.payment.lastName.$error"
        :error-message="$t('Field is required')"
        @blur="$v.payment.lastName.$touch()"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.streetAddress"
        class="form__element"
        name="street-address"
        :label="$t('Street name')"
        required
        :valid="!$v.payment.streetAddress.$error"
        :error-message="$t('Field is required')"
        @blur="$v.payment.streetAddress.$touch()"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.apartmentNumber"
        class="form__element"
        name="apartment-number"
        :label="$t('Address line 2')"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.city"
        class="form__element form__element--half"
        name="city"
        :label="$t('City')"
        required
        :valid="!$v.payment.city.$error"
        :error-message="$t('Field is required')"
        @blur="$v.payment.city.$touch()"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.state"
        class="form__element form__element--half form__element--half-even"
        name="state"
        :label="$t('County')"
      />
      <SfInput
        v-if="sendToBillingAddress"
        v-model.trim="payment.zipCode"
        class="form__element form__element--half"
        name="zipCode"
        :label="$t('Postcode')"
        required
        :valid="!$v.payment.zipCode.$error"
        :error-message="
          !$v.payment.zipCode.required
            ? $t('Field is required')
            : $t('Zip-code must have at least 3 letters.')
        "
        @blur="$v.payment.zipCode.$touch()"
      />
      <SfSelect
        v-if="sendToBillingAddress"
        v-model="payment.country"
        class="
          form__element
          form__element--half
          form__element--half-even
          form__select
          sf-select--underlined
        "
        name="countries"
        :label="$t('Country')"
        required
        :valid="!$v.payment.country.$error"
        :error-message="$t('Field is required')"
        @change="changeCountry"
        @blur="$v.payment.country.$touch()"
      >
        <SfSelectOption
          v-for="country in countries"
          :key="country.code"
          :value="country.code"
        >
          {{ country.name }}
        </SfSelectOption>
      </SfSelect>
      <!-- <VuePhoneNumberInput
        :default-country-code="defaultCountry"
        v-if="sendToBillingAddress"
        v-model.trim="payment.phoneNumber"
        class="form__element"
        name="phone"
        :label="$t('Phone Number')"
        required
        :valid="!$v.payment.phoneNumber.$error"
        @blur="$v.payment.phoneNumber.$touch()"
        :error-message="$t('Field is required')"
        @update="updatePhoneNumber"
      /> -->
      <!-- <SfCheckbox
        v-if="locationKind !== 'click_collect_free'"
        v-model="generateInvoice"
        class="form__element form__checkbox"
        name="generateInvoice"
        :label="$t('I want to generate an invoice for the company')"
      /> -->
      <template v-if="generateInvoice && sendToBillingAddress">
        <SfInput
          v-model.trim="payment.company"
          class="form__element form__element--half"
          name="company-name"
          :label="$t('Company name')"
          required
          :valid="!$v.payment.company.$error"
          :error-message="$t('Field is required')"
          @blur="$v.payment.company.$touch()"
        />
        <SfInput
          v-model.trim="payment.taxId"
          class="form__element form__element--half form__element--half-even"
          name="tax-id"
          :label="$t('Tax identification number')"
          required
          :valid="!$v.payment.taxId.$error"
          :error-message="
            !$v.payment.taxId.required
              ? $t('Field is required')
              : $t('Tax identification number must have at least 3 letters.')
          "
          @blur="$v.payment.taxId.$touch()"
        />
        <p class="mb40 mt0">
          {{ $t("We will send you the invoice to given e-mail address") }}
        </p>
      </template>
      <SfButton
        v-if="sendToBillingAddress"
        class="sf-button--full-width form__action-button"
        :disabled="$v.payment.$invalid"
        type="submit"
        @click="saveBillingAddress"
      >
        {{ $t("Save and Continue") }}
      </SfButton>
    </div>
    <SfHeading
      v-show="!sendToBillingAddress"
      :title="$t('Payment method')"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title mt40"
    />
    <div class="form" v-show="!sendToBillingAddress">
      <div class="form__radio-group" style="width: 100%" v-show="isShowPaymentMethod">
        <SfRadio
          v-for="method in paymentMethods"
          :key="method.code"
          v-model="payment.paymentMethod"
          :label="method.title ? method.title : method.name"
          :value="method.code"
          name="payment-method"
          class="form__radio payment-method"
          @input="changePaymentMethod"
        />
        <div class="stripe-container">
          <payment-stripe ref="paymentStripe" />
        </div>
      </div>
      <div class="form__action">
        <!-- it's epdq form -->

        <SfButton
          class="sf-button--full-width form__action-button"
          :disabled="disableOrder"
          v-show="payment.paymentMethod && !$v.payment.$invalid && showSaveButton && !sendToBillingAddress"
          @click="goToReviewOrder"
        >
          <SfLoader v-if="disableOrder" :loading="disableOrder" />
          <span v-else>{{ $t("Place Order") }}</span>
        </SfButton>
      </div>
    </div>
    <OmCheckoutModal :errors="errors" :is-visible="isVisible" @update=" value => isVisible = value" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { required, minLength } from 'vuelidate/lib/validators';
import {
  unicodeAlpha,
  unicodeAlphaNum
} from '@vue-storefront/core/helpers/validators';
import { Payment } from '@vue-storefront/core/modules/checkout/components/Payment.ts';
import { OrderReview } from '@vue-storefront/core/modules/checkout/components/OrderReview';
import { registerModule } from '@vue-storefront/core/lib/modules';
import { OrderModule } from '@vue-storefront/core/modules/order';
import OmAlertBox from 'theme/components/omni/om-alert-box';
import { Logger } from '@vue-storefront/core/lib/logger'
import OmCheckoutModal from '../omni/modals/om-checkout-modal';

import {
  SfInput,
  SfRadio,
  SfButton,
  SfSelect,
  SfHeading,
  SfCheckbox,
  SfLoader
} from '@storefront-ui/vue';
import { createSmoothscroll } from 'theme/helpers';
import PaymentStripe from 'src/modules/stripe/components/PaymentStripe';
import PaypalButton from 'src/modules/payment-paypal/components/Button';
import PaymentCheckoutCom from 'src/modules/payment-checkout_com/components/payment-frame';
import config from 'config';

export default {
  name: 'OPayment',
  components: {
    SfInput,
    SfRadio,
    SfButton,
    SfSelect,
    SfHeading,
    SfCheckbox,
    OmAlertBox,
    PaymentStripe,
    PaymentCheckoutCom,
    PaypalButton,
    SfLoader,
    OmCheckoutModal
  },
  mixins: [Payment, OrderReview],
  props: {
    nextAccordion: {
      type: Function,
      default: (Number) => {}
    },
    validateOrderBeforeSending: {
      type: Function,
      default: (Number) => {}
    }
  },
  validations () {
    const rules = {
      firstName: {
        required,
        minLength: minLength(2),
        unicodeAlpha
      },
      lastName: {
        required,
        unicodeAlpha
      },
      country: {
        required,
        minLength: minLength(2)
      },
      streetAddress: {
        required,
        unicodeAlphaNum
      },
      zipCode: {
        required,
        minLength: minLength(3),
        unicodeAlphaNum
      },
      city: {
        required,
        unicodeAlpha
      },
      // phoneNumber: {
      //   required
      // },
      paymentMethod: {
        required
      }
    };
    const rulesForInvoice = {
      company: {
        required,
        unicodeAlphaNum
      },
      taxId: {
        required,
        minLength: minLength(3)
      }
    };
    return this.generateInvoice
      ? {
        payment: {
          ...rules,
          ...rulesForInvoice
        }
      }
      : {
        payment: {
          ...rules
        }
      };
  },
  async mounted () {
    const passPhrase = ',3p%LhsENFp44Wn@ycK';
    this.edpqForm.orderId = this.cartToken;
    const cartTotalPrice = this.prices.grand_total;
    this.edpqForm.amount = this.prices.grand_total * 100;
    const shaSignature = `ACCEPTURL=${this.edpqForm.acceptUrl}${passPhrase}AMOUNT=${this.edpqForm.amount}${passPhrase}CURRENCY=${this.edpqForm.currency}${passPhrase}LANGUAGE=${this.edpqForm.language}${passPhrase}ORDERID=${this.edpqForm.orderId}${passPhrase}PSPID=${this.edpqForm.pspId}${passPhrase}`;
    // const hashHex = await getShaSignature(shaSignature);
    // this.shaSign = hashHex.toUpperCase();
    // createSmoothscroll(
    //   document.documentElement.scrollTop || document.body.scrollTop,
    //   0
    // );
    if (this.locationKind === 'click_collect_free') {
      this.sendToBillingAddress = true;
    }
  },
  computed: {
    ...mapGetters({
      paymentDetails: 'checkout/getPaymentDetails',
      cartToken: 'cart/getCartToken',
      totals: 'cart/getTotals'
    }),
    prices () {
      return this.totals.reduce((result, price) => {
        result[price.code] = price.value;
        return result;
      }, {});
    },
    billingAddress () {
      let excludeFields = ['paymentMethod', 'taxId', 'isThankYouPage', 'modifiedAt', 'paymentMethodAdditional', 'country', 'phoneNumber', 'telephone'];
      return Object.keys(this.paymentDetails).filter(payment => !excludeFields.includes(payment) && this.paymentDetails[payment]).map(key => this.paymentDetails[key]).join(', ');
      // else return Object.keys(this.getShippingDetails).filter(payment => !excludeFields.includes(payment) && this.getShippingDetails[payment]).map(key => this.getShippingDetails[key]).join(', ');
    },
    showSaveButton () {
      return this.locationKind !== 'click_collect_free' || (!!this.payment.phoneNumber && this.locationKind === 'click_collect_free');
    },
    isShowPaymentMethod () {
      return (!this.sendToBillingAddress && this.payment?.firstName) || this.locationKind === 'click_collect_free';
    }
  },
  beforeCreate () {
    registerModule(OrderModule);
  },
  data () {
    return {
      shaSign: '',
      edpqForm: {
        acceptUrl: 'https://www.glynhopkinpartsonline.co.uk/bc-order-success',
        amount: 2000,
        currency: 'GBP',
        language: 'en_US',
        orderId: '1010',
        pspId: 'epdq1611513'
      },
      disableOrder: false,
      defaultCountry: config.tax.defaultCountry,
      isValid: false,
      isVisible: false,
      errors: []
    };
  },
  methods: {
    updatePhoneNumber (data) {
      this.isValid = data.isValid;
    },
    handleClick () {
      this.sendToBillingAddress = !this.sendToBillingAddress;
    },
    async goToReviewOrder () {
      this.disableOrder = true;
      this.errors = this.validateOrderBeforeSending();
      // if (this.errors?.length) {
      //   this.disableOrder = false;
      //   this.isVisible = true;
      // } else {
      this.sendDataToCheckout();
      await this.$store.dispatch('cart/pullMethods', { forceServerSync: true })
      this.placeOrder();
      // }
    },
    epdqSubmit () {
      this.sendDataToCheckout();
    },
    async saveBillingAddress () {
      this.sendToBillingAddress = false;
      this.sendDataToCheckout();
      await this.$store.dispatch('cart/pullMethods', { forceServerSync: true })
    },
    setDisableOrder () {
      this.disableOrder = false;
    }
  },
  watch: {
    isShowBillingAddress (value) {
      if (value) this.sendToBillingAddress = true;
    }
  },
  beforeMount () {
    this.$bus.$on('notification-progress-stop', this.setDisableOrder);
    this.$bus.$on('stripe-info-error', this.setDisableOrder);
  },
  beforeDestroy () {
    this.$bus.$off('notification-progress-stop', this.setDisableOrder);
    this.$bus.$off('stripe-info-error', this.setDisableOrder);
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
.title {
  --heading-padding: var(--spacer-base) 0;
  @include for-desktop {
    --heading-title-font-size: var(--h3-font-size);
    --heading-padding: var(--spacer-2xl) 0 var(--spacer-base) 0;
    &:last-of-type {
      --heading-padding: var(--spacer-xs) 0 var(--spacer-base) var(--spacer-xs);
    }
  }
}
.form {
  &__checkbox {
    --checkbox-label-color: var(--c-dark-variant);
    margin: 0 0 var(--spacer-sm) 0;
  }
  &__group {
    display: flex;
    align-items: center;
  }
  &__action {
    margin: var(--spacer-base) 0;
    &-button {
      &:first-child {
        --button-height: 4.0625rem;
      }
      &--secondary {
        margin: var(--spacer-base) 0;
      }
    }
  }
  &__billing {
    color: #000000;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 20px;
  }
  &_button {
    color: #654855;
    cursor: pointer;
  }
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: 0 var(--spacer-xs);
    &__element {
      padding: 0 0 var(--spacer-xs) 0;
      flex: 0 0 100%;
      &--half {
        flex: 1 1 50%;
        &-even {
          padding: 0 0 0 var(--spacer-xl);
        }
      }
    }
    &__action {
      flex: 0 0 100%;
      display: flex;
    }
  }
}
.payment-method {
  --radio-container-align-items: center;
  --radio-container-padding: var(--spacer-sm) 0;
  --ratio-content-margin: 0 0 0 var(--spacer-lg);
  --radio-background: transparent;
  white-space: nowrap;
  @include for-desktop {
    --radio-container-padding: var(--spacer-sm);
  }
}
.billing-address-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
  width: 100%;
  &__title {
    font-weight: bold;
  }
  &__description {
    text-decoration: underline;
  }
}
.billing-address-content {
  width: 100%;
  padding: 15px 0;
  line-break: anywhere;
}
::v-deep .sf-icon{
    --icon-size: 12px !important;
    }
</style>
