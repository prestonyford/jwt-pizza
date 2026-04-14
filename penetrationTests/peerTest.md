# PenTest Report
Peer names: Preston Ford, Anna Egbert

## Self Attack
### Preston Ford
#### Attack 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 12, 2026 |
| Target         | pizza.pyford329.click |
| Classification | Injection |
| Severity       | 0 |
| Description    | Attempted SQL injection in registering a user, using: `curl -X PUT http://localhost:3000/api/auth -H "Content-Type: application/json" -d '{"email": "e@e.com; DROP DATABASE pizza;", "password": "password"}'`. The SQL input is sanitized, so there was no effect.|
| Images         | None |
| Corrections    | None |

#### Attack 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 12, 2026 |
| Target         | pizza.pyford329.click |
| Classification | Identification and Authentication Failures |
| Severity       | 2 |
| Description    | Logic error in login authentication bypasses the password check if the provided password is a falsy value, such as an empty string. The browser prevents login attempts if the password field is empty, but this is easily bypassed using CURL. |
| Images         | ![Bad authentication logic](preston_attack2.png) <br/> Auth token was given when password is empty. |
| Corrections    | Fix the bug in the authentication logic. |

#### Attack 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 12, 2026 |
| Target         | pizza.pyford329.click |
| Classification | Injection |
| Severity       | 2 |
| Description    | Inputs not sanitized when updating user information. Allows for SQL injection which can write sensitive data of another user into your username. |
| Images         | ![SQL injection](preston_attack3.png) <br/> ![SQL injection](preston_attack3_1.png) <br/>  This user used a SQL injection attack to overwrite their username to be another user's password hash. The victim's hashed password is then visible in the attacker's profile page. |
| Corrections    | Sanitize inputs. |

#### Attack 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 12, 2026 |
| Target         | pizza.pyford329.click |
| Classification | Injection |
| Severity       | 0 |
| Description    | Attempted a XSS attack to run JavaScript in an admin's browser. Did not work, React escapes the HTML. |
| Images         | ![XSS](preston_attack4.png) <br/> Attacker attempted XSS attack by making their username an HTML script tag with malicious code. |
| Corrections    | None |

#### Attack 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 12, 2026 |
| Target         | pizza.pyford329.click |
| Classification | Insecure Design |
| Severity       | 5 |
| Description    | Chaos testing endpoint was left in and is present in production. Causes orders to fail 50% of the time. |
| Images         | ![Failed order](preston_attack5.png) <br/> Order failed after attacker hit the chaos testing endpoint. |
| Corrections    | Remove the chaos testing endpoint. |

## Peer Attack
### Preston -> Anna
#### Attack 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 14, 2026 |
| Target         | pizza.afjwtpizza.click |
| Classification | Insecure Design |
| Severity       | 0 |
| Description    | Attempted to overload the server with bad login requests to brute force different combinations of passwords, however precautions were made to prevent too many authentication attempts.
| Images         | ![Failed login](auth-cooldown.png) |
| Corrections    | None |

#### Attack 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 14, 2026 |
| Target         | pizza.afjwtpizza.click |
| Classification | Security Misconfiguration |
| Severity       | 1 |
| Description    | Production code is built with sourcemaps, allowing end users to see source code with comments. This makes it easier for attackers to find vulnerabilities by investigating the code to discover API structure and internal business logic. For example, the source code of certain components could be investigated to find XSS vulnerabilities. It could also reveal feature flags, API keys left in by mistake, and reveal proprietary code. |
| Images         | ![Sourcemaps](sourcemaps.png) |
| Corrections    | Build code without sourcemaps |

#### Attack 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 14, 2026 |
| Target         | pizza.afjwtpizza.click |
| Classification | Security Misconfiguration |
| Severity       | 0 |
| Description    | Pizza ordering sends the price with the request. I thought this could be used to purchase a jwt pizza at a different price than is listed, however the backend does not actually use this field in the request. |
| Images         | None |
| Corrections    | None |

#### Attack 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 14, 2026 |
| Target         | pizza.afjwtpizza.click |
| Classification | Broken Access Control |
| Severity       | 0 |
| Description    | Attempted to hit the user list endpoint as a non-admin, however access was blocked. If it was not blocked, sensitive information about other users registered with JWT Pizza could have been obtained. |
| Images         | None |
| Corrections    | None |

#### Attack 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 14, 2026 |
| Target         | pizza.afjwtpizza.click |
| Classification | Injection |
| Severity       | 0 |
| Description    | Attempted to put a SQL injection to obtain other user information or to drop the database, but the queries are sanitized and the attempts did not work. `curl 'https://pizza-service.afjwtpizza.click/api/auth'-X POST -H 'Content-Type: application/json' --data-raw '{"name":"DROP DATABASE pizza;","email":"test@test.com","password":"test"}'`
| Images         | None |
| Corrections    | None |