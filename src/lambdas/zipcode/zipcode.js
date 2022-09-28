const request = require('../../config/request.config')
const providerAddressByZipcodeEnum = require('../../enum/provider-address-by-zipcode.enum')
const promiseAny = require('promise.any')

const handler = async (event) => {
  console.log('event: ', event)

  const { arguments } = event
  if (!arguments?.requestBody?.zipcode) throw new Error('Informe um CEP válido!')

  try {
    const result = await promiseAny([
      getAddressByZipcodeAwesomeApi(arguments.requestBody.zipcode),
      getAddressByZipcodeViaCep(arguments.requestBody.zipcode)
    ])

    if (!result) throw new Error(`Cep ${arguments?.requestBody?.zipcode} não encontrado`)
    return result
  } catch (error) {
    console.log('Error handler', error, arguments?.requestBody?.zipcode)
    throw new Error(`Cep ${arguments?.requestBody?.zipcode} não encontrado`)
  }
}

const getAddressByZipcodeAwesomeApi = async (zipcode) => {
  const result = await request.get(`${process.env.API_ZIPCODE_AWESOME_API}/${zipcode}`)
  return formatAddressAwesomeApi(result.data)
}

const getAddressByZipcodeViaCep = async (zipcode) => {
  const result = await request.get(`${process.env.API_ZIPCODE_VIACEP_ENDPOINT}/${zipcode}/json/`)
  return formatAddressByViaCep(result.data)
}

const formatAddressAwesomeApi = (data) => ({
  streetAddress: data?.address,
  district: data?.district,
  postalCode: data?.cep?.replace(/[^\d]+/g, ''),
  addressLocality: data?.city,
  addressRegion: data?.state?.toUpperCase(),
  localityCode: data?.city_ibge?.toString(),
  ddd: data.ddd,
  geolocation: { latitude: data?.lat, longitude: data?.lng },
  provider: providerAddressByZipcodeEnum.AWESOME_API
})

const formatAddressByViaCep = (data) => ({
  streetAddress: data?.logradouro,
  district: data?.bairro,
  postalCode: data?.cep?.replace(/[^\d]+/g, ''),
  addressLocality: data?.localidade,
  addressRegion: data?.uf?.toUpperCase(),
  localityCode: data?.ibge?.toString(),
  ddd: data.ddd,
  geolocation: { latitude: null, longitude: null },
  provider: providerAddressByZipcodeEnum.VIACEP
})

module.exports = { handler, getAddressByZipcodeAwesomeApi, getAddressByZipcodeViaCep }
