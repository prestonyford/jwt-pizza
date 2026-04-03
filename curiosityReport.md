# Upptime.js Curiosity Report
## What is Sentry?
Sentry is an application monitoring and error-tracking platform that helps developers detect, diagnose, and fix issues in real time. Instead of waiting for users to report bugs, Sentry automatically captures errors as they happen in the browser and provides detailed context about what went wrong.

Sentry provides:
- Real-time error tracking
- Stack traces and debugging context which make it wasier to fix problems
- Performance monitoring
- Alerts and notifications

## Why Was I Curious About It?
Traditionally, QA focuses on testing before release. In reality, many bugs only appear in production. I was interested in how Sentry solves this problem cleanly by enabling error tracking that automated tests might miss. In my current work as a web developer, one of my coworkers is working on a rewrite of a legacy system that runs the browser. We haven't flipped the switch yet, but right now we run both the old and new systems and have code in place to compare the results to function calls. If they are different, we have the browser send a request to our logging server. I felt that Sentry solves a similar problem that I was facing in work, so I decided to look into it.

It also connects to DevOps ideas like:
- Continuous monitoring
- Fast feedback loops
- Observability

## How it works
