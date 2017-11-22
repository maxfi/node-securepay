'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var xmlJs = require('xml-js');
var fetch = _interopDefault(require('node-fetch'));
var isPlainObject = _interopDefault(require('is-plain-object'));
var SchemaObject = _interopDefault(require('schema-object'));

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};











var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

const convert = x => {
  if (isPlainObject(x)) {
    return Object.entries(x).reduce((acc, value) => {
      var _value = slicedToArray(value, 2);

      const k = _value[0],
            v = _value[1];

      acc[k] = convert(v);
      return acc;
    }, {});
  }

  return { _text: x };
};

var getMessage = (x => {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert(x);
});

// Opts = {messageId, credentials, requestType, dataElementName, payload, options}
var getMessageContainer = (opts => {
  opts.options = opts.options || {};
  return {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    SecurePayMessage: {
      MessageInfo: {
        messageID: {
          _text: opts.messageId
        },
        messageTimestamp: {
          _text: new Date().toISOString()
        },
        timeoutValue: {
          _text: opts.options.timeout || '60'
        },
        apiVersion: {
          _text: 'spxml-4.2'
        }
      },
      MerchantInfo: {
        merchantID: {
          _text: opts.credentials.merchantId
        },
        password: {
          _text: opts.credentials.password
        }
      },
      RequestType: {
        _text: opts.requestType
      },
      [opts.dataElementName]: {
        [opts.dataElementName + 'List']: {
          _attributes: {
            count: '1'
          },
          [opts.dataElementName + 'Item']: Object.assign({ _attributes: { ID: '1' } }, getMessage(opts.payload))
        }
      }
    }
  };
});

const convert$1 = x => {
  if (!isPlainObject(x)) return x;
  if (x._text) return x._text;
  return Object.entries(x).reduce((acc, value) => {
    var _value = slicedToArray(value, 2);

    const k = _value[0],
          v = _value[1];

    acc[k] = convert$1(v);
    return acc;
  }, {});
};

var getResponse = (x => {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert$1(x);
});

var Payor = new SchemaObject({
  clientID: String,
  currency: String,
  amount: String,
  CreditCardInfo: {
    cardNumber: String,
    expiryDate: String,
    cardHolderName: String
  }
});

var Token = new SchemaObject({
  cardNumber: String,
  expiryDate: String,
  currency: String,
  amount: String,
  transactionReference: String
});

var Payment = new SchemaObject({
  clientID: String,
  currency: String,
  amount: String,
  transactionReference: String
});

const toXml = x => xmlJs.js2xml(x, { spaces: 4, compact: true });
const fromXml = x => xmlJs.xml2js(x, { compact: true });

