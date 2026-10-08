// 引入 echarts 文件
import * as echarts from '../ec-canvas/echarts';
import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({
  data: {
    ec: {}, // 先空着，在onLoad中初始化
    ecPie:{},
    ecPie2:{},
    showChart:false,
    dateUnitList:[
      {
        codeName:"天",
        codeValue:1,
      },
      {
        codeName:"月",
        codeValue:2,
      },
    ],
    expireDayTypeIndex:0,
    param:{
      num:30,
      type:1,
    },
    mileageTypeInfo:{},
    mileageTypeList:[
      {
        codeName:"昨天",
        codeValue:1,
      },
      {
        codeName:"上月",
        codeValue:2,
      },
    ],
    mileageTypeIndex:0,
  },

  async onLoad() {
    await this.doQuery();
    await this.loadVehicleMileageSumData(1);
    // 在onLoad中初始化ec配置，确保this指向正确
    this.setData({
      ec: {
        onInit: this.initChart.bind(this) // 显式绑定this
      },
      ecPie: {
        onInit: this.initChartPie.bind(this) // 显式绑定this
      },
      ecPie2: {
        onInit: this.initChartPie2.bind(this) // 显式绑定this
      },
    });
    // 初始化静态数据    
    let {
      EXPIRE_DAY_TYPE
    } = await util.postByBeanName('commonTF', 'getSysStaticDataByCodeTypes', {
      codeType: "EXPIRE_DAY_TYPE"
    });
    let attendanceData = await util.postByBeanName('vehicleBenefitAccountingService', 'queryOwnVehicleAttendanceData');
    let vehicleScheduleCount = await util.postByBeanName('resOwnVehicleScheduleTF', 'queryOwnVehicleScheduleCount');
    this.setData({
      expireDayTypeList: EXPIRE_DAY_TYPE,
      showChart:true,
      attendanceData,
      vehicleScheduleCount,
    });
  },
  async doQuery(){
    let info = await util.postByBeanName('vehicleBenefitAccountingService', 'getOwnVehicleStatisticInfo',this.data.param);
    this.setData({info})
  },
  
  async loadVehicleMileageSumData(type){
    let data = await util.postByBeanName("vehicleMileageService", "loadVehicleMileageSumData", {type});
    if(type == 2) {
      data.effectiveMileageSum = 3
      data.deadheadMileageSum = 2
    }
    this.setData({
      "mileageTypeInfo.sumMileageSum":data.sumMileageSum,
      "mileageTypeInfo.effectiveMileageSum":data.effectiveMileageSum,
      "mileageTypeInfo.deadheadMileageSum":data.deadheadMileageSum,
      showChart3:false,
    })
    let timeout = setTimeout(()=>{
      clearTimeout(timeout);
      this.setData({
        showChart3:true,
        ecPie3: {
          onInit: this.initChartPie3.bind(this) // 显式绑定this
        }
      });
    })
},

  // 将initChart方法定义在Page对象中
  initChart(canvas, width, height, dpr) {
    // 使用引入的echarts的init方法初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });

    canvas.setChart(chart);
    let months = this.data.info.ownVehicleFeeList.map(item => item.month);
    let costFees = this.data.info.ownVehicleFeeList.map(item => item.costFee);
    let incomeFees = this.data.info.ownVehicleFeeList.map(item => item.incomeFee);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      // 添加 grid 配置
      grid: {
        left: '3%',   // 左侧距离容器百分比
        right: '3%',  // 右侧距离容器百分比
        // top: '0',    // 上侧距离容器百分比（可选）
        bottom: '1%', // 下侧距离容器百分比（可选）
        containLabel: true  // 防止坐标轴标签被截断
      },
      legend: {
        data: ['成本', '收入']
      },
      xAxis: [{
        type: 'category',
        data: months,
        axisPointer: {
          type: 'shadow'
        }
      }],
      yAxis: [{
          type: 'value',
        },
        {
          type: 'value',
          splitLine: {
            show: false // 隐藏第二个轴的分割横线
          }
        }
      ],
      series: [{
          name: '成本',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value + '元';
            }
          },
          data: costFees
        },
        {
          name: '收入',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + '元';
            }
          },
          data: incomeFees
        }
      ]
    };

    chart.setOption(option);
    return chart;
  },
  initChartPie(canvas, width, height, dpr) {
    // 使用引入的echarts的init方法初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });

    canvas.setChart(chart);

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          label: {
            normal: {
              show: true,
              // 使用数组形式定义多行文本，更易控制
              formatter: [
                '{b|{b}:}',
                '{c|{c}}'
              ].join('\n'),
              // 定位到中心（根据图表类型调整，如饼图用'center'，柱状图用'top'等）
              // position: 'center', 
              // 垂直居中对齐
              verticalAlign: 'middle',
              // 富文本样式配置，单独控制每行
              textStyle: {
                rich: {
                  b: {
                    align: 'center', // 第一行居中
                    fontSize: 14
                  },
                  c: {
                    align: 'center', // 第二行居中
                    fontSize: 12,
                    top: 5
                  }
                }
              }
            }
          },
          data: [
            { value: this.data.info.stateNums1[0], name: this.data.info.stateNames1[0],itemStyle: {color:'#34c758'} },
            { value: this.data.info.stateNums1[1], name: this.data.info.stateNames1[1],itemStyle: {color:'#e87a29' } },
          ],
        }
      ]
    };

    chart.setOption(option);
    return chart;
  },
  initChartPie2(canvas, width, height, dpr) {
    // 使用引入的echarts的init方法初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });

    canvas.setChart(chart);

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          label: {
            normal: {
              show: true,
              // 使用数组形式定义多行文本，更易控制
              formatter: [
                '{b|{b}:}',
                '{c|{c}}'
              ].join('\n'),
              // 定位到中心（根据图表类型调整，如饼图用'center'，柱状图用'top'等）
              // position: 'center', 
              // 垂直居中对齐
              verticalAlign: 'middle',
              // 富文本样式配置，单独控制每行
              textStyle: {
                rich: {
                  b: {
                    align: 'center', // 第一行居中
                    fontSize: 14
                  },
                  c: {
                    align: 'center', // 第二行居中
                    fontSize: 12,
                    top: 5
                  }
                }
              }
            }
          },
          data: [
            { value: this.data.info.stateNums2[0], name: this.data.info.stateNames2[0],itemStyle: {color:'#ababab'} },
            { value: this.data.info.stateNums2[1], name: this.data.info.stateNames2[1],itemStyle: {color:'#007aff' } },
          ],
        }
      ]
    };

    chart.setOption(option);
    return chart;
  },
  initChartPie3(canvas, width, height, dpr) {
    // 使用引入的echarts的init方法初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // 像素
    });

    canvas.setChart(chart);

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '60%'],
          label: {
            normal: {
              show: true,
              // 使用数组形式定义多行文本，更易控制
              formatter: [
                '{b|{b}:}',
                '{c|{c}}'
              ].join('\n'),
              // 定位到中心（根据图表类型调整，如饼图用'center'，柱状图用'top'等）
              // position: 'center', 
              // 垂直居中对齐
              verticalAlign: 'middle',
              // 富文本样式配置，单独控制每行
              textStyle: {
                rich: {
                  b: {
                    align: 'center', // 第一行居中
                    fontSize: 14
                  },
                  c: {
                    align: 'center', // 第二行居中
                    fontSize: 12,
                    top: 5
                  }
                }
              }
            }
          },
          data: [
            { value: this.data.mileageTypeInfo.effectiveMileageSum, name: "有效里程",itemStyle: {color:'#ababab'} },
            { value: this.data.mileageTypeInfo.deadheadMileageSum, name: "空驶里程",itemStyle: {color:'#007aff' } },
          ],
        }
      ]
    };

    chart.setOption(option);
    return chart;
  },  
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.param[key] = value;
    this.setData({ param: this.data.param });
  },
  // 选择日期
  expireDayTypeChange(e) {
    let {
      value
    } = e.detail;
    this.setData({
      "param.type": this.data.expireDayTypeList[value].codeValue,
      expireDayTypeIndex: value
    })
    this.doQuery();
  },
  // 选择日期
  mileageTypeChange(e) {
    let {
      value
    } = e.detail;
    this.setData({
      mileageTypeIndex: value
    })
    this.loadVehicleMileageSumData(this.data.mileageTypeList[value].codeValue);
  },
  // 出勤
  toAttendance(e){
    let {tab,type} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../attendance/attendance?tab=${tab}&type=${type}`,
    })
  },
  // 回程单
  toReturnTripe(){
    wx.navigateTo({
      url: `../returnTrip/returnTrip`,
    })
  },
  // 到期
  toExpire(e){    
    let {tab} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../expire/expire?tab=${tab}&type=${this.data.param.type}`,
    })
  },
  // 实时定位
  toMap(){
    wx.navigateTo({
      url: `../vehicleMap/vehicleMap`,
    })
  },
  // 告警提示
  toWarn(){
    wx.navigateTo({
      url: `../warn/warnList/warnList`,
    })
  },
});