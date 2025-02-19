// ignore
import {} from '../../core/uzVideo.js';
import {} from '../../core/uzHome.js';
import {} from '../../core/uz3lib.js';
import {} from '../../core/uzUtils.js';
// ignore

class XHamsterAPI extends WebApiBase {
  constructor() {
    super();
    this.host = 'https://zh.xhamster.com/x-api'; // API 地址
    this.webSite = 'https://zh.xhamster.com'; // 网站首页
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Referer': this.webSite,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * 获取分类列表
   * @returns {Promise<RepVideoClassList>}
   */
  async getClassList(args) {
    let backData = new RepVideoClassList();
    try {
      let categories = [
        { type_id: 'straight', type_name: '直男' },
        { type_id: 'gay', type_name: '同性' },
        { type_id: 'trans', type_name: '变性' },
        { type_id: 'amateur', type_name: '素人' },
      ];
      backData.data = categories;
    } catch (error) {
      backData.error = `分类列表获取失败: ${error}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取分类视频列表
   * @returns {Promise<RepVideoList>}
   */
  async getVideoList(args) {
    let backData = new RepVideoList();
    try {
      if (!args.type_id) {
        throw new Error('分类ID为空');
      }

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          category: args.type_id,
          limit: 20,
          page: args.page || 1,
        }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.videos && Array.isArray(data.videos)) {
        backData.data = data.videos.map(video => ({
          vod_id: video.id,
          vod_name: video.title || '未知标题',
          vod_pic: video.thumbnail_url || '',
          vod_remarks: video.duration || '未知时长',
        }));
      } else {
        throw new Error('videos 数据格式错误');
      }
    } catch (error) {
      backData.error = `获取视频列表失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频详情
   * @returns {Promise<RepVideoDetail>}
   */
  async getVideoDetail(args) {
    let backData = new RepVideoDetail();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ video_id: args.vod_id }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.video) {
        let video = data.video;
        backData.vod_id = video.id;
        backData.vod_name = video.title || '未知视频';
        backData.vod_pic = video.thumbnail_url || '';
        backData.vod_content = video.description || '暂无简介';
      } else {
        throw new Error('video 数据格式错误');
      }
    } catch (error) {
      backData.error = `获取视频详情失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频播放地址
   * @returns {Promise<RepVideoPlayUrl>}
   */
  async getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      let videoPageUrl = `https://zh.xhamster.com/videos/${args.vod_id}`;

      let response = await req(videoPageUrl, {
        method: 'GET',
        headers: { 'User-Agent': this.headers['User-Agent'], 'Referer': this.webSite },
      });

      if (!response || !response.data) {
        throw new Error('无法获取视频详情页 HTML');
      }

      let html = response.data;
      let m3u8Regex = /https:\/\/video\d+\.xhcdn\.com\/key=.*?\.m3u8/;
      let match = html.match(m3u8Regex);

      if (match && match[0]) {
        backData.data = match[0];
      } else {
        throw new Error('未找到 m3u8 播放地址');
      }
    } catch (error) {
      backData.error = `获取播放地址失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 搜索视频
   * @returns {Promise<RepVideoList>}
   */
  async searchVideo(args) {
    let backData = new RepVideoList();
    try {
      if (!args.searchWord) {
        throw new Error('搜索关键词为空');
      }

      let searchUrl = `https://zh.xhamster.com/search/${encodeURIComponent(args.searchWord)}/${args.page || 1}`;

      let response = await req(searchUrl, {
        method: 'GET',
        headers: { 'User-Agent': this.headers['User-Agent'], 'Referer': this.webSite },
      });

      if (!response || !response.data) {
        throw new Error('无法获取搜索页面 HTML');
      }

      let html = response.data;
      let document = parse(html);
      let videoElements = document.querySelectorAll('div.video-thumb');

      backData.data = Array.from(videoElements).map(element => {
        let vod_id = element.querySelector('a').attributes['href'].split('/').pop();
        let vod_name = element.querySelector('a').attributes['title'] || '未知标题';
        let vod_pic = element.querySelector('img').attributes['src'] || '';
        let vod_duration = element.querySelector('div.duration')?.text || '未知时长';

        return { vod_id, vod_name, vod_pic, vod_remarks: vod_duration };
      });
    } catch (error) {
      backData.error = `搜索失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  ignoreClassName = ['4K', '可爱', '高清视频', '18岁', '虚拟现实视频', '地址'];

    combineUrl(url) {
        if (url === undefined) {
            return ''
        }
        if (url.indexOf(this.webSite) !== -1) {
            return url
        }
        if (url.startsWith('/')) {
            return this.webSite + url
        }
        return this.webSite + '/' + url
    }

    isIgnoreClassName(className) {
        for (let index = 0; index < this.ignoreClassName.length; index++) {
            const element = this.ignoreClassName[index]
            if (className.indexOf(element) !== -1) {
                return true
            }
        }
        return false
    }

    removeTrailingSlash(str) {
        if (str.endsWith('/')) {
            return str.slice(0, -1)
        }
        return str
    }
}
// json 中 instance 的值，这个名称一定要特殊
var xhm20250219 = new xhm20250219();
