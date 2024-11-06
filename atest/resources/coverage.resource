*** Settings ***
Documentation       Keywords for working with browser coverage data

Library             OperatingSystem
Library             SeleniumLibrary


*** Variables ***
${NEXT_COV_FILE}    ${1}


*** Keywords ***
Get Next Coverage File
    [Documentation]    Get a random filename.
    Set Suite Variable    ${NEXT_COV_FILE}    ${NEXT_COV_FILE.__add__(1)}    children=${TRUE}
    RETURN    ${OUTPUT DIR}${/}nyc${/}${NEXT_COV_FILE}.cov.json

Capture Page Coverage
    [Documentation]    Fetch coverage data from the browser.
    ${cov_json} =    Execute Javascript
    ...    return window.__coverage__ && JSON.stringify(window.__coverage__, null, 2)
    IF    ${cov_json}
        ${name} =    Get Next Coverage File
        Create File    ${name}    ${cov_json}
        Execute Javascript    window.__coverage__ = {}
    ELSE
        Log    No browser coverage captured    CONSOLE
    END
