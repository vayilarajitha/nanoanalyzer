package io.nanoanalyzer.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private LinearLayout layoutError;
    private LinearLayout layoutLoading;
    private Button btnRetry;

    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;

    private long backPressedTime = 0;
    private boolean isInitialPageLoaded = false;
    private String targetUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        targetUrl = getString(R.string.web_url);

        initViews();
        setupFileChooser();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            loadWebsite(targetUrl);
        }
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        progressBar = findViewById(R.id.progressBar);
        layoutError = findViewById(R.id.layoutError);
        layoutLoading = findViewById(R.id.layoutLoading);
        btnRetry = findViewById(R.id.btnRetry);

        swipeRefreshLayout.setColorSchemeResources(
                R.color.primary,
                R.color.accent_teal,
                R.color.accent_emerald
        );
        swipeRefreshLayout.setProgressBackgroundColorSchemeResource(R.color.surface_dark);

        btnRetry.setOnClickListener(v -> retryLoading());
    }

    private void setupFileChooser() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (fileUploadCallback == null) {
                        return;
                    }

                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Intent data = result.getData();
                        if (data.getClipData() != null) {
                            int count = data.getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = data.getClipData().getItemAt(i).getUri();
                            }
                        } else if (data.getData() != null) {
                            results = new Uri[]{data.getData()};
                        }
                    }

                    fileUploadCallback.onReceiveValue(results);
                    fileUploadCallback = null;
                }
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // 1. JavaScript & Storage
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // 2. Responsive Viewport & Device Scaling
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        settings.setDefaultTextEncodingName("UTF-8");

        // 3. Scrollbar & Viewport presentation
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(true);

        // 4. Media, File Access & Cache
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        // 5. Cookies & PHP Session Configuration
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // 6. WebView Clients
        webView.setWebViewClient(new CustomWebViewClient());
        webView.setWebChromeClient(new CustomWebChromeClient());
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                layoutError.setVisibility(View.GONE);
                webView.reload();
            } else {
                swipeRefreshLayout.setRefreshing(false);
                showErrorLayout();
            }
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (layoutError.getVisibility() == View.VISIBLE) {
                    if (webView.canGoBack()) {
                        layoutError.setVisibility(View.GONE);
                        webView.goBack();
                    } else {
                        finish();
                    }
                    return;
                }

                // Check if mobile sidebar drawer is open in WebView; if so, close it first
                webView.evaluateJavascript(
                        "(function() {" +
                        "  var sb = document.querySelector('#sidebar-wrapper.android-drawer-open');" +
                        "  var bd = document.getElementById('android-sidebar-backdrop');" +
                        "  if (sb) {" +
                        "    sb.classList.remove('android-drawer-open');" +
                        "    if (bd) { bd.style.opacity = '0'; setTimeout(function(){ bd.style.display = 'none'; }, 300); }" +
                        "    return true;" +
                        "  }" +
                        "  return false;" +
                        "})();",
                        value -> {
                            if ("true".equals(value)) {
                                // Drawer was closed by back press
                                return;
                            }

                            if (webView.canGoBack()) {
                                webView.goBack();
                            } else {
                                if (backPressedTime + 2000 > System.currentTimeMillis()) {
                                    finish();
                                } else {
                                    Toast.makeText(MainActivity.this, R.string.exit_prompt, Toast.LENGTH_SHORT).show();
                                    backPressedTime = System.currentTimeMillis();
                                }
                            }
                        }
                );
            }
        });
    }

    private void loadWebsite(String url) {
        if (isNetworkAvailable()) {
            layoutError.setVisibility(View.GONE);
            webView.loadUrl(url);
        } else {
            showErrorLayout();
        }
    }

    private void retryLoading() {
        layoutError.setVisibility(View.GONE);
        layoutLoading.setVisibility(View.VISIBLE);

        String currentUrl = webView.getUrl();
        if (currentUrl != null && !currentUrl.isEmpty() && !currentUrl.equals("about:blank")) {
            webView.reload();
        } else {
            webView.loadUrl(targetUrl);
        }
    }

    private void showErrorLayout() {
        layoutLoading.setVisibility(View.GONE);
        progressBar.setVisibility(View.GONE);
        swipeRefreshLayout.setRefreshing(false);
        layoutError.setVisibility(View.VISIBLE);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Network network = cm.getActiveNetwork();
            if (network == null) return false;
            NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
            return capabilities != null && (
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
            );
        } else {
            android.net.NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        }
    }

    private void applyMobileResponsiveFixes(WebView view) {
        String js = "(function() {" +
                "  var meta = document.querySelector('meta[name=\"viewport\"]');" +
                "  if (!meta) {" +
                "    meta = document.createElement('meta');" +
                "    meta.name = 'viewport';" +
                "    document.head.appendChild(meta);" +
                "  }" +
                "  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';" +
                "  if (!document.getElementById('android-responsive-viewport-fixes')) {" +
                "    var style = document.createElement('style');" +
                "    style.id = 'android-responsive-viewport-fixes';" +
                "    style.innerHTML = `" +
                "      html, body {" +
                "        width: 100% !important;" +
                "        max-width: 100vw !important;" +
                "        margin: 0 !important;" +
                "        padding: 0 !important;" +
                "        overflow-x: hidden !important;" +
                "        box-sizing: border-box !important;" +
                "      }" +
                "      *, *::before, *::after {" +
                "        box-sizing: border-box !important;" +
                "      }" +
                "      #wrapper {" +
                "        display: flex !important;" +
                "        flex-direction: column !important;" +
                "        width: 100% !important;" +
                "        max-width: 100vw !important;" +
                "        overflow-x: hidden !important;" +
                "        min-height: 100vh !important;" +
                "      }" +
                "      @media screen and (max-width: 991.98px), screen and (orientation: portrait) {" +
                "        #sidebar-wrapper {" +
                "          position: fixed !important;" +
                "          top: 0 !important;" +
                "          left: 0 !important;" +
                "          bottom: 0 !important;" +
                "          width: 275px !important;" +
                "          max-width: 85vw !important;" +
                "          z-index: 1050 !important;" +
                "          transform: translateX(-100%) !important;" +
                "          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;" +
                "          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.6) !important;" +
                "          overflow-y: auto !important;" +
                "          background: rgba(11, 15, 25, 0.98) !important;" +
                "          margin-left: 0 !important;" +
                "        }" +
                "        #sidebar-wrapper.android-drawer-open {" +
                "          transform: translateX(0) !important;" +
                "        }" +
                "        #page-content-wrapper {" +
                "          margin-left: 0 !important;" +
                "          width: 100% !important;" +
                "          max-width: 100vw !important;" +
                "          min-width: 0 !important;" +
                "          flex: 1 !important;" +
                "          overflow-x: hidden !important;" +
                "        }" +
                "        .top-navbar {" +
                "          padding: 0.5rem 1rem !important;" +
                "          width: 100% !important;" +
                "          max-width: 100vw !important;" +
                "          box-sizing: border-box !important;" +
                "        }" +
                "        .container, .container-fluid {" +
                "          width: 100% !important;" +
                "          max-width: 100vw !important;" +
                "          padding-left: 1rem !important;" +
                "          padding-right: 1rem !important;" +
                "          box-sizing: border-box !important;" +
                "        }" +
                "        .row {" +
                "          margin-left: -0.5rem !important;" +
                "          margin-right: -0.5rem !important;" +
                "        }" +
                "        .row > [class*='col-'] {" +
                "          padding-left: 0.5rem !important;" +
                "          padding-right: 0.5rem !important;" +
                "          max-width: 100% !important;" +
                "        }" +
                "        .col-md-6, .col-lg-4, .col-lg-3, .col-lg-8, .col-lg-6, .col-xl-3, .col-xl-4, .col-xl-6, .col-xl-8 {" +
                "          width: 100% !important;" +
                "          flex: 0 0 100% !important;" +
                "        }" +
                "        .glass-panel, .glass-card, .card {" +
                "          width: 100% !important;" +
                "          max-width: 100% !important;" +
                "          box-sizing: border-box !important;" +
                "          margin-bottom: 1rem !important;" +
                "        }" +
                "        .table-responsive {" +
                "          width: 100% !important;" +
                "          max-width: 100% !important;" +
                "          overflow-x: auto !important;" +
                "          -webkit-overflow-scrolling: touch !important;" +
                "          display: block !important;" +
                "        }" +
                "        canvas, .chart-container {" +
                "          max-width: 100% !important;" +
                "          height: auto !important;" +
                "        }" +
                "        #chatbot-modal {" +
                "          width: calc(100vw - 24px) !important;" +
                "          max-width: calc(100vw - 24px) !important;" +
                "          right: 12px !important;" +
                "          left: 12px !important;" +
                "          bottom: 80px !important;" +
                "        }" +
                "        #chatbot-floating-wrapper {" +
                "          bottom: 20px !important;" +
                "          right: 20px !important;" +
                "        }" +
                "      }" +
                "    `;" +
                "    document.head.appendChild(style);" +
                "  }" +
                "  var toggleBtn = document.getElementById('sidebar-toggle-btn');" +
                "  var sidebar = document.getElementById('sidebar-wrapper');" +
                "  if (toggleBtn && sidebar && !toggleBtn.dataset.androidDrawerHooked) {" +
                "    toggleBtn.dataset.androidDrawerHooked = 'true';" +
                "    var backdrop = document.getElementById('android-sidebar-backdrop');" +
                "    if (!backdrop) {" +
                "      backdrop = document.createElement('div');" +
                "      backdrop.id = 'android-sidebar-backdrop';" +
                "      backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1040;display:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:opacity 0.3s;opacity:0;';" +
                "      document.body.appendChild(backdrop);" +
                "      backdrop.addEventListener('click', function() {" +
                "        sidebar.classList.remove('android-drawer-open');" +
                "        backdrop.style.opacity = '0';" +
                "        setTimeout(function() { backdrop.style.display = 'none'; }, 300);" +
                "      });" +
                "    }" +
                "    toggleBtn.addEventListener('click', function(e) {" +
                "      e.preventDefault();" +
                "      e.stopPropagation();" +
                "      var isOpen = sidebar.classList.toggle('android-drawer-open');" +
                "      if (isOpen) {" +
                "        backdrop.style.display = 'block';" +
                "        setTimeout(function() { backdrop.style.opacity = '1'; }, 10);" +
                "      } else {" +
                "        backdrop.style.opacity = '0';" +
                "        setTimeout(function() { backdrop.style.display = 'none'; }, 300);" +
                "      }" +
                "    });" +
                "    var navLinks = sidebar.querySelectorAll('.nav-link');" +
                "    navLinks.forEach(function(link) {" +
                "      link.addEventListener('click', function() {" +
                "        sidebar.classList.remove('android-drawer-open');" +
                "        if (backdrop) {" +
                "          backdrop.style.opacity = '0';" +
                "          setTimeout(function() { backdrop.style.display = 'none'; }, 300);" +
                "        }" +
                "      });" +
                "    });" +
                "  }" +
                "})();";

        view.evaluateJavascript(js, null);
    }

    private class CustomWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String scheme = uri.getScheme();

            if (scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                return false; // Load inside WebView
            }

            // External schemes (mailto, tel, etc.)
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                startActivity(intent);
                return true;
            } catch (ActivityNotFoundException e) {
                return true;
            }
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            progressBar.setVisibility(View.VISIBLE);
            progressBar.setProgress(0);
            applyMobileResponsiveFixes(view);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            progressBar.setVisibility(View.GONE);
            swipeRefreshLayout.setRefreshing(false);

            applyMobileResponsiveFixes(view);

            if (!isInitialPageLoaded) {
                isInitialPageLoaded = true;
                layoutLoading.setVisibility(View.GONE);
            }

            // Sync cookies to persist session across restarts
            CookieManager.getInstance().flush();
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame()) {
                showErrorLayout();
            }
        }
    }

    private class CustomWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            super.onProgressChanged(view, newProgress);
            progressBar.setProgress(newProgress);

            if (newProgress > 30) {
                applyMobileResponsiveFixes(view);
            }

            if (newProgress >= 100) {
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            } else {
                progressBar.setVisibility(View.VISIBLE);
            }
        }

        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                         FileChooserParams fileChooserParams) {
            if (fileUploadCallback != null) {
                fileUploadCallback.onReceiveValue(null);
                fileUploadCallback = null;
            }

            fileUploadCallback = filePathCallback;

            Intent intent = fileChooserParams.createIntent();
            try {
                fileChooserLauncher.launch(intent);
            } catch (ActivityNotFoundException e) {
                Intent fallback = new Intent(Intent.ACTION_GET_CONTENT);
                fallback.addCategory(Intent.CATEGORY_OPENABLE);
                fallback.setType("*/*");
                try {
                    fileChooserLauncher.launch(Intent.createChooser(fallback, getString(R.string.file_chooser_title)));
                } catch (Exception ex) {
                    fileUploadCallback.onReceiveValue(null);
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
            return true;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.clearHistory();
            webView.destroy();
        }
        super.onDestroy();
    }
}
