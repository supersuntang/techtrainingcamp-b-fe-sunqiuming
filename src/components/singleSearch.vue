<template>
    <div>
        <div class="header" v-show="isShow">
            <img class="img" src="//sf3-ttcdn-tos.pstatp.com/obj/card-system/HeadBar/dist_browser/images/logo.545e6c99.png"/>
        </div>
        <div class="search">
            <van-search
                v-model="keyword"
                placeholder="搜你想看"
                @search="keydownHandle"
                @focus="getFocus"
                @blur="cancelFocus"
                @clear="clearKeyWord"
            />
        </div>
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
        <div class="result-list" v-if="showResult">
            <div class="result-item">
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
        <div id="no-content"></div>
    </div>
</template>
<script>
import { get } from '../utils/request'
export default {
    data() {
        return {
            keyword: '',
            searchResult: [],
            timer: null,
            resultList: [],
            isShow: true,
            loading: false,
            finished: false,
            suggestWord: false,
            offset: 0,
            total: 0
        }
    },
    computed: {
        swiperList() {
            return this.resultList.slice(0, 4)
        },
        itemList() {
            return this.resultList.slice(4)
        },
        showResult() {
            return this.resultList.length
        }
    },
    methods: {
        getKeyWord(val) {
            if (val) {
                return get('/api/sug', {keyword: val}).then(res => {
                    this.searchResult = res.data.data
                })
            }
        },
        selectHandle() {
            return get('/api/study', {keyword: this.keyword, offset: this.offset}).then(res => {
                this.resultList = this.resultList.concat(res.data.data)
                this.total = res.data.total
                let noContent = document.getElementById('no-content')
                if (this.resultList.length === 0) {
                    noContent.setAttribute('style',
                        'display:flex;' + 'justify-content:center;' + 'align-items:center;' + 'width:100%;' + 'height:300px;'
                    )
                    noContent.insertAdjacentHTML('afterbegin', '<div id="no">暂无数据</div>');
                } else {
                    noContent.removeAttribute('style')
                }
            }).finally(() => {
                this.loading = false
                if (this.total === this.resultList.length - 4) {
                    this.finished = true
                }
            })
        },
        goPage(val) {
            window.open(val, '_blank')
        },
        keydownHandle() {
            this.handleItemClick(this.keyword)
        },
        handleItemClick(val) {
            this.suggestWord = false
            this.keyword = val
            this.resultList = []
            this.selectHandle()
        },
        getFocus() {
            this.searchResult = []
            this.isShow = false
            this.suggestWord = true
            let no = document.getElementById('no')
            if (no) {
                no.remove()
            }
        },
        cancelFocus() {
            if (!this.keyword) {
                this.isShow = true
                let no = document.getElementById('no')
                if (no) {
                    no.remove()
                }
            }
        },
        clearKeyWord() {
            this.resultList = []
        },
        onLoad() {
            this.offset = this.offset + 10
            this.selectHandle()
        },
        formatDate(val) {
            let now = new Date(val)
            let year = now.getFullYear()
            let month = now.getMonth() + 1
            let date = now.getDate()
            let hour = now.getHours()
            let minute = now.getMinutes()
            return year + '-' + month + '-' + date + ' ' + hour + ':' + minute
        }
    },
    watch: {
        keyword(val) {
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
    margin-top: 20px;
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
</style>