

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
      <a href="https://rikuto-dev.netlify.app/">トップページへ戻る</a>
    </div>
  `;
}

fetch('https://raw.githubusercontent.com/rikuto-dev/app/main/AppData.json')
  .then(response => {
    if (!response.ok) throw new Error('データファイルの取得に失敗しました');
    return response.json();
  })
  .then(appData => {
    // Netlifyのサブドメイン部分（***.netlify.appの***）を取得
    const host = window.location.hostname;
    let subdomain = null;
    const netlifyMatch = host.match(/^([^.]+)\.netlify\.app$/);
    if (netlifyMatch) {
      subdomain = netlifyMatch[1];
    }
    let appInfo = null;
    if (subdomain) {
      appInfo = appData.apps.find(app => app.name === subdomain);
      if (!appInfo) {
        showErrorPage('指定されたアプリ名のデータが見つかりません。');
        return;
      }
    } else {
      showErrorPage('アプリ名が取得できません。');
      return;
    }

    const appName = appInfo.name;
    const subtitle = appInfo.subtitle;
    const title = appInfo.title;
    const description = appInfo.description || "";
    const iconUrl = `https://rikuto-dev.github.io/app/${appName}/icon.png`;

    // ToS, PP, QAのリンクを https://{AppDataのname}.netlify.app/{AppDataのid}/ToS の形式に変更
    const appId = appInfo.id;
    const linkClassMap = [
      { className: "tos-link", path: "ToS" },
      { className: "pp-link", path: "PP" },
      { className: "qa-link", path: "QA" }
    ];
    linkClassMap.forEach(link => {
      document.querySelectorAll(`.${link.className}`).forEach(el => {
        el.href = `https://${appName}.netlify.app/${appId}/${link.path}`;
      });
    });

    // サブタイトル
    if (subtitle && document.getElementById("app-subtitle")) {
      document.getElementById("app-subtitle").textContent = subtitle;
    }

    // ページタイトル（<title>タグ）と.app-title要素
    if (title) {
      document.title = title;
    }
    document.querySelectorAll(".app-title").forEach(titleEl => {
      titleEl.textContent = title;
    });

    // Appアイコンをimgタグに反映
    document.querySelectorAll(".app-icon").forEach(img => {
      img.src = iconUrl;
    });

    // Appアイコンを<link rel="icon">と<link rel="apple-touch-icon">に反映
    const iconLink = document.querySelector('link[rel="icon"]');
    if (iconLink) iconLink.href = iconUrl;
    const appleIconLink = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleIconLink) {
      appleIconLink.href = iconUrl;
      appleIconLink.setAttribute('sizes', '180x180');
    }

    // description の \n を <br> に置換
    const formattedDescription = description.replace(/\n/g, "<br>");
    document.getElementById("app-description").innerHTML = formattedDescription;

    // App Storeリンク（AppData.jsonにappStoreUrlがあれば使う。なければ#）
    const appStoreUrl = appInfo.appStoreUrl || "#";
    document.getElementById("app-store-link").href = appStoreUrl;

    // link要素の自動設定
    // canonical
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.href = window.location.href;
    }

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
    setMetaTag('og:image', iconUrl, true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', subtitle);
    setMetaTag('twitter:image', iconUrl);
  })
  .catch(error => {
    showErrorPage('データの取得に失敗しました: ' + error.message);
  });
