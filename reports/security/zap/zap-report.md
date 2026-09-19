# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 2 |
| Low | 0 |
| Informational | 4 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 10    |
| Low | Exceeded Low |  | Percentage of network failures | 7 % |
| Low | Exceeded High | http://host.docker.internal:3101 | Percentage of responses with status code 4xx | 55 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of responses with status code 2xx | 44 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type application/json | 16 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/css | 16 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/html | 50 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/javascript | 16 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with method GET | 83 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with method POST | 16 % |
| Info | Informational | http://host.docker.internal:3101 | Count of total endpoints | 6    |
| Info | Informational | https://host.docker.internal:3101 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://host.docker.internal:3101 | Count of total endpoints | 1    |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Absence of Anti-CSRF Tokens | Medium | Systemic |
| HTTP Only Site | Medium | 1 |
| Authentication Request Identified | Informational | 1 |
| Modern Web Application | Informational | 4 |
| Non-Storable Content | Informational | 1 |
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

* URL: http://host.docker.internal:3101/
  * Node Name: `http://host.docker.internal:3101/`
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
  * Evidence: `<form id="login-form" method="post" action="/api/auth/login" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 1: "login-email" "login-password" ].`
* URL: http://host.docker.internal:3101/robots.txt
  * Node Name: `http://host.docker.internal:3101/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<form id="login-form" method="post" action="/api/auth/login" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 1: "login-email" "login-password" ].`
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
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
  * Evidence: `<form id="login-form" method="post" action="/api/auth/login" novalidate>`
  * Other Info: `No known Anti-CSRF token [anticsrf, CSRFToken, __RequestVerificationToken, csrfmiddlewaretoken, authenticity_token, OWASP_CSRFTOKEN, anoncsrf, csrf_token, _csrf, _csrfSecret, __csrf_magic, CSRF, _token, _csrf_token, _csrfToken] was found in the following HTML form: [Form 1: "login-email" "login-password" ].`

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

### [ HTTP Only Site ](https://www.zaproxy.org/docs/alerts/10106/)



##### Medium (Medium)

### Description

The site is only served under HTTP and not HTTPS.

* URL: http://host.docker.internal:3101/
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

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://host.docker.internal:3101/api/auth/login
  * Node Name: `http://host.docker.internal:3101/api/auth/login ()(email,password)`
  * Method: `POST`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password
referer=http://host.docker.internal:3101/sitemap.xml`


Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



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


Instances: 4

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: http://host.docker.internal:3101/api/auth/login
  * Node Name: `http://host.docker.internal:3101/api/auth/login ()(email,password)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `400`
  * Other Info: ``


Instances: 1

### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable but Non-Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, but will not be retrieved directly from the cache, without validating the request upstream, in response to similar requests from other users.

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
* URL: http://host.docker.internal:3101/sitemap.xml
  * Node Name: `http://host.docker.internal:3101/sitemap.xml`
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


