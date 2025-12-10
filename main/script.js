        // アプリケーションの状態
        const state = {
            apiKey: '',
            playerSources: [
                'https://raw.githubusercontent.com/siawaseok3/wakame/master/video_config.json',
                'https://raw.githubusercontent.com/wakame02/wktopu/refs/heads/main/edu.text',
                'https://raw.githubusercontent.com/woolisbest-4520/about-youtube/refs/heads/main/edu.json',
                'https://raw.githubusercontent.com/woolisbest-4520/about-youtube/refs/heads/main/parameter.json',
                'https://apis.kahoot.it/media-api/youtube/key'
            ],
            selectedPlayerSourceIndex: 0,
            playerParams: '',
            currentPage: 'home',
            searchQuery: '',
            dateFilter: '',
            nextPageTokens: {
                search: '',
                channel: ''
            },
            currentVideoId: '',
            currentChannelId: ''
        };

        // DOM要素
        const setupScreen = document.getElementById('setupScreen');
        const app = document.getElementById('app');
        const apiOptions = document.querySelectorAll('.api-option');
        const playerSourceOptions = document.querySelectorAll('.player-source-option');
        const startBtn = document.getElementById('startBtn');
        const apiSelector = document.getElementById('apiSelector');
        const playerSourceSelector = document.getElementById('playerSourceSelector');
        const themeToggle = document.getElementById('themeToggle');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const dateFilter = document.getElementById('dateFilter');
        const goHome = document.getElementById('goHome');
        const videoGrid = document.getElementById('videoGrid');
        const loadMoreVideos = document.getElementById('loadMoreVideos');
        const playerPage = document.getElementById('playerPage');
        const homePage = document.getElementById('homePage');
        const channelPage = document.getElementById('channelPage');
        const videoPlayer = document.getElementById('videoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        const videoStats = document.getElementById('videoStats');
        const channelInfo = document.getElementById('channelInfo');
        const videoDescription = document.getElementById('videoDescription');
        const channelHeader = document.getElementById('channelHeader');
        const channelVideos = document.getElementById('channelVideos');
        const loadMoreChannelVideos = document.getElementById('loadMoreChannelVideos');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const retryBtn = document.getElementById('retryBtn');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // 初期化
        document.addEventListener('DOMContentLoaded', () => {
            // APIキー選択
            apiOptions.forEach(option => {
                option.addEventListener('click', () => {
                    apiOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    state.apiKey = option.dataset.apiKey;
                    updateStartButton();
                });
            });

            // プレイヤーソース選択
            playerSourceOptions.forEach(option => {
                option.addEventListener('click', () => {
                    playerSourceOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    state.selectedPlayerSourceIndex = parseInt(option.dataset.sourceIndex);
                    updateStartButton();
                });
            });

            // 開始ボタン
            startBtn.addEventListener('click', startApp);

            // APIセレクター変更
            apiSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    state.apiKey = e.target.value;
                    showMessage('APIキーを変更しました', 'success');
                    if (state.currentPage === 'player' && state.currentVideoId) {
                        loadVideoDetails(state.currentVideoId);
                    }
                }
            });

            // プレイヤーソースセレクター変更
            playerSourceSelector.addEventListener('change', (e) => {
                if (e.target.value !== '') {
                    state.selectedPlayerSourceIndex = parseInt(e.target.value);
                    showMessage('プレイヤーソースを変更しました', 'success');
                    if (state.currentPage === 'player' && state.currentVideoId) {
                        loadPlayerParams().then(() => {
                            playVideo(state.currentVideoId);
                        });
                    }
                }
            });

            // テーマ切り替え
            themeToggle.addEventListener('click', toggleTheme);

            // メニュートグル
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // 検索
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });

            // 日付フィルター
            dateFilter.addEventListener('change', (e) => {
                state.dateFilter = e.target.value;
                if (state.searchQuery) {
                    performSearch();
                }
            });

            // ホームに戻る
            goHome.addEventListener('click', () => {
                showHomePage();
            });

            // もっと読み込むボタン
            loadMoreVideos.addEventListener('click', loadMoreContent);
            loadMoreChannelVideos.addEventListener('click', loadMoreChannelVideosFunc);

            // サイドバーナビゲーション
            sidebarItems.forEach(item => {
                item.addEventListener('click', () => {
                    const page = item.dataset.page;
                    navigateToPage(page);
                });
            });

            // フィルターボタン
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // ここでフィルターを適用
                });
            });

            // 再試行ボタン
            retryBtn.addEventListener('click', () => {
                hideError();
                if (state.currentPage === 'player') {
                    loadVideoDetails(state.currentVideoId);
                } else if (state.currentPage === 'channel') {
                    loadChannelDetails(state.currentChannelId);
                } else {
                    loadHomeVideos();
                }
            });

            // プレイヤーパラメータを事前に取得
            loadPlayerParams();
        });

        // スタートボタンの更新
        function updateStartButton() {
            if (state.apiKey && state.selectedPlayerSourceIndex !== null) {
                startBtn.disabled = false;
            } else {
                startBtn.disabled = true;
            }
        }

        // アプリを開始
        function startApp() {
            setupScreen.classList.add('hidden');
            app.classList.remove('hidden');
            
            // プレイヤーパラメータを取得
            loadPlayerParams().then(() => {
                // ホームページの動画を読み込み
                loadHomeVideos();
            });
        }

        // テーマ切り替え
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
            }
        }

        // プレイヤーパラメータの読み込み
        async function loadPlayerParams() {
            try {
                const response = await fetch(state.playerSources[state.selectedPlayerSourceIndex]);
                if (response.ok) {
                    const data = await response.text();
                    // JSONの場合とテキストの場合があるので処理を分ける
                    if (data.trim().startsWith('{')) {
                        const jsonData = JSON.parse(data);
                        state.playerParams = jsonData.params || '';
                    } else {
                        state.playerParams = data.trim();
                    }
                } else {
                    // デフォルトのパラメータを使用
                    state.playerParams = '?autoplay=1&controls=1&rel=0';
                }
            } catch (error) {
                console.error('プレイヤーパラメータの読み込みに失敗しました:', error);
                state.playerParams = '?autoplay=1&controls=1&rel=0';
            }
        }

        // ページナビゲーション
        function navigateToPage(page) {
            state.currentPage = page;
            
            // サイドバーのアクティブ状態を更新
            sidebarItems.forEach(item => {
                if (item.dataset.page === page) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // ページを表示
            if (page === 'home') {
                showHomePage();
            } else {
                // 他のページの処理
                showHomePage(); // 一時的にホームページを表示
            }
        }

        // ホームページを表示
        function showHomePage() {
            playerPage.classList.add('hidden');
            channelPage.classList.add('hidden');
            homePage.classList.remove('hidden');
            state.currentPage = 'home';
            
            if (videoGrid.children.length === 0) {
                loadHomeVideos();
            }
        }

        // ホーム動画の読み込み
        async function loadHomeVideos() {
            showLoading();
            hideError();
            
            try {
                // 人気動画を取得
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=20&regionCode=JP&key=${state.apiKey}`
                );
                
                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    displayVideos(data.items);
                } else {
                    throw new Error('動画が見つかりませんでした');
                }
            } catch (error) {
                showError(`動画の読み込みに失敗しました: ${error.message}`);
            } finally {
                hideLoading();
            }
        }

        // 動画を表示
        function displayVideos(videos, container = videoGrid, clear = true) {
            if (clear) {
                container.innerHTML = '';
            }
            
            videos.forEach(video => {
                const videoCard = createVideoCard(video);
                container.appendChild(videoCard);
            });
        }

        // 動画カードの作成
        function createVideoCard(video) {
            const videoId = video.id.videoId || video.id;
            const snippet = video.snippet;
            const statistics = video.statistics || {};
            const contentDetails = video.contentDetails || {};
            
            const card = document.createElement('div');
            card.className = 'video-card';
            card.dataset.videoId = videoId;
            
            // サムネイル
            const thumbnailUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '';
            
            // 動画時間
            let duration = '';
            if (contentDetails.duration) {
                duration = formatDuration(contentDetails.duration);
            }
            
            // 視聴回数
            const viewCount = statistics.viewCount ? formatNumber(statistics.viewCount) + ' 回視聴' : '';
            
            // 投稿時間
            const publishedAt = timeAgo(snippet.publishedAt);
            
            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${thumbnailUrl}" alt="${snippet.title}" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumbnail'">
                    ${duration ? `<span class="video-duration">${duration}</span>` : ''}
                </div>
                <div class="video-info">
                    <img src="${snippet.thumbnails?.default?.url || 'https://via.placeholder.com/36x36?text=CH'}" 
                         alt="${snippet.channelTitle}" 
                         class="channel-avatar"
                         onerror="this.src='https://via.placeholder.com/36x36?text=CH'">
                    <div class="video-details">
                        <h3 class="video-title">${snippet.title}</h3>
                        <div class="channel-name">${snippet.channelTitle}</div>
                        <div class="video-stats">
                            ${viewCount} • ${publishedAt}
                        </div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => playVideo(videoId));
            
            return card;
        }

        // 検索実行
        async function performSearch() {
            const query = searchInput.value.trim();
            if (!query) return;
            
            state.searchQuery = query;
            showLoading();
            hideError();
            
            try {
                // 日付フィルターの処理
                let publishedAfter = '';
                const now = new Date();
                
                if (state.dateFilter === 'today') {
                    const today = new Date(now);
                    today.setDate(today.getDate() - 1);
                    publishedAfter = today.toISOString();
                } else if (state.dateFilter === 'this_week') {
                    const weekAgo = new Date(now);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    publishedAfter = weekAgo.toISOString();
                } else if (state.dateFilter === 'this_month') {
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    publishedAfter = monthAgo.toISOString();
                } else if (state.dateFilter === 'this_year') {
                    const yearAgo = new Date(now);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    publishedAfter = yearAgo.toISOString();
                }
                
                let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(query)}&key=${state.apiKey}`;
                
                if (publishedAfter) {
                    url += `&publishedAfter=${publishedAfter}`;
                }
                
                if (state.nextPageTokens.search) {
                    url += `&pageToken=${state.nextPageTokens.search}`;
                }
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`検索エラー: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 次のページトークンを保存
                state.nextPageTokens.search = data.nextPageToken || '';
                
                if (data.items && data.items.length > 0) {
                    // 動画の詳細情報を取得
                    const videoIds = data.items.map(item => item.id.videoId).join(',');
                    const detailsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${state.apiKey}`
                    );
                    
                    if (detailsResponse.ok) {
                        const detailsData = await detailsResponse.json();
                        displayVideos(detailsData.items);
                        loadMoreVideos.classList.remove('hidden');
                    } else {
                        throw new Error('動画詳細の取得に失敗しました');
                    }
                } else {
                    throw new Error('検索結果が見つかりませんでした');
                }
            } catch (error) {
                showError(`検索に失敗しました: ${error.message}`);
            } finally {
                hideLoading();
            }
        }

        // 動画を再生
        async function playVideo(videoId) {
            state.currentVideoId = videoId;
            
            // ページを切り替え
            homePage.classList.add('hidden');
            channelPage.classList.add('hidden');
            playerPage.classList.remove('hidden');
            state.currentPage = 'player';
            
            // サイドバーを閉じる（モバイルの場合）
            sidebar.classList.remove('open');
            
            showLoading();
            hideError();
            
            try {
                // プレイヤーパラメータを確認
                if (!state.playerParams) {
                    await loadPlayerParams();
                }
                
                // 動画プレイヤーを設定
                const playerUrl = `https://www.youtubeeducation.com/embed/${videoId}${state.playerParams}`;
                videoPlayer.innerHTML = `<iframe class="player-iframe" src="${playerUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                
                // 動画の詳細情報を取得
                await loadVideoDetails(videoId);
                
            } catch (error) {
                showError(`動画の読み込みに失敗しました: ${error.message}`);
            } finally {
                hideLoading();
            }
        }

        // 動画詳細の読み込み
        async function loadVideoDetails(videoId) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${state.apiKey}`
                );
                
                if (!response.ok) {
                    throw new Error(`動画詳細の取得エラー: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const video = data.items[0];
                    const snippet = video.snippet;
                    const statistics = video.statistics;
                    const contentDetails = video.contentDetails;
                    
                    // タイトル
                    videoTitle.textContent = snippet.title;
                    
                    // 統計情報
                    const viewCount = formatNumber(statistics.viewCount);
                    const likeCount = formatNumber(statistics.likeCount || 0);
                    const publishedAt = new Date(snippet.publishedAt).toLocaleDateString('ja-JP');
                    
                    videoStats.innerHTML = `
                        <span>${viewCount} 回視聴</span> • 
                        <span>${likeCount} いいね</span> • 
                        <span>${publishedAt}</span>
                    `;
                    
                    // チャンネル情報
                    channelInfo.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <img src="${snippet.thumbnails?.default?.url || 'https://via.placeholder.com/40x40?text=CH'}" 
                                 alt="${snippet.channelTitle}" 
                                 class="channel-avatar"
                                 onerror="this.src='https://via.placeholder.com/40x40?text=CH'"
                                 style="cursor: pointer;"
                                 onclick="showChannel('${snippet.channelId}')">
                            <div>
                                <div style="font-weight: 500; cursor: pointer;" onclick="showChannel('${snippet.channelId}')">${snippet.channelTitle}</div>
                                <div style="font-size: 12px; color: var(--light-secondary-text);">${formatNumber(statistics.subscriberCount || 0)} 登録者</div>
                            </div>
                            <button style="margin-left: auto; padding: 8px 16px; background-color: #cc0000; color: white; border: none; border-radius: 20px; font-weight: 500; cursor: pointer;">登録する</button>
                        </div>
                    `;
                    
                    // 説明
                    videoDescription.textContent = snippet.description || '説明はありません';
                } else {
                    throw new Error('動画が見つかりませんでした');
                }
            } catch (error) {
                showError(`動画詳細の取得に失敗しました: ${error.message}`);
            }
        }

        // チャンネルを表示
        async function showChannel(channelId) {
            state.currentChannelId = channelId;
            
            // ページを切り替え
            homePage.classList.add('hidden');
            playerPage.classList.add('hidden');
            channelPage.classList.remove('hidden');
            state.currentPage = 'channel';
            
            // サイドバーを閉じる（モバイルの場合）
            sidebar.classList.remove('open');
            
            showLoading();
            hideError();
            
            try {
                await loadChannelDetails(channelId);
                await loadChannelVideos(channelId);
            } catch (error) {
                showError(`チャンネルの読み込みに失敗しました: ${error.message}`);
            } finally {
                hideLoading();
            }
        }

        // チャンネル詳細の読み込み
        async function loadChannelDetails(channelId) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${state.apiKey}`
                );
                
                if (!response.ok) {
                    throw new Error(`チャンネル詳細の取得エラー: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const channel = data.items[0];
                    const snippet = channel.snippet;
                    const statistics = channel.statistics;
                    
                    channelHeader.innerHTML = `
                        <img src="${snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || 'https://via.placeholder.com/100x100?text=CH'}" 
                             alt="${snippet.title}" 
                             class="channel-avatar-large"
                             onerror="this.src='https://via.placeholder.com/100x100?text=CH'">
                        <div class="channel-info">
                            <h1 class="channel-title">${snippet.title}</h1>
                            <div class="channel-stats">
                                <span>${snippet.customUrl || ''}</span>
                                <span>${formatNumber(statistics.subscriberCount || 0)} 登録者</span>
                                <span>${formatNumber(statistics.videoCount || 0)} 本の動画</span>
                            </div>
                            <div class="channel-description">${snippet.description || ''}</div>
                        </div>
                    `;
                } else {
                    throw new Error('チャンネルが見つかりませんでした');
                }
            } catch (error) {
                throw error;
            }
        }

        // チャンネル動画の読み込み
        async function loadChannelVideos(channelId, nextPageToken = '') {
            try {
                // チャンネルの動画を検索
                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=20&key=${state.apiKey}`;
                const response = await fetch(nextPageToken ? `${url}&pageToken=${nextPageToken}` : url);
                
                if (!response.ok) {
                    throw new Error(`チャンネル動画の取得エラー: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 次のページトークンを保存
                state.nextPageTokens.channel = data.nextPageToken || '';
                
                if (data.items && data.items.length > 0) {
                    // 動画の詳細情報を取得
                    const videoIds = data.items.map(item => item.id.videoId).join(',');
                    const detailsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${state.apiKey}`
                    );
                    
                    if (detailsResponse.ok) {
                        const detailsData = await detailsResponse.json();
                        displayVideos(detailsData.items, channelVideos, nextPageToken === '');
                        
                        if (state.nextPageTokens.channel) {
                            loadMoreChannelVideos.classList.remove('hidden');
                        } else {
                            loadMoreChannelVideos.classList.add('hidden');
                        }
                    }
                } else {
                    channelVideos.innerHTML = '<p>動画はありません</p>';
                    loadMoreChannelVideos.classList.add('hidden');
                }
            } catch (error) {
                throw error;
            }
        }

        // もっと読み込む機能
        async function loadMoreContent() {
            if (!state.searchQuery) {
                // ホームの動画をさらに読み込む
                await loadHomeVideos(false);
            } else {
                // 検索結果をさらに読み込む
                await performSearch(false);
            }
        }

        // チャンネル動画をもっと読み込む
        async function loadMoreChannelVideosFunc() {
            if (state.nextPageTokens.channel) {
                await loadChannelVideos(state.currentChannelId, state.nextPageTokens.channel);
            }
        }

        // ユーティリティ関数
        function formatNumber(num) {
            if (!num) return '0';
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
            }
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            }
            return num.toString();
        }

        function formatDuration(duration) {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            if (!match) return '';
            
            const hours = (match[1] || '').replace('H', '');
            const minutes = (match[2] || '').replace('M', '');
            const seconds = (match[3] || '').replace('S', '');
            
            let result = '';
            if (hours) {
                result += hours + ':';
                result += minutes.padStart(2, '0') + ':';
            } else {
                result += minutes + ':';
            }
            result += seconds.padStart(2, '0');
            
            return result;
        }

        function timeAgo(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            
            if (seconds < 60) return 'たった今';
            
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} 分前`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} 時間前`;
            
            const days = Math.floor(hours / 24);
            if (days < 30) return `${days} 日前`;
            
            const months = Math.floor(days / 30);
            if (months < 12) return `${months} か月前`;
            
            const years = Math.floor(months / 12);
            return `${years} 年前`;
        }

        function showLoading() {
            loading.classList.remove('hidden');
        }

        function hideLoading() {
            loading.classList.add('hidden');
        }

        function showError(message) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }

        function hideError() {
            errorMessage.classList.add('hidden');
        }

        function showMessage(message, type = 'info') {
            // シンプルなメッセージ表示
            alert(message);
        }

        // グローバル関数
        window.showChannel = showChannel;

        // ローカルストレージからテーマを読み込む
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const icon = themeToggle.querySelector('i');
            icon.className = 'fas fa-sun';
        }
