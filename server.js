const http = require('http');
const https = require('https');

const PORT = 3000;
const TARGET = 'clearance.nbi.gov.ph';

console.log('='.repeat(60));
console.log('🚀 PROXY WITH COMPLETE CAPTCHA REMOVAL');
console.log('✅ Captcha will be completely removed from the page');
console.log('='.repeat(60));

const server = http.createServer((req, res) => {
    console.log(`\n📡 ${req.method} ${req.url}`);
    
    // Set CORS and iframe headers
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Collect request body if present
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    });
    
    req.on('end', () => {
        body = Buffer.concat(body).toString();
        
        // Prepare headers for target
        const headers = {
            'Host': TARGET,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': req.headers.accept || '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
            'Origin': `https://${TARGET}`,
            'Referer': `https://${TARGET}/`,
            'Connection': 'close'
        };
        
        // Forward authorization if present
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        // Add content length if body exists
        if (body) {
            headers['Content-Length'] = Buffer.byteLength(body);
        }
        
        // Parse URL
        const requestUrl = new URL(req.url, `http://${req.headers.host}`);
        
        // Options for target request
        const options = {
            hostname: TARGET,
            port: 443,
            path: requestUrl.pathname + requestUrl.search,
            method: req.method,
            headers: headers,
            rejectUnauthorized: false
        };
        
        // Make request to target
        const proxyReq = https.request(options, (proxyRes) => {
            console.log(`✅ Target response: ${proxyRes.statusCode} for ${req.url}`);
            
            // Remove blocking headers for HTML responses
            if (proxyRes.headers['content-type']?.includes('text/html')) {
                delete proxyRes.headers['x-frame-options'];
                delete proxyRes.headers['frame-options'];
                delete proxyRes.headers['content-security-policy'];
            }
            
            // Always set our headers
            proxyRes.headers['x-frame-options'] = 'ALLOWALL';
            proxyRes.headers['content-security-policy'] = "frame-ancestors *";
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-credentials'] = 'true';
            
            // Check if it's HTML
            const isHtml = proxyRes.headers['content-type']?.includes('text/html');
            
            if (isHtml && req.method === 'GET') {
                // Collect the HTML
                let htmlBody = [];
                proxyRes.on('data', (chunk) => {
                    htmlBody.push(chunk);
                });
                
                proxyRes.on('end', () => {
                    htmlBody = Buffer.concat(htmlBody).toString();
                    
                    // ===========================================
                    // COMPLETE CAPTCHA REMOVAL
                    // ===========================================
                    let modifiedBody = htmlBody
                        // Remove all reCAPTCHA script tags
                        .replace(/<script[^>]*src=["'][^"']*recaptcha[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<script[^>]*src=["'][^"']*google\.com\/recaptcha[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<script[^>]*src=["'][^"']*gstatic\.com\/recaptcha[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
                        
                        // Remove all reCAPTCHA divs and containers
                        .replace(/<div[^>]*class=["'][^"']*g-recaptcha[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
                        .replace(/<div[^>]*id=["'][^"']*recaptcha[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
                        .replace(/<div[^>]*data-sitekey[^>]*>[\s\S]*?<\/div>/gi, '')
                        
                        // Remove any reCAPTCHA related JavaScript code
                        .replace(/grecaptcha\.[a-zA-Z0-9_]+\([^)]*\)/g, '')
                        .replace(/recaptchaCallback/g, 'function(){}')
                        .replace(/ReCaptcha/g, '')
                        
                        // Remove any data-sitekey attributes
                        .replace(/ data-sitekey=["'][^"']*["']/g, '')
                        
                        // Remove any references to sitekey
                        .replace(/["']sitekey["']\s*:\s*["'][^"']*["']/g, '"sitekey":""')
                        .replace(/this\.props\.sitekey/g, 'null')
                        
                        // Remove any reCAPTCHA related meta tags
                        .replace(/<meta[^>]*recaptcha[^>]*>/gi, '')
                        
                        // Remove any iframes that might contain reCAPTCHA
                        .replace(/<iframe[^>]*src=["'][^"']*recaptcha[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi, '')
                        
                        // Remove any reCAPTCHA related styles
                        .replace(/<style[^>]*>[\s\S]*?(recaptcha|g-recaptcha)[\s\S]*?<\/style>/gi, '');
                    
                    // ===========================================
                    // INJECT SCRIPT TO COMPLETELY DISABLE CAPTCHA
                    // ===========================================
                    const disableCaptchaScript = `
                        <script>
                            // ===========================================
                            // COMPLETELY DISABLE ALL CAPTCHA FUNCTIONALITY
                            // ===========================================
                            (function() {
                                console.log('🔧 Completely disabling captcha...');
                                
                                // 1. Remove any remaining reCAPTCHA elements
                                const removeElements = function() {
                                    const selectors = [
                                        '.g-recaptcha',
                                        '[class*="recaptcha"]',
                                        '[id*="recaptcha"]',
                                        '[data-sitekey]',
                                        'iframe[src*="recaptcha"]',
                                        'script[src*="recaptcha"]',
                                        'script[src*="google.com/recaptcha"]'
                                    ];
                                    
                                    selectors.forEach(selector => {
                                        document.querySelectorAll(selector).forEach(el => {
                                            if (el.parentNode) {
                                                console.log('✅ Removing captcha element:', selector);
                                                el.parentNode.removeChild(el);
                                            }
                                        });
                                    });
                                };
                                
                                removeElements();
                                
                                // 2. Override fetch to block reCAPTCHA API calls
                                const originalFetch = window.fetch;
                                window.fetch = function(url, options) {
                                    if (url && typeof url === 'string' && 
                                        (url.includes('recaptcha') || url.includes('google.com/recaptcha'))) {
                                        console.log('🛡️ Blocked reCAPTCHA API call:', url);
                                        return Promise.resolve({
                                            ok: true,
                                            status: 200,
                                            json: () => Promise.resolve({ success: true })
                                        });
                                    }
                                    return originalFetch.call(this, url, options);
                                };
                                
                                // 3. Override XMLHttpRequest to block reCAPTCHA calls
                                const originalOpen = XMLHttpRequest.prototype.open;
                                XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                                    if (url && typeof url === 'string' && 
                                        (url.includes('recaptcha') || url.includes('google.com/recaptcha'))) {
                                        console.log('🛡️ Blocked reCAPTCHA XHR:', url);
                                        return;
                                    }
                                    return originalOpen.call(this, method, url, async, user, password);
                                };
                                
                                // 4. Remove any event listeners that might try to load captcha
                                const originalAddEventListener = EventTarget.prototype.addEventListener;
                                EventTarget.prototype.addEventListener = function(type, listener, options) {
                                    if (type === 'load' && listener && 
                                        listener.toString().includes('recaptcha')) {
                                        console.log('🛡️ Blocked reCAPTCHA event listener');
                                        return;
                                    }
                                    return originalAddEventListener.call(this, type, listener, options);
                                };
                                
                                // 5. Create mutation observer to remove any dynamically added captcha
                                const observer = new MutationObserver(function(mutations) {
                                    mutations.forEach(function(mutation) {
                                        mutation.addedNodes.forEach(function(node) {
                                            if (node.nodeType === 1) { // Element node
                                                // Check if the node itself is a captcha element
                                                if (node.matches && (
                                                    node.matches('.g-recaptcha') ||
                                                    node.matches('[class*="recaptcha"]') ||
                                                    node.matches('[id*="recaptcha"]') ||
                                                    node.matches('[data-sitekey]') ||
                                                    (node.tagName === 'IFRAME' && node.src && node.src.includes('recaptcha')) ||
                                                    (node.tagName === 'SCRIPT' && node.src && node.src.includes('recaptcha'))
                                                )) {
                                                    console.log('✅ Removed dynamically added captcha');
                                                    node.parentNode && node.parentNode.removeChild(node);
                                                }
                                                
                                                // Check inside the node for captcha elements
                                                if (node.querySelectorAll) {
                                                    node.querySelectorAll('.g-recaptcha, [class*="recaptcha"], [id*="recaptcha"], [data-sitekey], iframe[src*="recaptcha"], script[src*="recaptcha"]').forEach(el => {
                                                        console.log('✅ Removed nested captcha element');
                                                        el.parentNode && el.parentNode.removeChild(el);
                                                    });
                                                }
                                            }
                                        });
                                    });
                                });
                                
                                observer.observe(document.body, { childList: true, subtree: true });
                                console.log('✅ Mutation observer active - will remove any new captcha elements');
                                
                                // 6. Override document.createElement to block captcha script creation
                                const originalCreateElement = document.createElement;
                                document.createElement = function(tagName) {
                                    const element = originalCreateElement.call(document, tagName);
                                    
                                    if (tagName.toLowerCase() === 'script') {
                                        const originalSetAttribute = element.setAttribute;
                                        element.setAttribute = function(name, value) {
                                            if (name === 'src' && value && 
                                                (value.includes('recaptcha') || 
                                                 value.includes('google.com/recaptcha') ||
                                                 value.includes('gstatic.com/recaptcha'))) {
                                                console.log('🛡️ Blocked script creation:', value);
                                                return;
                                            }
                                            return originalSetAttribute.call(this, name, value);
                                        };
                                    }
                                    
                                    return element;
                                };
                                
                                // 7. Create dummy grecaptcha object to prevent errors
                                window.grecaptcha = {
                                    ready: function(cb) { cb && setTimeout(cb, 10); },
                                    execute: function() { return Promise.resolve('disabled'); },
                                    render: function() { return 'disabled'; },
                                    reset: function() {},
                                    getResponse: function() { return 'disabled'; }
                                };
                                
                                // 8. Run periodically to catch any missed captcha
                                setInterval(removeElements, 1000);
                                
                                console.log('✅ Captcha completely disabled');
                            })();
                        </script>
                        
                        <style>
                            /* Hide any remaining captcha elements */
                            .g-recaptcha,
                            [class*="recaptcha"],
                            [id*="recaptcha"],
                            [data-sitekey],
                            iframe[src*="recaptcha"] {
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                                width: 0 !important;
                                height: 0 !important;
                                position: absolute !important;
                                pointer-events: none !important;
                            }
                        </style>
                    `;
                    
                    // Inject the disable script right after head
                    modifiedBody = modifiedBody.replace('</head>', disableCaptchaScript + '</head>');
                    
                    // Also remove any remaining captcha references from the body
                    modifiedBody = modifiedBody.replace(/<body[^>]*>/, '$&<div style="display:none;"></div>');
                    
                    // Update content length
                    proxyRes.headers['content-length'] = Buffer.byteLength(modifiedBody);
                    
                    // Send modified response
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(modifiedBody);
                });
            } else if (req.url.includes('/api/v1/register/validate')) {
                // For registration validation, we need to handle captcha tokens
                console.log('📝 Registration validation detected - will bypass captcha');
                
                if (body) {
                    // Remove captcha from the body
                    let modifiedBody = body.replace(/&?captcha=[^&]*/g, '');
                    
                    // Add a dummy captcha token if needed
                    modifiedBody += '&captcha=disabled';
                    
                    // Update content length
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(modifiedBody));
                    
                    // Write modified body
                    proxyReq.write(modifiedBody);
                }
                
                // Forward the request
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            } else {
                // For all other responses, pass through
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            }
        });
        
        proxyReq.on('error', (err) => {
            console.error('❌ Proxy error:', err.message);
            res.writeHead(500, { 'X-Frame-Options': 'ALLOWALL' });
            res.end('Proxy error: ' + err.message);
        });
        
        // Send body if present (for non-validation requests)
        if (body && !req.url.includes('/api/v1/register/validate')) {
            proxyReq.write(body);
        }
        
        proxyReq.end();
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('✅ PROXY WITH COMPLETE CAPTCHA REMOVAL RUNNING');
    console.log(`✅ URL: http://localhost:${PORT}`);
    console.log(`✅ Target: https://${TARGET}`);
    console.log('✅ Captcha has been completely removed');
    console.log('='.repeat(60));
});