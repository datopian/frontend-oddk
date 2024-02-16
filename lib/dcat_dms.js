'use strict'

const { resolve, URL } = require('url')
const fetch = require('node-fetch')
const utils = require('../../../utils')
const querystring = require("querystring");
const logger = require('../../../utils/logger')

class DcatDmsModel {
  constructor(config) {
    this.config = config
    this.api = config.get('INTERNAL_API_URL') || config.get('API_URL')
  }

  async getJsonResponse(params, action, method = 'GET') {
    let url

    if (params !== {}) {

      let query = querystring.stringify(params)

      url = new URL(resolve(this.api, action + '?' + query))
    } else {
      url = new URL(resolve(this.api, action))
    }
  
    const fetchOptions = {
      method: method,
      headers: { 'User-Agent': 'frontend-v2/latest (internal API call from frontend app)' }
    }
  
    if (method === 'POST' && params) {
      fetchOptions.body = JSON.stringify(params)
    }

    let response = await fetch(url, fetchOptions)
    
    if (response.status !== 200) {
      throw response
    }
    try {
      response = await response.json()
    }
    catch(err) {
      console.error("Error_Response", response)
      console.error("Error", err)
      response = await response.json()
    }

    return response
  }

  async getDcatCatalog(format) {
    const action = 'dcat_catalog_show'
    const params = {
      'fq': 'data_directory:true',
      'format': format
    }
    const response = await this.getJsonResponse(params, action)
    console.log("response", response)
    return response.result
  }

  async getDcatDataset(id, format) {
    const action = 'dcat_dataset_show'
    const params = {
      'id': id,
      'format': format
    }
    const response = await this.getJsonResponse(params, action, 'POST')
    return response.result
  }
}

module.exports.DcatDmsModel = DcatDmsModel
