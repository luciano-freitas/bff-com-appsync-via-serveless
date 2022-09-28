const handler = {
  async http(event) {
    console.log('event: ', event)

    if (event?.authorizationToken !== 'Bearer token')
      return { isAuthorized: false }

    return { isAuthorized: true }
  }
}

module.exports = handler
