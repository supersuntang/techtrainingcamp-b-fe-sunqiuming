<template>
    <div>
        <!-- logo -->
        <div class="header" v-show="isShow">
            <img class="img" src="//sf3-ttcdn-tos.pstatp.com/obj/card-system/HeadBar/dist_browser/images/logo.545e6c99.png"/>
        </div>
        <!-- 搜索框 -->
        <div id="search" class="search">
            <van-search
                v-model="keyword"
                placeholder="搜你想看"
                @search="keydownHandle"
                @focus="getFocus"
                @blur="cancelFocus"
                @clear="clearKeyWord"
            />
        </div>
        <div id="content" class="content">
            <!-- 关键词推荐列表 -->
            <div class="search-list" v-if="keyword && suggestWord">
                <div class="search-content" ref="search">
                    <ul>
                        <li
                            class="search-item border-bottom"
                            v-for="item in searchResult"
                            :key="item.keyword"
                            @click="handleItemClick(item.keyword)"
                        >
                            <van-icon name="search" />
                            {{item.keyword}}
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 搜索结果页 -->
            <div id="result-list" class="result-list" v-if="showResult">
                <div class="result-item">
                    <!-- 滑动列表 -->
                    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="#000">
                        <van-swipe-item
                            v-for="item of swiperList"
                            :key="item.title"
                            @click="goPage(item.link_url)"
                        >
                            <span class="item-title">
                                {{item.title}}
                                <span class="item-tags">{{item.tags.toString()}}</span>
                            </span>
                            <div class="item-desc">{{item.description}}</div>
                            <div class="item-bottom">
                                <span class="item-bottom-name">作者：{{item.user_name}}</span>
                                <span class="item-bottom-comment">评论：{{item.comments_count}}</span>
                                <span class="item-bottom-date">{{formatDate(item.create_time)}}</span>
                            </div>
                        </van-swipe-item>
                    </van-swipe>
                </div>
                <div>
                    <!-- 瀑布流列表 -->
                    <van-list
                        v-model="loading"
                        :finished="finished"
                        finished-text="没有更多了"
                        @load="onLoad"
                    >
                        <van-cell
                            v-for="item of itemList"
                            :key="item.title"
                            @click="goPage(item.link_url)"
                        >
                            <div class="result-item-list">
                                <span class="item-title">
                                    {{item.title}}
                                    <span class="item-tags">{{item.tags.toString()}}</span>
                                </span>
                                <div class="item-desc">{{item.description}}</div>
                                <div class="item-bottom">
                                    <span class="item-bottom-name">作者：{{item.user_name}}</span>
                                    <span class="item-bottom-comment">评论：{{item.comments_count}}</span>
                                    <span class="item-bottom-date">{{formatDate(item.create_time)}}</span>
                                </div>
                            </div>
                        </van-cell>
                    </van-list>
                </div>
            </div>
        </div>
        <!-- 暂无数据 -->
        <div id="no-content"></div>
    </div>
