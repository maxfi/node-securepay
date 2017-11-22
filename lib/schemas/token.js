import SchemaObject from 'schema-object';

export default new SchemaObject({
  cardNumber: String,
  expiryDate: String,
  currency: String,
  amount: String,
  transactionReference: String
});
