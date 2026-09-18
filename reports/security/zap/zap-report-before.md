# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 4 |
| Low | 2 |
| Informational | 4 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 8    |
| Low | Exceeded Low |  | Percentage of network failures | 22 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of responses with status code 2xx | 96 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of responses with status code 4xx | 3 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/css | 14 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/html | 71 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/javascript | 14 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://host.docker.internal:3101 | Count of total endpoints | 7    |
| Info | Informational | http://host.docker.internal:3101 | Percentage of slow responses | 1 % |
| Info | Informational | https://host.docker.internal:3101 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://host.docker.internal:3101 | Count of total endpoints | 1    |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Absence of Anti-CSRF Tokens | Medium | Systemic |
| CORS Misconfiguration | Medium | Systemic |
| Cross-Domain Misconfiguration | Medium | Systemic |
| HTTP Only Site | Medium | 1 |
| Cross-Origin-Embedder-Policy Header Missing or Invalid | Low | Systemic |
| Permissions Policy Header Not Set | Low | Systemic |
| Authentication Request Identified | Informational | 2 |
| Information Disclosure - Sensitive Information in URL | Informational | 4 |
| Modern Web Application | Informational | Systemic |
| Storable but Non-Cacheable Content | Informational | Systemic |




## Alert Detail



### [ Absence of Anti-CSRF Tokens ](https://www.zaproxy.org/docs/alerts/10202/)



##### Medium (Low)

### Description

No Anti-CSRF tokens were found in a HTML submission form.
A cross-site request forgery is an attack that involves forcing a victim to send an HTTP request to a target destination without their knowledge or intent in order to perform an action as the victim. The underlying cause is application functionality using predictable URL/form actions in a repeatable way. The nature of the attack is that CSRF exploits the trust that a web site has for a user. By contrast, cross-site scripting (XSS) exploits the trust that a user has for a web site. Like XSS, CSRF attacks are not necessarily cross-site, but they can be. Cross-site request forgery is also known as CSRF, XSRF, one-click attack, session riding, confused deputy, and sea surf.

CSRF attacks are effective in a number of situations, including:
    * The victim has an active session on the target site.
    * The victim is authenticated via HTTP auth on the target site.
    * The victim is on the same local network as the target site.

CSRF has primarily been used to perform an action against a target site using the victim's privileges, but recent techniques have been discovered to disclose information by gaining access to the response. The risk of information disclosure is dramatically increased when the target site is vulnerable to XSS, because XSS can be used as a platform for CSRF, allowing the attack to operate within the bounds of the same-origin policy.

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="dialog-form" method="dialog" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 2: "" ].`
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="dialog-form" method="dialog" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 2: "" ].`
* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="dialog-form" method="dialog" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 2: "" ].`
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="dialog-form" method="dialog" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 2: "" ].`
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="dialog-form" method="dialog" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 2: "" ].`

Instances: Systemic


### Solution

Phase: Architecture and Design
Use a vetted library or framework that does not allow this weakness to occur or provides constructs that make this weakness easier to avoid.
For example, use anti-CSRF packages such as the OWASP CSRFGuard.

Phase: Implementation
Ensure that your application is free of cross-site scripting issues, because most CSRF defenses can be bypassed using attacker-controlled script.

Phase: Architecture and Design
Generate a unique nonce for each form, place the nonce into the form, and verify the nonce upon receipt of the form. Be sure that the nonce is not predictable (CWE-330).
Note that this can be bypassed using XSS.

Identify especially dangerous operations. When the user performs a dangerous operation, send a separate confirmation request to ensure that the user intended to perform that operation.
Note that this can be bypassed using XSS.

Use the ESAPI Session Management control.
This control includes a component for CSRF.

Do not use the GET method for any request that triggers a state change.

Phase: Implementation
Check the HTTP Referer header to see if the request originated from an expected page. This could break legitimate functionality, because users or proxies may have disabled sending the Referer for privacy reasons.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
* [ https://cwe.mitre.org/data/definitions/352.html ](https://cwe.mitre.org/data/definitions/352.html)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ CORS Misconfiguration ](https://www.zaproxy.org/docs/alerts/40040/)



##### Medium (High)

### Description

This CORS misconfiguration could allow an attacker to perform AJAX queries to the vulnerable website from a malicious page loaded by the victim's user agent.
In order to perform authenticated AJAX queries, the server must specify the header "Access-Control-Allow-Credentials: true" and the "Access-Control-Allow-Origin" header must be set to null or the malicious page's domain. Even if this misconfiguration doesn't allow authenticated AJAX requests, unauthenticated sensitive content can still be accessed (e.g intranet websites).
A malicious page can belong to a malicious website but also a trusted website with flaws (e.g XSS, support of HTTP without TLS allowing code injection through MITM, etc).

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: ``
  * Attack: `origin: http://aUh54LPO.com`
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: `origin: http://aUh54LPO.com`
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: ``
  * Attack: `origin: http://aUh54LPO.com`
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: `origin: http://aUh54LPO.com`
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/sitemap.xml%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/sitemap.xml (email,password)`
  * Method: `GET`
  * Parameter: ``
  * Attack: `origin: http://aUh54LPO.com`
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

