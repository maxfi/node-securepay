import SchemaObject from 'schema-object';

export default new SchemaObject({
  clientID: String,
  currency: String,
  amount: String,
  transactionReference: String
});
