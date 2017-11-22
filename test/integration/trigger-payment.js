import test from 'ava';
import SecurePay from '../../lib';

test('SecurePay.triggerPayment - success', async t => {
  const sp = new SecurePay(
    {
      merchantId: 'ABC0001',
      password: 'abc123'
    },
    {
      testMode: true
    }
  );

  const result = await sp.triggerPayment('123456789', {
    clientID: '8714448311797575',
    amount: '100',
    transactionReference: 'test transaction - node-securepay'
  });

  // Check variations
  t.regex(result.MessageInfo.messageTimestamp, /^\d{20}\+\d{3}$/);
  result.MessageInfo.messageTimestamp = '20172211193559912000+660';
  t.regex(result.Data.txnID, /^\d+$/);
  result.Data.txnID = '815056';

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '20172211193559912000+660',
      apiVersion: 'spxml-4.2'
    },
    RequestType: 'Periodic',
    MerchantInfo: { merchantID: 'ABC0001' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      _attributes: { ID: '1' },
      actionType: 'trigger',
      clientID: '8714448311797575',
      responseCode: '00',
      responseText: 'Approved',
      successful: 'yes',
      txnType: '3',
      amount: '100',
      currency: 'AUD',
      txnID: '815056',
      receipt: {},
      ponum: 'test transaction - node-securepay',
      settlementDate: '20171122',
      CreditCardInfo: {
        pan: '453934...716',
        expiryDate: '08/23',
        recurringFlag: 'no',
        cardType: '6',
        cardDescription: 'Visa'
      }
    }
  };

  t.deepEqual(result, expected);
});

test('SecurePay.triggerPayment - failure', async t => {
  const sp = new SecurePay(
    {
      merchantId: 'ABC0001',
      password: 'abc123'
    },
    {
      testMode: true
    }
  );

  const result = await sp.triggerPayment('123456789', {
    clientID: '8714448311797575',
    amount: '105',
    transactionReference: 'test transaction - node-securepay'
  });

  // Check variations
  t.regex(result.MessageInfo.messageTimestamp, /^\d{20}\+\d{3}$/);
  result.MessageInfo.messageTimestamp = '20172211193559912000+660';
  t.regex(result.Data.txnID, /^\d+$/);
  result.Data.txnID = '815056';

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '20172211193559912000+660',
      apiVersion: 'spxml-4.2'
    },
    RequestType: 'Periodic',
    MerchantInfo: { merchantID: 'ABC0001' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      _attributes: { ID: '1' },
      actionType: 'trigger',
      clientID: '8714448311797575',
      responseCode: '05',
      responseText: 'Do Not Honour',
      successful: 'no',
      txnType: '3',
      amount: '105',
      currency: 'AUD',
      txnID: '815056',
      receipt: {},
      ponum: 'test transaction - node-securepay',
      settlementDate: '20171122',
      CreditCardInfo: {
        pan: '453934...716',
        expiryDate: '08/23',
        recurringFlag: 'no',
        cardType: '6',
        cardDescription: 'Visa'
      }
    }
  };

  t.deepEqual(result, expected);
});
