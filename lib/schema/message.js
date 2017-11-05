const yup = require('yup')

const messageSchema = yup.object().shape({
  from: yup.string().required(),
  to: yup.string().required(),
  body: yup.string().required()
})

module.exports = {
  schema: messageSchema,
  validate: data => messageSchema.validateSync(data, { strict: true, abortEarly: true })
}