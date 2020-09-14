const Connection = require('../network/connection')
const { KafkaJSConnectionError } = require('../errors')

const validateBrokers = brokers => {
  if (!brokers || brokers.length === 0) {
    throw new KafkaJSConnectionError(`Failed to connect: expected brokers array and got nothing`)
  }
}

module.exports = ({
  socketFactory,
  brokers,
  ssl,
  sasl,
  clientId,
  requestTimeout,
  enforceRequestTimeout,
  connectionTimeout,
  maxInFlightRequests,
  retry,
  logger,
  instrumentationEmitter = null,
}) => {
  return {
    build: async ({ host, port, rack } = {}) => {
      if (!host) {
        const list = typeof brokers === 'function' ? await brokers() : brokers
        validateBrokers(list)

        const randomBroker = list[Math.floor(Math.random() * list.length)]

        host = randomBroker.split(':')[0]
        port = Number(randomBroker.split(':')[1])
      }

      if (typeof sasl === 'function') {
        sasl = await sasl()
      }

      return new Connection({
        host,
        port,
        rack,
        sasl,
        ssl,
        clientId,
        socketFactory,
        connectionTimeout,
        requestTimeout,
        enforceRequestTimeout,
        maxInFlightRequests,
        instrumentationEmitter,
        retry,
        logger,
      })
    },
  }
}
