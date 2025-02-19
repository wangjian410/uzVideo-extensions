// ignore
// 不支持导入，这里只是本地开发用于代码提示
// 如需添加通用依赖，请联系 https://t.me/uzVideoAppbot
import {} from '../uzVideo.js'
import {} from '../uzUtils.js'
import {} from '../uz3lib.js'

// ignore

//MARK: 注意
// 直接复制该文件进行扩展开发
// 请保持以下 变量 及 函数 名称不变
// 请勿删减，可以新增

const appConfig = {
    _webSite: 'https://zh.xhamster.com',
    /**
     * 网站主页，uz 调用每个函数前都会进行赋值操作
     * 如果不想被改变 请自定义一个变量
     */
    get webSite() {
        return this._webSite
    },
    set webSite(value) {
        this._webSite = value
    },

    _uzTag: '',
    /**
     * 扩展标识，初次加载时，uz 会自动赋值，请勿修改
     * 用于读取环境变量
     */
    get uzTag() {
        return this._uzTag
    },
    set uzTag(value) {
        this._uzTag = value
    },
}

/**
 * 异步获取分类列表的方法。
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoClassList())>}
 */
async function getClassList(args) {
    var backData = new RepVideoClassList()
    try {
        const categories = [
            { type_id: '/4k', type_name: '4K' },
            { type_id: '/categories', type_name: '类别' },
            { type_id: '/newest', type_name: '最新' },
            { type_id: '/best', type_name: '最佳' },
            { type_id: '/pornstars', type_name: '明星' }
        ];
        backData.data = categories;
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类列表筛选列表的方法。
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoSubclassList())>}
 */
async function getSubclassList(args) {
    var backData = new RepVideoSubclassList()
    try {
        // 示例：根据需要添加过滤条件
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取分类视频列表
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getVideoList(args) {
    var backData = new RepVideoList()
    try {
        const page = args.page || 1;
        const tid = args.type_id || '/newest'; // 默认获取最新视频
        let url = `https://zh.xhamster.com${tid}/page/${page}`;

        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Referer': 'https://zh.xhamster.com'
            }
        });

        if (!response || !response.data) {
            throw new Error('API 返回数据为空');
        }

        let data = response.data;
        let videos = [];
        let videoElements = parse(data).querySelectorAll('.video-item');
        
        videoElements.forEach(element => {
            videos.push({
                vod_id: element.querySelector('a').getAttribute('href').split('/').pop(),
                vod_name: element.querySelector('img').getAttribute('alt'),
                vod_pic: element.querySelector('img').getAttribute('src'),
                vod_remarks: element.querySelector('.duration').textContent,
            });
        });

        backData.data = videos;
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类视频列表 或 筛选视频列表
 * @param {UZSubclassVideoListArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getSubclassVideoList(args) {
    var backData = new RepVideoList()
    try {
        // 示例：根据需要获取视频内容
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取视频详情
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoDetail())>}
 */
async function getVideoDetail(args) {
    var backData = new RepVideoDetail()
    try {
        if (!args.vod_id) {
            throw new Error('视频ID为空');
        }

        let url = `https://zh.xhamster.com/videos/${args.vod_id}`;
        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Referer': 'https://zh.xhamster.com'
            }
        });

        if (!response || !response.data) {
            throw new Error('无法获取视频详情');
        }

        let data = response.data;
        backData.vod_name = data.title;
        backData.vod_pic = data.thumbnail_url;
        backData.vod_remarks = data.duration;

        // 解析播放链接
        let playUrl = data.video.play_url;
        backData.vod_play_url = playUrl;

    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}

/**
 * 获取视频的播放地址
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoPlayUrl())>}
 */
async function getVideoPlayUrl(args) {
    var backData = new RepVideoPlayUrl()
    try {
        if (!args.vod_id) {
            throw new Error('视频ID为空');
        }

        let url = `https://zh.xhamster.com/videos/${args.vod_id}`;
        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Referer': 'https://zh.xhamster.com'
            }
        });

        if (!response || !response.data) {
            throw new Error('无法获取视频播放地址');
        }

        let data = response.data;
        let playUrl = data.video.play_url;

        backData.data = playUrl;
    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}

/**
 * 搜索视频
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function searchVideo(args) {
    var backData = new RepVideoList()
    try {
        if (!args.searchWord) {
            throw new Error('搜索关键词为空');
        }

        let searchUrl = `https://zh.xhamster.com/search/${encodeURIComponent(args.searchWord)}?page=${args.page || 1}`;
        let response = await req(searchUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Referer': 'https://zh.xhamster.com'
            }
        });

        if (!response || !response.data) {
            throw new Error('无法获取搜索页面 HTML');
        }

        let data = response.data;
        let searchResults = [];
        let videoElements = parse(data).querySelectorAll('.search-result-item');
        
        videoElements.forEach(element => {
            searchResults.push({
                vod_id: element.querySelector('a').getAttribute('href').split('/').pop(),
                vod_name: element.querySelector('img').getAttribute('alt'),
                vod_pic: element.querySelector('img').getAttribute('src'),
                vod_remarks: element.querySelector('.duration').textContent,
            });
        });

        backData.data = searchResults;
    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}
// json 中 instance 的值，这个名称一定要特殊
var xhm20250219 = new xhm20250219();
