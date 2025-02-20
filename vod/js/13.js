var rule = {
    title: 'xHamster',
    host: 'https://zh.xhamster.com',
    url: '/categories/fyclass/fysort/fypage', // 分类URL模板
    searchUrl: '/search/**?page=fypage', // 搜索URL模板
    searchable: 2, // 支持搜索分页
    quickSearch: 1, // 支持快速搜索
    filterable: 0, // 暂不支持筛选
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Referer': 'https://zh.xhamster.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"'
    },
    timeout: 5000,
    class_name: '4K&国产&最新&最佳&频道&类别&明星',
    class_url: '4k&chinese&new&best&channels&categories&pornstars',
    play_parse: false,
    lazy: '',
    limit: 6,

    // 初始化
    init: function(cfg) {
        rule.host = cfg.host || rule.host;
    },

    // 主页推荐内容
    home: function(filter) {
        let html = req(rule.host, { headers: rule.headers });
        let $ = html(html);
        let videos = this.getVideoList($('.thumb-list--sidebar .thumb-list__item'));
        return JSON.stringify({
            class: rule.class_name.split('&').map((name, i) => ({
                type_id: rule.class_url.split('&')[i],
                type_name: name
            })),
            list: videos
        });
    },

    // 主页推荐视频
    homeVod: function() {
        let html = req(rule.host, { headers: rule.headers });
        let $ = html(html);
        let videos = this.getVideoList($('.thumb-list--sidebar .thumb-list__item'));
        return JSON.stringify({ list: videos });
    },

    // 分类页面
    category: function(tid, pg, filter, extend) {
        pg = pg || 1;
        let sort = tid === '4k' ? '' : 'best'; // 4K无排序，其他默认best
        let url = rule.host + rule.url.replace('fyclass', tid).replace('fysort', sort).replace('fypage', pg);
        if (tid === '4k') url = `${rule.host}/4k/${pg}`; // 4K特殊处理
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let videos = this.getVideoList($('.thumb-list--sidebar .thumb-list__item'));
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999, // 暂无法准确解析总数
            limit: rule.limit,
            total: 999 * rule.limit,
            list: videos
        });
    },

    // 视频详情
    detail: function(id) {
        let url = rule.host + id;
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let jsData = this.getJsData($); // 提取JSON数据
        let playList = [];
        
        // 解析播放链接
        try {
            let sources = jsData['xplayerSettings']['sources'];
            let hls = sources.get('hls');
            let standard = sources.get('standard');
            if (hls) {
                for (let [format, info] of Object.entries(hls)) {
                    if (info.url) playList.push(`${format}$${info.url}`);
                }
            }
            if (standard) {
                for (let [key, value] of Object.entries(standard)) {
                    if (Array.isArray(value)) {
                        value.forEach(item => {
                            let url = item.url || item.fallback;
                            if (url) playList.push(`${item.label || item.quality}$${url}`);
                        });
                    }
                }
            }
        } catch (e) {
            playList.push(`默认$${url}`); // 失败时直接用详情页URL
        }

        let video = {
            vod_id: id,
            vod_name: $('meta[property="og:title"]').attr('content'),
            vod_pic: $('.video-container img').attr('src') || $('meta[property="og:image"]').attr('content'),
            vod_play_from: 'xHamster',
            vod_play_url: playList.join('#'),
            vod_remarks: $('.rb-new__info').text().trim() || ''
        };
        return JSON.stringify({ list: [video] });
    },

    // 播放链接
    play: function(flag, id, flags) {
        return JSON.stringify({
            parse: 0,
            url: id
        });
    },

    // 搜索
    search: function(wd, quick, pg) {
        pg = pg || 1;
        let url = rule.host + rule.searchUrl.replace('**', encodeURIComponent(wd)).replace('fypage', pg);
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let videos = this.getVideoList($('.thumb-list--sidebar .thumb-list__item'));
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999,
            limit: rule.limit,
            total: 999 * rule.limit,
            list: videos
        });
    },

    // 辅助函数：提取视频列表
    getVideoList: function(elements) {
        let videos = [];
        elements.each(function() {
            let $this = $(this);
            let id = $this.find('.role-pop').attr('href');
            let name = $this.find('.video-thumb-info a').text().trim();
            if (id && name) {
                videos.push({
                    vod_id: id,
                    vod_name: name,
                    vod_pic: $this.find('.role-pop img').attr('src'),
                    vod_remarks: $this.find('.role-pop div[data-role="video-duration"]').text().trim()
                });
            }
        });
        return videos;
    },

    // 辅助函数：提取脚本中的JSON数据
    getJsData: function($) {
        let script = $("script[id='initials-script']").text();
        try {
            let jsonStr = script.split('initials=')[1].slice(0, -1);
            return JSON.parse(jsonStr);
        } catch (e) {
            print('解析JSON失败: ' + e);
            return {};
        }
    }
};

Object.assign(this, rule);
