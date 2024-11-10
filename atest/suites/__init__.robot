*** Settings ***
Documentation       Acceptance tests for `urljsf`

Resource            ../resources/browser.resource
Resource            ../resources/server.resource

Suite Setup         Start Suites
Suite Teardown      Stop Suites


*** Keywords ***
Start Suites
    [Documentation]    Start a static HTTP server for files.
    Start Server
    Open Firefox

Stop Suites
    [Documentation]    Stop the server.
    Stop Server
    Close All Browsers
