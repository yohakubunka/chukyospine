const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { createServer } = require('http');
const { Server } = require('socket.io');
const sass = require('sass');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DEFAULT_LANG = 'zh';

// EJSの設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/pages'));

// 静的ファイルの配信
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// JSONデータを読み込む関数
function loadSiteData() {
  try {
    let data = fs.readFileSync(path.join(__dirname, 'data/site.json'), 'utf8');
    // エディタがBOM付きで保存しても読めるように先頭のBOMを除去
    data = data.replace(/^\uFEFF/, '');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading site data:', error);
    return {};
  }
}

// SCSSをCSSにコンパイルする関数
function compileSass() {
  try {
    const result = sass.compile(path.join(__dirname, 'src/assets/scss/style.scss'));
    const outputPath = path.join(__dirname, 'public/css');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(path.join(outputPath, 'style.css'), result.css);
    console.log('SCSS compiled successfully');
    return true;
  } catch (error) {
    console.error('SCSS compilation error:', error);
    return false;
  }
}

// JavaScriptファイルをコピーする関数
function copyJavaScript() {
  try {
    const srcPath = path.join(__dirname, 'src/assets/js');
    const destPath = path.join(__dirname, 'public/js');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    // JSファイルをコピー
    const files = fs.readdirSync(srcPath);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        fs.copyFileSync(
          path.join(srcPath, file),
          path.join(destPath, file)
        );
      }
    });

    console.log('JavaScript files copied successfully');
    return true;
  } catch (error) {
    console.error('JavaScript copy error:', error);
    return false;
  }
}

// 初回コンパイル
compileSass();
copyJavaScript();

// ホットリロード用のスクリプトを挿入
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('</body>')) {
      const hotReloadScript = `
        <script src="/socket.io/socket.io.js"></script>
        <script>
          console.log('🔥 Hot reload script loaded');
          const socket = io();
          
          socket.on('connect', () => {
            console.log('✅ Socket.IO connected');
          });
          
          socket.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
          });
          
          socket.on('page-reload', () => {
            console.log('🔄 Page reload event received');
            window.location.reload();
          });
          
          socket.on('css-reload', () => {
            console.log('🎨 CSS reload event received');
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            console.log('Found', links.length, 'stylesheets to reload');
            links.forEach(link => {
              const newLink = link.cloneNode();
              newLink.href = link.href.split('?')[0] + '?t=' + Date.now();
              link.parentNode.insertBefore(newLink, link.nextSibling);
              setTimeout(() => link.remove(), 100);
            });
          });
          
          socket.on('js-reload', () => {
            console.log('📝 JavaScript reload event received');
            window.location.reload();
          });
          
          socket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error);
          });
        </script>
      `;
      body = body.replace('</body>', hotReloadScript + '</body>');
    }
    originalSend.call(this, body);
  };
  next();
});

// サイト共通データを読み込む（例: URLやテキスト）
const siteData = loadSiteData();

// 言語ルート
const langs = ['ja', 'en', 'zh'];
langs.forEach(lang => {
  const route = lang === DEFAULT_LANG ? '/' : `/${lang}`;

  // トップページ
  app.get(route, (req, res) => {
    res.render('index', { lang, site: siteData }); // サーバ起動時のsiteDataを使用
  });

  // ページ用ルート
  app.get(`${route}/:page`, (req, res) => {
    const pageName = req.params.page;

    // 既存のsiteDataを再利用（loadSiteData()は不要）
    const pagePath = path.join(__dirname, 'src/pages', `${pageName}.ejs`);
    if (fs.existsSync(pagePath)) {
      res.render(pageName, { lang, site: siteData });
    } else {
      res.status(404).send('Page not found');
    }
  });
});


// Socket.IOの設定
io.on('connection', (socket) => {
  console.log('Client connected for hot reload');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ファイル監視とホットリロード
const watcher = chokidar.watch([
  'src/**/*',
  'data/**/*'
], {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`\n🔄 File changed: ${filePath}`);

  // SCSSファイルが変更された場合
  if (filePath.includes('.scss')) {
    console.log('📝 SCSS file detected - Compiling CSS...');
    if (compileSass()) {
      console.log('✅ CSS compiled successfully - Reloading styles');
      io.emit('css-reload');
    }
  }
  // JavaScriptファイルが変更された場合
  else if (filePath.includes('src/assets/js') && filePath.endsWith('.js')) {
    console.log('📝 JavaScript file detected - Copying files...');
    if (copyJavaScript()) {
      console.log('✅ JavaScript copied successfully - Reloading page');
      io.emit('js-reload');
    }
  }
  // EJSファイルやJSONファイルが変更された場合
  else if (filePath.includes('.ejs') || filePath.includes('.json')) {
    console.log('📝 EJS/JSON file detected - Reloading page...');
    console.log('✅ Page reload triggered');
    io.emit('page-reload');
  }
  else {
    console.log('📝 Other file detected - Reloading page...');
    io.emit('page-reload');
  }
});

server.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
  console.log('Hot reload enabled');
});