If a web resource contains sensitive information, the origin should be properly specified in the Access-Control-Allow-Origin header. Only trusted websites needing this resource should be specified in this header, with the most secured protocol supported.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
* [ https://portswigger.net/web-security/cors ](https://portswigger.net/web-security/cors)


#### CWE Id: [ 942 ](https://cwe.mitre.org/data/definitions/942.html)


#### WASC Id: 14

#### Source ID: 1

### [ Cross-Domain Misconfiguration ](https://www.zaproxy.org/docs/alerts/10098/)



##### Medium (Medium)

### Description

Web browser data loading may be possible, due to a Cross Origin Resource Sharing (CORS) misconfiguration on the web server.

* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://host.docker.internal:3101/app.js
  * Node Name: `http://host.docker.internal:3101/app.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: http://host.docker.internal:3101/styles.css
  * Node Name: `http://host.docker.internal:3101/styles.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`

Instances: Systemic


### Solution

Ensure that sensitive data is not available in an unauthenticated manner (using IP address white-listing, for instance).
Configure the "Access-Control-Allow-Origin" HTTP header to a more restrictive set of domains, or remove all CORS headers entirely, to allow the web browser to enforce the Same Origin Policy (SOP) in a more restrictive manner.

### Reference


* [ https://vulncat.fortify.com/en/detail?category=HTML5&subcategory=Overly%20Permissive%20CORS%20Policy ](https://vulncat.fortify.com/en/detail?category=HTML5&subcategory=Overly%20Permissive%20CORS%20Policy)


#### CWE Id: [ 264 ](https://cwe.mitre.org/data/definitions/264.html)


#### WASC Id: 14

#### Source ID: 3

### [ HTTP Only Site ](https://www.zaproxy.org/docs/alerts/10106/)



##### Medium (Medium)

### Description

The site is only served under HTTP and not HTTPS.

* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `https://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `Failed to connect.
ZAP attempted to connect via: https://host.docker.internal:3101/`


Instances: 1

### Solution

Configure your web or application server to use SSL (https).

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
* [ https://letsencrypt.org/ ](https://letsencrypt.org/)


#### CWE Id: [ 311 ](https://cwe.mitre.org/data/definitions/311.html)


#### WASC Id: 4

#### Source ID: 1

### [ Cross-Origin-Embedder-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Permissions Policy Header Not Set ](https://www.zaproxy.org/docs/alerts/10063/)



##### Low (Medium)

### Description

Permissions Policy Header is an added layer of security that helps to restrict from unauthorized access or usage of browser/client features by web resources. This policy ensures the user privacy by limiting or specifying the features of the browsers can be used by the web resources. Permissions Policy provides a set of standard HTTP headers that allow website owners to limit which features of browsers can be used by the page such as camera, microphone, location, full screen etc.

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/app.js
  * Node Name: `http://host.docker.internal:3101/app.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to set the Permissions-Policy header.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy)
* [ https://developer.chrome.com/blog/feature-policy/ ](https://developer.chrome.com/blog/feature-policy/)
* [ https://scotthelme.co.uk/a-new-security-header-feature-policy/ ](https://scotthelme.co.uk/a-new-security-header-feature-policy/)
* [ https://w3c.github.io/webappsec-feature-policy/ ](https://w3c.github.io/webappsec-feature-policy/)
* [ https://www.smashingmagazine.com/2018/12/feature-policy/ ](https://www.smashingmagazine.com/2018/12/feature-policy/)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (Low)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password
referer=http://host.docker.internal:3101/`
* URL: http://host.docker.internal:3101/sitemap.xml%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/sitemap.xml (email,password)`
  * Method: `GET`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password
referer=http://host.docker.internal:3101/sitemap.xml`


Instances: 2

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Information Disclosure - Sensitive Information in URL ](https://www.zaproxy.org/docs/alerts/10024/)



##### Informational (Medium)

### Description

The request appeared to contain sensitive information leaked in the URL. This can violate PCI and most organizational compliance policies. You can configure the list of strings for this check to add or remove values specific to your environment.

* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `zaproxy@example.com`
  * Other Info: `The URL contains email address(es).`
* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: `password`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `The URL contains potentially sensitive information. The following string was found via the pattern: pass
password`
* URL: http://host.docker.internal:3101/sitemap.xml%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/sitemap.xml (email,password)`
  * Method: `GET`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `zaproxy@example.com`
  * Other Info: `The URL contains email address(es).`
* URL: http://host.docker.internal:3101/sitemap.xml%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/sitemap.xml (email,password)`
  * Method: `GET`
  * Parameter: `password`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `The URL contains potentially sensitive information. The following string was found via the pattern: pass
password`


Instances: 4

### Solution

Do not pass sensitive information in URIs.

### Reference



#### CWE Id: [ 598 ](https://cwe.mitre.org/data/definitions/598.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Client Spider may well be more effective than the standard one.

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<noscript>
      <div class="noscript-message">
        EduPréstamo necesita JavaScript para funcionar. Actívalo y vuelve a cargar la página.
      </div>
    </noscript>`
  * Other Info: `A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.`
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<noscript>
      <div class="noscript-message">
        EduPréstamo necesita JavaScript para funcionar. Actívalo y vuelve a cargar la página.
      </div>
    </noscript>`
  * Other Info: `A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.`
* URL: http://host.docker.internal:3101/%3Femail=zaproxy%2540example.com&password=ZAP
  * Node Name: `http://host.docker.internal:3101/ (email,password)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<noscript>
      <div class="noscript-message">
        EduPréstamo necesita JavaScript para funcionar. Actívalo y vuelve a cargar la página.
      </div>
    </noscript>`
  * Other Info: `A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.`
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<noscript>
      <div class="noscript-message">
        EduPréstamo necesita JavaScript para funcionar. Actívalo y vuelve a cargar la página.
      </div>
    </noscript>`
  * Other Info: `A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.`
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<noscript>
      <div class="noscript-message">
        EduPréstamo necesita JavaScript para funcionar. Actívalo y vuelve a cargar la página.
      </div>
    </noscript>`
  * Other Info: `A noScript tag has been found, which is an indication that the application works differently with JavaScript enabled compared to when it is not.`

Instances: Systemic


### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Storable but Non-Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, but will not be retrieved directly from the cache, without validating the request upstream, in response to similar requests from other users.

* URL: http://host.docker.internal:3101
  * Node Name: `http://host.docker.internal:3101`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: http://host.docker.internal:3101/app.js
  * Node Name: `http://host.docker.internal:3101/app.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: http://host.docker.internal:3101/styles.css
  * Node Name: `http://host.docker.internal:3101/styles.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``

Instances: Systemic


### Solution



### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


