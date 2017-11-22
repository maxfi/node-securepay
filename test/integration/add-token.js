import test from 'ava';
import SecurePay from '../../src';

test('SecurePay.addToken - success', async t => {
  const sp = new SecurePay(
    {
      merchantId: 'ABC0001',
      password: 'abc123'
    },
    {
      testMode: true
    }
  );

  const result = await sp.addToken('123456789', {
    cardNumber: '4539343927171716',
    expiryDate: '08/23',
    amount: '100',
    transactionReference: 'test transaction - node-securepay'
  });

  // Check variations
  result.MessageInfo.messageTimestamp = '2017-10-20T00:00:00.000Z';

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2017-10-20T00:00:00.000Z',
      apiVersion: 'xml-4.2'
    },
    RequestType: 'Payment',
    MerchantInfo: {
      merchantID: 'ABC0001'
    },
    Status: {
      statusCode: '0',
      statusDescription: 'Normal'
    },
    Data: {
      _attributes: {
        ID: '1'
      },
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

  t.deepEqual(result, expected);
});