const request = (() => {
  var _ref = asyncToGenerator(function* (url, payload) {
    const xml = toXml(payload);
    const response = yield fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    }).then(function (x) {
      return x.text();
    });
    return getResponse(fromXml(response));
  });

  return function request(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const clean = el => {
  return response => {
    const result = response.SecurePayMessage;
    result.Data = result[el][el + 'List'][el + 'Item'];
    delete result[el];
    return result;
  };
};

class SecurePay {
  /**
   * @summary SecurePay API wrapper
   * @class
   * @param {Object} config
   * @param {String} config.merchantId 5 or 7-character merchant ID supplied by SecurePay.
   * @param {String} config.password Transaction password. Password used for authentication of the merchant’s request message, supplied by SecurePay.
   * @param {Object} [options]
   * @param {Boolean} options.testMode Set to `true` to direct requests to the SecurePay test environment.
   * @param {String} options.timeout Timeout value used, in seconds.
   */
  constructor(config, options = {}) {
    this.merchantId = config.merchantId;
    this.password = config.password;
    this.baseUrl = options.testMode ? 'https://test.api.securepay.com.au/xmlapi/' : 'https://api.securepay.com.au/xmlapi/';
  }

  _getCredentials() {
    return {
      merchantId: this.merchantId,
      password: this.password
    };
  }

  _post(type, payload) {
    const el = type.charAt(0).toUpperCase() + type.slice(1);
    return request(this.baseUrl + type, payload).then(clean(el));
  }

  /**
   * @summary Add a new payor to the payor list
   * @param {String} messageId Unique identifier for the XML message. Generated by the merchant.
   * The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail.
   * A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {Object} payorDetails
   * @param {String} payorDetails.clientID Unique identifier. Eg, customer reference number.
   * @param {String} payorDetails.currency Default currency to be stored with Token. The amount can be overridden be passing an amount when triggering a payment.
   * @param {String} payorDetails.amount Default amount in cents to be stored with Token. The amount can be overridden be passing an amount when triggering a payment.
   * @param {Object} payorDetails.CreditCardInfo
   * @param {String} payorDetails.CreditCardInfo.cardNumber Credit card number.
   * @param {String} payorDetails.CreditCardInfo.expiryDate MM/YY Credit card expiry date.
   * @param {String} payorDetails.CreditCardInfo.cardHolderName Credit cardholder name.
   * @returns {Promise}
   */
  addPayor(messageId, payorDetails) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'Periodic',
      dataElementName: 'Periodic',
      payload: _extends({
        actionType: 'add',
        periodicType: '4'
      }, new Payor(payorDetails).toObject())
    });
    return this._post('periodic', payload);
  }

  /**
   * @summary Add a new token to the payor list
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {Object} tokenDetails
   * @param {Object} tokenDetails.cardNumber Credit card number.
   * @param {String} tokenDetails.expiryDate Credit card expiry date.
   * @param {String} tokenDetails.currency Default currency to be stored with Token. The amount can be overridden be passing an amount when triggering a payment.
   * @param {String} tokenDetails.amount Default amount in cents to be stored with Token. The amount can be overridden be passing an amount when triggering a payment.
   * @param {String} tokenDetails.transactionReference The transaction identifier. This value will appear against all processed transactions. Typically an invoice number. E.g. "invoice12345". If absent the Token value will be used.
   * @returns {Promise}
   * const result = {
      "MessageInfo": {
        "messageID": "123456789",
        "messageTimestamp": "2017-10-20T00:00:00.000Z",
        "apiVersion": "xml-4.2"
      },
      "RequestType": "Payment",
      "MerchantInfo": {
        "merchantID": "ABC0001"
      },
      "Status": {
        "statusCode": "0",
        "statusDescription": "Normal"
      },
      "Data": {
        "_attributes": {
          "ID": "1"
        },
        "responseCode": "00",
        "responseText": "Successful",
        "successful": "yes",
        "tokenValue": "8714448311797575",
        "CreditCardInfo": {
          "pan": "453934XXXXXXX716",
          "expiryDate": "08/23",
          "cardType": "6",
          "cardDescription": "Visa"
        },
        "amount": "100",
        "transactionReference": "test transaction - node-securepay"
      }
   */
  addToken(messageId, tokenDetails) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'addToken',
      dataElementName: 'Token',
      payload: _extends({
        tokenType: 1 }, new Token(tokenDetails).toObject())
    });
    return this._post('token', payload);
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {String} tokenValue The token value that represents a stored card within SecurePay
   * @returns {Promise}
   * const result = {
      MessageInfo: {
        messageID: '123456789',
        messageTimestamp: '2017-10-20T00:00:00.000Z',
        apiVersion: 'xml-4.2'
      },
      RequestType: 'Payment',
      MerchantInfo: { merchantID: 'ABC0001' },
      Status: { statusCode: '0', statusDescription: 'Normal' },
      Data: {
        _attributes: { ID: '1' },
        responseCode: '00',
        responseText: 'Successful',
        successful: 'yes',
        tokenValue: '8714448311797575',
        CreditCardInfo: {
          pan: '453934XXXXXXX716',
          expiryDate: '08/23',
          cardType: '6',
          cardDescription: 'Visa'
        },
        amount: '100',
        transactionReference: 'test transaction - node-securepay'
      }
    };
   */
  lookupToken(messageId, tokenValue) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'lookupToken',
      dataElementName: 'Token',
      payload: { tokenValue }
    });
    return this._post('token', payload);
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {String} tokenValue The token value that represents a stored card within SecurePay
   * @returns {Promise}
   * const result = {
      MessageInfo: {
        messageID: '123456789',
        messageTimestamp: '20172211194828703000+660',
        apiVersion: 'spxml-4.2'
      },
      RequestType: 'Periodic',
      MerchantInfo: { merchantID: 'ABC0001' },
      Status: { statusCode: '0', statusDescription: 'Normal' },
      Data: {
        _attributes: { ID: '1' },
        actionType: 'delete',
        clientID: '5115275733251415',
        responseCode: '00',
        responseText: 'Successful',
        successful: 'yes'
      }
    };
   */
  deleteToken(messageId, tokenValue) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'Periodic',
      dataElementName: 'Periodic',
      payload: {
        actionType: 'delete',
        clientID: tokenValue
      }
    });
    return this._post('periodic', payload);
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {Object} paymentDetails {timeout, testMode}
   * @param {String} paymentDetails.clientID Unique identifier of payor or token.
   * @param {String} paymentDetails.currency Default currency is "AUD" – Australian Dollars.
   * @param {String} paymentDetails.amount Transaction amount in cents.
   * @param {String} paymentDetails.tokenDetails.transactionReference The transaction identifier. This value will appear against all processed transactions. Typically an invoice number. E.g. "invoice12345". If absent the Token value will be used.
   * @returns {Promise}
   */
  triggerPayment(messageId, paymentDetails) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'Periodic',
      dataElementName: 'Periodic',
      payload: _extends({
        actionType: 'trigger'
      }, new Payment(paymentDetails).toObject())
    });
    return this._post('periodic', payload);
  }
}

module.exports = SecurePay;