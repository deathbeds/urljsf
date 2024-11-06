*** Settings ***
Documentation       Acceptance tests for `urlsjf`

Library             ../libraries/server.py
Library             SeleniumLibrary
Resource            ../resources/env.resource
Library             Process

Suite Setup         Start Server
Suite Teardown      Stop Server


*** Keywords ***
Start Server
    [Documentation]    Start a static HTTP server for files.
    Log    ${GECKODRIVER} ${FIREFOX}
    ${port} =    Get Unused Port
    ${server} =    Start Process
    ...    python
    ...    ${SERVER_PY}
    ...    ${port}
    ...    ${ROOT}${/}build${/}docs
    ...    stdout=${OUTPUT_DIR}${/}http.log
    ...    stderr=STDOUT
    Set Suite Variable    ${HTTP_PORT}    ${port}    children=${TRUE}
    Set Suite Variable    ${HTTP_SERVER}    ${server}    children=${TRUE}
    Set Suite Variable    ${HTTP_URL}    http://127.0.0.1:${port}    children=${TRUE}
    Open Firefox

Stop Server
    [Documentation]    Stop the server.
    Terminate All Processes
    Close All Browsers

Open Firefox
    [Documentation]    Start an instrumented firefox.
    ${options} =    Evaluate
    ...    selenium.webdriver.FirefoxOptions()
    ...    selenium.webdriver
    ${options.binary_location} =    Set Variable    ${FIREFOX}
    Call Method    ${options}    set_preference    ui.prefersReducedMotion    ${1}
    Call Method    ${options}    set_preference    devtools.console.stdout.content    ${True}

    ${service args} =    Create List    --log    info
    ${geckolog} =    Set Variable    ${OUTPUT DIR}${/}geckodriver.log
    ${geckolog} =    Set Variable    ${geckolog.replace('\\', '/')}

    Open Browser
    ...    about:blank
    ...    headlessfirefox
    ...    options=${options}
    ...    service=log_output='${geckolog}'; executable_path='${GECKODRIVER}'
