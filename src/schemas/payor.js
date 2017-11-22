import SchemaObject from 'schema-object';

export default new SchemaObject({
  clientID: String,
  currency: String,
  amount: String,
  CreditCardInfo: {
    cardNumber: String,
    expiryDate: String,
    cardHolderName: String
  }
});
