/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const utils = require('../lib/utils')

// HTML sanitization function to prevent XSS
function sanitizeHtml(html) {
  if (!html) return ''
  return html.toString().replace(/[&<>"']/g, function (match) {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return escape[match]
  })
}

exports.sequelizeVulnerabilityChallenge = () => (req, res) => {
  models.Recycle.findAll({
    where: {
      id: JSON.parse(req.params.id)
    }
  }).then((Recycle) => {
    // Sanitize recycle data to prevent XSS
    const sanitizedRecycle = Recycle.map(item => {
      const sanitizedItem = { ...item.dataValues }
      Object.keys(sanitizedItem).forEach(key => {
        if (typeof sanitizedItem[key] === 'string') {
          sanitizedItem[key] = sanitizeHtml(sanitizedItem[key])
        }
      })
      return sanitizedItem
    })
    return res.send(utils.queryResultToJson(sanitizedRecycle))
  })
}

exports.blockRecycleItems = () => (req, res) => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}
