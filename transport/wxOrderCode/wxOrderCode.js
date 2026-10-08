import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../common/commonImport'
import drawQrcode from '../../utils/weapp.qrcode.esm.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTip:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },
  async drawCode() {
    let _this = this;
    let code = await util.postByBeanName('orderService', 'getQRCodeID');
    const query = wx.createSelectorQuery()
    query.select('#myQrcode')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        var canvas = res[0].node

        // 调用方法drawQrcode生成二维码
        drawQrcode({
          canvas: canvas,
          canvasId: 'myQrcode',
          width: 260,
          padding: 30,
          background: '#ffffff',
          foreground: '#000000',
          text: 'https://pt.1000e56.com/wxOrder?code='+code,
        })

        wx.canvasToTempFilePath({
          canvasId: 'myQrcode',
          canvas: canvas,
          x: 0,
          y: 0,
          width: 260,
          height: 260,
          destWidth: 260,
          destHeight: 260,
          success(res) {
            console.log('二维码临时路径：', res.tempFilePath)
            _this.setData({tempFilePath:res.tempFilePath,showTip:true})
          },
          fail(res) {
            console.error(res)
          }
        })
      })
  },
  // 保存/分享图片
  shareCode(){
    let _this = this;
    wx.showShareImageMenu({
      path: _this.data.tempFilePath
    })
  },
})