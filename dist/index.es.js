import _extends from '@babel/runtime/helpers/extends';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import 'regenerator-runtime/runtime';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import { js2xml, xml2js } from 'xml-js';
import fetch from 'node-fetch';
import _Object$assign from '@babel/runtime/core-js/object/assign';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _Object$entries from '@babel/runtime/core-js/object/entries';
import isPlainObject from 'is-plain-object';

var convert = function convert(x) {
  if (isPlainObject(x)) {
    return _Object$entries(x).reduce(function (acc, value) {
      var _value = _slicedToArray(value, 2),
          k = _value[0],
          v = _value[1];

      acc[k] = convert(v);
      return acc;
    }, {});
  }

  return {
    _text: x
  };
};

var getMessage = (function (x) {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert(x);
});

var getMessageContainer = (function (opts) {
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
          [opts.dataElementName + 'Item']: _Object$assign({
            _attributes: {
              ID: '1'
            }
          }, getMessage(opts.payload))
        }
      }
    }
  };
});

var convert$1 = function convert(x) {
  if (!isPlainObject(x)) return x;
  if (x._text) return x._text;
  return _Object$entries(x).reduce(function (acc, value) {
    var _value = _slicedToArray(value, 2),
        k = _value[0],
        v = _value[1];

    acc[k] = convert(v);
    return acc;
  }, {});
};

var getResponse = (function (x) {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert$1(x);
});

var toXml = function toXml(x) {
  return js2xml(x, {
    spaces: 4,
    compact: true
  });
};

var fromXml = function fromXml(x) {
  return xml2js(x, {
    compact: true
  });
};

var request = function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(url, payload) {
    var xml, response;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            xml = toXml(payload);
            _context.next = 3;
            return fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/xml'
              },
              body: xml
            }).then(function (x) {
              return x.text();
            });

          case 3:
            response = _context.sent;
            return _context.abrupt("return", getResponse(fromXml(response)));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function request(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var clean = function clean(el) {
  return function (response) {
    var result = response.SecurePayMessage;
    result.Data = result[el][el + 'List'][el + 'Item'];
    delete result[el];
    return result;
  };
};

var SecurePay =
/*#__PURE__*/
function () {
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
  function SecurePay(config) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, SecurePay);

    this.merchantId = config.merchantId;
    this.password = config.password;
    this.baseUrl = options.testMode ? 'https://test.api.securepay.com.au/xmlapi/' : 'https://api.securepay.com.au/xmlapi/';
  }

  _createClass(SecurePay, [{
    key: "_getCredentials",
    value: function _getCredentials() {
      return {
        merchantId: this.merchantId,
        password: this.password
      };
    }
  }, {
    key: "_post",
    value: function _post(type, payload) {
      var el = type.charAt(0).toUpperCase() + type.slice(1);
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

  }, {
    key: "addPayor",
    value: function addPayor(messageId, payorDetails) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'Periodic',
        dataElementName: 'Periodic',
        payload: _extends({
          actionType: 'add',
          periodicType: '4'
        }, payorDetails)
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

  }, {
    key: "addToken",
    value: function addToken(messageId, tokenDetails) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'addToken',
        dataElementName: 'Token',
        payload: _extends({
          tokenType: 1
        }, tokenDetails)
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

  }, {
    key: "lookupToken",
    value: function lookupToken(messageId, tokenValue) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'lookupToken',
        dataElementName: 'Token',
        payload: {
          tokenValue
        }
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

  }, {
    key: "deleteToken",
    value: function deleteToken(messageId, tokenValue) {
      var payload = getMessageContainer({
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

  }, {
    key: "triggerPayment",
    value: function triggerPayment(messageId, paymentDetails) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'Periodic',
        dataElementName: 'Periodic',
        payload: _extends({
          actionType: 'trigger'
        }, paymentDetails)
      });
      return this._post('periodic', payload);
    }
  }]);

  return SecurePay;
}();

export default SecurePay;
