const UniversalRouter = require("universal-router");
const _ = require("lodash");
const debug = require('debug')('TG_ROUTER')
function defineRouterPath({ route = '', ctx } = {}) {
  if (!_.isString(route)) {
    route = "";
  }
  route = route.split("/");
  route = _.isArray(route) ? route : [];

  debug(route);

  const cbQueryHlp = (route, ctx) => {
      const cbData = getCBData(ctx);
      debug('cbData', cbData)

      const splittedCb = ('' + cbData).split(':')
      const splittedCbType = _.get(splittedCb, '0', null)
      const splittedCbPath = _.get(splittedCb, '1', null)

      debug('splittedCb', splittedCb)
      if (ctx.updateType === 'callback_query'){
        if (splittedCbType === 'redirect' && splittedCbPath){
          const splittedPathArray = splittedCbPath.split('/')
          if (splittedCbPath[0] === '/'){
            route = splittedPathArray
          }else{
            route = _.concat(route, splittedPathArray)
          }
        }else{
          route.push("callback_query");
        }
      } else if (ctx.updateType === 'message'){
        if (ctx.message.text === "/start") {
          route = ["start"];
        } else if (route.indexOf('message') === -1){
          route.push('message')
        }
      }
    return route
  }

  if (route === undefined || !route) {
    route.push("start");
  } else {
    route = cbQueryHlp(route, ctx)
  }
  debug('ROUTE_ARRAY', route)
  return route.join("/");
}

class Router {
  constructor({ bot, routes, logger = () => console.log, errorCb = () => { } }) {
    this.bot = bot;
    this.routes = routes;
    this.logger = logger;
    this.router = new UniversalRouter(this.routes);
    this.ctx = null;
    this.errorCb = errorCb;

    this.bot.use(async (ctx, next) => {
      ctx.session.routerPath = defineRouterPath({
        route: ctx.session.routerPath,
        ctx
      });
      this.ctx = ctx;

      await this.resolve(ctx);
      return next(ctx);
    });
  }

  async redirect(path, ctx) {
    this.ctx.session.routerPath = path;
    await this.resolve(ctx);
  }

  async resolve(ctx) {
    debug("resolvePath", this.ctx.session.routerPath);
    let data = {
      pathname: this.ctx.session.routerPath,
      ctx,
      router: this
    };
    try {
      await this.router.resolve(data);
    } catch (e) {
      console.error("Router exception", e.message);
      this.errorCb({ data, e });
    }
  }

  router() {
    return this.router;
  }
}

function getCBData(ctx) {
  return _.get(ctx, "update.callback_query.data", null);
}

function getMessage(ctx) {
  let res = _.get(ctx, "update.message", null) || {};
  const result = { message_id: null, date: null, text: null, ...res };
  debug("getMessage", result);
  return result;
}

function getFileId(message) {
  let res = _.get(message, "document.file_id", null);
  //Документ приходит один, а фото сразу массивом
  if (res) {
    res = res;
  } else {
    //если это фото он присылает 4 разрешения, последнее наше
    res = _.get(message, "photo", []);
    res = _.get(_.last(res, r => r.file_id), 'file_id', null);
  }
  debug("getFileId", res);
  return res;
}

module.exports = { getCBData, getMessage, getFileId, defineRouterPath,  Router};
