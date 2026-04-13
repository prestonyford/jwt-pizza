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