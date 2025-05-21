<script>
        const API_KEY = 'AIzaSyDZAgqPB-iolAh5N3jVgXBXrrPXWKWnmZA'; // 提供されたAPIキー
        let nextPageToken = ''; // 次のページトークンを保持
        let displayedVideos = new Set(); // 表示された動画のIDを保持

        function searchVideo() {
            const input = document.getElementById('searchInput').value;
            const videoPlayer = document.getElementById('videoPlayer');
            const resultsDiv = document.getElementById('results');
            const videoDetailsDiv = document.getElementById('videoDetails');
            resultsDiv.innerHTML = ''; // 結果をクリア
            videoDetailsDiv.innerHTML = ''; // 動画詳細をクリア

            // 現在の動画を消す
            videoPlayer.style.display = 'none'; // 動画プレーヤーを非表示にする

            const videoId = extractVideoId(input);
            if (videoId) {
                fetchVideoDetails(videoId);
            } else {
                fetchVideos(input);
            }
        }

        function extractVideoId(input) {
            const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = input.match(urlPattern);
            return match ? match[1] : null;
        }

        function fetchVideos(query) {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20&type=video${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    nextPageToken = data.nextPageToken; // 次のページトークンを保存
                    displayResults(data.items);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }

        function displayResults(videos) {
            const resultsDiv = document.getElementById('results');
            videos.forEach(video => {
                const videoId = video.id.videoId;
                if (!displayedVideos.has(videoId)) { // 重複をチェック
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = `
                        <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                        <p>${video.snippet.title}</p>
                    `;
                    resultDiv.onclick = () => {
                        const videoPlayer = document.getElementById('videoPlayer');
                        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`; // YouTubeの埋め込みURLを設定
                        videoPlayer.style.display = 'block'; // 動画プレーヤーを表示
                        fetchVideoDetails(videoId);
                        // スクロールして動画の位置に移動
                        videoPlayer.scrollIntoView({ behavior: 'smooth' });
                    };
                    resultsDiv.appendChild(resultDiv);
                    displayedVideos.add(videoId); // 表示された動画IDを追加
                }
            });

            // 「さらに表示」ボタンを追加
            const loadMoreButton = document.createElement('button');
            loadMoreButton.className = 'load-more';
            loadMoreButton.innerText = 'さらに表示';
            loadMoreButton.onclick = () => fetchVideos(document.getElementById('searchInput').value);
            resultsDiv.appendChild(loadMoreButton);
        }

        function fetchVideoDetails(videoId) {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${API_KEY}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const videoDetails = data.items[0];
                    displayVideoDetails(videoDetails);
                })
                .catch(error => {
                    console.error('Error fetching video details:', error);
                });
        }

        function displayVideoDetails(videoDetails) {
            const videoDetailsDiv = document.getElementById('videoDetails');
            const title = videoDetails.snippet.title;
            const views = videoDetails.statistics.viewCount || 0; // 視聴回数
            const likes = videoDetails.statistics.likeCount || 0; // 高評価数
            const dislikes = videoDetails.statistics.dislikeCount || 0; // 低評価数

            videoDetailsDiv.innerHTML = `
                <h2>${title}</h2>
                <p>視聴回数: ${views}</p>
                <p>高評価数: ${likes}</p>
                <p>低評価数: ${dislikes}</p>
                <div class="comments">
                    <h3>上位のコメント</h3>
                    <p>コメント機能は未実装です。</p>
                </div>
            `;
        }
    </script>
</body>
