const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const sass = require('sass');

// ビルド設定
const BUILD_DIR = 'dist';
const SRC_DIR = 'src';
const DATA_DIR = 'data';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ディレクトリをクリーンアップ
async function cleanBuildDir() {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fs.remove(BUILD_DIR);
      await fs.ensureDir(BUILD_DIR);
      console.log('✓ Build directory cleaned');
      return;
    } catch (error) {
      const isBusy = error && (error.code === 'EBUSY' || error.code === 'EPERM');
      if (isBusy && attempt < maxRetries) {
        const wait = 200 * attempt;
        console.warn(`! Build dir locked (attempt ${attempt}/${maxRetries}), retrying in ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      if (isBusy) {
        console.warn('! Build dir still locked; attempting to empty contents instead of full remove...');
        try {
          await fs.ensureDir(BUILD_DIR);
          await fs.emptyDir(BUILD_DIR);
          console.log('✓ Build directory emptied');
          return;
        } catch (emptyErr) {
          console.error('Error emptying build directory:', emptyErr);
        }
      }
      console.error('Error cleaning build directory:', error);
      process.exit(1);
    }
  }
}

// JSONデータを読み込み
function loadSiteData() {
  try {
    let data = fs.readFileSync(path.join(DATA_DIR, 'site.json'), 'utf8');
    // BOM除去（データがUTF-8 BOMで保存する場合に備える）
    data = data.replace(/^\uFEFF/, '');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading site data:', error);
    return {};
  }
}

// EJSファイルをHTMLにコンパイル（多言語で複数生成）
async function compileEJS() {
  try {
    const siteData = loadSiteData();
    const languages = [
      { code: 'zh', suffix: '' },   // default
      { code: 'ja', suffix: '-ja' },
      { code: 'en', suffix: '-en' },
    ];
    const pagesDir = path.join(SRC_DIR, 'pages');
    const pages = await fs.readdir(pagesDir);
    
    for (const page of pages) {
      if (path.extname(page) === '.ejs') {
        const pagePath = path.join(pagesDir, page);
        const baseName = path.basename(page, '.ejs');

        for (const { code, suffix } of languages) {
          const outputName = `${baseName}${suffix}.html`;
          const outputPath = path.join(BUILD_DIR, outputName);

          // EJSファイルをレンダリング
          const html = await ejs.renderFile(pagePath, { site: siteData, lang: code }, {
            views: [path.join(SRC_DIR, 'components'), pagesDir]
          });

          await fs.writeFile(outputPath, html);
          console.log(`✓ Compiled ${page} (${code}) -> ${outputName}`);
        }
      }
    }
  } catch (error) {
    console.error('Error compiling EJS:', error);
    process.exit(1);
  }
}

// SCSSをCSSにコンパイル
async function compileSCSS() {
  try {
    const scssFile = path.join(SRC_DIR, 'assets/scss/style.scss');
    const result = sass.compile(scssFile);
    
    const cssDir = path.join(BUILD_DIR, 'css');
    await fs.ensureDir(cssDir);
    await fs.writeFile(path.join(cssDir, 'style.css'), result.css);
    
    console.log('✓ SCSS compiled to CSS');
  } catch (error) {
    console.error('Error compiling SCSS:', error);
    process.exit(1);
  }
}

// JavaScriptファイルをコピー
async function copyJavaScript() {
  try {
    const jsDir = path.join(SRC_DIR, 'assets/js');
    const outputJsDir = path.join(BUILD_DIR, 'js');
    
    if (await fs.pathExists(jsDir)) {
      await fs.copy(jsDir, outputJsDir);
      console.log('✓ JavaScript files copied');
    }
  } catch (error) {
    console.error('Error copying JavaScript:', error);
    process.exit(1);
  }
}

// 画像ファイルをコピー
async function copyImages() {
  try {
    const imagesDir = path.join(SRC_DIR, 'assets/images');
    const outputImagesDir = path.join(BUILD_DIR, 'images');
    
    if (await fs.pathExists(imagesDir)) {
      await fs.copy(imagesDir, outputImagesDir);
      console.log('✓ Images copied');
    } else {
      console.log('! No images directory found, skipping');
    }
  } catch (error) {
    console.error('Error copying images:', error);
    process.exit(1);
  }
}

// その他静的ファイルをコピー（favicon、robots.txtなど）
async function copyStaticFiles() {
  try {
    const staticFiles = ['favicon.ico', 'robots.txt', 'sitemap.xml'];
    
    for (const file of staticFiles) {
      const srcFile = path.join('.', file);
      const destFile = path.join(BUILD_DIR, file);
      
      if (await fs.pathExists(srcFile)) {
        await fs.copy(srcFile, destFile);
        console.log(`✓ Copied ${file}`);
      }
    }
  } catch (error) {
    console.error('Error copying static files:', error);
  }
}

// ビルド情報を書き出し
function outputBuildInfo() {
  const buildInfo = {
    buildDate: new Date().toISOString(),
    version: require('./package.json').version,
    nodeVersion: process.version
  };
  
  fs.writeFileSync(
    path.join(BUILD_DIR, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  console.log('✓ Build info generated');
}

// メインのビルド関数
async function build() {
  console.log('🚀 Starting build process...\n');
  
  try {
    await cleanBuildDir();
    await compileEJS();
    await compileSCSS();
    await copyJavaScript();
    await copyImages();
    await copyStaticFiles();
    outputBuildInfo();
    
    console.log('\n🎉 Build completed successfully!');
    console.log(`📦 Output directory: ${BUILD_DIR}`);
    console.log('💡 You can now upload the contents of the dist folder to your server');
    
  } catch (error) {
    console.error('\n❁ Build failed:', error);
    process.exit(1);
  }
}

// ビルドを実行
if (require.main === module) {
  build();
}

module.exports = { build };
