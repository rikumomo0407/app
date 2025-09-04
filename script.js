

// URLパラメータからidを取得
function getAppIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function showErrorPage(message) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;">
      <h1>エラー</h1>
      <p>${message}</p>
      <a href="https://rikuto-dev.github.io/profile/">トップページへ戻る</a>
    </div>
  `;
}

fetch('https://raw.githubusercontent.com/rikuto-dev/app/main/AppData.json')
  .then(response => {
    if (!response.ok) throw new Error('データファイルの取得に失敗しました');
    return response.json();
  })
  .then(appData => {
    const urlAppId = getAppIdFromUrl();
    let appInfo = null;
    if (urlAppId) {
      appInfo = appData.apps.find(app => app.id === urlAppId);
      if (!appInfo) {
        showErrorPage('指定されたアプリIDのデータが見つかりません。');
        return;
      }
    } else {
        showErrorPage('アプリIDが指定されていません。');
        return;
    }

    const appId = appInfo.id;
    const subtitle = appInfo.subtitle;
    const title = appInfo.title;
    // サブタイトル
    if (subtitle && document.getElementById("app-subtitle")) {
      document.getElementById("app-subtitle").textContent = subtitle;
    }


    // ページタイトル（<title>タグ）と.app-title要素
    if (title) {
      document.title = title;
    }

    // link要素の自動設定
    // canonical
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.href = window.location.href;
    }
    // icon, apple-touch-iconはAPI取得後に設定

    // 必要なmetaタグを動的に追加
    function setMetaTag(name, content, property = false) {
      let meta = null;
      if (property) {
        meta = document.querySelector(`meta[property='${name}']`);
      } else {
        meta = document.querySelector(`meta[name='${name}']`);
      }
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }

    setMetaTag('description', subtitle);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', subtitle, true);
    setMetaTag('og:image', appInfo.iconUrl || 'images/KashikarichoIcon.png', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', subtitle);
    setMetaTag('twitter:image', appInfo.iconUrl);

    const apiUrl = `https://itunes.apple.com/lookup?id=${appId}&country=jp`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('iTunes APIの取得に失敗しました');
        return response.json();
      })
      .then(data => {
        if (data.results.length > 0) {
            const app = data.results[0];


      // Appアイコンをimgタグに反映
      document.querySelectorAll(".app-icon").forEach(img => {
        img.src = app.artworkUrl512;
      });

      // Appアイコンを<link rel="icon">と<link rel="apple-touch-icon">に反映
      const iconLink = document.querySelector('link[rel="icon"]');
      if (iconLink) iconLink.href = app.artworkUrl512;
      const appleIconLink = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleIconLink) {
        appleIconLink.href = app.artworkUrl512;
        appleIconLink.setAttribute('sizes', '180x180');
      }

            document.querySelectorAll(".app-title").forEach(title => {
                title.textContent = app.trackName;
            });

            // description の \n を <br> に置換
            const formattedDescription = app.description.replace(/\n/g, "<br>");
            document.getElementById("app-description").innerHTML = formattedDescription;
            
            document.getElementById("app-store-link").href = app.trackViewUrl;
        } else {
          showErrorPage('iTunes APIからアプリ情報が取得できませんでした。');
        }
      })
      .catch(error => {
        showErrorPage('アプリ情報の取得に失敗しました: ' + error.message);
      });
  })
  .catch(error => {
    showErrorPage('データの取得に失敗しました: ' + error.message);
  });
