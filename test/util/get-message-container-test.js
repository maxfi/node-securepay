import test from 'ava';
import xmljs from 'xml-js';
import readFile from '../helpers/read-file';
import getMessageContainer from '../../lib/util/get-message-container';

const payload = {
  messageId: '123456789',
  credentials: {
    merchantId: 'ABC0001',
    password: 'abc123'
  },
  requestType: 'Periodic',
  dataElementName: 'Periodic',
  payload: {
    actionType: 'add',
    periodicType: '4',
    clientID: 'testTokenId171120',
    currency: 'AUD',
    amount: '100',
    CreditCardInfo: {
      cardNumber: '5555555555554444',
      expiryDate: '12/23',
      cardHolderName: 'Eddie Murphy'
    }
  }
};

const toXml = x => xmljs.js2xml(x, { spaces: 4, compact: true });
const removeTimestamp = x =>
  x.replace(/<messageTimestamp>.*<\/messageTimestamp>/, '');

test('getMessageContainer', t => {
  const expected = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    SecurePayMessage: {
      MessageInfo: {
        messageID: {
          _text: '123456789'
        },
        messageTimestamp: {
          _text: new Date().toISOString()
        },
        timeoutValue: {
          _text: '60'
        },
        apiVersion: {
          _text: 'spxml-4.2'
        }
      },
      MerchantInfo: {
        merchantID: {
          _text: 'ABC0001'
        },
        password: {
          _text: 'abc123'
        }
      },
      RequestType: {
        _text: 'Periodic'
      },
      Periodic: {
        PeriodicList: {
          _attributes: {
            count: '1'
          },
          PeriodicItem: {
            _attributes: {
              ID: '1'
            },
            actionType: {
              _text: 'add'
            },
            periodicType: {
              _text: '4'
            },
            clientID: {
              _text: 'testTokenId171120'
            },
            currency: {
              _text: 'AUD'
            },
            amount: {
              _text: '100'
            },
            CreditCardInfo: {
              cardNumber: {
                _text: '5555555555554444'
              },
              expiryDate: {
                _text: '12/23'
              },
              cardHolderName: {
                _text: 'Eddie Murphy'
              }
            }
          }
        }
      }
    }
  };

  t.deepEqual(getMessageContainer(payload), expected);
});

test('getMessageContainer should create the correct object to be parsed to XML', async t => {
  const expected = removeTimestamp(
    await readFile('test/fixtures/addingpayor-request.xml')
  );
  const xml = removeTimestamp(toXml(getMessageContainer(payload)));
  t.is(xml, expected);
});
