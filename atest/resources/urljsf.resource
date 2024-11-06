*** Settings ***
Resource    ./env.resource
Resource    ./coverage.resource
Library     SeleniumLibrary


*** Variables ***
${CSS_U_FORM}       css:.urljsf-form


*** Keywords ***
Setup Urljsf Suite
    [Documentation]    Prepare a suite to run.
    [Arguments]    ${suite}
    Set Screenshot Directory    ${OUTPUT_DIR}${/}screens${/}${suite}

Open Blank
    [Documentation]    Go to the blank screen.
    Capture Page Coverage
    Go To    about:blank

Open Page
    [Documentation]    Open a hosted page.
    [Arguments]    ${page}
    Go To    ${HTTP_URL}/${page}

Open Demo
    [Documentation]    Open a named demo.
    [Arguments]    ${demo}
    Open Page    demos/${demo}.html
