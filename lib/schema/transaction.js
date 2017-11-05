const yup = require('yup')

const transactionSchema = yup.object().shape({
  from: yup.string().required(),
  to: yup.string().required(),
  amount: yup.number().required().positive()
})

module.exports = {
  schema: transactionSchema,
  validate: data => transactionSchema.validateSync(data, { strict: true, abortEarly: true })
}