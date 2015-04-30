Metalsmith = require 'metalsmith'
markdown = require 'metalsmith-markdown'
templates = require 'metalsmith-templates'
metadata = require 'metalsmith-metadata'
sass = require 'metalsmith-sass'
swig = require 'swig'
cjsx = require './plugins/metalsmith-cjsx'

fs = require 'fs'
yaml = require 'js-yaml'
config = yaml.safeLoad fs.readFileSync 'src/config.yaml', 'utf8'

swig.setFilter 'baseurl', (input) -> config.site.baseurl + input
swig.setFilter 'absolute', (input) -> config.site.url + config.site.baseurl + input
swig.setFilter 'truncate', (input, maxlength) -> input.slice(0, maxlength)

Metalsmith __dirname
  .use metadata config: 'config.yaml'
  .use markdown()
  .use templates 'swig'
  .use sass()
  .use cjsx()
  .destination './build'
  .build (err) -> console.error err if err?
