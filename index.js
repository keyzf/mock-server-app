import "regenerator-runtime/runtime";
import fs from 'fs'
import koa from 'koa'
import logger from 'koa-logger'

import db from './middleware/db'
import mock from './middleware/mock'
import api from './middleware/api'
import admin from './middleware/admin'
import cors from './middleware/cors'
import server from 'koa-static'
import bodyparser from 'koa-bodyparser'

// import config from './config'

import path from 'path'

let config = {
    "dbPath": "./db",
    "domain": "mock.dev",
    "port": 3000
}
let userConfig = {}

if(fs.existsSync('./config.json')){
    userConfig = JSON.parse(fs.readFileSync('./config.json'))
}
config = Object.assign({}, config, userConfig)

const app = new koa()
app.use(async (ctx, next) => {
    ctx.appConfig = config;
    await next()
})
app.use(logger())
app.use(server('./client'))
app.use(bodyparser())
app.use(cors('http://portal.wps.cn'))
app.use(db(path.join(process.cwd(), config.dbPath)))
app.use(admin.routes())
app.use(admin.allowedMethods())
app.use(api)
app.use(mock());

app.listen(config.port, '0.0.0.0', () => {
	console.log(`mock server listening http://${config.domain}:${config.port}`)
})