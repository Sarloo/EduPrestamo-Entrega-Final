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
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 9    |
| Low | Exceeded Low |  | Percentage of network failures | 21 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of responses with status code 2xx | 94 % |
| Info | Exceeded Low | http://host.docker.internal:3101 | Percentage of responses with status code 4xx | 5 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/css | 14 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/html | 71 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with content type text/javascript | 14 % |
| Info | Informational | http://host.docker.internal:3101 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://host.docker.internal:3101 | Count of total endpoints | 7    |
| Info | Informational | https://host.docker.internal:3101 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://host.docker.internal:3101 | Count of total endpoints | 1    |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Absence of Anti-CSRF Tokens | Medium | Systemic |
| HTTP Only Site | Medium | 1 |
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
referer=http://host.docker.internal:3101`
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


