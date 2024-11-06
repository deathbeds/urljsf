*** Settings ***
Documentation       Browser keywords

Library             SeleniumLibrary
Resource            ./env.resource


*** Keywords ***
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
