'use strict';

var Immutable = require('immutable');

module.exports = function() {
  return Immutable.fromJS({
    site: {
      title: 'Grow',
      email: 'marlinf@datashaman.com',
      description: 'Planting schedule for South African fruit, vegetables and herbs.',
      url: process.env.SITE_URL || 'http://localhost:3000',
      baseurl: process.env.SITE_BASEURL || ''
    },
    navbar: [
      {
        url: '/',
        title: 'Home'
      }, {
        url: '/settings/',
        title: 'Settings'
      }
    ],
    types: [
      {
        title: 'Herb',
        icon: 'leaf'
      }, {
        title: 'Fruit / Vegetable',
        icon: 'cutlery'
      }
    ],
    instructions: {
      P: 'Plant / Sow',
      ST: 'Seed Tray',
      TS: 'Transplant Seedlings'
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    services: {
      google: {
        apiKey: 'AIzaSyBUE58hcq5yxNE_-tL-YCGPdfZ39mYgKTw',
        tables: {
          plants: '1cvG26bXvpl3aV28nWEPnU_GD4CBlHTwetlH97vyk',
          schedule: '1VQz3viT8A1k_HCK5ss8R_YYQNcshAUWUrKFJiY7j'
        }
      }
    }
  });
};
