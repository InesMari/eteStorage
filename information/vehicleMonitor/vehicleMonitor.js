import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 40.002607,
    longitude: 116.487847,
    markers: [],    
    active:0,
    mapShow:true,
    params:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // this.doQuery();
  },
  async doQuery(){
    let {vehicleData} = await util.postByBeanName('miniProgramWaybillTF','vehicleMonitor',this.data.params); 
    this.setData({vehicleData});
    if(common.isNotBlank(vehicleData) && vehicleData.length > 0){
      this.initMap(vehicleData);
    }else{
      wxApi.showToast("该车辆没有定位信息。")
    }
  },
  initMap(info){
    let markers = [];   //地图marker
    info.forEach((item,index) => {   //遍历作业点信息插入到marker
      if(common.isNotBlank(item.latitude)&&common.isNotBlank(item.longitude)){
        let obj = {};
        obj.longitude = item.longitude;
        obj.latitude = item.latitude;
        obj.width = 48;
        obj.height = 24;
        obj.customCallout = {
          anchorY: 0,
          anchorX: 0,
          display: 'BYCLICK'
        };
        obj.plateNumber=item.plateNumber;
        obj.vehicleId=item.vehicleId;
        obj.iconPath = "/common/images/car.png";   
        obj.label = {
          content:"车牌号："+item.plateNumber,  
          padding:8,
          bgColor:"#fff",
          borderRadius:100,
          anchorX:-60,
          anchorY:-55,
          borderColor:"#aaa",
          borderWidth:1
        }   
        markers.push(obj);
      };
    })
    this.setData({markers});
    // 调整地图视野
    wx.createMapContext("map").includePoints({
      //要显示在可视区域内的坐标点列表
      points:markers,
    })
  },
  // 搜索框赋值
  search(e){
    this.setData({['params.plateNumber']:e.detail})
  },
})