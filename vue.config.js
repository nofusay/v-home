module.exports = {
  // 去年 map 文件
  productionSourceMap: false,
  // 这里是配置上线读取当前目录，默认是根路径，如 /js, /css 等
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
}
