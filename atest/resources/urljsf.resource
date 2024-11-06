*** Settings ***
Documentation       Keywords and variables for urljsf.

Resource            ./env.resource
Resource            ./coverage.resource
Library             SeleniumLibrary


*** Variables ***
${CSS_U_FORM}               .urljsf-form
${CSS_U_DATALIST}           .urljsf-datalist
${CSS_U_DATALIST_CHECK}     .urljsf-datalist input[type="checkbox"]
${CSS_U_SUBMIT}             .urljsf-submit


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
    Wait Until Element Is Visible    css:${CSS_U_FORM}    timeout=${TIMEOUT_LONG}

Open Demo
    [Documentation]    Open a named demo.
    [Arguments]    ${demo}
    Open Page    demos/${demo}.html

Scroll To
    [Documentation]    Scroll the first element matching a CSS selector into view.
    [Arguments]    ${css_selector}
    Execute Javascript
    ...    document.querySelector(`${css_selector.replace('css:', '')}`).scrollIntoView()
