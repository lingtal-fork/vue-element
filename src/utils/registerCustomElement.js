/*eslint-disable */
import isES2015 from './isES2015';
import 'set-prototype-of'; //polyfill for older browsers (IE < 11) that do not support Object.setPrototypeOf needed by Webpack's transpiled ES2015 "class", even if it's not directly used

export default function registerCustomElement(name, options = {}) {
  function connectedCallback() {
    typeof options.connectedCallback === 'function' && options.connectedCallback.call(this);
  };

  function disconnectedCallback() {
    typeof options.disconnectedCallback === 'function' && options.disconnectedCallback.call(this);
  };

  function attributeChangedCallback(name, oldValue, value) {
    typeof options.attributeChangedCallback === 'function' && options.attributeChangedCallback.call(this, name, oldValue, value);
  };

  if (isES2015) {
    // ES2015 detected. We will use "class" based Custom Elements V1 specification. If it's natively supported it will run without polyfill
    class myCustomElement extends HTMLElement {
      // Can define constructor arguments if you wish.
      constructor(self) {
        super();
        if (self) {
          self = HTMLElement.call(self);
        } else {
          self = this;
        }

        typeof options.constructorCallback === 'function' && options.constructorCallback.call(self);
        return self;
      }

      static get observedAttributes() {
        return options.observedAttributes || [];
      }
    }

    myCustomElement.prototype.connectedCallback = connectedCallback;
    myCustomElement.prototype.disconnectedCallback = disconnectedCallback;
    myCustomElement.prototype.attributeChangedCallback = attributeChangedCallback;

    customElements.define(name, myCustomElement);
  } else {
    // not ES2015. We will use polyfill supported version of registering Custom Elements so older browsers could handle it
    function myCustomElement(self) {
      self = HTMLElement.call(self || this);

      typeof options.constructorCallback === 'function' && options.constructorCallback.call(self);
      return self;
    }

    myCustomElement.observedAttributes = options.observedAttributes || [];

    myCustomElement.prototype = Object.create(
      HTMLElement.prototype, {
        constructor: {
          configurable: true,
          writable: true,
          value: myCustomElement
        }
      }
    );

    myCustomElement.prototype.connectedCallback = connectedCallback;
    myCustomElement.prototype.disconnectedCallback = disconnectedCallback;
    myCustomElement.prototype.attributeChangedCallback = attributeChangedCallback;

    customElements.define(name, myCustomElement);
  }
}
