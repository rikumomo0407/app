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

    const appId = appInfo.id;
    const appName = appInfo.name;
    const subtitle = appInfo.subtitle;
    const title = appInfo.title;
    const description = appInfo.description || "";
    const iconUrl = `https://rikuto-dev.github.io/app/${appId}/icon.png`;

    // ToS, PP, QAのリンクを https://{AppDataのname}.netlify.app/{AppDataのid}/ToS の形式に変更
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

    // App StoreリンクをAppDataのidから自動生成し、app-store-linkに設定
    const appStoreUrl = `https://apps.apple.com/jp/app/id${appId}`;
    const appStoreLinkEl = document.getElementById("app-store-link");
    if (appStoreLinkEl) {
      appStoreLinkEl.href = appStoreUrl;
      appStoreLinkEl.target = "_blank";
    }


    // GoogleフォームのリンクをAppDataのtitleを含む形で生成し、お問い合わせリンクに設定
    const googleFormBase = "https://docs.google.com/forms/d/e/1FAIpQLSewR0cNPgqu8NdOb4PJG2WGauSldNgA76yR6UaNc0p6CoS4Sg/viewform?usp=pp_url";
    const googleFormUrl = `${googleFormBase}&entry.1818123002=%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E3%81%94%E6%84%8F%E8%A6%8B%E3%83%BB%E3%81%94%E8%B3%AA%E5%95%8F&entry.1207451523=${encodeURIComponent(title)}`;
      // お問い合わせリンク（a.contact-linkタグ）をすべて書き換え
      document.querySelectorAll('a.contact-link').forEach(el => {
        el.href = googleFormUrl;
        el.target = "_blank";
      });

    // link要素の自動設定
    // canonical
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.href = window.location.href;
    }

    // フッター
    const copyrightEl = document.getElementById("footer-copyright");
    if (copyrightEl) {
      copyrightEl.innerHTML = `© Copyright 2025 ${appName} All rights reserved.`;
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
