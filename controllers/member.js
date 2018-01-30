/**
 * 会员中心
 */

const { User } = require('../models')

exports.index = (req, res) => {
  res.render('member')
}

exports.profile = (req, res) => {
  res.render('member-profile')
}

exports.address = (req, res) => {
  res.render('member-address')
}

exports.order = (req, res) => {
  res.render('member-order')
}