</template>
<script>
import { get } from '../utils/request'
export default {
    data() {
        return {
            keyword: '', // 搜索的关键词
            searchResult: [], //推荐词列表
            timer: null,
            resultList: [], //搜索结果页列表
            isShow: true, //是否显示“头条搜索”图片
            loading: false, //瀑布流加载状态
            finished: false, //瀑布流加载完成状态
            suggestWord: false, //是否显示推荐词列表
            offset: 0, //每次请求数据的偏移量
            total: 0 //后端返回数据的总数
        }
    },
    computed: {
        swiperList() { //滑动列表的长度
            return this.resultList.slice(0, 4)
        },
        itemList() { //瀑布流列表的长度
            return this.resultList.slice(4)
        },
        showResult() { //计算列表结果页的长度
            return this.resultList.length
        }
    },
    methods: {
        getKeyWord(val) { //从后端获取推荐词数据
            if (val) {
                return get('/api/sug', {keyword: val}).then(res => {
                    this.searchResult = res.data.data
                })
            }
        },
        selectHandle() { //从后端获取搜索结果列表数据
            return get('/api/study', {keyword: this.keyword, offset: this.offset}).then(res => {
                this.resultList = this.resultList.concat(res.data.data)
                this.total = res.data.total
                if (this.showResult) {
                    setTimeout(() => {
                        let searchResult = document.getElementById('result-list')
                        searchResult.style.marginTop = '46px'
                    })
                }
                let noContent = document.getElementById('no-content')
                if (this.resultList.length === 0) {
                    noContent.setAttribute('style',
                        'display:flex;' + 'justify-content:center;' + 'align-items:center;' + 'width:100%;' + 'height:300px;'
                    )
                    noContent.insertAdjacentHTML('afterbegin', '<div id="no">暂无数据</div>');
                } else {
                    noContent.removeAttribute('style')
                }
                if (this.offset === 0) {
                    this.playAnimation(this.keyword)
                }
            }).finally(() => {
                this.loading = false
                if (this.total === 4 || this.total === this.showResult || this.swiperList < 4) {
                    this.finished = true
                }
            })
        },
        goPage(val) { //根据link_url跳转页面
            window.open(val, '_blank')
        },
        keydownHandle() { //按Enter键或者移动端输入面板的搜索键时触发
            this.handleItemClick(this.keyword)
        },
        handleItemClick(val) { //搜索
            this.suggestWord = false
            this.keyword = val
            this.resultList = []
            this.selectHandle()
        },
        getFocus() { //获取焦点时触发
            this.searchResult = []
            this.isShow = false
            this.suggestWord = true
            this.offset = 0
            let no = document.getElementById('no')
            if (no) {
                no.remove()
            }
            if (!this.isShow) {
                let search = document.getElementById('search')
                if (![...search.classList].includes('search-copy')) {
                    search.classList.add('search-copy')
                } else {
                    let searchResult = document.getElementById('result-list')
                    searchResult.style.marginTop = ''
                }
            }
        },
        cancelFocus() { //失去焦点时触发
            if (!this.keyword) {
                this.isShow = true
                let no = document.getElementById('no')
                if (no) {
                    no.remove()
                }
                let search = document.getElementById('search')
                search.classList.remove('search-copy')
            }
        },
        clearKeyWord() { //清空关键字触发
            this.resultList = []
        },
        onLoad() { //瀑布流加载
            this.offset = this.offset + 10
            this.selectHandle()
        },
        formatDate(val) { //时间转换
            let now = new Date(val)
            let year = now.getFullYear()
            let month = now.getMonth() + 1
            let date = now.getDate()
            let hour = now.getHours()
            let minute = now.getMinutes()
            return year + '-' + month + '-' + date + ' ' + hour + ':' + minute
        },
        playAnimation(key) { //动画效果
            let content = document.getElementById('content')
            if (key.includes('转')) {
                content.classList.add('trans')
                setTimeout(() => {
                    content.classList.remove('trans')
                }, 800)
            }
            if (key.includes('抖')) {
                content.classList.add('shake')
                setTimeout(() => {
                    content.classList.remove('shake')
                }, 800)
            }
            if (key.includes('摇')) {
                content.classList.add('rock')
                setTimeout(() => {
                    content.classList.remove('rock')
                }, 800)
            }
        }
    },
    watch: {
        keyword(val) { //监听关键词变化
            this.resultList = []
            if (this.timer) {
                clearTimeout(this.timer)
            }
            if (!this.keyword) {
                this.searchResult = []
                return
            }
            if (this.suggestWord) {
                this.timer = setTimeout(() => {
                    this.getKeyWord(this.keyword)
                }, 300)
            }
        }
    }
}
</script>
<style scoped>
.content {
    position: relative;
}
.header {
    display: flex;
    justify-content: center;
    align-items: center;
}
.img {
    padding: 100px 0 20px 0;
}
.search {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 36px;
}
.search-copy {
    position: fixed;
    top: 0px;
    z-index: 99;
    padding-top: 10px;
    background-color: #fff;
}
.search >>> .van-search {
    width: 90%;
    padding: 0;
}
.search >>> .van-search__content {
    background-color: #fff;
    padding: 0 0 0 8px;
    border: 1px solid #333;
}
.search-list {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 46px;
}
.search-content {
    z-index: 1;
    overflow: hidden;
    width: 90%;
}
.search-item {
    border-top: 1px solid #eee;
    padding: 5px 0 5px 0px;
}
ul {
    padding: 0;
}
.result-list {
    background-color: #eee;
}
.my-swipe >>> .van-swipe-item {
    margin-bottom: 12px;
}
.my-swipe >>> .van-swipe__indicators{
    bottom: 0;
}
.result-list >>> .van-cell {
    margin: 6px 0;
    padding: 10px 17px;
}
.result-list >>> .van-list ::after {
    display: none;
}
.result-item {
    padding: 15px 17px 5px;
    background-color: #fff;
}
.result-item-list {
    background-color: #fff;
}
.item-title {
    display: inline-block;
    font-size: 16px;
    color: #2e3135;
    font-weight: bold;
}
.item-tags {
    font-size: 12px;
    color: #2e3135;
    font-weight: bold;
}
.item-title ::before {
    content: "·";
    color: rgb(178, 186, 194);
    margin: 0 5px;
}
.item-desc {
    font-size: 14px;
    text-indent: 28px;
    margin-top: 10px;
}
.item-bottom {
    margin-top: 10px;
    font-size: 12px;
    color: rgb(178, 186, 194);
}
.item-bottom-comment {
    display: inline-block;
    margin-left: 10px;
}
.item-bottom-date {
    display: inline-block;
    margin-left: 10px;
}
.trans {
    transform: rotateY(360deg);
    transition-duration: 2s;
}
.shake {
    animation: shake 2s ease-in-out;
}
.rock {
    animation: rock 2s ease-in-out;
}
@keyframes shake {
    10%, 90% { transform: translate3d(-20px, 0, 0); }
    20%, 80% { transform: translate3d(+20px, 0, 0); }
    30%, 70% { transform: translate3d(-20px, 0, 0); }
    40%, 60% { transform: translate3d(+20px, 0, 0); }
    50% { transform: translate3d(-20px, 0, 0); }
}
@keyframes rock {
    10%, 90% { transform: rotate(-30deg); }
    20%, 80% { transform: rotate(30deg); }
    30%, 70% { transform: rotate(-30deg); }
    40%, 60% { transform: rotate(30deg); }
    50% { transform: rotate(-30deg); }
}
</style>