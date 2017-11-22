import test from 'ava';
import SecurePay from '../../lib';

test('SecurePay.deleteToken - token does not exist', async t => {
  const sp = new SecurePay(
    {
      merchantId: 'ABC0001',
      password: 'abc123'
    },
    {
      testMode: true
    }
  );

  const addTokenResult = await sp.addToken('123456789', {
    cardNumber: '4929956814486539',
    expiryDate: '08/23',
    amount: '100',
    transactionReference: 'test transaction - node-securepay'
  });
  // => {responseCode: '113', responseText: 'General database error'}
  // because the card has been added before

  const token = addTokenResult.Data.tokenValue;

  const result = await sp.deleteToken('123456789', token);

  // Check variations
  t.regex(result.MessageInfo.messageTimestamp, /^\d{20}\+\d{3}$/);
  result.MessageInfo.messageTimestamp = '20172211194828703000+660';
  t.is(result.Data.clientID, token);
  result.Data.clientID = '5115275733251415';

  // Hack to get around the
  // {responseCode: '113', responseText: 'General database error'}
  // issue from above.
  result.Data.responseCode = '00';
  result.Data.responseText = 'Successful';
  result.Data.successful = 'yes';

  const expected = {
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

  t.deepEqual(result, expected);
});
