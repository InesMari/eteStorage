import Decimal from './decimal.js'
// 判断为空
const isBlank = str => (typeof str == 'number' && isNaN(str)) || (!str && str !== 0 && str !== false) || str == 'undefined';
// 判断非空
const isNotBlank = str => !isBlank(str);

//对象深拷贝
const copyObj = (obj) => JSON.parse(JSON.stringify(obj));
//对象合并,key相同则后对象覆盖前对象
const mergeObj = (...obj) => Object.assign({}, ...obj);

//加法
const accAdd = function(arg1, arg2) {
  arg1 = isBlank(arg1) ? 0 : arg1;
  arg2 = isBlank(arg2) ? 0 : arg2;

  arg1 = new Decimal(arg1);
  arg2 = new Decimal(arg2);
  let num = Number(arg1.add(arg2).toString());

  return num;
};

//减法
const accSub = function(arg1, arg2) {
  arg1 = isBlank(arg1) ? 0 : arg1;
  arg2 = isBlank(arg2) ? 0 : arg2;

  arg1 = new Decimal(arg1);
  arg2 = new Decimal(arg2);
  let num = Number(arg1.sub(arg2).toString());

  return num;
};

//乘法，获取精确乘法的结果值
const accMul = function(arg1, arg2) {
  if(isBlank(arg1) || isBlank(arg2)){
      return 0;
  }

  arg1 = new Decimal(arg1);
  arg2 = new Decimal(arg2);
  let num = Number(arg1.mul(arg2).toString());

  return num;
};

//除法，获取精确除法的结果值
const accDiv = function(arg1, arg2) {
  if(isBlank(arg1) || isBlank(arg2)){
      return 0;
  }

  arg1 = new Decimal(arg1);
  arg2 = new Decimal(arg2);
  let num = arg1.div(arg2);   //Decimal对象
  // 格式转换
  num = Number(num.toString());

  return num;
};

// 腾讯地图经纬度转百度地图经纬度
const qqMapTransBMap = function (lng, lat) {

  let x = Number(lng);
  let y = Number(lat);
  if (!isNaN(x) && !isNaN(y)) {
    let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let longitude = z * Math.cos(theta) + 0.0065;
    let latitude = z * Math.sin(theta) + 0.006;

    return {
      longitude,
      latitude
    }
  }
}
// 百度地图经纬度转腾讯地图经纬度
const bMapTransQQMap = function (lng, lat) {
  let x = Number(lng);
  let y = Number(lat);
  if (!isNaN(x) && !isNaN(y)) {
    let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    x = x - 0.0065;
    y = y - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let longitude = z * Math.cos(theta);
    let latitude = z * Math.sin(theta);

    return {
      longitude,
      latitude
    }
  }
}

/*
计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
默认单位m
*/
const getMapDistance = function (lat1, lng1, lat2, lng2) {
  //进行经纬度转换为距离的计算
  const Rad = function (d) {
    return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
  }
  let radLat1 = Rad(lat1);
  let radLat2 = Rad(lat2);
  let a = radLat1 - radLat2;
  let b = Rad(lng1) - Rad(lng2);
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378137; // EARTH_RADIUS;
  s = s.toFixed(0);
  return s;
}

// 获取大图
const getBigImgPath = function (path) {
  if(path.indexOf('_big')>-1){
    return path
  }else{
    let paramIdx = path.lastIndexOf("?");
    if (paramIdx > -1) {
      path = path.substring(0, paramIdx);
    }
    let path1 = path.substring(0, path.lastIndexOf("."));
    let path2 = path.substring(path.lastIndexOf("."));
    return path1 + "_big" + path2;
  }
}


// 获取日期时间
const formatDate = {
  year() {
    return new Date().getFullYear()
  },
  month() {
    return new Date().getMonth() + 1
  },
  day() {
    return new Date().getDate()
  },
  hour() {
    return new Date().getHours()
  },
  min() {
    return new Date().getMinutes()
  },
  sec() {
    return new Date().getSeconds()
  },
  // 获取月份
  getMonth() {
    let year = this.year();
    let month = this.month();
    return year + "-" + (month < 10 ? '0' + month : month);
  },
  // 获取日期
  getDate() {
    let year = this.year();
    let month = this.month();
    let day = this.day();
    return year + "-" + (month < 10 ? '0' + month : month) + "-" + (day < 10 ? '0' + day : day);
  },
  // 获取时间
  getTime() {
    let hour = this.hour();
    let min = this.min();
    let sec = this.sec();
    return (hour < 10 ? '0' + hour : hour) + ":" + (min < 10 ? '0' + min : min) + ":" + (sec < 10 ? '0' + sec : sec);
  },
  // 获取日期时间
  getDateTime() {
    return this.getDate() + " " + this.getTime();
  },
}

// 判断tokenID是否为到仓预约是的token
const checkAppointToken = function () {
  let tokenIdAppoint = wx.getStorageSync('tokenIdAppoint');
  if (isNotBlank(tokenIdAppoint)) {
    wx.removeStorageSync('tokenIdAppoint');
    wx.removeStorageSync('tokenId');
  }
}

// 配置权限ID
const getEntityIds = function(){  
  let {entityIds} = wx.getStorageSync("userInfo");
  if(isBlank(entityIds)) return;
  let entityIdArr = entityIds.split(',');
  let entitys = {};
  entityIdArr.forEach(id => {
    entitys[id] = true
  })
  return entitys
}

export default {
  isBlank,
  isNotBlank,
  accAdd,
  accSub,
  accMul,
  accDiv,
  copyObj,
  mergeObj,
  qqMapTransBMap,
  bMapTransQQMap,
  getMapDistance,
  getBigImgPath,
  formatDate,
  checkAppointToken,
  getEntityIds,
}