import test from 'ava';
import xmljs from 'xml-js';
import readFile from '../helpers/read-file';
import getResponse from '../../lib/util/get-response';

const fromXml = x => xmljs.xml2js(x, { compact: true });

test('getResponse', async t => {
  const expected = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    SecurePayMessage: {
      MessageInfo: {
        messageID: '8af793f9af34bea0ecd7eff71b37ef',
        messageTimestamp: '20040710144410220000+600',
        apiVersion: 'spxml-3.0'
      },
      RequestType: 'Periodic',
      MerchantInfo: {
        merchantID: 'ABC0001'
      },
      Status: {
        statusCode: '0',
        statusDescription: 'Normal'
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
            actionType: 'add',
            clientID: 'test3',
            responseCode: '00',
            responseText: 'Successful',
            successful: 'yes',
            CreditCardInfo: {
              pan: '444433...111',
              expiryDate: '09/25',
              recurringFlag: 'no'
            },
            amount: '1100',
            periodicType: '4'
          }
        }
      }
    }
  };
  const response = getResponse(
    fromXml(await readFile('test/fixtures/addingpayor-response.xml'))
  );
  t.deepEqual(response, expected);
});
